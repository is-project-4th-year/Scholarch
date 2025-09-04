import { AuthStatus, useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import {  Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {Button} from "react-native-paper";


export default function login() {
    const login = useAuthStore((state) => state.login);    
    return(
        <View style={styles.container}>
            <Text>Login Page</Text>
            <TextInput placeholder="Username" style={styles.textinput} />
            <TextInput placeholder="Password" secureTextEntry style={styles.textinput} />
            <Button 
                mode = "contained"
                onPress={() =>{
                    console.log("AuthStatus in store:", useAuthStore.getState().authStatus);
                    login();
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
                Don't have an account? Sign Up

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