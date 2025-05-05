import { Text, View, StyleSheet, ScrollView, Pressable, Modal, TextInput } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Stack } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from "react";

export type ProductType = {
    id: number;
    name:string;
    email:string;
    count: number;
    hasOptions: boolean;
  }

export default function OrderList() {
    // variables
    const [addProductModalVisible, setAddProductModalVisible] = useState(false);
    const [SelectProductModalVisible, setSelectProductModalVisible] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
    const [sum, setSum] = useState(0);

    // database
    const database = useSQLiteContext();

    // functions
    const headerLeft = () => {
        return(
          <Pressable onPress={() => setAddProductModalVisible(true)} style={{marginLeft: 5, padding: 10}}>
            <FontAwesome name="gear" size={24} color="#ffd33d"/>
          </Pressable>
        )
      }

      const headerRight = () => {
        return(
          <Pressable onPress={() => setAddProductModalVisible(true)} style={{marginLeft: 5, padding: 10}}>
            <FontAwesome name="plus-circle" size={24} color="#ffd33d"/>
          </Pressable>
        )
      }

      const addProductToList = (product: ProductType, isAdding: Boolean) => {
        product.count++;
        if(product.count === 1) {
          setSelectedProducts([...selectedProducts, product]);
        }
        setSum(sum + parseInt(product.email));
        console.log(selectedProducts);
      };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{headerLeft}}/>
            <Stack.Screen options={{headerRight}}/>
            <Text style={styles.title}>Order List</Text>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.orderText}>Order 1</Text>
                <Text style={styles.orderText}>Order 2</Text>
                <Text style={styles.orderText}>Order 3</Text>
            </ScrollView>
            <Pressable style={styles.button} onPress={() => {}}>
                <Text style={styles.buttonText}>Add Order</Text>
            </Pressable>
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
});