import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://homeyatraapi.azurewebsites.net",
});

// Add a request interceptor - AuthContext will handle token injection
axiosInstance.interceptors.request.use(
  (config) => {
    // Fallback: if token is not injected by AuthContext, try localStorage
    if (!config.headers.Authorization) {
      const token = localStorage.getItem("homeYatraToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    console.log("Making request to:", config.url);
    console.log("Has Authorization header:", !!config.headers.Authorization);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiry
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if error is due to token expiry or unauthorized access
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Authentication failed - token may be expired or invalid");
      console.log("Error details:", error.response?.data);
      
      // Clear localStorage tokens on auth failure
      localStorage.removeItem("homeYatraToken");
      localStorage.removeItem("homeYatraUser");
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;