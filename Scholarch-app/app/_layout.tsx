import { Redirect, router, Stack } from "expo-router";
import { AuthStatus, useAuthStore } from "../stores/authStore";

export default function RootLayout() {

    const { loading, authStatus } = useAuthStore();
 
    if (loading) {
        return (
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
            </Stack>
        )
    }

    if (authStatus === AuthStatus.UNAUTHENTICATED) {
        router.replace("/auth/login");
    }
        
}
    




