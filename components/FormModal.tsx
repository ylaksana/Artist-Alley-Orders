//Library imports
import { Modal, Text, View, StyleSheet, TextInput} from 'react-native';
import {useState} from 'react';

// Component imports
import Button from '@/components/Button';
import WarningModal from '@/components/WarningModal';
import { ProductType } from '@/app/(tabs)/index';

type Props = {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: (name: string, phone: string, address: string, sale: string) => void;
    name: string;
    phone: string;
    address: string;
    sale: string;
}

export default function OrderForm({isVisible, name, phone, address, sale, onClose, onSuccess} : Props) {
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [selectProductModalVisible, setSelectProductModalVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [sum, setSum] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
            {!selectMode && (
                <View>
                <Text style={styles.text}>Order Form</Text>
                <TextInput style={[styles.textBox, {marginTop:20}]} placeholder="Enter your name" placeholderTextColor="#888" />
                <TextInput style={styles.textBox} placeholder="Enter your address" placeholderTextColor="#888" keyboardType="email-address" />
                <TextInput style={[styles.textBox, {marginBottom:40}]} placeholder="Enter your phone number" placeholderTextColor="#888" keyboardType="name-phone-pad" />
                <Button label="Select Order" theme="primary" onPress={() => setSelectProductModalVisible(true)} />
                </View>
                )
            }

            {selectMode &&(
                <View>
                <Text style={styles.text}>Item List</Text>
                <TextInput style={[styles.textBox, {marginTop:20}]} value={name} placeholder="Enter your name" placeholderTextColor="#888" />
                <TextInput style={styles.textBox} value={address} placeholder="Enter your address" placeholderTextColor="#888" keyboardType="email-address" />
                <TextInput style={[styles.textBox, {marginBottom:40}]} value={phone} placeholder="Enter your phone number" placeholderTextColor="#888" keyboardType="name-phone-pad" />
                <Button label="Submit Order" theme="primary" onPress={() => setWarningModalVisible(true)} />
                </View>
                )
            }
            
            <WarningModal
                isVisible={warningModalVisible}
                onClose={() => setWarningModalVisible(false)}
                onSuccess={() => {
                    setWarningModalVisible(false);
                    onSuccess(name, phone, address, sale);
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
