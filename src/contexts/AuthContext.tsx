import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BASE_URL } from "@/constants/api";
import { formatPhoneNumber } from "@/utils/auth";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import axiosInstance from "@/axiosCalls/axiosInstance";
import type { decodedToken, User } from "@/Types/AuthContext";

// Define types for notifications
interface Notification {
  notificationId: string;
  message: string;
  isRead: boolean;
  createdDt: string;
  propertyId?: string;
  notificationType?: "user" | "property";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  notifications: Notification[];
  unreadCount: number;
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
  ) => Promise<boolean>;
  logout: () => void;
  fetchNotifications: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Add effect to fetch notifications when user is available
  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    }
  }, [user?.userId]);

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

  // Check for existing auth on mount
  useEffect(() => {
    const loadAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken: decodedToken = jwtDecode(token);
          // Verify the token is still valid if it exists

          const userData: User = {
            userId: decodedToken?.UserId,
            phone: decodedToken?.Phone,
            name: decodedToken?.UserName,
            token,
            userType: decodedToken?.userType || decodedToken?.userTypeId,
            role: decodedToken?.Role,
            userTypeId: decodedToken?.userTypeId,
          };
          if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            setUser(userData);
          }
        } catch (error) {
          console.error("Error parsing stored token:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    loadAuth();
  }, []);

  const requestOtp = async (phoneNumber: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;

      const responseOtp = await axiosInstance.post(`/api/Message/Send`, {
        phone: formattedPhone,
        templateId: 3,
        message: "Your OTP for Home Yatra login is: {{otp}}",
        action: "HomeYatra",
        name: "HomeYatra",
        userTypeId: "0",
      });

      if (
        responseOtp?.data?.statusCode === 200 &&
        responseOtp?.data?.message != null &&
        responseOtp?.data?.message != undefined &&
        responseOtp?.data?.message != ""
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      return false;
    }
  };

  const signup = async (
    phoneNumber: string,
    fullName: string,
    otp: string,
    userTypeId: string,
  ): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;

      const signupResponse = await axiosInstance.post(`/api/Auth/SignUp`, {
        name: fullName,
        phone: formattedPhone,
        otp,
        userTypeId,
      });

      if (
        signupResponse?.data?.statusCode === 200 &&
        signupResponse?.data?.token != null &&
        signupResponse?.data?.token != undefined &&
        signupResponse?.data?.token != ""
      ) {
        const data = signupResponse?.data;
        const token = data?.token;

        if (!token) {
          return false;
        }

        localStorage.setItem("token", token);
        const decodedToken = jwtDecode<decodedToken>(token);

        // Create user data object
        const userData: User = {
          userId: decodedToken.UserId,
          phone: decodedToken.Phone,
          name: decodedToken.UserName,
          token,
          userType:
            decodedToken.userType ||
            decodedToken.userTypeId ||
            data?.userType ||
            data?.userTypeId,
          role: decodedToken.Role,
          userTypeId: decodedToken.userTypeId || data?.userTypeId,
        };

        // Store user data for immediate use
        setUser(userData);

        // Close the auth modal after successful signup
        closeAuthModal();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error signing up:", error);
      return false;
    }
  };

  const fetchNotifications = async () => {
    if (!user?.userId) {
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/api/Notification/GetNotifications?userId=${user.userId}`,
      );

      if (response.status === 200 && response.data.notifications) {
        const allNotifications: Notification[] = response.data.notifications;

        // Sort notifications by date (newest first)
        allNotifications.sort(
          (a, b) =>
            new Date(b.createdDt).getTime() - new Date(a.createdDt).getTime(),
        );

        setNotifications(allNotifications);
        const newUnreadCount = allNotifications.filter((n) => !n.isRead).length;

        setUnreadCount(newUnreadCount);
      } else {
        console.warn(
          "No notifications found in response or unexpected response format:",
          response.data,
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (axios.isAxiosError(error)) {
        console.error("API Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }
    }
  };

  const login = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;

      const loginResponse = await axiosInstance.post(`/api/Auth/Login`, {
        phone: formattedPhone,
        otp,
      });

      if (!(loginResponse?.data?.statusCode === 200)) {
        console.error(
          "Login failed with status:",
          loginResponse.data.statusCode,
        );
        return false;
      }

      try {
        const data = loginResponse?.data;
        const token = data?.token;

        if (!token) {
          return false;
        }

        const decodedToken = jwtDecode<decodedToken>(token);
        localStorage.setItem("token", token);

        // Create user data with API values
        const userData: User = {
          userId: decodedToken.UserId,
          phone: decodedToken.Phone,
          token,
          name: decodedToken.UserName,
          userType:
            decodedToken.userType ||
            decodedToken.userTypeId ||
            data?.userType ||
            data?.userTypeId,
          role: decodedToken.Role,
          userTypeId: decodedToken.userTypeId || data?.userTypeId,
        };

        setUser(userData);

        // OPTIMIZED: Fetch only essential data on login, cache the rest
        await Promise.all([
          fetchNotifications(), // Essential for user experience
          fetchAmenities(), // Essential for property forms
        ]);

        // OPTIMIZED: Fetch other data in background to avoid blocking login
        setTimeout(() => {
          Promise.all([
            fetchAllStates(),
            fetchUserTypes(),
            fetchSuperCategory(),
          ]).catch((error) => {
            console.warn("Background data fetch failed:", error);
          });
        }, 1000);

        // Close the auth modal after successful login
        closeAuthModal();

        return true;
      } catch (e) {
        console.error("Error parsing login response:", e);
        return false;
      }
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };

  const fetchAmenities = async () => {
    try {
      const amenityRes = await axiosInstance.get(
        "/api/Generic/GetActiveRecords?tableName=Amenity",
      );
      if (
        amenityRes?.data?.statusCode === 200 &&
        amenityRes?.data?.data.length > 0
      ) {
        localStorage.setItem(
          "amenities",
          JSON.stringify(amenityRes?.data?.data),
        );
      } else {
        console.error("Failed to fetch amenities:", amenityRes.status);
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
    }
  };

  const fetchAllStates = async () => {
    try {
      const allStatesRes = await axiosInstance.get(
        "/api/Generic/GetActiveRecords?tableName=State",
      );
      if (
        allStatesRes?.data?.statusCode === 200 &&
        allStatesRes?.data?.data.length > 0
      ) {
        localStorage.setItem(
          "allStates",
          JSON.stringify(allStatesRes?.data?.data),
        );
      } else {
        console.error("Failed to fetch allStates:", allStatesRes.status);
      }
    } catch (err) {
      console.error("Error fetching allStates:", err);
    }
  };

  const fetchUserTypes = async () => {
    try {
      const UserTypesRes = await axiosInstance.get(
        "/api/Generic/GetActiveRecords?tableName=userType",
      );
      if (
        UserTypesRes?.data?.statusCode === 200 &&
        UserTypesRes?.data?.data.length > 0
      ) {
        localStorage.setItem(
          "userType",
          JSON.stringify(UserTypesRes?.data?.data),
        );
      } else {
        console.error("Failed to fetch userType:", UserTypesRes.status);
      }
    } catch (err) {
      console.error("Error fetching userType:", err);
    }
  };

  const fetchSuperCategory = async () => {
    try {
      const superCategoryRes = await axiosInstance.get(
        "/api/Generic/GetActiveRecords?tableName=superCategory",
      );
      if (
        superCategoryRes?.data?.statusCode === 200 &&
        superCategoryRes?.data?.data.length > 0
      ) {
        localStorage.setItem(
          "superCategory",
          JSON.stringify(superCategoryRes?.data?.data),
        );
      } else {
        console.error(
          "Failed to fetch superCategory:",
          superCategoryRes.status,
        );
      }
    } catch (err) {
      console.error("Error fetching superCategory:", err);
    }
  };

  const logout = () => {
    // Clear user data and token
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("token");
    localStorage.removeItem("amenities");
    localStorage.removeItem("allStates");
    localStorage.removeItem("userType");
    localStorage.removeItem("superCategory");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    notifications,
    unreadCount,
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
    fetchNotifications,
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
