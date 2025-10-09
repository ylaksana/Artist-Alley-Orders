import {Modal, View, Text, Pressable, StyleSheet, TextInput, ScrollView} from 'react-native';
import { PropsWithChildren } from 'react';
import { useState, useEffect } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';


type Props = PropsWithChildren<{
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productId?: number | null;
    database: SQLiteDatabase;
  }>;
  

export default function AddProductModal({isVisible, onSuccess, onClose, productId, database} : Props) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [count, setCount] = useState(0);
    const [hasOptions, setHasOptions] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [optionsData, setOptionsData] = useState<string[]>([]);
    const [optionText, setOptionText] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [extraOptionsVisible, setExtraOptionsVisible] = useState(false);
    const [previousOptions, setPreviousOptions] = useState<string[]>([]);
    

    useEffect(() => {
        if(!isVisible) {
            setName("");
            setPrice("");
            setEditMode(false);
            setOptionsData([]);
            console.log("optionsData", optionsData);
            return;
        }

        if (productId) {
            setEditMode(true);
            loadData();
        }else{
            setEditMode(false);
        }
    }, [isVisible, productId]);

    // useFocusEffect(() => {
    //   addColumnToTable();
    // })

    // const addColumnToTable = async () => {
    //     try {
    //         await database.runAsync(
    //             `ALTER TABLE users
    //             ADD COLUMN hasOptions BOOLEAN DEFAULT 0`
    //         );
    //         console.log("Successfully added column count to users table.");
    //     }
    //     catch (error) {
    //         console.error("Error adding column to table:", error);
    //     }
    //   }

    const loadData = async () =>{
        if(!productId) return;
      try{
        //fetch product data
        const result = await database.getFirstAsync<{
          name:string;
          email:string;
        }>

        // Set name and price from fetched product data
        (`SELECT name, email FROM users WHERE id = ?;`, [productId]);
        if (result) {
            setName(result.name);
            setPrice(result.email);
        } else {
            console.warn("No result found for the given ID.");
        }
        
        //fetch options data
        const options = await database.getAllAsync<{user_id: number, option: string}>(
          `SELECT * FROM extra_options WHERE user_id=?`, [productId]
        );

        // Set hasOptions based on whether options exist
        setHasOptions(options.length > 0);

        // Set optionsData to the list of option strings saved in database
        const optionsList = options.map((item) => item.option);
        setOptionsData(optionsList);
        console.log("Options data:", optionsList);

      }
      catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const handleUpdate = async () => {
        if(!productId) return;
        
        try {
            database.runAsync(
                `UPDATE users SET name = ?, email = ?, hasOptions = ?, where id = ?`,
                [name, price, hasOptions, productId]
            );

            alert("Product updated!");
            onSuccess();
            onClose();
        }catch (error) {
            console.error("Error updating product:", error);
        }
    }

    const handleOptionChange = async () => {
      try{
        const result = await database.getAllAsync<{user_id: number, option: string}>(`SELECT * FROM extra_options`);
  
        const optionList = result.map((item) => item.option);
  
        const filteredOptions = optionsData.filter((option) => !optionList.includes(option));
        const allOptions = [...optionList, ...filteredOptions];
        console.log("All options:", allOptions);
        setOptionsData(allOptions);
      }
      catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    // Add new option to extra options
    // If there's a productId, backup original options are stored in the database
    const addOption = async () => {
        console.log("Adding option:", optionText);
        try{
          console.log("Adding option:", optionText);
          if (optionExists(optionText)) {
            alert("Option already exists!");
            return;
          }
          if(hasOptions && previousOptions.length === 0){
            setPreviousOptions([...optionsData]);
          }
          setOptionsData([...optionsData, optionText]);
          setOptionText("");
          alert("Added new option!");
        }catch (error) {
          console.error("Error adding option:", error);
        }
    }

    // Create Product and insert into database
    const createProduct = async () =>{
        try{
          // Insert new product into users table
          const result = await database.runAsync(
            "INSERT INTO users (name, email, count, hasOptions) VALUES(?, ?, ?, ?)",
            [
              name,
              price,
              count,
              hasOptions
            ]
          );
          const newID = result.lastInsertRowId;
          console.log("New product ID:", newID);
          // Insert each option into extra_options table with the new product's ID
          for (const option of optionsData) {
            database.runAsync(
              "INSERT INTO extra_options (user_id, option) VALUES (?, ?)",
              [newID, option]
            );
          }
          alert("Added new product!");
          setName("");
          setPrice("");
          setHasOptions(false);
          setOptionsData([]);
          onClose();
          onSuccess();
        } catch (error) {
          console.error("Error adding product:", error);
        } 
    }

    // Delete product and its associated options from database
    const deleteProduct = async () => {
      if(!productId) return;
      try{
        console.log("Deleting product with ID:", productId);
        await database.runAsync(
          `DELETE FROM users WHERE id = ?`,
          [productId]
        );
        await database.runAsync(
          `DELETE FROM extra_options WHERE id = ?`,
          [productId]
        );
        onSuccess();
        onClose();
        alert("Product Deleted!");
      }
      catch (error) {
        console.error("Error deleting product:", error);
      }
    }


    // Check if option already exists in optionsData
    const optionExists = (option: string) => {
      return optionsData.includes(option);
    }


    // Delete selected options from both UI and database
    const deleteOption = async () => {
      if(selectedOptions.length === 0) return;

      const deletedOptions =  [...selectedOptions];

      // Update UI immediately
      setOptionsData(optionsData.filter(option => !selectedOptions.includes(option)));
      setSelectedOptions([]);
      
      // Then perform database operations in the background
      try {
        if(productId){
          for (const option of deletedOptions) {
            await database.runAsync(
              `DELETE FROM extra_options WHERE user_id = ? AND option = ?`,
              [productId, option]
            );
          }
        }
        else{
          setOptionsData(optionsData.filter(option => !deletedOptions.includes(option)));
        }
        alert("Delete successful!");
      } catch (error) {
        console.error("Error deleting option:", error);
        alert("Error deleting option: " + error);
        
        // If there's an error, reload data to ensure UI is in sync with database
        handleOptionChange();
      }
    }



    // For selecting options in the extra options list
    const handleOptionSelect = (option: string) => {
      if (selectedOptions.includes(option)) {
        setSelectedOptions(selectedOptions.filter((item) => item !== option));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
      console.log("Selected options:", selectedOptions);
    };

    const handleCancel = () => {
      if (hasOptions) {
        // The product had options before editing, so revert to previous options
        setOptionsData(previousOptions);
        setPreviousOptions([]);
      }
      else{
        // The product didn't have options before editing, so clear all options
        setOptionsData([]);
      }
      setExtraOptionsVisible(false);
    }


    return(
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}>
          <View style={styles.productModalView}>
            <View style={styles.productModalCard}>

              {/* Product Name */}
              <Text style={styles.productModalText}>Add Product</Text>
              {!extraOptionsVisible && (
                <View style={styles.productOptions}>
                  
                  {/* Name Input */}
                  <TextInput
                    style={[styles.productNameInput, { color: '#fff' }]}
                    placeholder="Name"
                    placeholderTextColor={'#fff'}
                    value={name}
                    onChangeText={(text) => setName(text)}
                  ></TextInput>

                  {/* Price Input */}
                  <TextInput
                    style={styles.productNameInput}
                    placeholder="Price"
                    keyboardType="numeric"
                    placeholderTextColor={'#fff'}
                    value={price}
                    onChangeText={(text) => setPrice(text)}
                  ></TextInput>

                  {/* Extra Options Button */}
                   <Pressable
                    style={styles.productModalButton}
                    onPress={() => {
                      setExtraOptionsVisible(true);
                    }}>
                    <Text style={{color: '#000'}}>Add Extra Options</Text>
                  </Pressable>

                  {/* Update/Add Button */}
                  <Pressable
                    style={styles.productModalButton}
                    onPress={async () => {editMode ?  handleUpdate() : createProduct()}}>
                    <Text style={{color: '#000'}}>{editMode ? "Update" : "Add"}</Text>
                  </Pressable>

                  {/* Delete */}
                  {editMode && <Pressable
                    style={styles.productModalButton}
                    onPress={async () => deleteProduct()}>
                    <Text style={{color: '#000'}}>Delete</Text>
                  </Pressable>}

                  {/* Cancel Button */}
                  <Pressable
                    style={styles.productModalButton}
                    onPress={() => {
                      setOptionsData([]);
                      onClose();
                    }}>
                    <Text style={{color: '#000'}}>Cancel</Text>
                  </Pressable>
                </View>
              )}



              {/* Extra Options Section */}
              {extraOptionsVisible && (
                <View style={styles.productOptions}>
                  <TextInput style={styles.productNameInput} placeholder="Option" placeholderTextColor={'#fff'} value={optionText} onChangeText={(text)=>setOptionText(text)}></TextInput>

                  {/* List of options */}
                  <ScrollView style={styles.productModalExtraOptionsList} contentContainerStyle={{ paddingBottom: 30 }}>
                    {optionsData.map((option, index) => (
                      <Pressable key={index} onPress={() => handleOptionSelect(option)}>
                        <Text key={index} style={[styles.productModalExtraOptionsText, 
                          {backgroundColor: selectedOptions.includes(option) ? '#525b66' : '#25292e'}]}>{option}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* Add Option Button */}
                {optionText !== '' && (
                <Pressable
                  style={styles.productModalButton}
                  onPress={async () => {
                    if(!productId){
                      setOptionsData([...optionsData, optionText]);
                      setOptionText("");
                      // alert("Option added locally. Save the product to store it permanently.");
                    }
                    else{
                      addOption();
                      handleOptionChange();
                    }
                  }}>
                <Text style={{color: '#000'}}>Add Option</Text>
                </Pressable>)}

                {/* Delete Option Button */}
                {selectedOptions.length > 0 && (
                  <Pressable
                    style={styles.productModalButton}
                    onPress={async () => {
                      deleteOption();
                    }}>
                    <Text style={{color: '#000'}}>Delete Option</Text>
                  </Pressable>)}
{/* 
                {selectedOptions.length > 0 && (
                <Pressable
                  onPress={() => {
                    setSelectedOptions([])
                    setHasOptions(false);
                  }}
                  style={styles.productModalButton}
                >
                  <Text style={{ color: '#000' }}>Clear Selection</Text>
                </Pressable>)} */}

                {/* Back Button */}
                <Pressable
                  style={styles.productModalButton}
                  onPress={async () => {
                    if (optionsData.length > 1) {
                      handleCancel();
                    } else {
                      setExtraOptionsVisible(false);
                    }
                  }}>
                  <Text style={{color: '#000'}}>{optionsData.length > 1 ? "Cancel" : "Back"}</Text>
                </Pressable>
                  
                </View>
              )}
            
            </View>

            
          </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    productNameInput:{
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
      productOptions:{
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        width: '100%',
      },
      productModalView:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      },
      productModalCard:{
        margin:20,
        width:'80%',
        backgroundColor: '#25292e',
        borderColor: '#ffd33d',
        borderWidth: 4,
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset:{
          width:0,
          height:2,
        },
        justifyContent: 'center',
        alignItems: 'center',
      },
      productModalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        color: '#ffd33d',
      },
      productModalButton:{
        backgroundColor: '#ffd33d',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
        width: '80%',
      },
      productModalExtraOptionsText:{
        borderWidth: 2,
        borderRadius: 5,
        borderColor: '#ffd33d',
        textAlign: 'center',
        padding: 5,
        fontSize: 16,
        color: '#fff',
        marginTop: 10,
      },
      productModalExtraOptionsList:{
        backgroundColor: '#25292e',
        borderRadius: 5,
        borderWidth: 3,
        borderColor: '#ffd33d',
        padding: 10,
        margin: 10,
        width: '100%',
        maxHeight: 200,
      },
});