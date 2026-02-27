import {Modal, View, Text, Pressable, StyleSheet, TextInput} from 'react-native';
import { PropsWithChildren } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (cardAmount?: string, cashAmount?: string) => void;
  customPayment?: boolean;
  sum?: number;
  database?: SQLiteDatabase
}>;

export default function WarningModal({isVisible, onSuccess, onClose, customPayment, sum, database} : Props) {
    const [cashAmount, setCashAmount] = useState<string>("");
    const [cardAmount, setCardAmount] = useState<string>("");
    const [split, setSplit] = useState<boolean>(customPayment ? true : false);
  
    useEffect(() => {
      if (isVisible) {
        setSplit(customPayment ? true : false);
        setCashAmount("");
        setCardAmount("");
      }
    }, [isVisible, customPayment]);


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}>
            <View style={styles.warningModalView}>
            {/*  Custom payment warning modal  */}
              {split ? 
                (
                  <View style={styles.warningModalCard}>
                      <Text style={styles.warningModalText}>Split Payment</Text>
                      {/*Cash Amount*/}
                      <TextInput 
                        style={styles.textBox} 
                        placeholder="Cash" 
                        placeholderTextColor="#888" 
                        keyboardType="numeric" 
                        value={cashAmount}
                        onChangeText={(text) => {setCashAmount(text)}}
                      />
                      {/*Card Amount*/}
                      <TextInput 
                        style={styles.textBox} 
                        placeholder="Card" 
                        placeholderTextColor="#888" 
                        keyboardType="numeric" 
                        value={cardAmount}
                        onChangeText={(text) => {setCardAmount(text)}}
                      />
                      {/* confirm split payment and proceed with the order submission */}
                      <Pressable
                      style={styles.warningModalButton}
                      onPress={() => {
                        if (parseFloat(cashAmount) + parseFloat(cardAmount) !== sum) {
                          alert(`The total of cash and card must equal the sum of the order: $${sum}`);
                          return;
                        }

                        setSplit(false);
                        
                      }}>
                        <Text style={{color: '#000'}}>Next</Text>
                      </Pressable>

                      {/* cancel split payment and return to the previous screen */}
                      <Pressable
                      style={styles.warningModalButton}
                      onPress={() => {
                        onClose();
                      }}>
                        <Text style={{color: '#000'}}>Back</Text>
                      </Pressable>
                  </View>
                )
                  
                :
                
                (
                  <View style={styles.warningModalCard}>
                    <Text style={styles.warningModalText}>Are you sure?</Text>
                    <Pressable
                    style={styles.warningModalButton}
                    onPress={() => onSuccess(cardAmount, cashAmount)}>
                    <Text style={{color: '#000'}}>Yes</Text>
                    </Pressable>
                    <Pressable
                    style={styles.warningModalButton}
                    onPress={onClose}>
                    <Text style={{color: '#000'}}>No</Text>
                    </Pressable>
                  </View>
                ) 
              }
            
            </View>
    </Modal>
    );
}

const styles = StyleSheet.create({
    warningModalView:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      },
      warningModalCard:{
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
      warningModalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        color: '#ffd33d',
      },
      warningModalButton:{
        backgroundColor: '#ffd33d',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
        width: '80%',
      },
      textBox:{
        height: 40,
        width: '80%',
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        color: '#fff', // Text color
        backgroundColor: '#333', // Background color for the text box
      }
});