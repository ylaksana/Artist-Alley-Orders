import {Modal, View, Text, Pressable, StyleSheet} from 'react-native';
import { PropsWithChildren } from 'react';
import { useState } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  database?: SQLiteDatabase
}>;

export default function WarningModal({isVisible, onSuccess, onClose} : Props) {

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}>
            <View style={styles.warningModalView}>
            <View style={styles.warningModalCard}>
                <Text style={styles.warningModalText}>Are you sure?</Text>
                <Pressable
                style={styles.warningModalButton}
                onPress={onSuccess}>
                <Text style={{color: '#000'}}>Yes</Text>
                </Pressable>
                <Pressable
                style={styles.warningModalButton}
                onPress={onClose}>
                <Text style={{color: '#000'}}>No</Text>
                </Pressable>
            </View>
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
});