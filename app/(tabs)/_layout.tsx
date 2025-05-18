import { Tabs } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
  return (
      <Tabs
        screenOptions={{
            headerTitle: "PeiTrishaWorks Sales",
            headerTitleAlign: "center",
            tabBarActiveTintColor: "#ffd33d",
            headerStyle: {
                backgroundColor: "#25292e", 
            },
            headerTintColor: "#fff",
            headerShadowVisible: false,
            tabBarStyle: {
                backgroundColor: "#25292e",
            }
        }}
      >

        <Tabs.Screen 
          name="index" 
          options={{ 
            title:"Create Order",
            tabBarIcon: ({focused, color}) => (
                <Ionicons 
                    name={focused ? "card" : "card-outline"}
                    color={color}
                    size={24}
                />
            ),
          }} 
        />

        <Tabs.Screen
            name="order-history"
            options={{ 
            title:"Order History",
            tabBarIcon: ({focused, color}) => (
                <Ionicons 
                    name={focused ? "list" : "list-outline"}
                    color={color}
                    size={24}
                />
            ),
          }} 
        />

        </Tabs>
      
  );
}