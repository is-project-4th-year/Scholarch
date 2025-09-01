import {create} from 'zustand'
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db} from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Enum for clear auth states
export enum AuthStatus {
  UNAUTHENTICATED = "UNAUTHENTICATED",
  AWAITING_EMAIL_VERIFICATION = "AWAITING_EMAIL_VERIFICATION",
  AWAITING_2FA = "AWAITING_2FA",
  ONBOARDING = "ONBOARDING",
  AUTHENTICATED = "AUTHENTICATED",
  LOADING = "LOADING", // splash hydration
}

interface UserProfile {
  uid: string;
  email: string | null;
  name?: string;
  course?: string;
  profileComplete?: boolean;
}

interface AuthStore {
  authStatus: AuthStatus;
  user: UserProfile | null;
  loading: boolean;

  // actions
  setAuthStatus: (status: AuthStatus) => void;
  setUser: (user: UserProfile | null) => void;
  hydrateAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authStatus: AuthStatus.LOADING,
  user: null,
  loading: true,

  setAuthStatus: (status) => set({ authStatus: status }),
  setUser: (user) => set({ user }),

  // Hydrate on app start
  hydrateAuth: async () => {
    set({ loading: true });
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser: User | null) => {
        if (!firebaseUser) {
          set({ user: null, authStatus: AuthStatus.UNAUTHENTICATED, loading: false });
          return resolve();
        }

        // Reload user to check verification
        await firebaseUser.reload();
        const emailVerified = firebaseUser.emailVerified;

        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const profileData = userDoc.exists() ? userDoc.data() : {};

        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profileData?.name,
          course: profileData?.course,
          profileComplete: profileData?.profileComplete || false,
        };

        // Decide authStatus
        let nextStatus: AuthStatus;
        if (!emailVerified) {
          nextStatus = AuthStatus.AWAITING_EMAIL_VERIFICATION;
        } else if (!userProfile.profileComplete) {
          nextStatus = AuthStatus.ONBOARDING;
        } else {
          nextStatus = AuthStatus.AUTHENTICATED;
        }

        set({ user: userProfile, authStatus: nextStatus, loading: false });
        resolve();
      });
    });
  },

  logout: async () => {
    await auth.signOut();
    set({ user: null, authStatus: AuthStatus.UNAUTHENTICATED });
  },
}));
