import {Modal, View, Text, Pressable, StyleSheet, TextInput, ScrollView} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { ProductType } from "@/app/(tabs)/order-list";

type Props = {
    isVisible: boolean;
    product: ProductType
    name: string;
    onClose: () => void;
    onSuccess: (product: ProductType) => void;
}

export default function OptionsModal({isVisible, product, onClose, onSuccess} : Props) {
    const [options, setOptions] = useState<any[]>([]);
    const database = useSQLiteContext();
    const [selectedOption, setSelectedOption] = useState<string>("");

    useEffect(() => {
        if (!isVisible) {
            setSelectedOption("");
        }
    }, [isVisible]);

    useEffect(() => {
        if (isVisible) {
            loadOptions();
        }
    }, [isVisible, product]);

    const loadOptions = async () => {
        try{
            console.log(product);
            console.log("Loading options for product ID:", product.id);
            const result = await database.getAllAsync(`SELECT * FROM extra_options WHERE user_id = ?`, [product.id]);
            setOptions(result);
            console.log("Options loaded:", result); // Check what data is being returned}
        }
        catch (error) {
            console.error("Error loading options:", error);
        }
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
                        {options.map((option, index) => (
                            <Pressable key={index} onPress={() => {setSelectedOption(option);}}>
                                <Text style={styles.optionCell}>{option.option}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <Pressable style={[styles.button, styles.buttonClose]} onPress={() => {
                        product.name += ` ${selectedOption}`;
                        onSuccess(product);}
                        }>
                        <Text style={styles.buttonText}>Submit</Text>
                    </Pressable>
                    <Pressable 
                        style={[styles.button, styles.buttonClose]} 
                        onPress={() => {
                            setOptions([]);
                            onClose();   
                        }}>
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
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 10,
        color: '#ffd33d',
    },
    scrollView: {
        width: '100%',
        maxHeight: 300,
        marginBottom: 20,
    },
    optionCell: {
        borderWidth: 2,
        borderRadius: 5,
        borderColor: '#ffd33d',
        textAlign: 'center',
        padding: 5,
        fontSize: 16,
        color: '#fff',
        marginTop: 10,
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        width: '100%',
        marginTop: 10,
    },
    buttonClose: {
        backgroundColor: '#ffd33d',
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
})