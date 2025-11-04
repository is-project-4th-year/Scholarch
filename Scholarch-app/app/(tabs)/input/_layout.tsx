// app/(tabs)/input/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";
import { ProgressBar } from "react-native-paper";
import { useLocalSearchParams, usePathname } from "expo-router";

export default function InputLayout() {
  const pathname = usePathname();

  // Simple mapping for progress
  const getProgress = () => {
    if (pathname.includes("step1")) return 0.33;
    if (pathname.includes("step2")) return 0.66;
    if (pathname.includes("step3")) return 1;
    return 0.33; // default
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Progress Bar */}
      <ProgressBar progress={getProgress()} color="#007AFF" style={{ height: 4 }} />

      {/* Stack Navigation for steps */}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}
