import {Text, View, StyleSheet, ScrollView, Pressable, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useSQLiteContext, SQLiteDatabase } from 'expo-sqlite';
import {useState, useEffect, useCallback} from 'react';
import { router } from 'expo-router';
import { useFocusEffect } from "expo-router";

import OrderModal from '@/components/OrderModal';

export interface DatabaseInfo {
  id: string;
  name: string;
  createdAt: string;
  description?: string;
}

export default function DatabaseList() {
  const [databases, setDatabases] = useState<DatabaseInfo[]>([
    {
      id: '1',
      name: 'Database 1',
      createdAt: '2023-10-01',
      description: 'This is the first database.',
    },
    {
      id: '2',
      name: 'Database 2',
      createdAt: '2023-10-02',
      description: 'This is the second database.',
    },
    {
      id: '3',
      name: 'Database 3',
      createdAt: '2023-10-03',
      description: 'This is the third database.',
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [newDbDescription, setNewDbDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [currDatabase, setCurrentDatabase] = useState<SQLiteDatabase | null>(null);

  // Fucntion to create databases
  const createDatabase = async () => {}
  // Function to navigate to selecteddatabase
  const navigateToDatabase = (db: DatabaseInfo) => {}

    return (
        <View style={styles.container}>
            {databases.length > 0 && 
            (<ScrollView 
                style={styles.scrollView}
                >
                {databases.map((order) =>(
                    <View key={order.id} style={styles.cell}>
                        <Pressable>
                            <Text style={styles.text}>{order.name}</Text>
                        </Pressable>
                    </View>
                
                ))}
            </ScrollView>)}
          
            {databases.length === 0 && (<Text style={styles.text}>{`Convention List\n\nStart recording sales!`}</Text>)}
        </View>
        
    );
    
}

const styles=StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text:{
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollView: {
        backgroundColor: '#25292e',
        width: '100%',
        flex:1,
    },
    cell: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#25292e',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#525961', // Change this color to modify the border colo
    },

});