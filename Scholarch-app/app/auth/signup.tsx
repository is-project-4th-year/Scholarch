import { router } from "expo-router";
import { use, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "react-native-paper";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/FirebaseConfig";
import { useAuthStore } from "@/stores/authStore";


export default function signup (){
   const [email, setEmail] = useState ("");
   const [password, setPassword] = useState ("");
   const [confirmPassword, setConfirmPassword] = useState ("");
   const login = useAuthStore ((state) => state.login);


   const handleSignup = async () => {
       try{
           if (password !== confirmPassword) {
               alert ("Passwords do not match");
               return;
           }
           const userCredentials = await createUserWithEmailAndPassword (auth, email, password);
           console.log ("Sign up successful", userCredentials.user.uid);
           login();
           router.push ("/auth/login")
       } catch(error:any){
           console.log ("Error signing up", error.message);
           alert (error.message);
       }
   };


   return (
       <View style={styles.container}>
           <Text>Sign Up</Text>
           <TextInput
               placeholder="Email"
               style={styles.textinput}
               value={email}
               onChangeText={setEmail}
           />
           <TextInput
               placeholder="Password"
               secureTextEntry
               style={styles.textinput}
               value={password}
               onChangeText={setPassword}
           />
           <TextInput
               placeholder="Confirm Password"
               secureTextEntry
               style={styles.textinput}
               value={confirmPassword}
               onChangeText={setConfirmPassword}
           />
           <Button mode="contained" onPress={handleSignup}>Sign Up</Button>
           <Button mode="text" onPress={() => {console.log ("Navigate to login page"), router.push("/auth/login")}}>Already have an account? Login</Button>
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



