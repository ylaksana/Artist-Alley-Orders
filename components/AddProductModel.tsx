import {Modal, View, Text, Pressable, StyleSheet, TextInput, ScrollView} from 'react-native';
import { PropsWithChildren, useRef } from 'react';
import { useState, useEffect } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

// Modal component for adding/editing products, including managing extra options
type Props = PropsWithChildren<{
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productId?: number | null;
    database: SQLiteDatabase;
    productList: {id: number, name: string}[];
  }>;
  
// This component serves as a modal for both adding new products and editing existing ones. 
// It manages product details like name and price, as well as extra options that can be associated with a product.
// The component handles the logic for creating, updating, and deleting products and their options in the SQLite database. 
// It also provides a user interface for inputting product information and managing extra options.
export default function AddProductModal({isVisible, onSuccess, onClose, productId, database, productList} : Props) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [optionsData, setOptionsData] = useState<string[]>([]);
    const [optionText, setOptionText] = useState("");
    const [extraOptionsVisible, setExtraOptionsVisible] = useState(false);
    // const [previousOptions, setPreviousOptions] = useState<string[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const previousOptions = useRef<Set<string>>(new Set()); // Backup of original options fetched from database to manage option updates and cancellations
    const changesExists = optionsData.length !== previousOptions.current.size || optionsData.some(option => !previousOptions.current.has(option));
    // Flag to indicate whether to submit new product
    let submitFlag = false;
    // Product category type
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const testList = [1,2,3,4,5];

    
// Load product data and options when modal becomes visible or when productId changes
    useEffect(() => {
        if(!isVisible) {
            setName("");
            setPrice("");
            setEditMode(false);
            previousOptions.current.clear();
            setOptionsData([]);
            console.log("optionsData", optionsData);
            return;
        }

        if (productId != null) {
            setEditMode(true);
            loadProductData();
        }else{
            setEditMode(false);
        }
    }, [isVisible, productId]);

// Function to load product details and options from the database for editing
    const loadProductData = async () =>{
        if(productId == null) return;
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
        previousOptions.current = new Set(optionsList); // Backup original options in case of cancel
        console.log(`Loaded options for addProductModal:`, optionsList);

      }
      catch (error) {
        console.error("Error fetching data:", error);
      }
    };






    // MAIN FUNCTIONS FOR PRODUCT MANAGEMENT (CREATE, UPDATE, DELETE)//

    // Create Product and insert into database
    const createProduct = async () =>{
      // we add the new product to users table
      // if there are options added, we also add those to the extra_options table and link them with the new product's ID
      // if we fail to add a product, we rollback any changes to avoid having options without a product and vice versa
        
      
      //first we check if the name and the price are valid, if not we alert the user and don't proceed with database operations
      if (name == "" || price == "") {
        alert("Please enter a valid name and price.");
        return;
      }

      // then we check if there's an existing product with the same name to avoid duplicates
      if (productList.some(product => product.name === name)) {
        alert("A product with this name already exists.");
        return;
      }

        try{
          // atomic transaction
          await database.withTransactionAsync(async () => {
            // Insert new product into users table
            const result = await database.runAsync(
              "INSERT INTO users (name, email, count, hasOptions) VALUES(?, ?, ?, ?)",
              [
                name,
                price,
                0,
                optionsData.length > 0 ? 1 : 0,
              ]
            );

            // get the ID of the newly inserted product to link options
            const newID = result.lastInsertRowId;
            console.log("New product ID:", newID);

            // Insert associated options into extra_options table
            for (const option of optionsData) {
              await database.runAsync(
                "INSERT INTO extra_options (user_id, option) VALUES (?, ?)",
                [newID, option]
              );
            }
          });

          // Alert user that product was added and reset states
          alert("Added new product!");
          // reset states
          setName("");
          setPrice("");
          setOptionsData([]);
          setOptionText("");
          setSelectedOptions([]);
          // close out of modal
          onSuccess();
        } catch (error) {
          console.error("Error adding product:", error);
        } 
      }



    // Delete product and its associated options from database
    const deleteProduct = async () => {
      if(productId == null) return;
      // we need to delete the product from users table and also delete all associated options from extra_options table
      try{
        console.log("Deleting product with ID:", productId);
        // we run transactions to ensure that both deletions happen together
        // the same thing with creating products, if the process fails, we can just rollback changes and not have partial deletions

        // atomic transaction
        await database.withTransactionAsync(async () => {
          
          // delete options first, otherwise the app won't be able to find the productId foreign key in extra_options and throw an error
          await database.runAsync(
            `DELETE FROM extra_options WHERE user_id = ?`,
            [productId]
          );

          // then delete the product
          await database.runAsync(
            `DELETE FROM users WHERE id = ?`,
            [productId]
          );
        });
        

        // close out of modal and alert user that product was deleted
        onSuccess();
        alert("Product Deleted!");
      }
      catch (error) {
        console.error("Error deleting product:", error);
      }
    }


  // Update product details in the database for existing product
    const updateProduct = async () => {
      // make sure that productId is available before trying to update
        if(productId == null) return;

        // Determine if there are any options remaining after considering new additions and deletions
        const hasOptions = optionsData.length > 0;


        // debug log for checking if options remain after update
        if (hasOptions) {
          console.log("Options remain.");
        } else {
          console.log("No options remain.");
        }
        
        // we update product information in users table, including options
        // if there are options remaining, we set hasOptions to 1, otherwise set it to 0
        try {
          // atomic transaction to ensure no partial updates happen
          await database.withTransactionAsync(async () => {

            // Update product details in users table  
            await database.runAsync(
              `UPDATE users SET name = ?, email = ?, hasOptions = ? where id = ?`,
              [name, price, hasOptions ? 1 : 0, productId]
          );

          // After updating the product, we need to know how to update its options in the options table
          // we need two lists to keep track of the changes to options: 
          //    - newOptions for options added in this session
          //    - deletedOptions for options marked for deletion in this session
          
          // optionsData set
          const current = new Set(optionsData);
          // options to add
          const newOptions = optionsData.filter(x => !previousOptions.current.has(x));
          // options to delete
          const deletedOptions = [...previousOptions.current].filter(x => !current.has(x));
          
          // Update existing options in the database
          for (const option of newOptions) {
              await database.runAsync(
                  "INSERT INTO extra_options (user_id, option) VALUES (?, ?)",
                  [productId, option]
              );
          }

          // Delete options marked for deletion from the database
          for (const option of deletedOptions) {
              await database.runAsync(
                  "DELETE FROM extra_options WHERE user_id = ? AND option = ?",
                  [productId, option]
              );
          }

          });
            

            // message to alert user that product was updated and reset option management states
            alert("Product updated!");
            // now previous becomes current for the next time we edit the same product
            previousOptions.current = new Set(optionsData);
            // close out
            onSuccess();
        }catch (error) {
            console.error("Error updating product:", error);
        }
    }


    // Boolean functions to check if an option is in a list

    // Check if option already exists in optionsData
    const optionExists = (option: string) => {
      return optionsData.includes(option);
    }

    // Check if option exists in previousOptions (original options from database)
    const optionInPreviousList = (option: string) => {
      return previousOptions.current.has(option);
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

          // add to optionsData to update the UI with the new option immediately
          setOptionsData([...optionsData, optionText]);

          alert("Added new option!");
          console.log("optionsData after adding:", optionsData);
        }catch (error) {
          console.error("Error adding option:", error);
        }
    }


    // Delete selected options from optionsData
    const deleteOption = async () => {
      // make sure that there are selected options to delete
      if(selectedOptions.length === 0) return;

      // we need to manage the deletion of options based on whether they are newly added in this session or if they exist in the database
      let optionsCopy = [...optionsData];

      for (const option of selectedOptions) {
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

                  {/* Discount Dropdown */}
                  <View style={styles.discountContainer}>
                    <Picker
                      selectedValue={categoryId}
                      onValueChange={(itemValue) => setCategoryId(itemValue)}
                      style={styles.discountDropdown}
                    >
                      {testList.map((item) => (
                        <Picker.Item key={item} label={`Category ${item}`} value={item} />
                      ))}
                    </Picker>
                  </View>
                  

                  {/* Extra Options Button */}
                   <Pressable
                    style={styles.productModalButton}
                    onPress={() => {
                      setExtraOptionsVisible(true);
                    }}>
                    <Text style={{color: '#000'}}>{productId != null ? "Edit Extra Options" : "Add Extra Options"}</Text>
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
                      previousOptions.current.clear();
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
                {changesExists && (
                <Pressable
                  style={styles.productModalButton}
                  onPress={async () => {
                    setOptionsData([...previousOptions.current]);
                    setSelectedOptions([]);
                  }}>
                  <Text style={{color: '#000'}}>Revert Changes</Text>
                </Pressable>)}

                {/* Back Button */}
                <Pressable
                  style={styles.productModalButton}
                  onPress={() => {{
                    setSelectedOptions([]);
                    setExtraOptionsVisible(false);
                  }}}>
                  <Text style={{color: '#000'}}>Back</Text>
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
      scrollView: {
        backgroundColor: '#25292e',
        width: '100%',
        flex:1,
      },
      discountContainer: {
        height: 40,
        width: "80%",
        borderColor: "#fff",
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: "#333",
        justifyContent: "center",
        marginVertical: 10
      },
      discountDropdown: {
        width: '100%',
        color: '#fff', // Text color
      }
});