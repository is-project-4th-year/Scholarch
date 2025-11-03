import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // show page titles
        tabBarActiveTintColor: isDark ? "#00BFA6" : "#007AFF", // highlight color
        tabBarInactiveTintColor: "#A0A0A0", // neutral color
        tabBarStyle: {
          backgroundColor: isDark ? "#111" : "#fff",
          borderTopColor: isDark ? "#222" : "#eee",
          height: 60,
          paddingBottom: 6,
        },
        headerTitleAlign: "center",
      }}
    >
     
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

     
      <Tabs.Screen
        name="input"
        options={{
          title: "Input",
        }}
      />

      
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
        }}
      />

      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}