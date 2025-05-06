import { Text, View, StyleSheet, ScrollView, Pressable, Modal, TextInput } from "react-native";
import {useState, useEffect, useCallback} from 'react';
import { Stack, useFocusEffect, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Button from "@/components/Button"; // Adjust the path as necessary
import WarningModal from "@/components/WarningModal"; // Adjust the path as necessary
import AddProductModal from "@/components/AddProductModel"; // Adjust the path as necessary
import OptionsModal from "@/components/OptionsModal";

export default function Index() {
  const [data, setData] = useState<ProductType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [product, setProduct] = useState<ProductType>({id: 0, name: "", email: "", count: 0, hasOptions: false});

  
  const [name, setName] = useState("");
  const [orderType, setOrderType] = useState("");
  const [email, setEmail] = useState("");

  const database = useSQLiteContext();
  const [sum, setSum] = useState(0);

  type ProductType = {
    id: number;
    name:string;
    email:string;
    count: number;
    hasOptions: boolean;
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

  const headerRight = () => {
    return(
      <Pressable onPress={() => setAddProductModalVisible(true)} style={{padding: 10}}>
        <FontAwesome name="plus-circle" size={24} color="#ffd33d"/>
      </Pressable>
    )
  }

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
      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        product.count = 0;
      }
      setSelectedProducts([]);
      setWarningModalVisible(false);
    } catch (error) {
      const tableInfo = await database.getAllAsync(`PRAGMA table_info(orders);`);
      alert(`Error saving order: ${error}, table info: ${JSON.stringify(tableInfo)}`);
      console.log(`Error saving order: ${error}, table info: ${JSON.stringify(tableInfo)}`);
    } 
  }

  const optionsExists = async (productId: number) => {
    const result = await database.getAllAsync(`SELECT * FROM extra_options WHERE user_id = ?`, [productId]);
    if (result.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  const openOptionsModal = async (product: ProductType) => {
    // Check to see if options exist for this product
    if (await optionsExists(product.id) || !(product.hasOptions === false && optionsExists(product.id))) {
      setName(product.name);
      setProductId(product.id);
      setOptionsModalVisible(true);
    }
  }

  const closeOptionsModal = (options: string) => {
    // add options to the product name
    setName(name + " " + options);
    // last step
    setOptionsModalVisible(false);
    setProductId(null);
  }


  const storeOrder = () => {
    try{
      storeCustomerInformation();
      alert("Order saved successfully!");
      setWarningModalVisible(false);
    }
    catch (error) {
      alert(`Error saving order: ${error}`);
    }
  }
  
  useEffect(() => {
    console.log("Current selected products:", selectedProducts);
  }, [selectedProducts]);



  // const addProductToList = (product: ProductType, isAdding: Boolean) => {
  //   if (!isAdding) {
  //     product.count--;
  //     if (product.count < 1) {
  //       setSelectedProducts(selectedProducts.filter(item => item.name !== product.name));
  //     }

  //     setSum(sum - parseInt(product.email));

  //   } else {
  //     product.count++;
  //     if(product.count === 1) {

  //       setSelectedProducts([...selectedProducts, product]);
  //     }

  //     setSum(sum + parseInt(product.email));

  //   }
  //   console.log(selectedProducts);
  // };

  const addProductToList = (product: ProductType, isAdding: Boolean) => {
    product.count++;
    if(product.count === 1) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setSum(sum + parseInt(product.email));
    console.log(selectedProducts);
  };

  return (
    <View style= {styles.container}>
      <Stack.Screen options={{headerRight}}/>
      <ScrollView
        style={styles.scrollView}>
        {data.map((product) => (
            <Pressable 
              key={product.id}
              style={[
                styles.cell, 
                selectedProducts.some(item => item.name === product.name) &&
                { backgroundColor: product.count > 0 ? '#525b66' : '#25292e' }
              ]}
              onPress={async () => {
                await optionsExists(product.id) ? openOptionsModal(product): addProductToList(product, true);
              }}>
              {/* <View style={styles.productCounterContainer}>
                <Pressable 
                style={styles.productCountButton}
                  onPress={() => {
                    if (product.count > 0) {
                      addProductToList(product, false);
                    }
                  }}>
                  <FontAwesome name="minus-circle" size={24} color="#ffd33d"/> 
                </Pressable>
                <Text style={styles.productCounter}>{product.count}</Text>
                <Pressable 
                  style={styles.productCountButton}
                  onPress={() => {
                    openOptionsModal(product);
                    addProductToList(product, true);
                  }}>
                  <FontAwesome name="plus-circle" size={24} color="#ffd33d"/>
                </Pressable>
              </View> */}
              <Text style={styles.text}>{product.name}, ${product.email}</Text>
              <Pressable
                onPress={() => {
                  setProductId(product.id);
                  setAddProductModalVisible(true);
                }}>
                  <Text style={styles.editButton}>Edit</Text>
              </Pressable>
            </Pressable>
        ))}
        
      </ScrollView>
      {sum > 0 && (<Text style={styles.sumCounter}>Total: ${sum}</Text>)}
      <View style={styles.buttomContainer}>
        <Button label="Submit" theme="primary" onPress={() => setWarningModalVisible(true)} />
      </View>

      <WarningModal
        isVisible={warningModalVisible}
        onClose={() => setWarningModalVisible(false)}
        onSuccess={() => {
          storeOrder()      
        }}
      />
      
      <AddProductModal
        isVisible={addProductModalVisible}
        onClose={() => {
          setAddProductModalVisible(false),
          setProductId(null);
        }}
        onSuccess={() => loadData()}
        productId={productId}
        database={database}/>

      <OptionsModal
        isVisible={optionsModalVisible}
        product={product}
        name={name}
        onSuccess={() => {
            setOptionsModalVisible(false);
            setProductId(null);
          }
        }
        onClose={() => {
            setOptionsModalVisible(false);
            setProductId(null);
          }
        }
        />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",

  },
  buttomContainer:{
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView:{
    backgroundColor: "#25292e",
    width: "100%",
    flex: 1,
  },
  cell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#25292e',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#525961', // Change this color to modify the border color
  },
  editButton: {
    color: '#25292e',
    backgroundColor: '#ffd33d',
    borderRadius: 5,
    padding: 5,
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
  },
  sumCounter:{
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
    textAlign: 'center',
    padding: 10,
  },
  productCounterContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCountButton:{
    marginHorizontal: 5,
  },
  productCounter:{
    fontSize: 20,
    fontWeight: 'bold',
    borderColor : '#ffd33d',
    borderRadius: 5,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    width: 40,
    padding: 5,
  }
});
