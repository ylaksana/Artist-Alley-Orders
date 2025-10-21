//Library imports
import { Modal, Text, View, StyleSheet, TextInput} from 'react-native';
import {useState} from 'react';

// Component imports
import Button from '@/components/Button';
import WarningModal from '@/components/WarningModal';

type Props = {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: (name: string, phone: string, address: string, sale: string) => void;
}

export default function OrderForm({isVisible, onClose, onSuccess} : Props) {
    const [warningModalVisible, setWarningModalVisible] = useState(false);
    const [name, setName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [address, setAddress] = useState<string>("");


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Text style={styles.text}>Order Form</Text>
                <TextInput style={[styles.textBox, {marginTop:20}]} placeholder="Enter your name" value={name} placeholderTextColor="#888" onChangeText={setName}/>
                <TextInput style={styles.textBox} placeholder="Enter your address" value={address} placeholderTextColor="#888" onChangeText={setAddress} />
                <TextInput style={[styles.textBox, {marginBottom:40}]} placeholder="Enter your phone number" value={phone} placeholderTextColor="#888" keyboardType="phone-pad" onChangeText={setPhone} />
                <Button label="Submit" theme="primary" onPress={() => setWarningModalVisible(true)} />
                <Button label="Cancel" theme="primary" onPress={() => {
                    setName("");
                    setPhone("");
                    setAddress("");
                    onClose();
                }} />
`
            <WarningModal
                isVisible={warningModalVisible}
                onClose={() => setWarningModalVisible(false)}
                onSuccess={() => {
                    console.log("Form submitted with name:", name, "phone:", phone, "address:", address);
                    setWarningModalVisible(false);
                    onSuccess(name, phone, address, "Customer Sale");
                }}
                />

            </View>
        </Modal>
        
    );

}

const styles = StyleSheet.create({
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
    color: '#fff', // Text color
    backgroundColor: '#333', // Background color for the text box
  }
 });
