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
    const [editMode, setEditMode] = useState(false);
    const [optionsData, setOptionsData] = useState<string[]>([]);
    const [optionText, setOptionText] = useState("");
    const [extraOptionsVisible, setExtraOptionsVisible] = useState(false);
    const [previousOptions, setPreviousOptions] = useState<string[]>([]);
    const [newOptions, setNewOptions] = useState<string[]>([]);
    const [deletedOptions, setDeletedOptions] = useState<string[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    

    useEffect(() => {
        if(!isVisible) {
            setName("");
            setPrice("");
            setEditMode(false);
            setPreviousOptions([]);
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

        // Set optionsData to the list of option strings saved in database
        const optionsList = options.map((item) => item.option);

        // Set optionsData and previousOptions to the fetched options
        setOptionsData(optionsList);
        setPreviousOptions(optionsList); // Backup original options in case of cancel
        console.log(`Loaded options for addProductModal:`, optionsList);

      }
      catch (error) {
        console.error("Error fetching data:", error);
      }
    };


    // Update product details in the database for existing product
    const updateProduct = async () => {
        if(!productId) return;

        const hasOptions = (previousOptions.length + newOptions.length) - deletedOptions.length > 0;

        if (hasOptions) {
          console.log("Options remain.");
        } else {
          console.log("No options remain.");
        }
        
        try {
            await database.runAsync(
                `UPDATE users SET name = ?, email = ?, hasOptions = ? where id = ?`,
                [name, price, hasOptions ? 1 : 0, productId]
            );
            
            // Update existing options in the database
            for (const option of newOptions) {
                await database.runAsync(
                    "INSERT INTO extra_options (user_id, option) VALUES (?, ?)",
                    [productId, option]
                );
            }
            for (const option of deletedOptions) {
                await database.runAsync(
                    "DELETE FROM extra_options WHERE user_id = ? AND option = ?",
                    [productId, option]
                );
            }


            alert("Product updated!");
            setDeletedOptions([]);
            setNewOptions([]);
            onSuccess();
            onClose();
        }catch (error) {
            console.error("Error updating product:", error);
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
              0,
              newOptions.length > 0 ? 1 : 0,
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





    // Boolean functions to check if an option is in a list

    // Check if option already exists in optionsData
    const optionExists = (option: string) => {
      return optionsData.includes(option);
    }

    // Check if option exists in previousOptions (original options from database)
    const optionInPreviousList = (option: string) => {
      return previousOptions.includes(option);
    }

    // Check if option exists in deletedOptions (options marked for deletion)
    const optionInDeletedList = (option: string) => {
      return deletedOptions.includes(option);
    }

    // Check if option exists in newOptions (options added in current session)
    const optionInNewList = (option: string) => {
      return newOptions.includes(option);
    }

    
    // Add new option to extra options
    // If there's a productId, backup original options are stored in the database
    const addOption = async () => {
        console.log("Adding option:", optionText);
        try{
          if (optionExists(optionText)) {
            alert("Option already exists!");
            return;
          }

          // If editing an existing product, manage newOptions and deletedOptions lists

          // If option was in previousOptions and also in deletedOptions, it means user is re-adding a previously deleted option
          if(optionInPreviousList(optionText) && optionInDeletedList(optionText)){
            setOptionsData([...optionsData, optionText]);
          }
          // If option is in newOptions, it means user is trying to add a duplicate new option
          else if(optionInPreviousList(optionText) && !optionInDeletedList(optionText)){
            alert("Option already exists!");
            return;
          }
          // If option is not in previousOptions and not in newOptions, it's a completely new option
          else{
            setOptionsData([...optionsData, optionText]);
            setNewOptions([...newOptions, optionText]);
          }

          // Clear the input box after adding
          setOptionText("");

          alert("Added new option!");
          console.log("optionsData after adding:", optionsData);
        }catch (error) {
          console.error("Error adding option:", error);
        }
    }


    // Delete selected options from optionsData
    const deleteOption = async () => {
      if(selectedOptions.length === 0) return;

      let optionsCopy = [...optionsData];

      for (const option of selectedOptions) {
        if (optionInNewList(option)) {
          // If option is newly added in this session, just remove it from optionsData and newOptions
          setNewOptions(newOptions.filter((item) => item !== option));
        }
        else{
          // If option exists in previousOptions, it means it's stored in the database
          deletedOptions.push(option); // Mark it for deletion from database
        }
        optionsCopy = optionsCopy.filter((item) => item !== option); // Remove from current optionsData
      }

      setOptionsData(optionsCopy);
      setSelectedOptions([]); // Clear selected options after deletion
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
                    <Text style={{color: '#000'}}>{productId ? "Edit Extra Options" : "Add Extra Options"}</Text>
                  </Pressable>

                  {/* Update/Add Button */}
                  <Pressable
                    style={styles.productModalButton}
                    onPress={async () => {editMode ?  updateProduct() : createProduct()}}>
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
                      setPreviousOptions([]);
                      setNewOptions([]);
                      setDeletedOptions([]);
                      setExtraOptionsVisible(false);
                      onClose();
                    }}>
                    <Text style={{color: '#000'}}>Cancel</Text>
                  </Pressable>
                </View>
              )}



              {/* Extra Options Section */}
              {extraOptionsVisible && (
                <View style={styles.productOptions}>

                  {/* Option Input */}
                  <TextInput style={styles.productNameInput} placeholder="Type your option here.." placeholderTextColor={'#fff'} value={optionText} onChangeText={(text)=>setOptionText(text)}></TextInput>

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
                  onPress={async () => addOption()}>
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


                {/* Revert Button */}
                {newOptions.length > 0 || deletedOptions.length > 0 && (
                <Pressable
                  style={styles.productModalButton}
                  onPress={async () => {
                    setOptionsData(previousOptions);
                    setDeletedOptions([]);
                    setNewOptions([]);
                    setSelectedOptions([]);
                  }}>
                  <Text style={{color: '#000'}}>Revert Changes</Text>
                </Pressable>)}

                {/* Back Button */}
                (<Pressable
                  style={styles.productModalButton}
                  onPress={async () => {{
                    setSelectedOptions([]);
                    setExtraOptionsVisible(false);
                  }}}>
                  <Text style={{color: '#000'}}>Back</Text>
                </Pressable>)
                  
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