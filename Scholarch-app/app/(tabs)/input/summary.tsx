import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import { Card, Text, Button, Title, Paragraph } from "react-native-paper";
import { useRouter } from "expo-router";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../../lib/FirebaseConfig";
import { useAuthStore } from "../../../stores/authStore";
import { 
  yesNoLabels, 
  motivationLabels,
  learningStyleLabels,
  stressLevelLabels,
  resourceAccessLabels,
  labelFor, 
} from "@/lib/behaviorLabels";

interface BehaviorData {
  studyHours: number;
  attendance: number;
  resources: number;
  extracurricular: number;
  motivation: number;
  internet: boolean;
  learningStyle: string;
  onlineCourses: number;
  discussions: number;
  assignmentCompletion: number;
  eduTech: number;
  stressLevel: string;
  lastUpdated?: any;
}

// 
export default function SummaryScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<BehaviorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBehavior = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, `users/${user.uid}/behavior_logs`),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0];
          setData(latestDoc.data() as BehaviorData); // ✅ type assertion
        } else {
          console.log("⚠️ No behavior data found.");
        }
      } catch (error) {
        console.error("Error fetching latest behavior data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBehavior();
  }, [user]);

     if (loading) return <Text>Loading...</Text>;
    if (!data) return <Text>No data available</Text>;

  return (
    <View>
       <Text>Study Hours: {data.studyHours}</Text>
      <Text>Attendance: {data.attendance}%</Text>
      <Text>Assignment Completion: {data.assignmentCompletion}%</Text>

      <Text>Motivation: {labelFor(motivationLabels, data.motivation)}</Text>
      <Text>Learning Style: {labelFor(learningStyleLabels, Number(data.learningStyle))}</Text>
      <Text>Stress Level: {labelFor(stressLevelLabels, Number(data.stressLevel))}</Text>
      <Text>Resource Access: {labelFor(resourceAccessLabels, data.resources)}</Text>

      <Text>Internet Access: {labelFor(yesNoLabels, Number(data.internet))}</Text>
      <Text>Participates in Discussions: {labelFor(yesNoLabels, data.discussions)}</Text>
      <Text>Online Courses: {labelFor(yesNoLabels, data.onlineCourses)}</Text>
      <Text>Extracurricular Activities: {labelFor(yesNoLabels, data.extracurricular)}</Text>
      <Text>Uses EduTech Tools: {labelFor(yesNoLabels, data.eduTech)}</Text>

      
    </View>
  );

}