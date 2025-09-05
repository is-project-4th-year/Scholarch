import { AuthStatus, useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import {  Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {Button} from "react-native-paper";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { Alert } from "react-native";


export default function login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const login = useAuthStore((state) => state.login);

    const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login success:", userCred.user.uid);
      router.push("/app/home");

      // update Zustand store
      login();

      // (Optional) If you want explicit navigation instead of relying on layout:
      // router.replace("/app");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", error.message);
    }
  };
    return(
        <View style={styles.container}>
            <Text>Login Page</Text>
            <TextInput placeholder="Email" onChangeText= {setEmail}style={styles.textinput} />
            <TextInput placeholder="Password" onChangeText={setPassword} secureTextEntry style={styles.textinput} />
            <Button 
                mode = "contained"
                onPress={() =>{
                    handleLogin();
                    console.log("AuthStatus in store:", useAuthStore.getState().authStatus);
                    
                }} 
            > Login
                </Button>
            <Button 
                mode = "text"
                onPress={() => {
                    console.log("Navigate to Signup");
                    router.push("/auth/signup")
                }}
            >
                New to scholarch? Sign Up

            </Button>
            
        </View>
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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