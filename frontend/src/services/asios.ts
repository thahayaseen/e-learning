import { get_cookie } from "@/lib/features/cookie";
import axios, { AxiosInstance } from "axios";

// Fallback to localhost if env var is not set
const domain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:4050";
console.log(domain, '← API base URL');

const api: AxiosInstance = axios.create({
  baseURL: domain,
  timeout: 100000,
  withCredentials: true, // Recommended to be here globally
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = get_cookie("access");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("→ Request with token", token);
    } else {
      console.log("→ Request without token");
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("→ Response received", response.data);
    return response.data; // Simplify response usage
  },
  (error) => {
    const errorMsg = error?.response?.data?.message || error.message;
    console.error("→ Response error:", errorMsg);
    // You can show toast here if you're using a UI lib
    throw new Error(errorMsg); // Keeps it consistent with async/await usage
  }
);

export default api;
