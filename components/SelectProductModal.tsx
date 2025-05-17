import { Text, View, StyleSheet, ScrollView, Pressable, Modal, TextInput } from "react-native";
import {useState, useEffect, useCallback} from 'react';
import { Stack, useFocusEffect, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Button from "@/components/Button"; // Adjust the path as necessary
import AddProductModal from "@/components/AddProductModel"; // Adjust the path as necessary
import OptionsModal from "@/components/OptionsModal";
import { ProductType, defaultProduct } from "@/app/(tabs)/index";


type Props = {
    isVisible: boolean;
    editMode?: boolean;
    onClose: () => void;
    onSuccess: (product: ProductType, name: string) => void;
}

export default function SelectProductModal({isVisible, editMode, onClose, onSuccess}: Props) {
  const [data, setData] = useState<ProductType[]>([]);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [currProduct, setCurrProduct] = useState<ProductType>(defaultProduct);
  const [name, setName] = useState<string>("");
  
  
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

  useFocusEffect(
    useCallback(() => {
      loadData();
      setCurrProduct
    }
    , [])
  );

  // useFocusEffect(() => {
  //   if (isVisible) {
  //     setCurrProduct(defaultProduct);
  //   }
  // })

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
      setCurrProduct(product);
      setProductId(product.id);
      console.log("Product:", product);
      setOptionsModalVisible(true);
    }
  }

 

  return (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <View style= {styles.container}>
            <Stack.Screen options={{headerRight}}/>
            <ScrollView
                style={styles.scrollView}>
                {data.map((product) => (
                    <Pressable 
                    key={product.id}
                    style={[
                        styles.cell, 
                        { backgroundColor: currProduct.id === product.id ? '#525b66' : '#25292e' }
                    ]}
                    onPress={async () => {
                        await optionsExists(product.id) ? openOptionsModal(product) : setCurrProduct(product);
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

            

            <View style={styles.buttomContainer}>
                {!editMode && currProduct.name !== "" && (<Button label="Submit" theme = "primary" onPress={() => {
                  console.log("Name:", name); 
                  onSuccess(currProduct, "")}
                  } />)}
                {/* add product button */}

                {editMode && (
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
                onSuccess(currProduct, option);
                setOptionsModalVisible(false);
                console.log("Product ID:", productId);
                setProductId(null);
              }}
              onClose={() => 
                {
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