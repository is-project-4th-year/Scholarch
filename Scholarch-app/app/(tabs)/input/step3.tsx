// import React, { useState } from "react";
// import { View, StyleSheet, ScrollView, Alert } from "react-native";
// import { TextInput, Text, Button, ActivityIndicator } from "react-native-paper";
// import { useAuthStore } from "../../../stores/authStore";
// import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
// import { db, auth } from "../../../lib/FirebaseConfig";
// import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
// import { router } from "expo-router";
// import {yesNoLabels, motivationLabels, learningStyleLabels, stressLevelLabels} from "@/lib/behaviorLabels";

// export default function Step3({ navigation }: any) {

// const formData = useBehaviorFormStore.getState().getCleanData();  const [loading, setLoading] = useState(false);

//   const saveToFirestore = async (formData: any) => {
//   const user = auth.currentUser;
//   if (!user) {
//     Alert.alert("Not Logged In", "Please log in before saving your data.");
//     return;
//   }

//   try {
//     // ✅ Only include known numeric/boolean/string fields used in ML
//     const allowedKeys = [
//       "studyHours",
//       "attendance",
//       "resources",
//       "extracurricular",
//       "motivation",
//       "internet",
//       "gender",
//       "age",
//       "learningStyle",
//       "onlineCourses",
//       "discussions",
//       "assignmentCompletion",
//       "eduTech",
//       "stressLevel",
//     ];
//     console.log("🧾 Form data before cleaning:", JSON.stringify(formData, null, 2));

    


//     const cleanForm: Record<string, any> = {};
//     allowedKeys.forEach((key) => {
//       if (key in formData) cleanForm[key] = formData[key];
//     });
//     console.log("🧾 Clean form data:", formData);
//     await saveToFirestore(formData);

//     const logRef = collection(db, `users/${user.uid}/behavior_logs`);
//     const newDoc = await addDoc(logRef, {
//       ...cleanForm,
//       timestamp: serverTimestamp(),
//     });

//     console.log("✅ Behavior data saved with ID:", newDoc.id);
//     Alert.alert("Success", "Your behavior data has been saved!");
//     router.navigate("/input/summary");

//   } catch (error: any) {
//     console.error("❌ Error saving behavior data:", error);
//     Alert.alert("Error", "Could not save your data. Try again later.");
//   }
// };


//   const renderRow = (label: string, value: string | number) => (
//     <Text style={styles.row}>{`${label}: ${value}`}</Text>
//   );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text variant="titleLarge" style={styles.title}>
//         Step 3 – Review & Save
//       </Text>

//       <Text style={styles.subtitle}>Confirm your inputs before saving:</Text>

//       {/* ✅ Human-friendly summary */}
//       {renderRow("Study Hours / Week", formData.studyHours)}
//       {renderRow("Attendance (%)", formData.attendance)}
//       {renderRow("Assignment Completion (%)", formData.assignmentCompletion)}
//       {renderRow("Motivation Level", motivationLabels[formData.motivation])}
//       {renderRow("Learning Style", learningStyleLabels[formData.learningStyle])}
//       {renderRow("Internet Access", yesNoLabels[formData.internet])}
//       {renderRow("Resources Access", yesNoLabels[formData.resources])}
//       {renderRow("Participates in Discussions", yesNoLabels[formData.discussions])}
//       {renderRow("Takes Online Courses", yesNoLabels[formData.onlineCourses])}
//       {renderRow(
//         "Extracurricular Activities",
//         yesNoLabels[formData.extracurricular]
//       )}
//       {renderRow("Uses EduTech Tools", yesNoLabels[formData.eduTech])}
//       {renderRow("Stress Level", stressLevelLabels[formData.stressLevel])}

//       <Button
//         mode="outlined"
//         onPress={() => router.replace("/input/step2")}
//         style={styles.button}
//         disabled={loading}
//       >
//         Previous
//       </Button>

      

//       <Button
//         mode="contained"
//         onPress={saveToFirestore}
//         style={styles.button}
//         disabled={loading}
//       >
//         {loading ? <ActivityIndicator animating color="#fff" /> : "Save & Finish"}
//       </Button>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   title: { marginBottom: 10 },
//   subtitle: { marginBottom: 20 },
//   row: { marginVertical: 4, fontSize: 16 },
//   button: { marginTop: 20 },
// });

import React, { useState } from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../../lib/FirebaseConfig";
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { router } from "expo-router";
import {
  yesNoLabels,
  motivationLabels,
  learningStyleLabels,
  stressLevelLabels,
} from "@/lib/behaviorLabels";

export default function Step3() {
  const [loading, setLoading] = useState(false);
  const formData = useBehaviorFormStore.getState().getCleanData();

  const saveToFirestore = async () => {
  const user = auth.currentUser;
  if (!user) {
    Alert.alert("Not Logged In", "Please log in before saving your data.");
    return;
  }

  try {
    setLoading(true);

    // ✅ Get clean data snapshot from Zustand store
    const formData = useBehaviorFormStore.getState().getCleanData?.() 
      ?? useBehaviorFormStore.getState();

    // ✅ Define which keys are allowed (model features)
    const allowedKeys = [
      "studyHours",
      "attendance",
      "assignmentCompletion",
      "motivation",
      "learningStyle",
      "stressLevel",
      "resources",
      "internet",
      "discussions",
      "onlineCourses",
      "extracurricular",
      "eduTech",
    ];

    // ✅ Clean the data safely
    const cleanForm: Record<string, any> = {};
    allowedKeys.forEach((key) => {
      if (key in formData) {
        cleanForm[key] = formData[key as keyof typeof formData]; // 👈 type-safe fix
      }
    });

    // ✅ Log clean data for debug
    console.log("🧾 Clean form data ready to save:", cleanForm);

    // ✅ Save new document into Firestore collection
    const logRef = collection(db, `users/${user.uid}/behavior_logs`);
    const newDoc = await addDoc(logRef, {
      ...cleanForm,
      timestamp: serverTimestamp(),
    });

    console.log("✅ Behavior data saved with ID:", newDoc.id);

    Alert.alert("Success", "Your behavior data has been saved!");
    router.navigate("/input/summary");
  } catch (error: any) {
    console.error("❌ Error saving behavior data:", error);
    Alert.alert("Error", "Could not save your data. Try again later.");
  } finally {
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

      {renderRow("Study Hours / Week", formData.studyHours)}
      {renderRow("Attendance (%)", formData.attendance)}
      {renderRow("Assignment Completion (%)", formData.assignmentCompletion)}
      {renderRow("Motivation Level", motivationLabels[formData.motivation])}
      {renderRow("Learning Style", learningStyleLabels[formData.learningStyle])}
      {renderRow("Internet Access", yesNoLabels[formData.internet])}
      {renderRow("Resources Access", yesNoLabels[formData.resources])}
      {renderRow("Participates in Discussions", yesNoLabels[formData.discussions])}
      {renderRow("Takes Online Courses", yesNoLabels[formData.onlineCourses])}
      {renderRow("Extracurricular Activities", yesNoLabels[formData.extracurricular])}
      {renderRow("Uses EduTech Tools", yesNoLabels[formData.eduTech])}
      {renderRow("Stress Level", stressLevelLabels[formData.stressLevel])}

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
