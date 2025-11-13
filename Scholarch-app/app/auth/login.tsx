import { AuthStatus, useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import { Button, DividerProps, TextInput } from "react-native-paper";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";

export default function login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // 🔹 keep Zustand in sync with Firebase
      useAuthStore.getState().login(user);

      console.log("Login success:", user.uid);
      console.log("Store user:", useAuthStore.getState().user?.email);

      

      router.push("/profile")
      
    
    

      // (Optional) If you want explicit navigation instead of relying on layout:
      // router.replace("/app");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.loginText}>Login Page</Text>
      <Text style={styles.loginSubtitle}>
        Welcome back! Please login to your account.
      </Text>
      <TextInput
        label={"Email"}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize={"none"}
        keyboardType={"email-address"}
        style={styles.textinput}
      />
      <TextInput
        label={"Password"}
        value={password}
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry = {!showpassword}
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

       <Button
        mode="text"
        onPress={() => {
          console.log("Navigate to forgot password");
          router.push("/auth/forgotpassword");
        }}
      >
        Forgot your Password?
      </Button>



       <Button
        mode="contained"
        onPress={() => {
          handleLogin();
          console.log(
            "AuthStatus in store:",
            useAuthStore.getState().authStatus
          );
        }}
      >
        {" "}
        Login
      </Button>
      
      <Button
        mode="text"
        onPress={() => {
          console.log("Navigate to Signup");
          router.push("/auth/signup");
        }}
      >
        New to scholarch? Sign Up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0000",
  },
  loginText: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 30,
    marginBottom: 20,
  },
  loginSubtitle: {
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
