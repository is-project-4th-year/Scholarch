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
  StudyHours: number;
  Attendance: number;
  Resources: number;
  Extracurricular: number;
  Motivation: number;
  Internet: boolean;
  LearningStyle: string;
  OnlineCourses: number;
  Discussions: number;
  AssignmentCompletion: number;
  EduTech: number;
  StressLevel: string;
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
       <Text>Study Hours: {data.StudyHours}</Text>
      <Text>Attendance: {data.Attendance}%</Text>
      <Text>Assignment Completion: {data.AssignmentCompletion}%</Text>

      <Text>Motivation: {labelFor(motivationLabels, data.Motivation)}</Text>
      <Text>Learning Style: {labelFor(learningStyleLabels, Number(data.LearningStyle))}</Text>
      <Text>Stress Level: {labelFor(stressLevelLabels, Number(data.StressLevel))}</Text>
      <Text>Resource Access: {labelFor(resourceAccessLabels, data.Resources)}</Text>

      <Text>Internet Access: {labelFor(yesNoLabels, Number(data.Internet))}</Text>
      <Text>Participates in Discussions: {labelFor(yesNoLabels, data.Discussions)}</Text>
      <Text>Online Courses: {labelFor(yesNoLabels, data.OnlineCourses)}</Text>
      <Text>Extracurricular Activities: {labelFor(yesNoLabels, data.Extracurricular)}</Text>
      <Text>Uses EduTech Tools: {labelFor(yesNoLabels, data.EduTech)}</Text>

      
    </View>
  );

}