import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { auth, db } from "@/lib/FirebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { LineChart } from "react-native-chart-kit";

interface Prediction {
  predicted_score: number;
  recommendations: string[];
  timestamp: Date | null;
}

interface BehaviorLog {
  StudyHours: number;
  Attendance: number;
  StressLevel: number;
  AssignmentCompletion: number;
  timestamp: Date | null;
}

export default function ProgressScreen() {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLog[]>([]);

  // ----------------- Fetch Firestore Data -----------------
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;

      try {
        const predQuery = query(
          collection(db, `users/${user.uid}/predictions`),
          orderBy("timestamp", "asc")
        );
        const predSnap = await getDocs(predQuery);
        const preds = predSnap.docs.map((doc) => ({
          predicted_score: doc.data().predicted_score || 0,
          recommendations: doc.data().recommendations || [],
          timestamp: doc.data().timestamp?.toDate() || null,
        }));
        setPredictions(preds);

        const logsQuery = query(
          collection(db, `users/${user.uid}/behavior_logs`),
          orderBy("timestamp", "asc")
        );
        const logsSnap = await getDocs(logsQuery);
        const logs = logsSnap.docs.map((doc) => ({
          StudyHours: doc.data().StudyHours || 0,
          Attendance: doc.data().Attendance || 0,
          StressLevel: doc.data().StressLevel || 0,
          AssignmentCompletion: doc.data().AssignmentCompletion || 0,
          timestamp: doc.data().timestamp?.toDate() || null,
        }));
        setBehaviorLogs(logs);
      } catch (error) {
        console.error("❌ Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user]);

  // ----------------- Handle Loading -----------------
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating size="large" />
        <Text>Loading your progress...</Text>
      </View>
    );
  }

  // ----------------- Prepare Data for Chart -----------------
  const labels = predictions.map((p) =>
    p.timestamp
      ? p.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "N/A"
  );
  const data = predictions.map((p) => p.predicted_score);

  // ----------------- Compute Averages -----------------
  const avg = (key: keyof BehaviorLog) =>
    behaviorLogs.length
      ? behaviorLogs.reduce((sum, l) => sum + (l[key] as number), 0) / behaviorLogs.length
      : 0;

  const avgStudyHours = avg("StudyHours");
  const avgStress = avg("StressLevel");
  const avgAttendance = avg("Attendance");

  // ----------------- Chart Config -----------------
  const chartConfig = {
    backgroundGradientFrom: "#f7f7f7",
    backgroundGradientTo: "#f7f7f7",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: { r: "4" },
  };

  // ----------------- UI -----------------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📈 Academic Progress</Text>

      {data.length > 0 ? (
        <LineChart
          data={{
            labels,
            datasets: [{ data }],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisSuffix="%"
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text>No prediction data available.</Text>
      )}

      <View style={styles.summaryContainer}>
        <Text style={styles.subtitle}>Summary Averages</Text>
        <Text>Average Study Hours: {avgStudyHours.toFixed(1)}</Text>
        <Text>
          Average Stress Level:{" "}
          {avgStress.toFixed(1)}{" "}
          ({avgStress < 1 ? "Low" : avgStress < 2 ? "Medium" : "High"})
        </Text>
        <Text>Average Attendance: {avgAttendance.toFixed(1)}%</Text>
      </View>

      <View style={styles.footer}>
        <Text style={{ color: "#555" }}>Updated automatically from your submissions.</Text>
      </View>
    </ScrollView>
  );
}

// ----------------- Styles -----------------
const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  chart: { borderRadius: 16, marginVertical: 10 },
  summaryContainer: { marginTop: 20 },
  subtitle: { fontWeight: "600", fontSize: 18, marginBottom: 8 },
  footer: { marginTop: 30, alignItems: "center" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});