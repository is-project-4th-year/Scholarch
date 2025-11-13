import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Button
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
}


  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    program: "",
    university: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

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
    setIsEdited(true);
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
      setIsEdited(false);
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
      await useAuthStore.getState().logout();
      router.replace("/auth/login"); // Redirect to login
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out.");
    }
  };
  const handleAPITest = () => {
    router.push("/test/TestAPI");
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9fafb',
    },
    scrollContent: {
      flexGrow: 1,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 40,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#e0e7ff',
    },
    content: {
      padding: 20,
      paddingTop: 0,
      marginTop: -20,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 32,
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#e0e7ff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: '#ffffff',
    },
    avatarInitial: {
      fontSize: 48,
      fontWeight: '700',
      color: '#6366f1',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#6366f1',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    cameraIcon: {
      fontSize: 18,
    },
    formSection: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#f9fafb',
      borderWidth: 2,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: '#1f2937',
    },
    buttonSection: {
      gap: 12,
      marginBottom: 20,
    },
    saveButton: {
      backgroundColor: '#6366f1',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonDisabled: {
      backgroundColor: '#9ca3af',
      shadowOpacity: 0,
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    logoutButton: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fee2e2',
    },
    logoutButtonText: {
      color: '#ef4444',
      fontSize: 16,
      fontWeight: '600',
    },
    infoSection: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    infoText: {
      fontSize: 13,
      color: '#6b7280',
      textAlign: 'center',
      lineHeight: 20,
    },
  });

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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account information</Text>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          
           

          {/* Form Section */}
          <View style={styles.formSection}>
            
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Full Name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Age */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={profile.age?.toString()}
                onChangeText={(text) => handleChange("age", text)}
                placeholder="Age"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <TextInput
                style={styles.input}
                value={profile.gender}
                onChangeText={(text) => handleChange("gender", text)}
                placeholder="Gender"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Program */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Program</Text>
              <TextInput
                style={styles.input}
                value={profile.program}
                onChangeText={(text) => handleChange("program", text)}
                placeholder="e.g., Computer Science"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* University */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>University</Text>
              <TextInput
                style={styles.input}
                value={profile.university}
                onChangeText={(text) => handleChange("university", text)}
                placeholder="University"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity 
              style={[
                styles.saveButton,
                (!isEdited || saving) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={!isEdited || saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Your data is securely stored and can be updated anytime
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

 