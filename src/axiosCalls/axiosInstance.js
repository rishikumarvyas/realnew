import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://homeyatraapi.azurewebsites.net",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If sending FormData, remove Content-Type to let browser set multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle response errors
    const originalRequest = error.config;

    // If no response (network error) just reject
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    // If unauthorized or forbidden, try to refresh the access token once
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      // Simple refresh queue to avoid multiple refresh calls in parallel
      if (!axiosInstance._isRefreshing) {
        axiosInstance._isRefreshing = true;
        axiosInstance._refreshSubscribers = [];
        const currentToken = localStorage.getItem("token");
        const refreshUrl = `${axiosInstance.defaults.baseURL}/api/Auth/RefreshToken`;

        return axios
          .post(refreshUrl, { accessToken: currentToken })
          .then((res) => {
            // Server returns a refreshToken which will act as the next accessToken
            const newRefreshToken = res?.data?.refreshToken;

            if (newRefreshToken) {
              // Replace our stored token with the new refreshToken
              localStorage.setItem("token", newRefreshToken);
              originalRequest.headers.Authorization = `Bearer ${newRefreshToken}`;
              // Update default headers for future requests
              axiosInstance.defaults.headers.Authorization = `Bearer ${newRefreshToken}`;

              // notify queued requests with the new token
              axiosInstance._refreshSubscribers.forEach((cb) =>
                cb(newRefreshToken)
              );
              axiosInstance._refreshSubscribers = [];

              // retry original
              return axiosInstance(originalRequest);
            }
            return Promise.reject(error);
          })
          .catch((err) => {
            // If refresh failed, remove tokens and reject
            localStorage.removeItem("token");
            return Promise.reject(err);
          })
          .finally(() => {
            axiosInstance._isRefreshing = false;
          });
      }

      // If a refresh is already in progress, queue the request
      return new Promise((resolve, reject) => {
        axiosInstance._refreshSubscribers.push((token) => {
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
