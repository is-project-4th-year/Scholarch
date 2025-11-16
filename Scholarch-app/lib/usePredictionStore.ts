import { create } from "zustand";

import { PredictionResponse, predictAndRecommend, getLatestPrediction } from "@/app/services/api";

interface PredictionStore {
  loading: boolean;
  error: string | null;
  prediction: PredictionResponse | null;

  // ACTIONS
  fetchLatestPrediction: (userId: string) => Promise<void>;
  submitBehaviorAndPredict: (
    userId: string,
    behaviorData: Record<string, any>,
    timestamp?: string
  ) => Promise<PredictionResponse | null>;

  clearPrediction: () => void;
}

/* ------------------------------------------------------- */
/*                     STORE IMPLEMENTATION               */
/* ------------------------------------------------------- */

export const usePredictionStore = create<PredictionStore>((set) => ({
  loading: false,
  error: null,
  prediction: null,

  /* ----------------- Fetch Latest Prediction ----------------- */
  fetchLatestPrediction: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const result = await getLatestPrediction(userId);

      set({ prediction: result, loading: false });
    } catch (err: any) {
      console.error("❌ Error fetching latest prediction:", err.message);
      set({ error: "Failed to fetch prediction", loading: false });
    }
  },

  /* -------------- Submit Form + Predict + Save --------------- */
  submitBehaviorAndPredict: async (userId: string, behaviorData: Record<string, any>, timestamp?: string) => {
    try {
      set({ loading: true, error: null });

      const result = await predictAndRecommend(userId, behaviorData);

      // Save prediction in Zustand
      set({ prediction: result, loading: false });

      return result;
    } catch (err: any) {
      console.error("❌ Prediction error:", err.message);
      set({ error: "Prediction failed", loading: false });
      return null;
    }
  },

  /* ------------------------- Clear --------------------------- */
  clearPrediction: () => set({ prediction: null, error: null })
}));