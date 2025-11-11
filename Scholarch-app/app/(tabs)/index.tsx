import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Button, Text, Card } from "react-native-paper";
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { formatDate } from "@/lib/dateUtils";
import { db } from "@/lib/FirebaseConfig";
import { useAuthStore } from "@/stores/authStore"; 
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { getLatestPrediction } from "../services/api";
import { router } from "expo-router";

interface PredictionData {
  user_id: string;
  predicted_score: number;
  recommendations: string[];
  trend_insights?: string[];
  timestamp?: string;
}
export default function HomeScreen() {
  const [prediction, setPrediction] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Mock fallback data for dashboard
  const mockPrediction = {
    predictedExamScore: 78.5,
    keyDrivers: ["Attendance", "Motivation", "Study Hours"],
    recommendation: "Boost your motivation and maintain attendance above 85%.",
    datePredicted: "2025-10-17",
  };

    // ✅ Fetch the latest prediction from backend
  useEffect(() => {
    const fetchPrediction = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await getLatestPrediction(user.uid);
        console.log("✅ Latest prediction:", result);
        setPrediction(result);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error fetching prediction:", err);
        setError("No prediction found or server unreachable.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [user]);

  // 🔄 Refresh manually
  const handleRefresh = () => {
    setPrediction(null);
    setLoading(true);
    setError(null);
    if (user) {
      getLatestPrediction(user.uid)
        .then(setPrediction)
        .catch(() => setError("Unable to refresh predictions."))
        .finally(() => setLoading(false));
    }
  };

   // 🧩 UI States
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading your latest prediction...</Text>
      </View>
    );
  }

   if (error || !prediction) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "No data available."}</Text>
        <Button mode="contained" onPress={handleRefresh}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        🎓 Your Academic Dashboard
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Predicted Exam Score</Text>
          <Text style={styles.score}>{prediction.predicted_score.toFixed(2)}%</Text>
          <Text style={styles.timestamp}>
            Last Updated: {prediction.timestamp || "N/A"}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">📋 Recommendations</Text>
          {prediction.recommendations && prediction.recommendations.length > 0 ? (
            prediction.recommendations.map((rec: string, idx: number) => (
              <Text key={idx} style={styles.recommendation}>• {rec}</Text>
            ))
          ) : (
            <Text>No recommendations found.</Text>
          )}
        </Card.Content>
      </Card>

      {prediction.trend_insights && prediction.trend_insights.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">📈 Trend Insights</Text>
            {prediction.trend_insights.map((insight: string, idx: number) => (
              <Text key={idx} style={styles.trend}>• {insight}</Text>
            ))}

          </Card.Content>
        </Card>
      )}

      <Button mode="contained" style={styles.refreshButton} onPress={handleRefresh}>
        Refresh Data
      </Button>

      <Button
        mode="outlined"
        onPress={() => router.push("/input/step1")}
        style={styles.refreshButton}
      >
        Update Behavior Data
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  card: {
    marginBottom: 16,
  },
  score: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#777",
    marginTop: 6,
  },
  recommendation: {
    fontSize: 14,
    marginTop: 6,
  },
  trend: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: "italic",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  refreshButton: {
    marginTop: 10,
  },
});