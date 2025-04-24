import { Text, View, StyleSheet, ScrollView, Pressable, Modal, TextInput } from "react-native";
import {useState, useEffect, useCallback} from 'react';
import { Stack, useFocusEffect, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Button from "@/components/Button"; // Adjust the path as necessary
import WarningModal from "@/components/WarningModal"; // Adjust the path as necessary
import AddProductModal from "@/components/AddProductModel"; // Adjust the path as necessary

export default function Index() {
  const [data, setData] = useState<ProductType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);

  
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
  }


  const loadData = async () => {
    const result = await database.getAllAsync<ProductType>(`SELECT * FROM users`);
    setData(result);
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
      setOrderType("Convention Sale");
      const result = await database.runAsync(
        "INSERT INTO orders (type, name, email, price) VALUES(?, ?, ?, ?)",
        [
          orderType,
          name,
          email,
          sum
        ]
      );

      const orderId = result.lastInsertRowId;
      
      selectedProducts.forEach((product) => {
        database.runAsync(
          "INSERT INTO sold_products (user_id, product, count) VALUES(?, ?, ?",
          [
            orderId,
            product.name,
            product.count
          ]
        );
      });

      setName("");
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

  const addProductToList = (product: ProductType, isAdding: Boolean) => {
    if (!isAdding) {
      product.count--;
      if (product.count < 1) {
        setSelectedProducts(selectedProducts.filter(item => item.name !== product.name));
      }

      setSum(sum - parseInt(product.email));

    } else {
      product.count++;
      if(product.count === 1) {

        setSelectedProducts([...selectedProducts, product]);
      }

      setSum(sum + parseInt(product.email));

    }
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
              ]}>
              <View style={styles.productCounterContainer}>
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
                    addProductToList(product, true);
                  }}>
                  <FontAwesome name="plus-circle" size={24} color="#ffd33d"/>
                </Pressable>
              </View>
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
          setName('N/A'),
          setOrderType('Convention Sale'),
          setEmail('N/A'),
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
    fontSize: 20,
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
