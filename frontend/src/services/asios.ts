import { get_cookie } from "@/lib/features/cookie";
import axios, { AxiosInstance } from "axios";
import toast from "react-hot-toast";

const api: AxiosInstance = axios.create({
  baseURL: "http://" + process.env.NEXT_PUBLIC_DOMAIN,
  timeout: 100000,
});
api.interceptors.request.use(
  (config) => {
    console.log("Requset Intercepto", config);
    const tocken = get_cookie("access");
    config.withCredentials = true;

    if (tocken) {
      console.log("tojen in access", tocken);

      config.headers["Authorization"] = `Bearer ${tocken}`;
      return config;
    }
    return config;
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
    // toast.error( error.response.data.message)
    // return Promise.reject(error);
    throw new Error(error?.response?.data.message || error.message);
  }
);

export default api;
