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
// Define types
interface AuthContextType {
  user: User | null;
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
    userTypeId: string
  ) => Promise<boolean>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
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

      const responseOtp = await axios.post(
        `${BASE_URL}/api/Message/Send`,
        {
          phone: formattedPhone,
          templateId: 3,
          message: "Your OTP for Home Yatra login is: {{otp}}",
          action: "HomeYatra",
          name: "HomeYatra",
          userTypeId: "0",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

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
    userTypeId: string
  ): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;

      const signupResponse = await axios.post(
        `${BASE_URL}/api/Auth/SignUp`,
        {
          name: fullName,
          phone: formattedPhone,
          otp,
          userTypeId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (
        signupResponse?.data?.statusCode === 200 &&
        signupResponse?.data?.token != null &&
        signupResponse?.data?.token != undefined &&
        signupResponse?.data?.token != ""
      ) {
        const data = signupResponse?.data;

        // Get token from response
        const token = data?.token;

        if (!token) {
          return false;
        }
        localStorage.setItem("token", token);
        const decodedToken: decodedToken = jwtDecode(token);

        // Create user data object
        const userData: User = {
          userId: decodedToken?.UserId,
          phone: decodedToken?.Phone,
          name: decodedToken?.UserName,
          token,
          userTypeId,
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

  const login = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;

      const loginResponse = await axios.post(
        `${BASE_URL}/api/Auth/Login`,
        {
          phone: formattedPhone,
          otp,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!(loginResponse?.data?.statusCode === 200)) {
        console.error(
          "Login failed with status:",
          loginResponse.data.statusCode
        );
        return false;
      }

      try {
        const data = loginResponse?.data;

        // Get token from response
        const token = data?.token;

        if (!token) {
          return false;
        }
        const decodedToken: decodedToken = jwtDecode(token);

        localStorage.setItem("token", token);

        // Create user data with API values
        const userData = {
          userId: decodedToken?.UserId,
          phone: decodedToken?.Phone,
          token,
          name: decodedToken?.UserName,
        };

        setUser(userData);

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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const value = {
    user,
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
