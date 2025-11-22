import { create } from "zustand";
import { signOut, User } from "firebase/auth";
import { auth } from "../lib/FirebaseConfig";
import { router } from "expo-router";

export enum AuthStatus {
  UNAUTHENTICATED = "UNAUTHENTICATED",
  AUTHENTICATED = "AUTHENTICATED",
}

interface AuthStore {
  authStatus: AuthStatus;
  user: User | null;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authStatus: AuthStatus.UNAUTHENTICATED,
  user: null,

  // Sets user manually when logging in
  setUser: (user) => set({ user }),

  // Called after Firebase login success
  login: (user) =>
    set({
      authStatus: AuthStatus.AUTHENTICATED,
      user,
    }),

  // Logout and reset store
  logout: async () => {
    try {
      await signOut(auth);
      set({
        authStatus: AuthStatus.UNAUTHENTICATED,
        user: null,
      });
      router.replace("/auth/login"); // optional: return to login
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
}));
