import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/FirebaseConfig";
import { useAuthStore } from "../../../stores/authStore";

export default function InputLayout() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBehaviorData = async () => {
      if (!user) return;
      try {
        // Check if the user already has behavior data saved
        const docRef = doc(db, "users", user.uid, "behavior", "data");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // ✅ If behavior data exists, go to summary
          router.replace("/input/summary");
        } else {
          // ❌ If no data, start from step 1
          router.replace("/input/step1");
        }
      } catch (error) {
        console.error("Error checking behavior data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkBehaviorData();
  }, [user]);

  // Show a loader while checking
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // A fallback Stack if needed (Expo Router requirement)
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
