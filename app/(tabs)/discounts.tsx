// libraries
import { Text, View, StyleSheet, ScrollView, Pressable} from "react-native";
import {useState} from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Feather, Ionicons } from '@expo/vector-icons';

// components
import WarningModal from "@/components/WarningModal";  
import { Stack } from "expo-router";

export default function DiscountsScreen(){

    const headerLeft = () => {
        return(
          <Pressable onPress={() => {
            // navigate to discount creation screen
            }
          } 
          style={{marginLeft: 5, padding: 10}}>
            <Feather name="plus" size={24} color="#ffd33d"/>
          </Pressable>
        )
      }

    // database
    const db = useSQLiteContext();
    const [warningModalVisible, setWarningModalVisible] = useState(false);
    // necessary info for discounts
    const [priceCut, setPriceCut] = useState<string>("0");
    const [discountName, setDiscountName] = useState<string>("");
    const [threshold, setThreshold] = useState<string>("0");
    const [list, setList] = useState<number[]>([1,2,3,4,5,6,7,8,9,10]);


    const createDiscount = async () => {
        // insert entry in discounts
        try{
            // atomic transaction
            await db.withTransactionAsync(async() => {
                const result = await db.runAsync(
                    "INSERT INTO users (name, price_cut, threshold) VALUES(?, ?, ?)",
                    [
                        discountName,
                        priceCut,
                        threshold
                    ]
                );
            });

            alert("Discount successfully added!");
        }
        catch(error){
            console.error("Error in inserting entry into discounts: ", error);
        }
    }

    const deleteDiscount = async (id: number) => {
        // remove entry from discounts
        try{
            await db.withTransactionAsync(async() =>{
                await db.runSync(
                        "DELETE FROM discounts where id = ?",[id]
                    );
                }
            );

            alert("Successfully deleted entry from discounts");
        }
        catch(error){
            console.error("Error removing entry from discounts: ", error);
        }
    }

    const updateDiscount = async (id: number) => {
        // update discount
        try{
            await db.withTransactionAsync(async() => {
                await db.runAsync(
                        "UPDATE discounts SET name = ?, price_cut = ?, threshold = ? where id = ?",
                        [
                           discountName,
                           priceCut, 
                           threshold
                        ]
                    );  
                }
            );

            alert("Successfully updated entry!");
        }
        catch(error){
            console.error("Error updating entry in discounts: ", error);
        }
    }


    // Screen Layout
    return(
        
        <View style={styles.container}>
             <Stack.Screen options={{headerLeft}}/>
            <ScrollView style={styles.scrollView}>
                {/* This is where the list of discounts will be displayed */}
                {list.map((discount, index) => (
                    <View key={index} style={styles.cell}>
                      
                        <Text style={styles.text}>{discount}</Text>
                        <Pressable
                        onPress={() => {
                            // navigate to discount editing screen
                        }}>
                            <Ionicons name="ellipsis-vertical" size={17} color='#ffd33d'/>
                        </Pressable>
                      
                    </View>
                ))}
            </ScrollView>
        
        
        {/* We save the discount to the database and then close the modal */}
            <WarningModal
                isVisible={warningModalVisible}
                onClose={() => setWarningModalVisible(false)}
                onSuccess={() => {
                    createDiscount()
                    setWarningModalVisible(false);
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    title:{
        fontSize: 20,
        marginBottom: 20,
    },
    container:{
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text:{
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollView:{
        backgroundColor: "#25292e",
        height: 300,
        width: "100%",
        flex: 1,
    },
    cell:{
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


})