//Library imports
import { Modal, Text, View, StyleSheet, TextInput} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import {useState} from 'react';

// Component imports
import Button from '@/components/Button';
import WarningModal from '@/components/WarningModal';
import SelectProductModal from '@/components/SelectProductModal';
import { ProductType } from '@/app/(tabs)/index';

export default function OrderForm() {
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [selectProductModalVisible, setSelectProductModalVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [sum, setSum] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);

  const db = useSQLiteContext();

  const submitForm = async(productList: ProductType[] | undefined) => {
    if (productList) {
      try{
        await db.runAsync(
            "INSERT INTO orders (type, name, email, price, phone) VALUES(?, ?, ?, ?, ?)",
            [
              "Convention Sale",
              'name',
              'N/A',
              sum,
              'N/A'
            ]
          );

      }
      catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  }
  return (
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
          <TextInput style={[styles.textBox, {marginTop:20}]} placeholder="Enter your name" placeholderTextColor="#888" />
          <TextInput style={styles.textBox} placeholder="Enter your address" placeholderTextColor="#888" keyboardType="email-address" />
          <TextInput style={[styles.textBox, {marginBottom:40}]} placeholder="Enter your phone number" placeholderTextColor="#888" keyboardType="name-phone-pad" />
          <Button label="Submit Order" theme="primary" onPress={() => setWarningModalVisible(true)} />
        </View>
        )
      }
      

      <WarningModal
        isVisible={warningModalVisible}
        onClose={() => setWarningModalVisible(false)}
        onSuccess={() => submitForm(selectedProducts)}
        />

      <SelectProductModal
        isVisible={selectProductModalVisible}
        onClose={() => setSelectProductModalVisible(false)}
        onSuccess={() => 
          {
            setSelectProductModalVisible(false);
            setWarningModalVisible(true)
          }
        }
      />

    </View>
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
