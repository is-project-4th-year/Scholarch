import { useState } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import { sendPasswordResetEmail } from "@firebase/auth";
import { router } from "expo-router";
import { Button, TextInput } from "react-native-paper";
import { auth } from "@/lib/FirebaseConfig";

export default function forgotpassword() {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to send password reset email");
      console.error("Error sending password reset email: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.forgotPassword}>Forgot Password</Text>
      <Text style={styles.forgotPasswordSubtitle}>
        Enter your email to reset your password
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

      <Button
        mode="contained"
        onPress={() => {
          console.log("Reset Password");
          handleResetPassword();
        }}
      >
        {" "}
        Reset Password{" "}
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
  forgotPassword: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 30,
    marginBottom: 20,
  },
  forgotPasswordSubtitle: {
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
