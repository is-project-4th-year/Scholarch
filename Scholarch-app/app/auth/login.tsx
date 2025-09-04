import { AuthStatus, useAuthStore } from "@/stores/authStore";
import { Button, StyleSheet, Text, View } from "react-native";


export default function login() {
    const login = useAuthStore((state) => state.login);    
    return(
        <View style={styles.container}>
            <Text>Login Page</Text>
            <Button title = "Login" onPress={() =>{
                console.log("AuthStatus in store:", useAuthStore.getState().authStatus);
                login();
            }} />
        </View>
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})