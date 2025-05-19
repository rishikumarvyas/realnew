import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://homeyatraapi.azurewebsites.net",
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

// Add a response interceptor to handle token expiry
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if error is due to token expiry or unauthorized access
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is expired or invalid
      localStorage.removeItem("token");
      
      // Don't redirect automatically - let the protected route handle this
      // This avoids refresh loops when authentication fails
      
      // Instead, let the AuthContext handle redirection through its protection mechanism
      console.log("Authentication failed - token may be expired");
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;