import { router } from "expo-router";
import React from "react";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, DividerProps, TextInput } from "react-native-paper";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../lib/FirebaseConfig";
import { useAuthStore } from "@/stores/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showpassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSignup = async () => {
    try {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(userCredentials.user)
      console.log("Email verification sent")
      console.log("Sign up successful", userCredentials.user.uid);
      login();
      router.push("/auth/login");
    } catch (error: any) {
      console.log("Error signing up", error.message);
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.signupText}>Sign Up</Text>
      <Text style={styles.signupSubtitle}>
        To gain access to Scholarch, please proceed
      </Text>
      <TextInput
        label={"Email"}
        placeholder="Email"
        style={styles.textinput}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TextInput
        label={"Password"}
        value={password}
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry={!showpassword}
        style={styles.textinput}
        autoCapitalize={"none"}
        autoCorrect={false}
        right={
          <TextInput.Icon
            icon={() => (
              <Ionicons
                name={showpassword ? "eye-off" : "eye"}
                size={20}
                color="gray"
                onPress={() => setShowPassword(!showpassword)}
              />
            )}
          />
        }
      />
      <TextInput
        label={"Confirm Password"}
        value={confirmPassword}
        placeholder="Confirm your Password"
        onChangeText={setConfirmPassword}
        secureTextEntry={!showpassword}
        style={styles.textinput}
        autoCapitalize={"none"}
        autoCorrect={false}
        right={
          <TextInput.Icon
            icon={() => (
              <Ionicons
                name={showpassword ? "eye-off" : "eye"}
                size={20}
                color="gray"
                onPress={() => setShowPassword(!showpassword)}
              />
            )}
          />
        }
      />

      <Button mode="contained" onPress={handleSignup}>
        Sign Up
      </Button>
      <Button
        mode="text"
        onPress={() => {
          (console.log("Navigate to login page"), router.push("/auth/login"));
        }}
      >
        Already have an account? Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 30,
    marginBottom: 20,
  },
  signupSubtitle: {
    color: "gray",
    textAlign: "center",
    fontSize: 15,
    marginBottom: 20,
  },
  textinput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    width: 200,
    paddingHorizontal: 10,
  },
});
