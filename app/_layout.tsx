// app/_layout.tsx (Root Layout with Inline Context)
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {SQLiteDatabase, SQLiteProvider} from 'expo-sqlite';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, ActivityIndicator } from "react-native";

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

export default function RootLayout() {
  const [error, setError] = React.useState<string | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const createDBIfNeeded = React.useCallback(async (db:SQLiteDatabase) => {
    
    try{
      await db.execAsync(`PRAGMA foreign_keys = ON;`);
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
          hasOptions INTEGER DEFAULT 0
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
          FOREIGN KEY (user_id) REFERENCES users(id)
        );`
      );
      console.log("Extra options table created successfully.");
      setTimeout(() => setIsReady(true), 100);

      }
      catch (error) {
        console.error("Error creating tables:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
      }
  }, []);
  
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25292e', padding: 20 }}>
        <Text style={{ color: '#ffd33d', fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
          Database Error
        </Text>
        <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

 


  return (
    <SQLiteProvider databaseName="peitrisha-sales.db" onInit={createDBIfNeeded}>
      <DatabaseProvider>
        <StatusBar style="light"
          translucent={false}
          backgroundColor="#25292e"
        />
           {/* Show loading screen until database is ready */}
          {!isReady ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25292e' }}>
              <ActivityIndicator size="large" color="#ffd33d" />
              <Text style={{ color: '#fff', fontSize: 16, marginTop: 20 }}>
                Initializing database...
              </Text>
            </View>
          ) : (
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            headerShadowVisible: false,
          }}
          initialRouteName="index"
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: true,
            }} 
          />
          
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
            }} 
          />
        </Stack>)}{/* End isReady conditional */}
      </DatabaseProvider>
    </SQLiteProvider>
  );
}
