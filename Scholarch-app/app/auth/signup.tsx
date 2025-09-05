import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View,  } from "react-native";
import { Button } from "react-native-paper";
import { useState } from "react";   
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { useAuthStore } from "@/stores/authStore";
import { Alert } from "react-native";


export default function signup (){
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login); // updates Zustand store

  const handleSignup = async () => {
    console.log("Signup button pressed");
    try {
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Signup success:", userCred.user.uid);
      router.push("/auth/login"); // navigate to login page

      // update Zustand state
      login();
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Signup Failed", error.message);
    }
  };
    return (
      <View style={styles.container}>
        <Text>Sign Up Page</Text>
        <TextInput
          placeholder="Email"
          onChangeText={setEmail}
          style={styles.textinput}
        />
        <TextInput
          placeholder="Password"
          onChangeText={setPassword}
          secureTextEntry
          style={styles.textinput}
        />
        <TextInput
          placeholder="Confirm Password"
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.textinput}
        />
        <Button
          mode="contained"
          onPress={() => {
            handleSignup;
          }}
        >
          Sign Up
        </Button>
        <Button
          mode="text"
          onPress={() => {
            console.log("Navigate to login page"), router.push("/auth/login");
          }}
        >
          Already have an account? Login
        </Button>
      </View>
    );
}

const styles = StyleSheet.create ({
    container:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    textinput:{
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        width: 200,
        paddingHorizontal: 10
    }
})