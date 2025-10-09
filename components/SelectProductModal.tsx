import { Text, View, StyleSheet, ScrollView, Pressable, Modal, TextInput } from "react-native";
import {useState, useEffect, useCallback} from 'react';
import { Stack, useFocusEffect, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Button from "@/components/Button"; // Adjust the path as necessary
import AddProductModal from "@/components/AddProductModel"; // Adjust the path as necessary
import OptionsModal from "@/components/OptionsModal";
import { ProductType, defaultProduct } from "@/types"; // Adjust the path as necessary


type Props = {
    isVisible: boolean;
    editMode?: boolean;
    onClose: () => void;
    // onSuccess: (product: ProductType, name: string) => void;
    onSuccess: (products: ProductType[], name: string) => void;
}

export default function SelectProductModal({isVisible, editMode, onClose, onSuccess}: Props) {
  const [data, setData] = useState<ProductType[]>([]);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [productIds, setProductIds] = useState<number[]>([]);
  const [currProduct, setCurrProduct] = useState<ProductType>(defaultProduct);
  const [currProducts, setCurrProducts] = useState<ProductType[]>([]);
  const [name, setName] = useState<string>("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  
  
  const database = useSQLiteContext();


  const loadData = async () => {
    const result = await database.getAllAsync<ProductType>(`SELECT * FROM users`);
  
    // Merge with existing selectedProducts counts
    const updatedResult = result.map(product => {

    // Otherwise return the product as is (with count 0 or whatever default)
    return product;
    });
  
    // Update the data state with the merged information
    setData(updatedResult);
    

  };


  useEffect(() => {
  if (isVisible) {
    loadData();
  }
}, [isVisible]);

  


  const headerRight = () => {
    return(
      <Pressable onPress={() => setAddProductModalVisible(true)} style={{padding: 10}}>
        <FontAwesome name="plus-circle" size={24} color="#ffd33d"/>
      </Pressable>
    )
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
      // setCurrProduct(product);
      setCurrProducts(prev => [...prev, product]);
      setProductId(product.id);
      console.log("Product:", product);
      setOptionsModalVisible(true);
    }
  }

  const search = async (text: string) => {
    // change the search text to the text that the user has typed in the search bar
      setSearchText(text);
    // Set searching true to indicate that the user is searching
    if(!searching){
      setSearching(true);
      setProducts(data);
    }

    // If the search text is not empty, filter the products based on the search text. Create a new array with the products that match the search text
    if(text.length > 0){
      // If searching, filter the products based on the search text
      const currData = searching ? products : data;
      console.log(`Products: ${products}`);
      const filteredProducts = currData.filter((product) => {
      return product.name.toLowerCase().includes(text.toLowerCase());
    });
      console.log("Filtered Products:", filteredProducts);
      setData(filteredProducts);
    }
    //If search text is empty, reset the data to the original products
    else {
      setData(products);
      setProducts([]);
      loadData();
      setSearching(false);
    }
  }

  return (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <View style={styles.container}>
            <Stack.Screen options={{headerRight}}/>
            <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor={'#525b66'} value={searchText} onChangeText={(text) =>{search(text)}}/>
            <ScrollView
                style={styles.scrollView}>
                {data.map((product) => (
                    <Pressable 
                    key={product.id}
                    style={[
                        styles.cell, 
                        { backgroundColor: productIds.includes(product.id) ? '#525b66' : '#25292e' }
                    ]}
                    // if the product has extra options, user needs to select them before adding to list, else add to list directly
                    // onPress={async () => {
                    //     await optionsExists(product.id) ? openOptionsModal(product) : setCurrProduct(product);
                    // }}>
                    onPress={async () => {
                      if(!editMode){
                      if (await optionsExists(product.id)) {
                        openOptionsModal(product);
                      } else {
                        //add product to list if it doesn't already exist
                        const existsInSelection = productIds.includes(product.id);
    
                        if (!existsInSelection) {
                          // add product to list
                          setCurrProducts(prev => [...prev, product]);
                          setProductIds(prev => [...prev, product.id]);
                        } else {
                          // remove product from list
                          setCurrProducts(prev => prev.filter(p => p.id !== product.id));
                          setProductIds(prev => prev.filter(id => id !== product.id));
                        }
                        console.log("Product IDs:", productIds);
                        console.log("Current Products:", currProducts);
                      }
                    } else {
                      setCurrProduct(product);
                      setProductId(product.id);
                      setAddProductModalVisible(true);
                    }
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
                    
                    {editMode && (
                      <Pressable
                        onPress={() => {
                        setCurrProduct(product);
                        setProductId(product.id);
                        setAddProductModalVisible(true);
                        }}>
                        <Text style={styles.editButton}>Edit</Text>
                    </Pressable>
                  )}
                    </Pressable>
                  
                ))}    
            </ScrollView>

            

            <View style={styles.buttonContainer}>
                {/* {!editMode && currProduct.name !== "" && (<Button label="Submit" theme="primary" onPress={() => {
                  console.log("Name:", name);
                  search("")
                  onSuccess(currProduct, "")
                }} />)} */}

                 {!editMode && currProducts.length > 0 && (<Button label="Submit" theme="primary" onPress={() => {
                  console.log("Current Products on Submit:", currProducts);
                  search("")
                  onSuccess(currProducts, "")
                  setCurrProducts([]);
                  setProductIds([]);
                }} />)}
                {/* add product button */}


                {/* If in edit mode and search bar is empty, allow users to add products */}
                {editMode && !searching && (
                  <Button
                    label="Add Product"
                    theme="primary"
                    onPress={() => {
                      setAddProductModalVisible(true);
                    }}/>
                )}
                <Button label="Back" theme = "primary" onPress={() =>
                  {
                    setCurrProduct(defaultProduct);
                    console.log(currProduct);
                    setCurrProducts([]);
                    setProductIds([]);
                    onClose();
                  }
                  } />
            </View>

            <AddProductModal
                isVisible={addProductModalVisible}
                productId={productId}
                database={database}
                onClose={() => {
                    setCurrProduct(defaultProduct);
                    setAddProductModalVisible(false);
                    setProductId(null);
                }}
                onSuccess={() => {
                    setData(data.map(item => item.id === currProduct.id ? currProduct : item));
                    loadData();
                    setAddProductModalVisible(false);
                    setProductId(null);
                }}/>

            <OptionsModal
              isVisible={optionsModalVisible}
              productId={productId}
              onSuccess={(option: string) => {
                console.log("Name 1:", option);
                onSuccess(currProducts, option);
                setOptionsModalVisible(false);
                setCurrProduct(defaultProduct);
                console.log("Product ID:", productId);
                setProductId(null);
              }}
              onClose={() => {
                  setCurrProduct(defaultProduct);
                  setOptionsModalVisible(false);
                  console.log("Product ID:", productId);
                  setProductId(null);
                }
              }
            />
          </View>
    </Modal>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",

  },
  searchInput: {
    width: "100%",
    color: '#ffffffff',
    backgroundColor: '#25292eff',
    borderColor: '#525961',
    borderWidth: 3,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
    marginBottom: 15,

  },
  buttonContainer:{
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
    height: 300,
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
    borderColor: '#525961',
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