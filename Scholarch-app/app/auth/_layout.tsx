import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SvgAst } from "react-native-svg";

export default function AuthLayout() {
    return (
        <SafeAreaProvider>
           <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="signup" options={{ headerShown: false }} />
                <Stack.Screen name="confirmEmail" options={{ headerShown: false }} />
                <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
            </Stack> 
        </SafeAreaProvider>
        
    )
}