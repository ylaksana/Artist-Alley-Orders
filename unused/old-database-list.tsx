import {Text, View, StyleSheet, ScrollView, Pressable} from 'react-native';
import { useSQLiteContext} from 'expo-sqlite';
import {useState, useEffect} from 'react';
import { router, useFocusEffect, Stack} from 'expo-router';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import EnterInfoModal from '@/components/EnterInfoModal';
import WarningModal from '@/components/WarningModal';

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
  const [enterInfoModalVisible, setEnterInfoModalVisible] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [id, setId] = useState<string>('');

  // Function to create databases
  const createDatabase = async (name : string) => {
    try {
      const date = new Date().toISOString();
      let dateMDY = `${date.slice(5, 10)}-${date.slice(0, 4)}`;

      // console.log(`name: ${name}, date: ${dateMDY}`);
      await db.runAsync(
        `INSERT INTO databases (name, createdAt) VALUES (?, ?)`,
        [name, dateMDY]
      );
    } catch (error) {
      console.error("Error creating database:", error);
    }
  }

  // Function to delete databases
  const deleteDatabase = async (id: string) => {
    try {
      // console.log("Deleting database with id:", id);
      // Delete the database with the given id
      await db.runAsync(`DELETE FROM databases WHERE id = ?`, [id]);
      // update the databases state
      fetchDatabases();
    } catch (error) {
      console.error("Error deleting database:", error);
    }
  }
  
  // Function to fetch databases
  const fetchDatabases = async () => {
      // Fetch all databases from the database
      const result = await db.getAllAsync<DatabaseInfo>(`SELECT * FROM databases`);
      // Merge with existing databases
      const updatedResult = result.map(database => {
        return database;
      });
    
      // Update the data state with the merged information
      setDatabases(updatedResult);
      
  
    };

  // Function to navigate to selecteddatabase
  const navigateToDatabase = (dbID: string) => {
    alert(`Navigating to database with id: ${dbID}`);
  }
  
  // useEffect for whenever the databases state changes
  useEffect(() => {
    fetchDatabases();
  }
  , [databases]);

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
                            <Text style={styles.text}>{`${order.name} - ${order.id}`}</Text>
                        </Pressable>
                        <View style={styles.cellOptions}>
                          <Pressable 
                            style={styles.button}
                            onPress={() => {
                                // router navigate to the database details page
                                navigateToDatabase(order.id);
                            }}>
                                <Text style={styles.buttonText}>Open</Text>
                          </Pressable>
                            <Pressable 
                              style={styles.button}
                              onPress={() => {
                                setId(order.id);
                                // console.log("Deleting database with id:", id);
                                setWarningModalVisible(true);   
                              }}
                            >
                              <Text style={styles.buttonText}>Delete</Text>
                            </Pressable>
                        </View>
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
                onSuccess={(name: string) => {
                  createDatabase(name);
                  fetchDatabases();
                  setEnterInfoModalVisible(false);
                }}/>
            
            <WarningModal
                isVisible={warningModalVisible}
                onClose={() => {setWarningModalVisible(false);}}
                onSuccess={() => {
                  // console.log("Deleting database with id:", id);
                  deleteDatabase(id);
                  setWarningModalVisible(false);
                }}
              />
                

             
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
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      marginBottom: 10,
      backgroundColor: '#25292e',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#525961',
    },
    cellOptions:{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 10,
    },
    button: {
      backgroundColor: '#ffd33d',
      padding:5,
      alignItems: 'center',
      borderRadius: 5,
      marginTop: 10,
      width: 120,
      marginHorizontal: 5,
    },
    buttonText: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 20,
      borderColor: '#000',
      paddingVertical: 5,
      width: '100%',
      borderWidth: 4,
      borderRadius: 5,
      textAlign: 'center',
    },

});