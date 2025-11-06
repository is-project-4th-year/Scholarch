import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { formatDate } from "@/lib/dateUtils";
import { db } from "@/lib/FirebaseConfig";
import { useAuthStore } from "@/stores/authStore"; 
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
export default function HomeScreen() {
  const [prediction, setPrediction] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  // 🔹 Mock fallback data for dashboard
  const mockPrediction = {
    predictedExamScore: 78.5,
    keyDrivers: ["Attendance", "Motivation", "Study Hours"],
    recommendation: "Boost your motivation and maintain attendance above 85%.",
    datePredicted: "2025-10-17",
  };

  useEffect(() => {
    if (!user) return;

    // --- Fetch Profile ---
    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, "users", user.uid, "profile", "info");
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          console.log("No profile found for user.");
          setProfile({ name: "Student", program: "your program" });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile({ name: "Student", program: "your program" });
      }
      console.log(useBehaviorFormStore.getState());

    };

    fetchProfile();

    // --- Fetch Latest Prediction ---
    const ref = collection(db, "users", user.uid, "prediction");
    const q = query(ref, orderBy("datePredicted", "desc"), limit(1));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          setPrediction(snapshot.docs[0].data());
          
        } else {
          console.log("No predictions found, using mock data.");
          setPrediction(mockPrediction);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching predictions:", error);
        setPrediction(mockPrediction);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 🔹 Personalized Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>
          Hi {profile?.name || "Student"} 👋
        </Text>
        <Text style={styles.subText}>
          You are pursuing {profile?.program || "your program"}.
        </Text>
      </View>

      

      {/* 🔹 Predicted Score Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Predicted Exam Score</Text>
        <Text style={styles.scoreText}>{prediction.predictedExamScore.toFixed(1)}%</Text>
        <Text style={styles.dateText}>
          as of {formatDate(prediction.datePredicted)}
        </Text>
      </View>

      {/* 🔹 Recommendation Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recommendation</Text>
        <Text style={styles.bodyText}>{prediction.recommendation}</Text>
      </View>

      {/* 🔹 Key Drivers Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Performance Drivers</Text>
        {prediction.keyDrivers.map((driver: string, idx: number) => (
          <Text key={idx} style={styles.driverItem}>• {driver}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  greetingContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
  },
  subText: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: "#444",
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#007AFF",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  driverItem: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
