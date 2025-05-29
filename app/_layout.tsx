import { Stack } from "expo-router";
import {LogBox} from 'react-native';
import { StatusBar } from "expo-status-bar";
import {SQLiteDatabase, SQLiteProvider} from 'expo-sqlite';

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const createDBIfNeeded = async (db:SQLiteDatabase) => {
    // This function can be used to initialize the database if needed
    console.log("Checking if database needs to be created...");
    try{
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT,
          count INTEGER,
          hasOptions BOOLEAN DEFAULT 0
        );`
      );
      console.log("Products table created successfully.");
    
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            name TEXT,
            email TEXT,
            price REAL
            db_id INTEGER,
            FOREIGN KEY (db_id) REFERENCES databases(id) 
          );`
        );
      console.log("Orders table created successfully.");

      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS sold_products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          product TEXT,
          count INTEGER,
          FOREIGN KEY (user_id) REFERENCES orders(id)
        );`
      );
      console.log("Sold products table created successfully.");

      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS extra_options (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          option TEXT,
          FOREIGN KEY (user_id) REFERENCES orders(id)
        );`
      );
      console.log("Extra options table created successfully.");
      }
      catch (error) { 
        console.error("Error creating tables:", error);
      }
    
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS databases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          createdAt TEXT
        );`
      );
      console.log("Databases table created successfully.");
    
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
