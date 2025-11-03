import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, Alert, ScrollView } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/FirebaseConfig";// Adjust path if needed
import { useAuthStore } from "@/stores/authStore"; // Zustand store
import { useRouter } from "expo-router";

export default function profile() {
    const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const { logout } = useAuthStore();

  interface Profile {
  name: string;
  email: string;
  age: string;
  gender: string;
  program: string;
  university: string;
  learningStyle: string;
}


  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    program: "",
    university: "",
    learningStyle: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🧠 Fetch user profile data when screen mounts
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "profile", "info");
        const snap = await getDoc(docRef);

        if (snap.exists()) {
  const data = snap.data() as Partial<Profile>; // ✅ cast safely
  setProfile({
    name: data.name ?? "",
    email: data.email ?? "",
    age: data.age ?? "",
    gender: data.gender ?? "",
    program: data.program ?? "",
    university: data.university ?? "",
    learningStyle: data.learningStyle ?? "",
  });
} else {
  // Create placeholder doc
  await setDoc(docRef, {
    email: user.email ?? "",
    createdAt: serverTimestamp(),
  });

  setProfile((prev) => ({ ...prev, email: user.email ?? "" })); // ✅ ensure string
}

      } catch (error: any) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // ✏️ Handle field changes
  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // 💾 Save profile to Firestore
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const docRef = doc(db, "users", user.uid, "profile", "info");
      await updateDoc(docRef, {
        ...profile,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // 🚪 Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout(); // Reset Zustand auth state
      router.replace("/auth/login"); // Redirect to login
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out.");
    }
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 20 }}>My Profile</Text>

      {/* Form fields */}
      <TextInput
        placeholder="Full Name"
        value={profile.name}
        onChangeText={(text) => handleChange("name", text)}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Age"
        keyboardType="numeric"
        value={profile.age?.toString()}
        onChangeText={(text) => handleChange("age", text)}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Gender"
        value={profile.gender}
        onChangeText={(text) => handleChange("gender", text)}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Program"
        value={profile.program}
        onChangeText={(text) => handleChange("program", text)}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="University"
        value={profile.university}
        onChangeText={(text) => handleChange("university", text)}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Learning Style"
        value={profile.learningStyle}
        onChangeText={(text) => handleChange("learningStyle", text)}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 8 }}
      />

      <Button title={saving ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={saving} />
      <View style={{ height: 20 }} />
      <Button title="Logout" color="red" onPress={handleLogout} />
    </ScrollView>
  );
}