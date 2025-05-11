import { Text, View, StyleSheet, ScrollView, Pressable, Modal, TextInput } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Stack, useFocusEffect } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useCallback } from "react";

import SelectProductModal from "@/components/SelectProductModal";
import WarningModal from "@/components/WarningModal";

export type ProductType = {
    id: number;
    name:string;
    email:string;
    count: number;
    hasOptions: boolean;
  }

export const defaultProduct = {id: 0, name: "", email: "", count: 0, hasOptions: false};

export default function OrderList() {
    // variables
    const [data, setData] = useState<ProductType[]>([]);
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
            setSelectProductModalVisible(true);}
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

      const loadData = async () => {
        const result = await database.getAllAsync<ProductType>(`SELECT * FROM users`);
      
        // Merge with existing selectedProducts counts
        const updatedResult = result.map(product => {
        // Find this product in selectedProducts (if it exists)
        const selectedProduct = selectedProducts.find(item => item.id === product.id);
        
        if (selectedProduct) {
          // If it exists in selectedProducts, use its count
          return {
            ...product,
            count: selectedProduct.count
          };
        }
        
        // Otherwise return the product as is (with count 0 or whatever default)
        return product;
      });
      
      // Update the data state with the merged information
      setData(updatedResult);
    
      };
    
      useFocusEffect(
        useCallback(() => {
          loadData();
        }
        , [])
      );

      const deleteProductFromList = (product: ProductType) => {
        product.count--;
        if (product.count < 1) {
          setSelectedProducts(selectedProducts.filter(item => item.name !== product.name));
        }
        setSum(sum - parseInt(product.email));
      };
    
    
      const addProductToList = (product: ProductType) => {
        product.count++;
        if(product.count === 1) {
          setSelectedProducts([...selectedProducts, product]);
        }
        setSum(sum + parseInt(product.email));
        console.log(selectedProducts);
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
            <Text style={styles.title}>Order List</Text>
            <ScrollView style={styles.scrollView}>
                <View>{
                // Count and Name of the selected products
                selectedProducts.map((product) => (
                  <View key={product.id} style={styles.itemContainer}>
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
                
                
            </ScrollView>
            <Pressable style={styles.button} onPress={() => {}}>
                <Text style={styles.buttonText}>Add Order</Text>
            </Pressable>

            {selectedProducts.length > 0 && (
              <View style={styles.bottomHeader}>  
                <Text style={{color: '#fff', fontSize: 18}}>Total: {sum}</Text>
                <Pressable onPress={() => setSelectProductModalVisible(true)} style={{marginLeft: 5, padding: 10}}>
                    <FontAwesome name="check" size={24} color="#ffd33d"/>
                </Pressable>
              </View>)
            }

          <SelectProductModal
            isVisible={SelectProductModalVisible}
            editMode={editMode}
            onClose={() => {
              setSelectProductModalVisible(false);
              setEditMode(false);
            }}
            onSuccess={() => setWarningModalVisible(true)}/>

          <WarningModal
              isVisible={warningModalVisible}
              onClose={() => setWarningModalVisible(false)}
              onSuccess={() => {
                storeOrder()
                setWarningModalVisible(false)   
              }}
          />

          {sum > 0 && (<View style={styles.sumCounter}>
            <Text>
              ${sum}
            </Text>
          </View>)}
          
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffd33d',
        marginBottom: 20,
    },
    scrollView: {
        width: '100%',
        maxHeight: 300,
    },
    itemContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
    },    
    orderText: {
        fontSize: 18,
        color: '#fff',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ffd33d',
    },
    button: {
        backgroundColor: '#ffd33d',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
    },
    bottomHeader:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#25292e',
        padding: 10,
    },
    sumCounter:{
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      width: '100%',
      textAlign: 'center',
      padding: 10,
    }
});