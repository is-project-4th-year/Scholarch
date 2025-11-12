import React, { useState } from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { useAuthStore } from "@/stores/authStore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/FirebaseConfig";
import { router } from "expo-router";
import { predictAndRecommend } from "../../services/api"

export default function Step3() {
  const formData = useBehaviorFormStore.getState().getCleanData();
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const saveToFirestore = async () => {
    if (!user) {
      Alert.alert("Not Logged In", "Please log in before saving your data.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Step 1: Define fields that match your ML model
      const allowedKeys = [
        "StudyHours",
        "Attendance",
        "AssignmentCompletion",
        "Motivation",
        "LearningStyle",
        "StressLevel",
        "Resources",
        "Internet",
        "Discussions",
        "OnlineCourses",
        "Extracurricular",
        "EduTech",
      ];

      console.log("🧾 Raw Zustand form data:", formData, "This is the step3 file");

      const cleanForm: Record<string, any> = {};
      allowedKeys.forEach((key) => {
        if (key in formData) cleanForm[key] = formData[key as keyof typeof formData];
      });

      console.log("📄 Data about to be saved in Firestore:", cleanForm, "This is the step3 file");

      // ✅ Step 2: Save behavior to Firestore
      
      const logRef = collection(db, `users/${user.uid}/behavior_logs`);
      const newDoc = await addDoc(logRef, {
        ...cleanForm,
        timestamp: serverTimestamp(),
      });

      console.log("✅ Behavior data saved with ID:", newDoc.id);

      // ✅ Step 3: Trigger backend for prediction & recommendations
      console.log("🚀 Sending to backend /predict_and_recommend:", cleanForm);
      console.log("📋 Final form being sent to backend:", JSON.stringify(cleanForm, null, 2));
      const response = await predictAndRecommend(user.uid, cleanForm);
      console.log("🤖 Backend response received:", response);

      if (response) {
        console.log("🎯 Prediction response:", response);
        Alert.alert(
  "Success 🎉",
  "Your behavior data was saved and your performance prediction has been generated. You can now view your results on the Dashboard.",
  [
    {
      text: "Go to Dashboard",
      onPress: () => router.replace("/(tabs)"),
    },
  ]
);

      } else {
        Alert.alert("Warning", "Behavior saved, but backend response missing.");
      }

      // ✅ Step 4: Navigate to summary page
      router.navigate("/input/summary");

    } catch (error: any) {
      console.error("❌ Error saving behavior data:", error);
      Alert.alert("Error", "Could not save your data. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Step 3 – Review & Save
      </Text>

      

      <Button
        mode="contained"
        onPress={saveToFirestore}
        style={styles.button}
        disabled={loading}
      >
        {loading ? <ActivityIndicator animating color="#fff" /> : "Save & Generate"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { marginBottom: 20 },
  button: { marginTop: 20 },
});
