import { Text, View, StyleSheet, ScrollView, Pressable, Modal, TextInput } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Stack, useFocusEffect } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useCallback, useEffect } from "react";

import SelectProductModal from "@/components/SelectProductModal";
import WarningModal from "@/components/WarningModal";
import Button from "@/components/Button"; // Adjust the path as necessary

export type ProductType = {
    id: number;
    name:string;
    email:string;
    count: number;
    hasOptions: boolean;
  }

export const defaultProduct = {id: 0, name: "", email: "", count: 0, hasOptions: false};

export default function Index() {
    // variables
    const [warningModalVisible, setWarningModalVisible] = useState(false);
    const [SelectProductModalVisible, setSelectProductModalVisible] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
    const [sum, setSum] = useState(0);
    const [editMode, setEditMode] = useState(false);

    // database
    const database = useSQLiteContext();

    // functions
    const headerLeft = () => {
        return(
          <Pressable onPress={() => {
            setEditMode(true);
            setSelectProductModalVisible(true);
            }
          } 
          style={{marginLeft: 5, padding: 10}}>
            <FontAwesome name="gear" size={24} color="#ffd33d"/>
          </Pressable>
        )
      }

      const headerRight = () => {
        return(
          <Pressable onPress={() => setSelectProductModalVisible(true)} style={{marginLeft: 5, padding: 10}}>
            <FontAwesome name="plus-circle" size={24} color="#ffd33d"/>
          </Pressable>
        )
      }
    

      const deleteProductFromList = (product: ProductType) => {
        product.count--;
        if (product.count < 1) {
          setSelectedProducts(selectedProducts.filter(item => item.name !== product.name));
        }
        setSum(sum - parseInt(product.email));
      };
    
    
      const addProductToList = (product: ProductType, option: string) => {
        // create product object with the selected product
        const newProduct = {...product};
        console.log("newProduct:", newProduct);
        
        // check if the product has options, if so change the name
        console.log("option:", option);
        if(option !== ""){
            newProduct.name += " " + option;
            console.log("newProduct with option:", newProduct);
          }

        // check if the product is already in the selectedProducts array
        const index = selectedProducts.findIndex(item => item.name === newProduct.name)
        console.log("index:", index);

        // if the product is not in the array, add it
        if(index === -1){ 
          newProduct.count = 1;
          setSelectedProducts([...selectedProducts, newProduct]);
        }
        // if the product is already in the array, increase the count
        else{
          selectedProducts[index].count += 1;
        }
        setSum(sum + parseInt(product.email));
        console.log(selectedProducts);
        console.log('option:', option);

      };

      const storeCustomerInformation = async() =>{
        try{
          const result = await database.runAsync(
            "INSERT INTO orders (type, name, email, price, phone) VALUES(?, ?, ?, ?, ?)",
            [
              "Convention Sale",
              'N/A',
              'N/A',
              sum,
              'N/A'
            ]
          );
    
          const orderId = result.lastInsertRowId;
          
          for (const product of selectedProducts) {
            if (product.count > 0) {
              try {
                // Fixed SQL query with closing parenthesis
                await database.runAsync(
                  "INSERT INTO sold_products (user_id, product, count) VALUES(?, ?, ?)",
                  [
                    orderId,
                    product.name,
                    product.count
                  ]
                );
                console.log("Saved product:", product.name, "with count:", product.count);
              } catch (productError) {
                console.error("Error saving product:", productError, product);
              }
            }
          }
          
          setSum(0);
          setSelectedProducts([]);
        } catch (error) {
          const tableInfo = await database.getAllAsync(`PRAGMA table_info(orders);`);
          alert(`Error saving order: ${error}, table info: ${JSON.stringify(tableInfo)}`);
          console.log(`Error saving order: ${error}, table info: ${JSON.stringify(tableInfo)}`);
        } 
      }
    
      const storeOrder = () => {
        try{
          storeCustomerInformation();
          alert("Order saved successfully!");
        }
        catch (error) {
          alert(`Error saving order: ${error}`);
        }
      }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{headerLeft}}/>
            <Stack.Screen options={{headerRight}}/>
            {selectedProducts.length === 0 && (
              <Text style={styles.title}>Click the plus button to start adding items!</Text>)}
            {selectedProducts.length > 0 && (
              <ScrollView style={styles.scrollView}>
                <View>{
                // Count and Name of the selected products
                selectedProducts.map((product) => (
                  <View key={product.id} style={styles.cell}>
                      <Text style={styles.orderText}>
                          {product.count}x {product.name}
                      </Text>
                      {/* Delete Button */}
                      <Pressable 
                        onPress={() => deleteProductFromList(product)} 
                        style={{marginLeft: 5, padding: 10}}>
                        <FontAwesome name="trash" size={24} color="#ffd33d"/>                    
                      </Pressable>
                  </View>
                  ))}
                </View>
            </ScrollView>)}
            
          <SelectProductModal
            isVisible={SelectProductModalVisible}
            editMode={editMode}
            onClose={() => {
              setSelectProductModalVisible(false);
              setEditMode(false);
            }}
            onSuccess={(currProduct: ProductType, option: string) => {
              addProductToList(currProduct, option);
              console.log("selectedProducts:", selectedProducts);
              setSelectProductModalVisible(false);
              }}/>

          <WarningModal
              isVisible={warningModalVisible}
              onClose={() => setWarningModalVisible(false)}
              onSuccess={() => {
                storeOrder()
                setWarningModalVisible(false);
              }}
          />

          {sum > 0 && (
            <View style={styles.bottomHeader}>
              <Text style={styles.sumCounter}>Total: ${sum}</Text>
              <Button label="Submit" theme="primary" onPress={() => setWarningModalVisible(true)} />
              <Pressable
                style={styles.button} 
                onPress={() => {
                  setSum(0);
                  setSelectedProducts([]);
                }
              }>
                <Text style={styles.buttonText}>Clear</Text>
              </Pressable>
            </View>
            )}
            
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#25292e',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6b7178',
        marginBottom: 20,
    },
    scrollView: {
        width: '100%',
        maxHeight: "80%",
    },
    cell: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      margin: 10,
      backgroundColor: '#25292e',
      borderRadius: 5,
      borderWidth: 2,
      borderColor: '#525961',
    },
    orderText: {
        fontSize: 18,
        color: '#fff',
        padding: 10,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#ffd33d',
        paddingVertical: 4,
        paddingHorizontal: 4,
        color: '#000',
        width: 320,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        borderRadius: 10,
        borderWidth: 3,
        paddingVertical: 7,
        width: '100%',
        borderColor: '#25292e',
        textAlign: 'center',
    },
    bottomHeader:{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#25292e',
        padding: 10,
        width: '100%',
    },
    sumCounter:{
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      width: '100%',
      textAlign: 'center',
      borderRadius: 5,
      padding: 10,
      margin: 10,
    }
});