import { Stack } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export default function RootLayout() {

 const { loading, authStatus } = useAuthStore();

    if (loading) {
        return (
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
            </Stack>
        );
    }

    
}
// Show splash while loading
//if (loading) return <Index />;

// Then decide: auth screens, onboarding, or app
//if (authStatus === AuthStatus.AWAITING_EMAIL_VERIFICATION) return <VerifyEmailScreen />;
//if (authStatus === AuthStatus.ONBOARDING) return <OnboardingLayout />;
//if (authStatus === AuthStatus.AUTHENTICATED) return <AppLayout />;

