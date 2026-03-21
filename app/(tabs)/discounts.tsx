// libraries
import { Text, View, StyleSheet, ScrollView, Pressable, TextInput} from "react-native";
import {useState} from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Feather, Ionicons } from '@expo/vector-icons';

// components
import WarningModal from "@/components/WarningModal";  
import { Stack } from "expo-router";

export default function DiscountsScreen(){
    // database
    const db = useSQLiteContext();
    const [warningModalVisible, setWarningModalVisible] = useState(false);
    // necessary info for discounts
    const [priceCut, setPriceCut] = useState<string>("");
    const [discountName, setDiscountName] = useState<string>("");
    const [threshold, setThreshold] = useState<string>("");
    const [list, setList] = useState<number[]>([1,2,3,4,5,6,7,8,9,10]);
    const [discountCreateMode, setDiscountCreateMode] = useState<boolean>(false);
    const [discountEditMode, setDiscountEditMode] = useState<boolean>(false);

    // top-left corner icon
    const headerLeft = () => {
        return(
            !discountCreateMode && !discountEditMode ? 
            
            // SHOW PLUS ICON WHEN NOT IN EDIT MODE, NAVIGATE TO DISCOUNT CREATION SCREEN
            (<Pressable onPress={() => {
                // navigate to discount creation screen
                setDiscountCreateMode(true);
                setDiscountEditMode(false);
                }
            } 
            style={{marginLeft: 5, padding: 10}}>
                <Feather name="plus" size={24} color="#ffd33d"/>
            </Pressable>
            ) :
            // SHOW BACK BUTTON IN EDIT MODE, NAVIGATE BACK TO DISCOUNTS SCREEN ON PRESS
            (
            <Pressable onPress={() => {
                // navigate to discount creation screen
                setDiscountCreateMode(false);
                setDiscountEditMode(false);
                }
            } 
            style={{marginLeft: 5, padding: 10}}>
                <Feather name="arrow-left" size={24} color="#ffd33d"/>
            </Pressable>
            )
        );
    }
        
    // database functions for creating, updating, and deleting discounts

    // discount creation: simply insert the discount into the discounts table with the given info
    const createDiscount = async () => {
        // insert entry in discounts
        try{
            // atomic transaction
            await db.withTransactionAsync(async() => {
                await db.runAsync(
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

    // discount deletion: simply delete the discount from the discounts table with the given id
    const deleteDiscount = async (id: number) => {
        // remove entry from discounts
        try{
            // delete the discount with given id
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

    // we can reuse the same screen for creating and updating discounts, we just need to pass in the id of the discount we want to update
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

        {/*Change the view based on whether we are editing or creating a discount*/}
            {!discountCreateMode && !discountEditMode ? 
                // discount list page
                (<ScrollView style={styles.scrollView}>
                    {/* This is where the list of discounts will be displayed */}
                    {list.map((discount, index) => (
                        <View key={index} style={styles.cell}>
                        
                            <Text style={styles.text}>{discount}</Text>
                            <Pressable
                            onPress={() => {
                                // navigate to discount editing screen
                                setDiscountEditMode(true);
                                console.log(discountEditMode);
                            }}>
                                <Ionicons name="ellipsis-vertical" size={17} color='#ffd33d'/>
                            </Pressable>
                        
                        </View>
                    ))}
                </ScrollView>) 
                : 
                // discount creation page
                !discountCreateMode ?

                    // DISCOUNT EDITING MODE
                    (<View style={styles.container}></View>)
                    
                    : 
                    
                    // DISCOUNT CREATION MODE
                    (<View style={styles.container}>
                        <Text style={styles.titleText}>Create a new discount</Text>
                        <TextInput 
                            style={[styles.textInput, {marginTop: 20}]} 
                            placeholder="Discount Name" 
                            placeholderTextColor="#fff"
                            onChangeText={(text) => setDiscountName(text)}
                            value={discountName}
                        />
                        <TextInput
                            style = {styles.textInput}
                            placeholder="Price Cut Amount"
                            placeholderTextColor="#fff"
                            keyboardType="numeric" 
                            onChangeText={(text) => setPriceCut(text)}
                            value={priceCut}
                        />
                        <TextInput
                            style = {styles.textInput}
                            placeholder="Number of units required for discount"
                            placeholderTextColor="#fff"
                            keyboardType="numeric"
                            onChangeText={(text) => setThreshold(text)}
                            value={threshold}
                        />
                        <Pressable
                        style={styles.createButton}
                        onPress={() => {
                            // show warning modal before creating discount
                            setWarningModalVisible(true);
                        }}>
                            <Text style={styles.buttonText}>Create Discount</Text>
                        </Pressable>
                    </View>)
            }
            


          
        
        
        {/* We save the discount to the database and then close the modal */}
            <WarningModal
                isVisible={warningModalVisible}
                onClose={() => setWarningModalVisible(false)}
                onSuccess={() => {
                    createDiscount();
                    setWarningModalVisible(false);
                    setDiscountName("");
                    setPriceCut("");
                    setThreshold("");
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
        width: '100%',
    },
    text:{
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    titleText:{
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
    },
    scrollView:{
        backgroundColor: "#25292e",
        height: 300,
        width: "95%",
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
    textInput:{
        height: 40,
        width: '80%',
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        color: '#fff', // Text color
        backgroundColor: '#333', // Background color for the text box
    },
    createButton:{
        backgroundColor: '#ffd33d',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText:{
        color: '#000000',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 2,
    },
})