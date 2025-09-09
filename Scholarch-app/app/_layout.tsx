import { auth } from "@/lib/FirebaseConfig";
import { useAuthStore } from "@/stores/authStore";
import {Redirect, Slot, Stack} from "expo-router";

export default function RootLayout() {
    const {authStatus} = useAuthStore();

    if (authStatus === "UNAUTHENTICATED") {
        return (
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name = "auth"/>
            </Stack>
        )
    }

    if (authStatus === "AUTHENTICATED") {
        if(auth.currentUser && !auth.currentUser.emailVerified){
            return (
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name = "auth/verfyemail"/>
                </Stack>
            )
        }
        return (
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name = "app"/>
            </Stack>
        )        
    }
    return <Slot />
    
}
    




