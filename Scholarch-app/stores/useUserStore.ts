import { create } from "zustand";
import { getUserProfile } from "@/app/services/api";

interface UserStore {
  name: string;
  loadUserProfile: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  name: "",
  loadUserProfile: async (userId: string) => {
    const profile = await getUserProfile(userId);
    if (profile?.name) {
      set({ name: profile.name });
    }
  },
}));
