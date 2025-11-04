import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Switch, Button, Title, Paragraph } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { useBehaviorFormStore } from "../../../stores/behaviorFormStore";

export default function Step2() {
  const { form, updateField } = useBehaviorFormStore();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Step 2 of 3 – Learning Behavior</Title>
      <Paragraph style={styles.subtitle}>
        Tell us more about your learning activities
      </Paragraph>

      {/* Resources */}
      <View style={styles.row}>
        <Text style={styles.label}>Do you use additional study resources?</Text>
        <Switch
          value={form.resources}
          onValueChange={(v) => updateField("resources", v)}
        />
      </View>

      {/* Extracurricular */}
      <View style={styles.row}>
        <Text style={styles.label}>Participate in extracurriculars?</Text>
        <Switch
          value={form.extracurricular}
          onValueChange={(v) => updateField("extracurricular", v)}
        />
      </View>

      {/* Online Courses */}
      <View style={styles.row}>
        <Text style={styles.label}>Take online courses?</Text>
        <Switch
          value={form.onlineCourses}
          onValueChange={(v) => updateField("onlineCourses", v)}
        />
      </View>

      {/* Discussions */}
      <Text style={styles.label}>
        Discussions frequency (1 – 5): {form.discussions}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={form.discussions}
        onValueChange={(v) => updateField("discussions", v)}
        minimumTrackTintColor="#007AFF"
      />

      {/* EduTech */}
      <View style={styles.row}>
        <Text style={styles.label}>Use educational technology tools?</Text>
        <Switch
          value={form.eduTech}
          onValueChange={(v) => updateField("eduTech", v)}
        />
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/input/step3")}
          style={styles.nextButton}
        >
          Next
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { marginBottom: 20, color: "#555" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  label: { color: "#333", flex: 1, marginRight: 10 },
  slider: { width: "100%" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  backButton: { flex: 1, marginRight: 10 },
  nextButton: { flex: 1, backgroundColor: "#007AFF" },
});
