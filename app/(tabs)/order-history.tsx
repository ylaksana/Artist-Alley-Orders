import {Text, View, StyleSheet, ScrollView, Pressable} from 'react-native';
import { useSQLiteContext, SQLiteDatabase } from 'expo-sqlite';
import {useState, useEffect, useCallback} from 'react';
import { useFocusEffect } from "expo-router";

import OrderModal from '@/components/OrderModal';

export type OrderType ={
    id: number;
    type: string;
    name: string;
    email: string;
    list: ProductItem[];
    price: string;
}

export type ProductItem = {
    id: number;
    user_id: number;
    product: string;
    count: number;
}

export default function OrderHistoryScreen() {
    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const [data, setData] = useState<OrderType[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
    const database = useSQLiteContext();

    useFocusEffect(
        useCallback(() => {
          loadData();
          checkSoldProducts();
        }
        , [])
    );
    

    const loadData = async () => {
        const result = await database.getAllAsync<OrderType>(`SELECT * FROM orders`);
        console.log("Orders loaded:", result); // Check what data is being returned
        setData(result);
    };

    const deleteOrder = async (id: number) => {
        try{
            await database.runAsync(`DELETE FROM orders WHERE id = ?`, [id]);
            await database.runAsync(`DELETE FROM sold_products WHERE user_id = ?`, [id]);
            loadData();
        }
        catch (error) {
        alert(`Error deleting order: ${error}`);
        }
    }
    
    const checkSoldProducts = async () => {
        try {
          const allProducts = await database.getAllAsync(
            `SELECT * FROM sold_products`
          );
          console.log("All sold products:", allProducts);
        } catch (error) {
          console.error("Error checking sold products:", error);
        }
      };

    const openOrder = async (order: OrderType) => {
        try{
            const result = await database.getAllAsync<ProductItem>(`SELECT * FROM sold_products WHERE user_id = ?`, [order.id]);
            console.log("Order products:", result); // Check what products are returned
            order.list = result;
            setSelectedOrder(order);
            setOrderModalVisible(true);
        }
        catch (error) {
            alert(`Error fetching order details: ${error}`);
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
            >
            {data.map((order) =>(
                <View key={order.id} style={styles.cell}>
                    <Pressable onPress={() => openOrder(order)}>
                        <Text style={styles.text}>Type: {order.type}, Price: {order.price}</Text>
                    </Pressable>
                </View>
                
            ))}
            </ScrollView>
            {selectedOrder && (
                <OrderModal
                    isVisible={orderModalVisible}
                    order={selectedOrder}
                    onClose={() => setOrderModalVisible(false)}
                    onDelete={() => {
                        deleteOrder(selectedOrder.id);
                        setOrderModalVisible(false);
                    }}
                />
            )}
            
        </View>
        
    );
    
}

const styles=StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text:{
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollView: {
        backgroundColor: '#25292e',
        width: '100%',
        flex:1,
    },
    cell: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#25292e',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#525961', // Change this color to modify the border colo
    },

});