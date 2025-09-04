import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "react-native-paper";

export default function signup (){
    return (
        <View style={styles.container}>
            <Text>Sign Up Page</Text>
            <TextInput placeholder="Username" style={styles.textinput} />
            <TextInput placeholder="Password" secureTextEntry style={styles.textinput} />
            <TextInput placeholder="Confirm Password" secureTextEntry style={styles.textinput} />
            <Button mode="contained">Sign Up</Button>
            <Button mode="text" onPress={() => {console.log ("Navigate to login page"), router.push("/auth/login")}}>Already have an account? Login</Button>
        </View>
    )
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