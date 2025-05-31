import {Text, View, StyleSheet, ScrollView, Pressable} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useLocalSearchParams } from 'expo-router';
import {useState, useEffect, useCallback} from 'react';
import { useFocusEffect } from "expo-router";

import OrderModal from '@/components/OrderModal';
import { useDatabaseContext } from '../_layout';


export type OrderType ={
    id: number;
    type: string;
    name: string;
    email: string;
    phone: string;
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
    const { selectedDatabase } = useDatabaseContext();
    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const [data, setData] = useState<OrderType[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
    const database = useSQLiteContext();

    

    console.log('Order History - Selected Database:', selectedDatabase);

    useFocusEffect(
        useCallback(() => {
          loadData();
          checkSoldProducts();
        }
        , [])
    );
    
    const updateSoldProductsTable = async () => {
        try {
            if (!selectedDatabase) {    
                console.warn('No database selected in Order History');
                setData([]);
                return; // Exit early
            }
            await database.runAsync(
                `ALTER TABLE sold_products
                ADD COLUMN db_id`
            );
            console.log("Successfully added column db_id to sold_products table.");
            await database.runAsync(
                `UPDATE sold_products
                SET db_id = ?`,
                [selectedDatabase?.id]
            );
        } catch (error) {
            console.error("Error adding db_id to sold_products table:", error);
        }
    }

    // const updateOrderTable = async () => {
    //     try {
    //          if (!selectedDatabase) {    
    //             console.warn('No database selected in Order History');
    //             setData([]);
    //             return; // Exit early
    //         }
    //                 await database.runAsync(
    //             `ALTER TABLE sold_products
    //             ADD COLUMN db_id`
    //         );
    //         console.log("Successfully added column db_id to orders table.");
    //         await database.runAsync(
    //             `UPDATE sold_products
    //             SET db_id = ?`,
    //             [selectedDatabase?.id]
    //         );
    //     } catch (error) {
    //         console.error("Error adding phone to table:", error);
    //     }
    // }

    const loadData = async () => {
        if (!selectedDatabase) {    
        console.warn('No database selected in Order History');
        setData([]);
        return; // Exit early
    }
        const result = await database.getAllAsync<OrderType>(`SELECT * FROM orders WHERE db_id = ?`, [selectedDatabase.id]);
        // Uncomment the line below to log the result for debugging
        console.log("Orders loaded:", result);
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
        //   console.log("All sold products:", allProducts);
        } catch (error) {
          console.error("Error checking sold products:", error);
        }
      };

    const openOrder = async (order: OrderType) => {
        try{
            const result = await database.getAllAsync<ProductItem>(`SELECT * FROM sold_products WHERE user_id = ?`, [order.id]);
            // console.log("Order products:", result);
            order.list = result;
            setSelectedOrder(order);
            setOrderModalVisible(true);
        }
        catch (error) {
            alert(`Error fetching order details: ${error}`);
        }
    }

    const logDatabaseID = () => {
        console.log("Current Database ID:", selectedDatabase?.id);  
    }
    

    useEffect(() => {
        // updateOrderTable();
        logDatabaseID();
    }, []);

    return (
        <View style={styles.container}>
            {data.length > 0 && 
            (<ScrollView 
                style={styles.scrollView}
                >
                {data.map((order) =>(
                    <View key={order.id} style={styles.cell}>
                        <Pressable onPress={() => openOrder(order)}>
                            <Text style={styles.text}>Type: {order.type}, Price: ${order.price}</Text>
                        </Pressable>
                    </View>
                
                ))}
            </ScrollView>)}
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
            
            {data.length === 0 && (<Text style={styles.text}>No Sales Yet!</Text>)}
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