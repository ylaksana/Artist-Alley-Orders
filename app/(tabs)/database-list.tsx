import {Text, View, StyleSheet, ScrollView, Pressable} from 'react-native';
import { useSQLiteContext} from 'expo-sqlite';
import {useState, useEffect, useCallback} from 'react';
import { router, useFocusEffect, Stack} from 'expo-router';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import EnterInfoModal from '@/components/EnterInfoModal';

export interface DatabaseInfo {
  id: string;
  name: string;
  createdAt: string;
}

export default function DatabaseList() {
  const headerRight = () => {
        return(
          <Pressable onPress={() => setEnterInfoModalVisible(true)} style={{marginLeft: 5, padding: 10}}>
            <MaterialCommunityIcons name="plus" size={24} color="#ffd33d"/>
          </Pressable>
        )
      }

  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const db = useSQLiteContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [enterInfoModalVisible, setEnterInfoModalVisible] = useState(false);
  const [dbID, setDbID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to create databases
  const createDatabase = async () => {
    try {
      await db.runAsync(
        `INSERT INTO databases (name, createdAt) VALUES (?, ?, ?)`,
        ["New Database", new Date().toISOString()]
      );
    } catch (error) {
      console.error("Error creating database:", error);
      setLoading(false);
    }
  }

  // Function to navigate to selecteddatabase
  const navigateToDatabase = (db: DatabaseInfo) => {}
  
  // Function to fetch databases
  const fetchDatabases = async () => {}

    return (  
        <View style={styles.container}>
            <Stack.Screen options={{headerRight}}/>
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
          
            {databases.length === 0 && (
              <View style={styles.container}>
                <Text style={[styles.text,{fontSize: 28}]}>Conventions List</Text>
                <Text>{`\n`}</Text>
                <Text style={[styles.text]}>No events so far</Text>
              </View>
              )}

            <EnterInfoModal
                isVisible={enterInfoModalVisible}
                onClose={() => setEnterInfoModalVisible(false)}
                onSuccess={() => {
                  alert(`Success`);
                  setEnterInfoModalVisible(false);
                }}/>
             
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
        color: '#6b7178',
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