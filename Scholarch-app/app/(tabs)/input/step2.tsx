import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Button, RadioButton } from "react-native-paper";
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { router } from "expo-router";
import { yesNoLabels,stressLevelLabels } from "@/lib/behaviorLabels";

export default function Step2({ navigation }: any) {
  const {
    internet,
    discussions,
    onlineCourses,
    extracurricular,
    eduTech,
    stressLevel,
    updateField,
  } = useBehaviorFormStore();

  // ✅ Small helper to render Yes/No questions
  const renderYesNoGroup = (label: string, field: string) => (
    <>
      <Text variant="titleMedium" style={styles.label}>{label}</Text>
      <RadioButton.Group
        onValueChange={(val: string) => updateField(field as any, Number(val))}
        value={String((useBehaviorFormStore.getState() as any)[field])}
      >
        {yesNoLabels.map((lbl: string, index: number) => (
          <RadioButton.Item key={index} label={lbl} value={String(index)} />
        ))}
      </RadioButton.Group>
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Step 2: Technology & Lifestyle
      </Text>

      {renderYesNoGroup("Do you have reliable Internet access?", "internet")}
      {renderYesNoGroup("Do you often participate in discussions?", "discussions")}
      {renderYesNoGroup("Do you take online courses?", "onlineCourses")}
      {renderYesNoGroup("Do you have access to resources?", "resources")}
      {renderYesNoGroup("Are you engaged in extracurricular activities?", "extracurricular")}
      {renderYesNoGroup("Do you use educational technology tools?", "eduTech")}

      {/* Stress Level */}
      <Text variant="titleMedium" style={styles.label}>Stress Level</Text>
      <RadioButton.Group
        onValueChange={(val: string) => updateField("stressLevel", Number(val))}
        value={String(stressLevel)}
      >
        {stressLevelLabels.map((label: string, index: number) => (
          <RadioButton.Item key={index} label={label} value={String(index)} />
        ))}
      </RadioButton.Group>

      {/* Navigation Buttons */}
      <Button
        mode="outlined"
        onPress={() => router.replace("/input/step1")}
        style={styles.button}
      >
        Previous
      </Button>

      <Button
        mode="contained"
        onPress={() => router.push("/input/step3")}
        style={styles.button}
      >
        Next
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { marginBottom: 20 },
  label: { marginTop: 10, marginBottom: 4 },
  button: { marginTop: 20 },
});
