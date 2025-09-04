import { useAuthStore } from "@/stores/authStore";
import {Redirect, Slot, Stack} from "expo-router";

export default function RootLayout() {
    const {authStatus} = useAuthStore();

    if (authStatus === "UNAUTHENTICATED") {
        return (
            <Stack>
                <Stack.Screen name = "auth"/>
            </Stack>
        )
    }

    if (authStatus === "AUTHENTICATED") {
        return (
            <Stack>
                <Stack.Screen name = "auth"/>
            </Stack>
        )        
    }
    return <Slot />
    
}
    




