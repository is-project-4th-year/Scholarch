import React, { useEffect, useState } from "react";
import { ActivityIndicator,View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/FirebaseConfig";
import { formatDate } from "@/lib/dateUtils";
import { useAuthStore } from "@/stores/authStore";

const screenWidth = Dimensions.get("window").width;

export default function ProgressScreen() {
  const { user } = useAuthStore();
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, "users", user.uid, "progress", "data"); // "data" is the doc ID you used earlier
        const snap = await getDoc(docRef);

        if (snap.exists()) {
            console.log("🔥 Firestore progress data:", snap.data());
            setProgressData(snap.data());
        } else {
          console.log("No progress data found.");
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!progressData) {
    return (
      <View style={styles.loader}>
        <Text>No progress data available yet.</Text>
      </View>
    );
  }

  // Transform Firestore history into chart format
  const chartData = {
    labels: progressData.history.map((item: any) => formatDate(item.date)),
    datasets: [
      {
        data: progressData.history.map((item: any) => item.predictedScore),
        color: () => `rgba(0, 122, 255, 1)`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Progress Overview</Text>
      <Text style={styles.subtitle}>Track your performance over time</Text>

      {/* Line Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          yAxisSuffix="%"
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => "#333",
            propsForDots: { r: "5", strokeWidth: "2", stroke: "#007AFF" },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{progressData.avgStudyHours}</Text>
          <Text style={styles.statLabel}>Avg Study Hours</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{progressData.avgStressLevel}</Text>
          <Text style={styles.statLabel}>Avg Stress Level</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{progressData.scoreTrend}</Text>
          <Text style={styles.statLabel}>Trend</Text>
        </View>
      </View>

      {/* Insight Card */}
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>📈 Progress Update</Text>
        <Text style={styles.insightText}>
          {progressData.scoreTrend === "Improving"
            ? "Your predicted score is improving — great job!"
            : "Keep pushing, you can do better next week!"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  subtitle: { color: "#555", marginBottom: 20 },
  chartContainer: { alignItems: "center", marginBottom: 24 },
  chart: { borderRadius: 16 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#007AFF" },
  statLabel: { color: "#555", fontSize: 12, marginTop: 4 },
  insightCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#007AFF",
  },
  insightText: { fontSize: 14, color: "#444" },
});