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

// Optional: Handle errors globally (so you don’t repeat try/catch everywhere)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);
    throw error;
  }
);

export default apiClient;


// 1️⃣ Send behavior data for prediction
export const predictAndRecommend = async (userId: string, behaviorData: Record<string, any>) => {
  const response = await apiClient.post("/predict_and_recommend", {
    user_id: userId,
    behavior: behaviorData,
  });
  return response.data;
};

// 2️⃣ Retrieve latest prediction
export const getLatestPrediction = async (userId: string) => {
  const response = await apiClient.get(`/get_latest_prediction/${userId}`);
  return response.data;
};
