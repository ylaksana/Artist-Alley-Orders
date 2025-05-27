import {View, Text, TextInput, Modal, StyleSheet} from 'react-native';
import { useState } from 'react';
import Button from '@/components/Button';

type Props = {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EnterInfoModal({ isVisible, onClose, onSuccess } : Props){
    const [name, setName] = useState<string>("");
    
    return(
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}>
            <View style={styles.container}>
                <Text style={styles.text}>Enter the name for your database:</Text>
                <TextInput 
                    style={styles.textBox}
                    placeholder="Name"
                    onChangeText={(text) => setName(text)}
                />
                <Button label="Submit" theme="primary" onPress={() => onSuccess()} />
                <Button label="Cancel" theme="primary" onPress={onClose} />
            </View>
        </Modal>
            
    );
};


const styles =  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    textBox: {
        height: 40,
        width: '80%',
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        color: '#fff',
        backgroundColor: '#333',
    }
 });


