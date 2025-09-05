import { create } from "zustand";
import { signOut } from "firebase/auth";
import { auth } from "../lib/FirebaseConfig";
import { router } from "expo-router";

export enum AuthStatus {
  UNAUTHENTICATED = "UNAUTHENTICATED",
  AUTHENTICATED = "AUTHENTICATED",
}

interface AuthStore {
  authStatus: AuthStatus;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authStatus: AuthStatus.UNAUTHENTICATED,

  login: () =>
  set((state) => {
    //console.log("AuthStatus before login:", state.authStatus);
    return { authStatus: AuthStatus.AUTHENTICATED };
  }),

  
  logout: async () => {
    try{
      await signOut(auth);
      set((state) => {
        return  { authStatus: AuthStatus.UNAUTHENTICATED };
      });
    }catch(error){
      console.error("Error signing out:", error);
    }
  } 
}));

