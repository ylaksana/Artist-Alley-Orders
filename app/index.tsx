import {Text, View, StyleSheet, ScrollView, Pressable} from 'react-native';
import { useSQLiteContext} from 'expo-sqlite';
import {useState, useEffect} from 'react';
import { router, useFocusEffect, Stack} from 'expo-router';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import EnterInfoModal from '@/components/EnterInfoModal';
import WarningModal from '@/components/WarningModal';
import { DatabaseInfo } from '@/unused/old-database-list';
import { useDatabaseContext } from './_layout';


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
  const { setSelectedDatabase } = useDatabaseContext();

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

      const result = await db.getAllAsync(`SELECT * FROM sold_products WHERE db_id = ?`, [id]);
      console.log("Orders associated with db_id:", id, result);
      
      // Delete all products associated with the database
      await db.runAsync(`DELETE FROM sold_products WHERE db_id = ?`, [id]);
      console.log("Deleting sold products with db_id:", id);
      
      // Delete all orders associated with the database
      await db.runAsync(`DELETE FROM orders WHERE db_id = ?`, [id]);
      console.log("Deleting orders with db_id:", id);
      
      // Delete the database with the given id
      await db.runAsync(`DELETE FROM databases WHERE id = ?`, [id]);
      console.log("Deleting database with id:", id);

      // Check to see if the deletion was successful
      const check = await db.getAllAsync(`SELECT * FROM sold_products WHERE id = ?`, [id]);
      const check2 = await db.getAllAsync(`SELECT * FROM orders WHERE id = ?`, [id]);
      console.log("Check sold products after deletion:", check.length);
      console.log("Check orders after deletion:", check2.length);
      
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
  const navigateToDatabase = (database: DatabaseInfo) => {
    // console.log("Navigating to database with id:", dbID);
    console.log("Selecting database:", database);
    
    // Set the database in context
    setSelectedDatabase({
      id: database.id,
      name: database.name,
      createdAt: database.createdAt
    });
    
    // Navigate to tabs
    router.push('/(tabs)');
  }
  
  // useEffect for whenever the databases state changes
  useEffect(() => {
    fetchDatabases();
  }
  , [databases]);

    return (  
        <View style={styles.container}>
            <Stack.Screen   
              options={{
                headerRight,
                title: "Select Convention",
                headerStyle: {
                  backgroundColor: "#25292e", 
                },
                headerTintColor: "#fff",
                headerShadowVisible: false, // Removes the shadow/border under header
                
                }}
            />
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
                                navigateToDatabase(order);
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