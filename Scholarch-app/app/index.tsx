import { Text, ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../stores/authStore"; // Adjust path if needed
import { useEffect } from "react";

export default function Index() {
  const {hydrateAuth, loading, authStatus} = useAuthStore();

  useEffect(()=> {
    hydrateAuth();
  }, [])
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hmmm.......</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

