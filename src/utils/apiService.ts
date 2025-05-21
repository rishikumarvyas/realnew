import { BASE_URL } from "@/constants/api";

// Define request options type
type ApiRequestOptions = RequestInit & {
  authorized?: boolean;
};

/**
 * Central API utility for making requests with or without authentication
 * @param url API endpoint URL
 * @param options Request options
 * @returns Promise with response data
 */
export const apiRequest = async (
  url: string,
  options: ApiRequestOptions = {}
): Promise<any> => {
  try {
    const { authorized = true, ...restOptions } = options;

    // Create headers starting with content-type
    const headers = {
      "Content-Type": "application/json",
      ...restOptions.headers,
    };

    // Add authorization token if required and available
    if (authorized) {
      const authData = sessionStorage.getItem("auth");

      if (authData) {
        const { token } = JSON.parse(authData);
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        } else {
          console.warn("No token available for authorized request");
        }
      } else {
        console.warn("No auth data found for authorized request");
      }
    }

    // Prepare final request options
    const requestOptions = {
      ...restOptions,
      headers,
    };

    // Make the API call
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `API request failed with status ${response.status}: ${
          errorData?.message || response.statusText
        }`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

/**
 * Shorthand for making authorized GET requests
 */
export const apiGet = async (
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<any> => {
  return apiRequest(`${BASE_URL}${endpoint}`, {
    method: "GET",
    authorized: true,
    ...options,
  });
};

/**
 * Shorthand for making authorized POST requests
 */
export const apiPost = async (
  endpoint: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<any> => {
  return apiRequest(`${BASE_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
    authorized: true,
    ...options,
  });
};

/**
 * Shorthand for making authorized PUT requests
 */
export const apiPut = async (
  endpoint: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<any> => {
  return apiRequest(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    body: JSON.stringify(data),
    authorized: true,
    ...options,
  });
};

/**
 * Shorthand for making authorized DELETE requests
 */
export const apiDelete = async (
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<any> => {
  return apiRequest(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    authorized: true,
    ...options,
  });
};

/**
 * Make unauthorized requests when authentication is not required
 */
export const apiPublic = {
  get: async (
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<any> => {
    return apiRequest(`${BASE_URL}${endpoint}`, {
      method: "GET",
      authorized: false,
      ...options,
    });
  },

  post: async (
    endpoint: string,
    data: any,
    options: ApiRequestOptions = {}
  ): Promise<any> => {
    return apiRequest(`${BASE_URL}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(data),
      authorized: false,
      ...options,
    });
  },
};

/**
 * Get the current auth token (useful when you need direct access)
 * @returns The current token or null if not authenticated
 */
export const getAuthToken = (): string | null => {
  try {
    const authData = sessionStorage.getItem("auth");
    if (authData) {
      const { token } = JSON.parse(authData);
      return token || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};
