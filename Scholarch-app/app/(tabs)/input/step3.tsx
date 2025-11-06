import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Text, Button, ActivityIndicator } from "react-native-paper";
import { useAuthStore } from "../../../stores/authStore";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../../lib/FirebaseConfig";
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { router } from "expo-router";
import {yesNoLabels, motivationLabels, learningStyleLabels, stressLevelLabels} from "@/lib/behaviorLabels";

export default function Step3({ navigation }: any) {
  const form = useBehaviorFormStore();
  const [loading, setLoading] = useState(false);

  const saveToFirestore = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not Logged In", "Please log in before saving your data.");
      return;
    }

    try {
      setLoading(true);
      const docRef = doc(db, `users/${user.uid}/behavior/data`);
      await setDoc(docRef, {
        ...form,
        lastUpdated: serverTimestamp(),
      });

      Alert.alert("Success", "Your data has been saved!");
      setLoading(false);
      navigation.navigate("home"); // ✅ back to dashboard/home
    } catch (error: any) {
      console.error("Error saving behavior data:", error);
      Alert.alert("Error", "Could not save your data. Try again later.");
      setLoading(false);
    }
  };

  const renderRow = (label: string, value: string | number) => (
    <Text style={styles.row}>{`${label}: ${value}`}</Text>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Step 3 – Review & Save
      </Text>

      <Text style={styles.subtitle}>Confirm your inputs before saving:</Text>

      {/* ✅ Human-friendly summary */}
      {renderRow("Study Hours / Week", form.studyHours)}
      {renderRow("Attendance (%)", form.attendance)}
      {renderRow("Assignment Completion (%)", form.assignmentCompletion)}
      {renderRow("Motivation Level", motivationLabels[form.motivation])}
      {renderRow("Learning Style", learningStyleLabels[form.learningStyle])}
      {renderRow("Internet Access", yesNoLabels[form.internet])}
      {renderRow("Resources Access", yesNoLabels[form.resources])}
      {renderRow("Participates in Discussions", yesNoLabels[form.discussions])}
      {renderRow("Takes Online Courses", yesNoLabels[form.onlineCourses])}
      {renderRow(
        "Extracurricular Activities",
        yesNoLabels[form.extracurricular]
      )}
      {renderRow("Uses EduTech Tools", yesNoLabels[form.eduTech])}
      {renderRow("Stress Level", stressLevelLabels[form.stressLevel])}

      <Button
        mode="outlined"
        onPress={() => router.replace("/input/step2")}
        style={styles.button}
        disabled={loading}
      >
        Previous
      </Button>

      <Button
        mode="contained"
        onPress={saveToFirestore}
        style={styles.button}
        disabled={loading}
      >
        {loading ? <ActivityIndicator animating color="#fff" /> : "Save & Finish"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { marginBottom: 10 },
  subtitle: { marginBottom: 20 },
  row: { marginVertical: 4, fontSize: 16 },
  button: { marginTop: 20 },
});