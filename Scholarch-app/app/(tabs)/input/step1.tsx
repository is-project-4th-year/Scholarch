// app/(tabs)/input/step1.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, TextInput, Title, Paragraph } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useBehaviorFormStore } from "../../../stores/behaviorFormStore";

export default function Step1() {
  const { updateField, form } = useBehaviorFormStore();

   const [studyHours, setStudyHours] = useState(0);
  const [attendance, setAttendance] = useState(50);
  const [assignmentCompletion, setAssignmentCompletion] = useState(50);
  const [motivation, setMotivation] = useState("Medium");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Step 1 of 3: Study Habits</Title>
      <Paragraph style={styles.subtitle}>Let's start with your study routine</Paragraph>

      {/* Study Hours */}
      <Text style={styles.label}>Study Hours per Week</Text>
      <TextInput
        label="Study Hours"
        keyboardType="numeric"
        value={String(form.studyHours)}
        onChangeText={(v) => updateField("studyHours", parseInt(v) || 0)}
      />


      {/* Attendance */}
      <Text style={styles.label}>Attendance%</Text>
      <TextInput
        label="Attendance"
        keyboardType="numeric"
        value={String(form.attendance)}
        onChangeText={(v) => updateField("attendance", parseInt(v) || 0)}
      />


      {/* Assignment Completion */}
      <Text style={styles.label}>Assignment Completion%</Text>
      <TextInput
        label="Assignment Completion"
        keyboardType="numeric"
        value={String(form.assignmentCompletion)}
        onChangeText={(v) => updateField("assignmentCompletion", parseInt(v) || 0)}
      />

      {/* Motivation */}
      <Text style={styles.label}>Motivation Level</Text>
      <View style={styles.dropdownContainer}>
        <Picker selectedValue={motivation} onValueChange={setMotivation}>
          <Picker.Item label="Low" value="Low" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="High" value="High" />
        </Picker>
      </View>

      {/* Next Button */}
      <Button
        mode="contained"
        onPress={() => router.push("/input/step2")}
        style={styles.button}
      >
        Next
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 20,
    color: "#555",
  },
  label: {
    marginTop: 15,
    marginBottom: 4,
    color: "#333",
    fontWeight: "500",
  },
  slider: {
    width: "100%",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#007AFF",
  },
});
