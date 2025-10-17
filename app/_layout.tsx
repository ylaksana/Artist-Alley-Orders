// app/_layout.tsx (Root Layout with Inline Context)
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {SQLiteDatabase, SQLiteProvider} from 'expo-sqlite';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Database Context defined right here in the layout file
interface DatabaseInfo {
  id: string;
  name: string;
  createdAt?: string;
}

interface DatabaseContextType {
  selectedDatabase: DatabaseInfo | null;
  setSelectedDatabase: (database: DatabaseInfo) => void;
  clearSelectedDatabase: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Custom hook to use the context
export function useDatabaseContext() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabaseContext must be used within the app');
  }
  return context;
}

// Database Provider Component (inline)
function DatabaseProvider({ children }: { children: ReactNode }) {
  const [selectedDatabase, setSelectedDatabaseState] = useState<DatabaseInfo | null>(null);

  const setSelectedDatabase = (database: DatabaseInfo) => {
    console.log('Setting selected database:', database);
    setSelectedDatabaseState(database);
  };

  const clearSelectedDatabase = () => {
    console.log('Clearing selected database');
    setSelectedDatabaseState(null);
  };

  return (
    <DatabaseContext.Provider value={{
      selectedDatabase,
      setSelectedDatabase,
      clearSelectedDatabase
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

let dbInitialized = false;

export default function RootLayout() {
  const createDBIfNeeded = async (db:SQLiteDatabase) => {
    // This function can be used to initialize the database if needed
    if (dbInitialized) {
      console.log("Database already initialized, skipping...");
      return;
    }
    
    console.log("Checking if database needs to be created...");
    dbInitialized = true;

    try{
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS databases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          createdAt TEXT
        );`
      );
      console.log("Databases table created successfully.");
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
            price TEXT,
            phone REAL,
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
          db_id INTEGER,
          FOREIGN KEY (db_id) REFERENCES databases(id),
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
    
  };

  return (
    <SQLiteProvider databaseName="peitrisha-sales.db" onInit={createDBIfNeeded}>
      <DatabaseProvider>
        <StatusBar style="light"/>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: true,
              title: "Select Database",
            }} 
          />
          
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
            }} 
          />
        </Stack>
      </DatabaseProvider>
    </SQLiteProvider>
  );
}
