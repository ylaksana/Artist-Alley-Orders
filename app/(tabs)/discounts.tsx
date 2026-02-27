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
    const database = useSQLiteContext();
    const [warningModalVisible, setWarningModalVisible] = useState(false);
    // necessary info for discounts
    const [priceCut, setPriceCut] = useState<string>("0");
    const [discountName, setDiscountName] = useState<string>("");
    const [threshold, setThreshold] = useState<string>("0");
    const [list, setList] = useState<number[]>([1,2,3,4,5,6,7,8,9,10]);


    const createDiscount = async () => {
        // not implemented yet
    }

    const deleteDiscount = async () => {
        // not implemented yet
    }

    const updateDiscount = async () => {
        // not implemented yet
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