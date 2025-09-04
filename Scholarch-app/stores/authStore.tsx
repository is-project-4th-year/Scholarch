import { create } from "zustand";

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

  
  logout: () => {
    console.log("Logging out...");
    set({ authStatus: AuthStatus.UNAUTHENTICATED });
  } 
}));

