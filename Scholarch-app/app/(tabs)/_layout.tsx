import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
export default function AppLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets(); // 👈 get device safe area


  return (
    <SafeAreaProvider>
        <Tabs
        screenOptions={{
          headerShown: false, // show page titles
          tabBarActiveTintColor: isDark ? "#00BFA6" : "#007AFF", // highlight color
          tabBarInactiveTintColor: "#A0A0A0", // neutral color
          tabBarStyle: {
            backgroundColor: isDark ? "#111" : "#fff",
            borderTopColor: isDark ? "#222" : "#eee",
            height: 60 + insets.bottom,   // 👈 push tab bar above nav buttons
            paddingBottom: insets.bottom, // 👈 avoid overlapping
          },
          headerTitleAlign: "center",
        }}
      >
      
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={24} color="black" />
            )
          }}
        />

      
        <Tabs.Screen
          name="input"
          options={{
            title: "Input",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="newspaper-outline" size={24} color="black" />
            )
          }}
        />

        
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart-outline" size={24} color="black" />
            )
          }}
        />

        
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={24} color="black" />          )
          }}
        />
      </Tabs>
    </SafeAreaProvider>
    
  );
}