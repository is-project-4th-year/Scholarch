import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { StyleSheet, Text, View, Button } from "react-native";


export default function home() {
    const logout = useAuthStore((state) => state.logout)
    return (
        <View style={styles.container}>
            <Text>Home Page</Text>
            <Button title = "Logout" onPress= {() => {logout}} />
        </View>
    )
}

const styles = StyleSheet.create ({
    container:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})