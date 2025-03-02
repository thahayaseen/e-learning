import { get_cookie } from "@/lib/features/cookie";
import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "http://" + process.env.NEXT_PUBLIC_DOMAIN,
  timeout: 100000,
});
api.interceptors.request.use(
  (config) => {
    console.log("Requset Intercepto", config);
    const tocken = get_cookie('access')
 
    
    if (tocken) {
      console.log('tojen in access',tocken);
      
      config.headers["Authorization"] = `Bearer ${tocken}`;
      return config;
    }
    config.withCredentials=true
    return config
  },
  (error) => {
    console.log("error in request" + error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    console.log("responcse is " + response.data);
    return response.data;
  },
  (error) => {
    console.log("error is", error);
    return Promise.reject(error);
  }
);

export default api;
