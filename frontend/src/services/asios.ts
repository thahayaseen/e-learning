import { get_cookie } from "@/lib/features/cookie";
import axios, { AxiosInstance } from "axios";

// Fallback to localhost if env var is not set
const domain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:4050";
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
     } else {
     }
    return config;
  },
  (error) => {
 
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
     return response.data; 
  },
  (error) => {
     const errorMsg = error?.response?.data?.message || error.message;

    throw new Error(errorMsg); // Keeps it consistent with async/await usage
  }
);

export default api;
