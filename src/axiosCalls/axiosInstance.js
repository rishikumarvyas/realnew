import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://homeyatraapi.azurewebsites.net",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
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