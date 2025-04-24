//Library imports
import { Text, View, StyleSheet, TextInput} from 'react-native';
import React from 'react';

// Component imports
import Button from '@/components/Button';
import WarningModal from '@/components/WarningModal';

export default function OrderForm() {
  const [isVisible, setIsVisible] = React.useState(false);
  const submitForm = () => {
      alert('Order Form Submitted!');
      setIsVisible(false);
  }
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Order Form</Text>
      <TextInput style={[styles.textBox, {marginTop:20}]} placeholder="Enter your name" placeholderTextColor="#888" />
      <TextInput style={styles.textBox} placeholder="Enter your address" placeholderTextColor="#888" keyboardType="email-address" />
      <TextInput style={[styles.textBox, {marginBottom:40}]} placeholder="Enter your phone number" placeholderTextColor="#888" keyboardType="name-phone-pad" />
      <Button label="Submit Order" theme="primary" onPress={() => setIsVisible(true)} />

      <WarningModal
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        onSuccess={() => submitForm()}
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
