import axios from "axios";

// ⚠️ IMPORTANT: If testing with Expo on a physical phone,
// replace 127.0.0.1 with your local IP address (e.g., 192.168.x.x)
const API_BASE_URL = "http://10.0.2.2:8000";

// Create a reusable Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to log outgoing requests
apiClient.interceptors.request.use((req) => {
  console.log("➡️ Request:", req.method?.toUpperCase(), req.url, req.data ?? req.params);
  return req;
});

// Optional: Handle responses and errors globally (so you don’t repeat try/catch everywhere)
apiClient.interceptors.response.use(
  (response) => {
    console.log("⬅️ Response:", response.config.method?.toUpperCase(), response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error?.response?.data || error.message);
    throw error;
  }
);



/* ---------------- Types ---------------- */
export interface PredictionResponse {
  predicted_score: number;
  recommendations: string[];
  trend_insights?: string[];
  trend_summary?: Record<string, any>;
  correlations?: Record<string, number | null>;
  top_drivers?: Record<string, number>;
  saved?: boolean;
  timestamp?: string;
  user_id?: string;
}

// 1️⃣ Send behavior data for prediction
export const predictAndRecommend = async (userId: string, behaviorData: Record<string, any>) => {
  try {
    console.log("🔁 POST /predict_and_recommend payload:", { user_id: userId, behavior: behaviorData });
    const response = await apiClient.post("/predict_and_recommend", {
      user_id: userId,
      behavior: behaviorData,
    });
    console.log("🔗 POST /predict_and_recommend response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ API call failed: /predict_and_recommend", error?.message || error);
    throw error;
  }
};

// 2️⃣ Retrieve latest prediction
export const getLatestPrediction = async (userId: string) => {
  try {
    console.log("🔁 GET /get_latest_prediction payload:", { user_id: userId });
    const response = await apiClient.get(`/get_latest_prediction/${userId}`);
    console.log("🔗 GET /get_latest_prediction response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ API call failed: /get_latest_prediction", error?.message || error);
    throw error;
  }
};

// 3) Get prediction history (optional endpoint if your backend exposes it)
// export const getPredictionHistory = async (userId: string): Promise<PredictionResponse[]> => {
//   const response = await apiClient.get<PredictionResponse[]>(`/get_prediction_history/${userId}`);
//   return response.data;
// };

// 4) If you want to fetch analytics specifically (optional)
export const getCorrelations = async (userId: string): Promise<Record<string, number | null>> => {
  const response = await apiClient.get<Record<string, number | null>>(`/analytics/correlations/${userId}`);
  return response.data;
};

export const getTrendSummary = async (userId: string): Promise<Record<string, any>> => {
  const response = await apiClient.get<Record<string, any>>(`/analytics/trend_summary/${userId}`);
  return response.data;
};


export default apiClient;