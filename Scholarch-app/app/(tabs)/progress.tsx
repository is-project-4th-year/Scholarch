import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Text, ActivityIndicator, Card } from "react-native-paper";
import { auth, db } from "@/lib/FirebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getLatestPrediction } from "../services/api";
import { LineChart } from "react-native-chart-kit";
import {useAuthStore} from "@/stores/authStore";


export default function ProgressScreen() {
 const { user } = useAuthStore();
 const [loading, setLoading] = useState(true);
 const [prediction, setPrediction] = useState<any>(null);


 useEffect(() => {
   const fetchPrediction = async () => {
     if (!user) return;
     try {
       const data = await getLatestPrediction(user.uid);
       setPrediction(data);
     } catch (error) {
       console.error("❌ Error fetching prediction:", error);
     } finally {
       setLoading(false);
     }
   };
   fetchPrediction();
 }, [user]);


 if (loading) {
   return <ActivityIndicator style={{ marginTop: 100 }} />;
 }


 if (!prediction) {
   return <Text>No prediction data available yet.</Text>;
 }


 const shapValues = prediction.shap_explanation || {};


 // Convert to sorted list
 const sortedShap = Object.entries(shapValues as Record<string, number>)
 .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
 .slice(0, 5);


 return (
   <ScrollView contentContainerStyle={styles.container}>
     <Text style={styles.header}>📈 Academic Performance Overview</Text>


     <Card style={styles.card}>
       <Card.Content>
         <Text style={styles.score}>Predicted Score: {prediction.predicted_score?.toFixed(2)}</Text>
         <Text style={styles.timestamp}>Last updated: {prediction.timestamp || "N/A"}</Text>
       </Card.Content>
     </Card>


     {prediction && prediction.shap_explanation ? (
     <>
       <Text style={styles.sectionTitle}>Top Feature Influences</Text>
       {Object.entries(prediction.shap_explanation as Record<string, number>)
         .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
         .slice(0, 5)
         .map(([key, value], idx) => (
           <Text key={idx} style={styles.shapItem}>
             {key}: {value.toFixed(3)}
           </Text>
         ))}
     </>
   ) : (
     <Text style={{ color: "gray" }}>No SHAP explanation available yet.</Text>
   )}


     
   </ScrollView>
 );
}


const styles = StyleSheet.create({
 container: { padding: 20 },
 header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
 score: { fontSize: 18, fontWeight: "600" },
 timestamp: { fontSize: 14, color: "#555" },
 sectionTitle: { marginTop: 20, fontSize: 16, fontWeight: "600" },
 card: { marginTop: 10, padding: 5 },
 shapItem: {
 fontSize: 15,
 marginVertical: 3,
 color: "#333",
 fontWeight: "500",
 borderLeftWidth: 3,
 borderColor: "#4CAF50",
 paddingLeft: 8,
},


});




