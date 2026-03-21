// libraries
import { Text, View, StyleSheet, ScrollView, Pressable, TextInput} from "react-native";
import {useCallback, useState} from "react";
import { useSQLiteContext, SQLiteDatabase  } from "expo-sqlite";
import { Feather, Ionicons } from '@expo/vector-icons';

// components
import WarningModal from "@/components/WarningModal";  
import { Stack, useFocusEffect } from "expo-router";
import { DiscountType } from "@/types";
import { useDatabaseContext } from "../_layout";

export default function DiscountsScreen(){
    // database
    const db = useSQLiteContext() as SQLiteDatabase;
    const { selectedDatabase } = useDatabaseContext();;
    const [warningModalVisible, setWarningModalVisible] = useState(false);
    // pagination for discount list
    const [pageNumber, setPageNumber] = useState<number>(1);
    const limit = 10;
    // necessary info for discounts
    const [priceCut, setPriceCut] = useState<string>("");
    const [discountName, setDiscountName] = useState<string>("");
    const [threshold, setThreshold] = useState<string>("");
    const [discounts, setDiscounts] = useState<DiscountType[]>([]);
    const [discountCreateMode, setDiscountCreateMode] = useState<boolean>(false);
    const [discountEditMode, setDiscountEditMode] = useState<boolean>(false);
    

    // top-left corner icon
    const headerLeft = () => {
        return(

            // if we aren't in either edit or create mode, show the plus icon to navigate to the discount creation screen, 
            // otherwise show the back arrow to navigate back to the discount list screen
            !discountCreateMode && !discountEditMode ? 
            
            // SHOW PLUS ICON WHEN NOT IN EDIT MODE OR CREATE MODE, NAVIGATE TO DISCOUNT CREATION SCREEN
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
            // SHOW BACK BUTTON IN EDIT MODE OR CREATE MODE, NAVIGATE BACK TO DISCOUNTS SCREEN ON PRESS
            (
            <Pressable onPress={() => {
                // navigate to discount list screen
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
    

    
    /// discount screen init ///
    

    // navigate to new page
    const goToPage = async (newPage: number) => {
        
        if (!selectedDatabase) {
            return;
        }

        // load discounts for the page we are navigating to
        setPageNumber(newPage);
        loadDiscounts(newPage);
    }

    // load set number of discounts with offset and limit based on the current page number
    const loadDiscounts = async (page: number) => {
        try{
            const limit = 10;
            const offset = (page - 1) * limit;
            const query = `SELECT * FROM discounts LIMIT ? OFFSET ?`;
            const params = [limit, offset];
            
            
            const results = await db.getAllAsync<DiscountType>(query, params);
            
            if (results.length > 0) {
                setDiscounts(results);
            }
            else{
                setDiscounts([]);
                setPageNumber(page - 1);
            }
        }
        catch(error){
            console.error("Error loading discounts: ", error);
        }
    }

    const nextPageExists = async (page: number) => {
        if (!selectedDatabase) {
            console.log("nextPageExists: no selected database");
            return false;
        }

        const offset = (page - 1) * limit;
        const row = await db.getFirstAsync<{ total: number }>(
            `SELECT COUNT(*) AS total FROM discounts`,
        );

        const total = row?.total ?? 0;
        const pageExists = total > offset;
        console.log(`nextPageExists -> page=${page}, offset=${offset}, total=${total}, hasRowsOnPage=${pageExists}`);
        return pageExists;
    }


     useFocusEffect(
        useCallback(() => {
            if (selectedDatabase) {
                goToPage(pageNumber);
            }
        }, [selectedDatabase, pageNumber])
    );





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
                    {discounts.map((discount, index) => (
                        <View key={index} style={styles.cell}>
                        
                            <Text style={styles.text}>{discount.discountName}</Text>
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
                    (<View style={styles.container}>
                        <Text style={styles.titleText}>Edit discount</Text>
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
                            <Text style={styles.buttonText}>Update Discount</Text>
                        </Pressable>
                    </View>)
                    
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