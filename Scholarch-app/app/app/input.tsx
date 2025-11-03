// app/input.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  Button,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/FirebaseConfig";
import { useAuthStore } from "@/stores/authStore";

export default function InputScreen() {
  // ---------------------------
  // 🧠 State variables
  // ---------------------------
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);

  const [studyHours, setStudyHours] = useState<number>(0);
  const [attendance, setAttendance] = useState<number>(0);
  const [assignmentCompletion, setAssignmentCompletion] = useState<number>(0);

  const [motivation, setMotivation] = useState<number>(3);
  const [discussions, setDiscussions] = useState<number>(3);
  const [extracurricular, setExtracurricular] = useState<boolean>(false);
  const [onlineCourses, setOnlineCourses] = useState<boolean>(false);

  const [resources, setResources] = useState<boolean>(false);
  const [internet, setInternet] = useState<boolean>(false);
  const [eduTech, setEduTech] = useState<boolean>(false);
  const [stressLevel, setStressLevel] = useState<number>(3);

  // ---------------------------
  // 📦 Load Firestore data
  // ---------------------------
  useEffect(() => {
    const fetchBehaviorData = async () => {
      try {
        if (!user?.uid) return;

        const docRef = doc(db, "users", user.uid, "behavior", "current");
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();

          // Set values from Firestore
          setStudyHours(data.studyHours || 0);
          setAttendance(data.attendance || 0);
          setAssignmentCompletion(data.assignmentCompletion || 0);
          setMotivation(data.motivation || 3);
          setDiscussions(data.discussions || 3);
          setExtracurricular(!!data.extracurricular);
          setOnlineCourses(!!data.onlineCourses);
          setResources(!!data.resources);
          setInternet(!!data.internet);
          setEduTech(!!data.eduTech);
          setStressLevel(data.stressLevel || 3);
        }
      } catch (error) {
        console.error("Error fetching behavior data:", error);
        Alert.alert("Error", "Could not load behavior data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBehaviorData();
  }, [user?.uid]);

  // ---------------------------
  // 💾 Save data to Firestore
  // ---------------------------
  const handleSave = async () => {
    if (!user?.uid) return Alert.alert("Error", "User not logged in.");

    const behaviorData = {
      studyHours,
      attendance,
      assignmentCompletion,
      motivation,
      discussions,
      extracurricular: extracurricular ? 1 : 0,
      onlineCourses: onlineCourses ? 1 : 0,
      resources: resources ? 1 : 0,
      internet: internet ? 1 : 0,
      eduTech: eduTech ? 1 : 0,
      stressLevel,
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = doc(db, "users", user.uid, "behavior", "current");
      await setDoc(docRef, behaviorData, { merge: true });
      Alert.alert("Success", "Behavior data saved successfully!");
    } catch (error) {
      console.error("Error saving behavior data:", error);
      Alert.alert("Error", "Could not save data. Please try again.");
    }
  };

  // ---------------------------
  // 🧩 UI Layout
  // ---------------------------
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#fafafa" }}>
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 12 }}>
        Study Behavior Input
      </Text>

      {/* 📘 Section 1: Study Metrics */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "500", marginBottom: 8 }}>
          Study Metrics
        </Text>

        <Text>Study Hours: {studyHours}</Text>
        <TextInput
          keyboardType="numeric"
          value={studyHours.toString()}
          onChangeText={(v) => setStudyHours(Number(v))}
          style={{ borderWidth: 1, padding: 8, borderRadius: 6, marginBottom: 12 }}
        />

        <Text>Attendance (%): {attendance}</Text>
        <TextInput
          keyboardType="numeric"
          value={attendance.toString()}
          onChangeText={(v) => setAttendance(Number(v))}
          style={{ borderWidth: 1, padding: 8, borderRadius: 6, marginBottom: 12 }}
        />

        <Text>Assignment Completion (%): {assignmentCompletion}</Text>
        <TextInput
          keyboardType="numeric"
          value={assignmentCompletion.toString()}
          onChangeText={(v) => setAssignmentCompletion(Number(v))}
          style={{ borderWidth: 1, padding: 8, borderRadius: 6 }}
        />
      </View>

      {/* 💬 Section 2: Engagement */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "500", marginBottom: 8 }}>Engagement</Text>

        <Text>Motivation: {motivation}</Text>
        <Slider minimumValue={1} maximumValue={5} step={1} value={motivation} onValueChange={setMotivation} />

        <Text>Discussions: {discussions}</Text>
        <Slider minimumValue={1} maximumValue={5} step={1} value={discussions} onValueChange={setDiscussions} />

        <Text>Extracurricular: {extracurricular ? "Yes" : "No"}</Text>
        <Switch value={extracurricular} onValueChange={setExtracurricular} />

        <Text>Online Courses: {onlineCourses ? "Yes" : "No"}</Text>
        <Switch value={onlineCourses} onValueChange={setOnlineCourses} />
      </View>

      {/* ⚙️ Section 3: Environment */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "500", marginBottom: 8 }}>Environment</Text>

        <Text>Resources: {resources ? "Yes" : "No"}</Text>
        <Switch value={resources} onValueChange={setResources} />

        <Text>Internet: {internet ? "Yes" : "No"}</Text>
        <Switch value={internet} onValueChange={setInternet} />

        <Text>EduTech Tools: {eduTech ? "Yes" : "No"}</Text>
        <Switch value={eduTech} onValueChange={setEduTech} />

        <Text>Stress Level: {stressLevel}</Text>
        <Slider minimumValue={1} maximumValue={5} step={1} value={stressLevel} onValueChange={setStressLevel} />
      </View>

      <Button title="Save Changes" onPress={handleSave} />
    </ScrollView>
  );
}
