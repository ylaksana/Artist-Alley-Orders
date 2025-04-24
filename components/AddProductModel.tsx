import {Modal, View, Text, Pressable, StyleSheet, TextInput} from 'react-native';
import { PropsWithChildren } from 'react';
import { useState, useEffect } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';


type Props = PropsWithChildren<{
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productId?: number | null;
    database: SQLiteDatabase;
  }>;

export default function WarningModal({isVisible, onSuccess, onClose, productId, database} : Props) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [count, setCount] = useState(0);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        if(!isVisible) {
            setName("");
            setPrice("");
            setEditMode(false);
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

        const result = await database.getFirstAsync<{
            name:string;
            email:string;
        }>
        (`SELECT name, email FROM users WHERE id = ?;`, [productId]);
        if (result) {
            setName(result.name);
            setPrice(result.email);
        } else {
            console.warn("No result found for the given ID.");
        }
    };

    const handleUpdate = async () => {
        if(!productId) return;
        
        try {
            const response = await database.runAsync(
                `UPDATE users SET name = ?, email = ? where id = ?`,
                [name, price, productId]
            );
            alert("Product updated!");
            onSuccess();
            onClose();
        }catch (error) {
            console.error("Error updating product:", error);
        }
    }

    const createProduct = () =>{
        try{
          database.runAsync(
            "INSERT INTO users (name, email, count) VALUES(?, ?, ?)",
            [
              name,
              price,
              count
            ]
          );
          alert("Added new product!");
          setName("");
          setPrice("");
          onClose();
          onSuccess();
        } catch (error) {
          console.error("Error adding product:", error);
        } 
    }

    const deleteProduct = async () => {
      if(!productId) return;
      try{
        await database.runAsync(
          `DELETE FROM users WHERE id = ?`,
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

    return(
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}>
          <View style={styles.productModalView}>
            <View style={styles.productModalCard}>
              <Text style={styles.productModalText}>Add Product</Text>
              <TextInput style={[styles.productNameInput, {color: '#fff'}]} placeholder="Name" placeholderTextColor={'#fff'} value={name} onChangeText={(text)=>setName(text)}></TextInput>
              <TextInput style={styles.productNameInput} placeholder="Price" keyboardType="numeric" placeholderTextColor={'#fff'} value={price} onChangeText={(text)=>setPrice(text)}></TextInput>
              <View style={styles.productOptions}>
                <Pressable
                  style={styles.productModalButton}
                  onPress={async () => {editMode ?  handleUpdate() : createProduct()}}>
                  <Text style={{color: '#000'}}>{editMode ? "Update" : "Add"}</Text>
                </Pressable>
                {editMode && <Pressable
                  style={styles.productModalButton}
                  onPress={async () => deleteProduct()}>
                  <Text style={{color: '#000'}}>Delete</Text>
                </Pressable>}
                <Pressable
                  style={styles.productModalButton}
                  onPress={() => {
                    onClose();
                  }}>
                  <Text style={{color: '#000'}}>Cancel</Text>
                </Pressable>
              </View>
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
});