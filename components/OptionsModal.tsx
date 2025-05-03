import {Modal, View, Text, Pressable, StyleSheet, TextInput, ScrollView} from 'react-native';
import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';

type Props = {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function OptionsModal({isVisible, onClose, onSuccess} : Props) {
    const [optionsData, setOptionsData] = useState<any[]>([]);
    const database = useSQLiteContext();

    useFocusEffect

    const optionsExists = async (productId: number) => {
        const result = await database.getAllAsync(`SELECT * FROM extra_options WHERE user_id = ?`, [productId]);
        if (result.length > 0) {
          return true;
        } else {
          return false;
        }
      }

    const loadOptions = async () => {
        const result = await database.getAllAsync(`SELECT * FROM extra_options`);
        console.log("Options loaded:", result); // Check what data is being returned
        setOptionsData(result);
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Options</Text>
                    <ScrollView style={styles.scrollView}>
                        {optionsData.map((option, index) => (
                            <Pressable key={index} onPress={() => {}}>
                                <Text style={styles.textInput}>{option.option}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <Pressable style={[styles.button, styles.buttonClose]} onPress={() => {onSuccess();}}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </Pressable>
                    <Pressable style={[styles.button, styles.buttonClose]} onPress={() => {onClose();}}>
                        <Text style={styles.buttonText}>Back</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    scrollView: {
        width: '100%',
        maxHeight: 300,
    },
    textInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        width: '100%',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
})