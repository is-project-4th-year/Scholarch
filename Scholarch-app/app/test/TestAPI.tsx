import React from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { predictAndRecommend, getLatestPrediction } from "../services/api";
import { auth } from "@/lib/FirebaseConfig";
interface BehaviorData {
  StudyHours: number;
  Attendance: number;
  Resources: number;
  Extracurricular: number;
  Motivation: number;
  Internet: number;
  Gender: number;
  Age: number;
  LearningStyle: number;
  OnlineCourses: number;
  Discussions: number;
  AssignmentCompletion: number;
  EduTech: number;
  StressLevel: number;
}

const TestApi: React.FC = () => {
  const testUserId = auth?.currentUser?.uid || "test_user_001";

  const dummyBehavior: BehaviorData = {
    StudyHours: 18,
    Attendance: 92,
    Resources: 1,
    Extracurricular: 1,
    Motivation: 2,
    Internet: 1,
    Gender: 1,
    Age: 21,
    LearningStyle: 2,
    OnlineCourses: 1,
    Discussions: 2,
    AssignmentCompletion: 85,
    EduTech: 1,
    StressLevel: 1,
  };

  const handlePost = async () => {
    try {
      const result = await predictAndRecommend(testUserId, dummyBehavior);
      console.log("✅ POST Success:", result);
      Alert.alert(
        "POST Success",
        `Predicted Score: ${result.predicted_score}\nRecommendations: ${result.recommendations?.join(
          ", "
        )}`
      );
    } catch (err: any) {
      console.error("❌ POST Error:", err);
      Alert.alert("Error", err.message || "Failed to send POST request");
    }
  };

  const handleGet = async () => {
    try {
      const result = await getLatestPrediction(testUserId);
      console.log("✅ GET Success:", result);
      Alert.alert(
        "GET Success",
        `Latest Score: ${result.predicted_score}\nTop Drivers: ${JSON.stringify(
          result.top_drivers
        )}`
      );
    } catch (err: any) {
      console.error("❌ GET Error:", err);
      Alert.alert("Error", err.message || "Failed to fetch data");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Scholarch API Test</Text>
      <Button title="Test POST /predict_and_recommend" onPress={handlePost} />
      <View style={{ marginTop: 20 }} />
      <Button title="Test GET /get_latest_prediction" onPress={handleGet} />
    </View>
  );
};

export default TestApi;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 80,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
});
