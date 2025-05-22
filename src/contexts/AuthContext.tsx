import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BASE_URL } from "@/constants/api";
import { formatPhoneNumber, parseJwt } from "@/utils/auth";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../axiosCalls/axiosInstance";

// Define types
interface User {
  userId?: string;
  phone: string;
  name?: string;
  token?: string;
  userTypeId?: string;
  isActive?: boolean;
}

interface UserProperty {
  superCategoryId: string;
  superCategory: string;
  propertyTypeId: string;
  propertyType: string;
  title: string;
  description: string;
  price: number;
  area: number;
  bedroom: number;
  bathroom: number;
}

interface AuthContextType {
  user: User | null;
  userProperties: UserProperty[];
  isAuthenticated: boolean;
  loading: boolean;
  // Auth modal state
  showAuthModal: boolean;
  modalType: "login" | "signup" | null;
  openLoginModal: () => void;
  openSignupModal: () => void;
  closeAuthModal: () => void;
  // Auth functions
  requestOtp: (phoneNumber: string) => Promise<boolean>;
  login: (phoneNumber: string, otp: string) => Promise<boolean>;
  signup: (
    phoneNumber: string,
    fullName: string,
    otp: string,
    userTypeId: string,
    stateId: string
  ) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProperties, setUserProperties] = useState<UserProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"login" | "signup" | null>(null);

  // Auth modal actions
  const openLoginModal = () => {
    setModalType("login");
    setShowAuthModal(true);
  };

  const openSignupModal = () => {
    setModalType("signup");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setModalType(null);
  };

  // Add updateUser function
  const updateUser = (updates: Partial<User>) => {
    setUser(prevUser => {
      if (prevUser) {
        const updatedUser = { ...prevUser, ...updates };
        // Update localStorage as well
        localStorage.setItem("homeYatraUser", JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    });
  };

  // Save user to localStorage
  const saveUserToStorage = (userData: User) => {
    localStorage.setItem("homeYatraUser", JSON.stringify(userData));
    localStorage.setItem("homeYatraToken", userData.token || "");
    setUser(userData);
  };

  // Load user from localStorage
  const loadUserFromStorage = () => {
    try {
      const savedUser = localStorage.getItem("homeYatraUser");
      const savedToken = localStorage.getItem("homeYatraToken");
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser);
        
        // Check if token is expired
        if (userData.token) {
          try {
            const decodedToken = jwtDecode(userData.token);
            const currentTime = Date.now() / 1000;
            
            if (decodedToken.exp && decodedToken.exp > currentTime) {
              // Token is valid
              console.log("Loading user from localStorage:", userData.name);
              setUser(userData);
              return userData;
            } else {
              // Token expired
              console.log("Token expired, clearing storage");
              clearUserStorage();
            }
          } catch (error) {
            console.error("Error decoding token:", error);
            clearUserStorage();
          }
        }
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
      clearUserStorage();
    }
    return null;
  };

  // Clear user from localStorage
  const clearUserStorage = () => {
    localStorage.removeItem("homeYatraUser");
    localStorage.removeItem("homeYatraToken");
    setUser(null);
  };

  // Check for existing auth on mount
  useEffect(() => {
    console.log("AuthProvider mounting, checking for saved user...");
    const savedUser = loadUserFromStorage();
    setLoading(false);
  }, []);

  // Set up axios interceptor when user changes
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = user?.token || localStorage.getItem("homeYatraToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("Adding token to request");
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle token expiry in response interceptor
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("Authentication failed - logging out user");
          clearUserStorage();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [user?.token]);

  const requestOtp = async (phoneNumber: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;

      console.log("Requesting OTP for:", formattedPhone);

      const response = await axiosInstance.post('/api/Message/Send', {
        phone: formattedPhone,
        templateId: 3,
        message: "Your OTP for Home Yatra login is: {{otp}}",
        action: "HomeYatra",
        name: "HomeYatra",
        userTypeId: "0",
      });

      console.log("OTP request response:", response.data);

      return response.status === 200 && response.data?.statusCode === 200;
    } catch (error) {
      console.error("Error requesting OTP:", error);
      return false;
    }
  };

  const signup = async (
    phoneNumber: string,
    fullName: string,
    otp: string,
    userTypeId: string
  ): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;

      console.log("Attempting signup with:", {
        phone: formattedPhone,
        name: fullName,
        otp,
        userTypeId,
      });

      const signupResponse = await axiosInstance.post('/api/Auth/SignUp', {
        name: fullName,
        phone: formattedPhone,
        otp: otp,
        userTypeId: userTypeId,
      });

      console.log("Signup response:", signupResponse.data);

      if (signupResponse.status === 200 && signupResponse.data?.statusCode === 200) {
        const data = signupResponse.data;

        // Extract userId and token from response
        const userId = data.userId || data.id || (data.user && data.user.userId);
        const token = typeof data.token === "string" ? data.token : data.token?.token;

        if (!userId || !token) {
          console.error("API did not provide userId or token during signup");
          return false;
        }

        // Create user data object
        const userData = {
          userId,
          phone: formattedPhone,
          name: fullName,
          token,
          userTypeId,
          isActive: true,
        };

        // Save to localStorage and state
        saveUserToStorage(userData);
        closeAuthModal();

        console.log("User signed up and saved:", userData.name);
        return true;
      } else {
        console.error("Signup failed with status:", signupResponse.data?.statusCode);
        return false;
      }
    } catch (error) {
      console.error("Error during signup:", error);
      return false;
    }
  };

  const login = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;

      console.log("Attempting login with:", { phone: formattedPhone, otp });

      const loginResponse = await axiosInstance.post('/api/Auth/Login', {
        phone: formattedPhone,
        otp,
      });

      console.log("Login response:", loginResponse.data);

      if (loginResponse.status === 200 && loginResponse.data?.statusCode === 200) {
        const data = loginResponse.data;
        const token = data?.token;

        if (!token) {
          console.error("No token received from login response");
          return false;
        }

        // Decode token to get user info
        const decodedToken = jwtDecode(token);
        console.log("Decoded token:", decodedToken);

        // Create user data with token values
        const userData = {
          userId: decodedToken?.UserId,
          phone: decodedToken?.Phone || formattedPhone,
          token,
          name: decodedToken?.UserName,
          userTypeId: decodedToken?.UserTypeId,
          isActive: true,
        };

        // Save to localStorage and state
        saveUserToStorage(userData);
        closeAuthModal();
        setUserProperties([]);

        console.log("User logged in and saved:", userData.name);
        return true;
      } else {
        console.error("Login failed with status:", loginResponse.data?.statusCode);
        return false;
      }
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };

  const logout = () => {
    console.log("Logging out user...");
    clearUserStorage();
    setUserProperties([]);
  };

  const value = {
    user,
    userProperties,
    isAuthenticated: !!user,
    loading,
    // Auth modal state
    showAuthModal,
    modalType,
    openLoginModal,
    openSignupModal,
    closeAuthModal,
    // Auth functions
    requestOtp,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};