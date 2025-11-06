import { Text, View, StyleSheet, ScrollView, Pressable} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Stack, router} from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from "react";
import { ProductType} from "@/types";

import SelectProductModal from "@/components/SelectProductModal";
import WarningModal from "@/components/WarningModal";
import FormModal from "@/components/FormModal";
import Button from "@/components/Button"; // Adjust the path as necessary
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDatabaseContext } from "../_layout";


export default function Index() {
    // Get database context
    const database = useSQLiteContext();
    
    // variables
    const [warningModalVisible, setWarningModalVisible] = useState(false);
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [name, setName] = useState("N/A");
    const [phone, setPhone] = useState("N/A");
    const [address, setAddress] = useState("N/A");
    const [sale, setSale] = useState("Convention Sale");
    const [paymentType, setPaymentType] = useState("Card");
    const [SelectProductModalVisible, setSelectProductModalVisible] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
    const [sum, setSum] = useState<number>(0);
    const [editMode, setEditMode] = useState(false);
    const { selectedDatabase, clearSelectedDatabase } = useDatabaseContext();
    
    // // Guard: redirect if no database selected
    // useEffect(() => {
    //     if (!selectedDatabase) {
    //         console.log('No database selected, redirecting...');
    //         router.replace('../database-list');
    //     }
    // }, [selectedDatabase]);


    // if (!selectedDatabase) {
    //     return (
    //         <View style={styles.container}>
    //             <Text style={styles.title}>Loading...</Text>
    //         </View>
    //     );
    // }

    // useEffect(() => {
    //   const updateOrdersTable = async () => {
    //     try {
    //       await database.runAsync(
    //         `ALTER TABLE orders ADD COLUMN paymentType TEXT;`
    //       )
    //       console.log("Column paymentType added to orders table successfully.");
    //     } catch (error) {
    //       console.error("Error updating orders table:", error);
    //     }
    //   };

    //   updateOrdersTable();
    // }, [database]);

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
          <Pressable onPress={() => setFormModalVisible(true)} style={{marginLeft: 5, padding: 10}}>
            <MaterialCommunityIcons name="form-select" size={24} color="#ffd33d"/>
          </Pressable>
        )
      }
    
      {/* Remove one product from the list */}
      const deleteProductFromList = (product: ProductType) => {
        product.count--;
        if (product.count < 1) {
          setSelectedProducts(selectedProducts.filter(item => item.name !== product.name));
        }
        setSum(sum - parseInt(product.email));
      };
    
      {/* Add products to the list */}
      const addProductsToList = (products: ProductType[], options: [string, number][]) => {
        
        // create copies of the current state to modify the selectedProducts and sum states
        let productsCopy = [...selectedProducts];
        let newSum = sum;
        console.log("Initial sum:", newSum);

        // options index
        let optionIndex = 0;


        // go through each product to update counts and sum
        products.forEach(product => {
          console.log("Processing product:", product);
          const productCopy = { ...product };


          // check if the product has options, if so change the name
          if(productCopy.hasOptions){
            productCopy.name += " " + options[optionIndex][0];
            optionIndex++;
          }


          // check if the product is already in the selectedProducts array
          const index = productsCopy.findIndex(item => item.name === productCopy.name)
          console.log("index:", index);

          
          // if the product is not in the array, add it
          if(index === -1){ 
            productCopy.count = 1;
            productsCopy.push(productCopy);
            console.log("Product added:", productCopy);
          }
          // if the product is already in the array, increase the count
          else{
            productsCopy[index].count += 1;
          }

          console.log("Product price:", parseInt(productCopy.email));
          newSum += Number(productCopy.email);
          console.log("New sum:", newSum);
        });


        // finally update the state with all the changes
        setSelectedProducts(productsCopy);
        setSum(newSum);
      };



      const changeOrderInformation = (name: string, phone: string, address: string, sale: string) => {
        setSale(sale);
        setName(name);
        setPhone(phone);
        setAddress(address);
      }

      const clearCustomerInformation = () => {
        setSum(0);
        setSelectedProducts([]);
        setName("N/A");
        setPhone("N/A");
        setAddress("N/A");
        setSale("Convention Sale");
        setPaymentType("Card");
      } 

      const storeCustomerInformation = async() =>{
        if (!selectedDatabase) {
          console.warn('No database selected');
          return;
        }
        try{
          const result = await database.runAsync(
            "INSERT INTO orders (type, name, email, price, phone, db_id, paymentType) VALUES(?, ?, ?, ?, ?, ?, ?)",
            [
              sale,
              name,
              address,
              sum,
              phone,
              selectedDatabase.id,
              paymentType 
            ]
          );
    
          const orderId = result.lastInsertRowId;
          
          for (const product of selectedProducts) {
            if (product.count > 0) {
              try {
                // Fixed SQL query with closing parenthesis
                await database.runAsync(
                  "INSERT INTO sold_products (user_id, product, count, db_id) VALUES(?, ?, ?, ?)",
                  [
                    orderId,
                    product.name,
                    product.count,
                    selectedDatabase.id
                  ]
                );
                console.log("Saved product:", product.name, "with count:", product.count);
              } catch (productError) {
                console.error("Error saving product:", productError, product);
              }
            }
          }
          
          clearCustomerInformation();
          
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

      const switchConvention = () => {
        clearSelectedDatabase();
        router.back();
      }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{headerLeft}}/>
            <Stack.Screen options={{headerRight}}/>
            <View style={styles.main}>

              
            {selectedProducts.length === 0 ? (
              /* Prompt to add products */
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Click the plus button to start adding items!</Text>
              </View>
            ) : (
              /* List of Selected Products */
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

            {/* Payment Type Selection */}
            {sum > 0 && (<View style={styles.paymentTypeContainer}>
              <Pressable style = {paymentType === "Card" ? [styles.paymentTypeButton,{backgroundColor: 'rgba(255, 255, 255, 0.3)'}] : [styles.paymentTypeButton]} onPress ={() => setPaymentType("Card")}>
                <Text style={styles.paymentTypeButtonText}>Card</Text>
              </Pressable>
              <Pressable style = {paymentType === "Cash" ? [styles.paymentTypeButton,{backgroundColor: 'rgba(255, 255, 255, 0.3)'}] : [styles.paymentTypeButton]} onPress ={() => setPaymentType("Cash")}>
                <Text style={styles.paymentTypeButtonText}>Cash</Text>
              </Pressable>
            </View>)}

            {/* Total Sum */}
             {sum > 0 && (<Text style={styles.sumCounter}>Total: ${sum}</Text>)}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Button to add products */}
               <View style={styles.button}>
                <Pressable
                style={styles.buttonText}
                onPress={() => setSelectProductModalVisible(true)}
                >
                  <Feather name="plus" size={24} color="#25292e"/>
                </Pressable>
              </View>


              {/* Button to switch convention */}
              <View>
                <Pressable
                    onPress={() => {
                      switchConvention();
                    }}
                    >
                    <Text style={styles.switchConventionButton}>Switch Convention</Text>
                </Pressable>
              </View>


            </View>
          </View>

          {/* Bottom Header with Submit and Clear buttons */}
          {(sum > 0 || sale === "Preorder Sale") && (
            <View style={styles.bottomHeader}>
              
              
              {// Submit Button ( only show if sum > 0 )
                sum > 0 && 
                  (<Button label="Submit" theme="primary" onPress={() => setWarningModalVisible(true)} />)
              }
              
              <Pressable
                style={styles.button} 
                onPress={() => {
                  
                  clearCustomerInformation();
                }
              }>
                <Text style={styles.buttonText}>Clear</Text>
              </Pressable>
            </View>
            )}
           
            {/*  Modals  */}
          <SelectProductModal
            isVisible={SelectProductModalVisible}
            editMode={editMode}
            onClose={() => {
              setSelectProductModalVisible(false);
              setEditMode(false);
            }}
            // Get products and option from the modal
            onSuccess={(currProducts: ProductType[], options: [string, number][]) => {
              console.log("Current Products on Success:", currProducts);
              console.log("Options on Success:", options);
              addProductsToList(currProducts, options);
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
          
          <FormModal
            isVisible={formModalVisible}
            onClose={() => setFormModalVisible(false)}
            onSuccess={(newName: string, newPhone: string, newAddress: string, newSale: string) => {
              console.log(`Name: ${newName}, Phone: ${newPhone}, Address: ${newAddress} Sale: ${newSale}`);
              changeOrderInformation(newName, newPhone, newAddress, newSale);
              setFormModalVisible(false);
            }}
            />


          
            
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#25292e',
        height: '100%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6b7178',
        marginBottom: 20,
        textAlign: 'center',
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
        marginVertical: 5,
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
        alignItems: 'center',
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
    },
    buttonContainer:{
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: 10,
    },
    main:{
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: 10
    },
    titleContainer:{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    paymentTypeContainer:{
      flexDirection: 'row',
      alignItems: 'center',
    },
    switchConventionButton:{
      color: 'rgba(252, 251, 251, 1)',
      fontSize: 16,
      fontWeight: 'bold', 
      textDecorationLine: 'underline',
      padding: 10,
      borderRadius: 5,
    },
    paymentTypeButton:{
      paddingVertical: 4,
      paddingHorizontal: 4,
      borderRadius: 10,
      marginHorizontal: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.09)',
    },
    paymentTypeButtonText:{
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
      borderColor: '#25292e',
      borderWidth: 3,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 7,
      backgroundColor: 'rgba(255, 255, 255, 0.09)',
    } 
});