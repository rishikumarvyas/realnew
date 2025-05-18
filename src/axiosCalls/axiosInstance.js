import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://homeyatraapi.azurewebsites.net", // Update this to your API base URL
});
// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
