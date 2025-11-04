import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import { Card, Text, Button, Title, Paragraph } from "react-native-paper";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/FirebaseConfig";
import { useAuthStore } from "../../../stores/authStore";

interface BehaviorData {
  studyHours: number;
  attendance: number;
  resources: number;
  extracurricular: number;
  motivation: number;
  internet: boolean;
  gender: string;
  age: string;
  learningStyle: string;
  onlineCourses: number;
  discussions: number;
  assignmentCompletion: number;
  eduTech: number;
  stressLevel: string;
  lastUpdated?: any;
}

export default function SummaryScreen() {
  const [data, setData] = useState<BehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchBehaviorData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid, "behavior", "data");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setData(snap.data() as BehaviorData);
        }
      } catch (error) {
        console.error("Error fetching behavior data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBehaviorData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Title>No Data Found</Title>
        <Paragraph>Fill in your learning data to personalize predictions.</Paragraph>
        <Button mode="contained" onPress={() => router.replace("/input/step1")}>
          Fill Data
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Your Learning Data</Title>

      <Card style={styles.card}>
        <Card.Content>
          <Paragraph>📚 Study Hours: {data.studyHours} hrs/week</Paragraph>
          <Paragraph>🎯 Attendance: {data.attendance}%</Paragraph>
          <Paragraph>📘 Resources Used: {data.resources}</Paragraph>
          <Paragraph>🏫 Extracurricular: {data.extracurricular}</Paragraph>
          <Paragraph>🔥 Motivation Level: {data.motivation}</Paragraph>
          <Paragraph>💻 Internet Access: {data.internet ? "Yes" : "No"}</Paragraph>
          <Paragraph>🧠 Learning Style: {data.learningStyle}</Paragraph>
          <Paragraph>👨‍🎓 Gender: {data.gender}</Paragraph>
          <Paragraph>🎓 Age: {data.age}</Paragraph>
          <Paragraph>📊 Assignment Completion: {data.assignmentCompletion}%</Paragraph>
          <Paragraph>💬 Discussions: {data.discussions}</Paragraph>
          <Paragraph>🌐 Online Courses: {data.onlineCourses}</Paragraph>
          <Paragraph>🧩 EdTech Tools: {data.eduTech}</Paragraph>
          <Paragraph>⚖️ Stress Level: {data.stressLevel}</Paragraph>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={styles.editButton}
        onPress={() => router.replace("/input/step1")}
      >
        Edit My Data
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  editButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
  },
});
