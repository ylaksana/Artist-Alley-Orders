import { Stack } from "expo-router";
import {LogBox} from 'react-native';
import { StatusBar } from "expo-status-bar";
import {SQLiteDatabase, SQLiteProvider} from 'expo-sqlite';

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const createDBIfNeeded = async (db:SQLiteDatabase) => {
    // This function can be used to initialize the database if needed
    console.log("Checking if database needs to be created...");
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT
      );`
    );
  
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT,
          name TEXT,
          email TEXT,
          price REAL
        );`
      );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS sold_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product TEXT,
        count INTEGER,
        FOREIGN KEY (id) REFERENCES orders(id)
      );`
    );
    
  };

  return (
    <SQLiteProvider databaseName="peitrisha-sales.db" onInit={createDBIfNeeded}>
      <>
      <StatusBar style="light"/>
        <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
            }} 
          />

        </Stack>
      </>
    </SQLiteProvider>
  );
}
