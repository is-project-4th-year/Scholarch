// app/(tabs)/input/step1.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Title, Paragraph } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";

export default function Step1() {
  const [studyHours, setStudyHours] = useState(0);
  const [attendance, setAttendance] = useState(50);
  const [assignmentCompletion, setAssignmentCompletion] = useState(50);
  const [motivation, setMotivation] = useState("Medium");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Step 1 of 3: Study Habits</Title>
      <Paragraph style={styles.subtitle}>Let's start with your study routine</Paragraph>

      {/* Study Hours */}
      <Text style={styles.label}>Study Hours per Week: {studyHours}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={40}
        step={1}
        value={studyHours}
        onValueChange={setStudyHours}
        minimumTrackTintColor="#007AFF"
      />

      {/* Attendance */}
      <Text style={styles.label}>Attendance: {attendance}%</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={attendance}
        onValueChange={setAttendance}
        minimumTrackTintColor="#007AFF"
      />

      {/* Assignment Completion */}
      <Text style={styles.label}>Assignment Completion: {assignmentCompletion}%</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={assignmentCompletion}
        onValueChange={setAssignmentCompletion}
        minimumTrackTintColor="#007AFF"
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
