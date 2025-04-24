import {Text, View, StyleSheet, ScrollView} from 'react-native';
import { useSQLiteContext, SQLiteDatabase } from 'expo-sqlite';
import {useState, useEffect, useCallback} from 'react';

export type OrderType ={
    id: number;
    type: string;
    name: string;
    email:string;
    list: string[];
    price: string;
}
export default function OrderHistoryScreen() {

 useEffect(() => {
    loadData();
 });

    const database = useSQLiteContext();
    
    const [data, setData] = useState<OrderType[]>([]);

    const loadData = async () => {
        const result = await database.getAllAsync<OrderType>(`SELECT * FROM orders`);
        setData(result);
    };
    
    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
            >
            {data.map((order) =>(
                <View key={order.id} style={styles.cell}>
                    <Text style={styles.text}>Type: {order.type}, Price: {order.price}</Text>
                </View>
            ))}
            </ScrollView>
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