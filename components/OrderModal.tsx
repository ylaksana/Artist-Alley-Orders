import {Modal, View, Text, Pressable, StyleSheet, ScrollView} from 'react-native';
import { PropsWithChildren } from 'react';

import { OrderType } from '@/app/(tabs)/order-history';

type Props = PropsWithChildren<{
  isVisible: boolean;
  order: OrderType | null;
  onClose: () => void;
  onDelete: () => void;
}>;

export default function OrderModal({isVisible, order, onClose, onDelete} : Props) { 
    
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}>
            <View style={styles.orderModalView}>
            <View style={styles.orderModalCard}>
                <ScrollView style={styles.orderListContainer}>
                    {order?.list.map((item, index) => (
                        <Text key={index} style={{color: '#ffd33d'}}>{item.count}x {item.product}</Text>
                    ))}
                </ScrollView>
                <Text style={styles.orderModalText}>
                  {`Order Type: ${order?.type}\n`}
                  {`Name: ${order?.name}\n`}
                  {`Email: ${order?.email}\n`}
                  {`Price: $${order?.price}`} 
                </Text>
                
                <Pressable
                style={styles.orderModalButton}
                onPress={onDelete}>
                <Text style={{color: '#000'}}>Delete</Text>
                </Pressable>

                <Pressable
                style={styles.orderModalButton}
                onPress={onClose}>
                <Text style={{color: '#000'}}>Close</Text>
                </Pressable>
                

            </View>
            </View>
    </Modal>
    );
}

const styles = StyleSheet.create({
    orderModalView:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      },
      orderModalCard:{
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
      orderModalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        color: '#ffd33d',
      },
      orderModalButton: {
        backgroundColor: '#ffd33d',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
        width: '80%',
      },
      orderListContainer:{
        borderRadius: 10,
        borderColor: '#ffd33d',
        backgroundColor: '#25292e',
        padding: 10,
        marginBottom: 10,
      }
});