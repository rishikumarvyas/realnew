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
      delete config.headers["Content-Type"];
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
      // mark that we're retrying this request so we don't loop
      originalRequest._retry = true;

      // Only attempt a refresh if we have a current token
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        // No token to refresh - reject and let caller handle auth flow
        return Promise.reject(error);
      }

      // Initialize queue if needed
      if (!axiosInstance._isRefreshing) {
        axiosInstance._isRefreshing = true;
        axiosInstance._refreshSubscribers = [];

        const refreshUrl = `${axiosInstance.defaults.baseURL}/api/Auth/RefreshToken`;

        if (
          typeof import.meta !== "undefined" &&
          import.meta.env &&
          import.meta.env.DEV
        ) {
          // eslint-disable-next-line no-console
          console.debug("[axiosInstance] refreshing token", { refreshUrl });
        }

        return axios
          .post(refreshUrl, { accessToken: currentToken })
          .then((res) => {
            const newRefreshToken = res?.data?.refreshToken;
            if (newRefreshToken) {
              try {
                localStorage.setItem("token", newRefreshToken);
              } catch (e) {
                // ignore storage errors
              }

              // ensure axios default header uses the new token
              if (!axiosInstance.defaults.headers)
                axiosInstance.defaults.headers = {};
              if (!axiosInstance.defaults.headers.common)
                axiosInstance.defaults.headers.common = {};
              axiosInstance.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${newRefreshToken}`;

              // notify queued requests with the new token
              axiosInstance._refreshSubscribers.forEach((cb) =>
                cb(newRefreshToken)
              );
              axiosInstance._refreshSubscribers = [];

              // retry the original request
              return axiosInstance(originalRequest);
            }
            // no token in response - treat as failure
            return Promise.reject(error);
          })
          .catch((err) => {
            // If refresh failed, remove tokens and reject so app can redirect to login
            try {
              localStorage.removeItem("token");
            } catch (e) {}
            return Promise.reject(err);
          })
          .finally(() => {
            axiosInstance._isRefreshing = false;
          });
      }

      // If a refresh is already in progress, queue the request and retry once we have a token
      return new Promise((resolve, reject) => {
        axiosInstance._refreshSubscribers.push((token) => {
          if (!originalRequest.headers) originalRequest.headers = {};
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
