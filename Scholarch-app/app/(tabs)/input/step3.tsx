import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Text, Button, Title, Paragraph, RadioButton, Switch } from "react-native-paper";
import { router } from "expo-router";
import { useBehaviorFormStore } from "../../../stores/behaviorFormStore";
import { useAuthStore } from "../../../stores/authStore";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/FirebaseConfig";

export default function Step3() {
  const { form, resetForm } = useBehaviorFormStore();
  const { user } = useAuthStore(); // ✅ requires user object in authStore
  const [saving, setSaving] = useState(false);

  const [gender, setGender] = useState(form.gender);
  const [learningStyle, setLearningStyle] = useState(form.learningStyle);
  const [internet, setInternet] = useState(form.internet);
  const [stressLevel, setStressLevel] = useState(form.stressLevel);
  const [age, setAge] = useState(form.age);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...form,
        age,
        gender,
        learningStyle,
        internet,
        stressLevel,
        lastUpdated: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid, "behavior", "data"), dataToSave);
      resetForm();
      Alert.alert("Success", "Your learning data has been saved.");
      router.push("/app/profile");
    } catch (error: any) {
      console.error("Error saving behavior data:", error);
      Alert.alert("Error", "Failed to save data. Try again later.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Step 3 of 3 – Personal Factors</Title>
      <Paragraph style={styles.subtitle}>
        Tell us more about yourself to help personalize predictions
      </Paragraph>

      <TextInput
        label="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Gender</Text>
      <RadioButton.Group onValueChange={setGender} value={gender}>
        <View style={styles.row}>
          <RadioButton value="Male" />
          <Text>Male</Text>
          <RadioButton value="Female" />
          <Text>Female</Text>
        </View>
      </RadioButton.Group>

      <TextInput
        label="Learning Style (e.g. Visual, Auditory)"
        value={learningStyle}
        onChangeText={setLearningStyle}
        style={styles.input}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Do you have reliable internet access?</Text>
        <Switch value={internet} onValueChange={setInternet} />
      </View>

      <Text style={styles.label}>Stress Level</Text>
      <RadioButton.Group onValueChange={setStressLevel} value={stressLevel}>
        <View style={styles.row}>
          <RadioButton value="Low" />
          <Text>Low</Text>
          <RadioButton value="Medium" />
          <Text>Medium</Text>
          <RadioButton value="High" />
          <Text>High</Text>
        </View>
      </RadioButton.Group>

      <Button
        mode="contained"
        loading={saving}
        onPress={handleSubmit}
        style={styles.saveButton}
      >
        Save & Finish
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { marginBottom: 20, color: "#555" },
  input: { marginVertical: 8, backgroundColor: "white" },
  label: { marginTop: 16, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#007AFF",
  },
});
