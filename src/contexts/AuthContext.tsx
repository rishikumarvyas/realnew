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
            userType: decodedToken?.userType || decodedToken?.userTypeId,
            role: decodedToken?.Role,
            userTypeId: decodedToken?.userTypeId
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
          userType: decodedToken?.userType || decodedToken?.userTypeId || data?.userType || data?.userTypeId,
          role: decodedToken?.Role,
          userTypeId: decodedToken?.userTypeId || data?.userTypeId
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
        fetchAmenities(); // Fetch amenities after successful login
        fetchAllStates(); // Fetch all states after successful login
        fetchUserTypes(); // Fetch user types after successful login
        fetchSuperCategory(); // Fetch super categories after successful login

        // Create user data with API values
        const userData = {
          userId: decodedToken?.UserId,
          phone: decodedToken?.Phone,
          token,
          name: decodedToken?.UserName,
          userType: decodedToken?.userType || decodedToken?.userTypeId || data?.userType || data?.userTypeId,
          role: decodedToken?.Role,
          userTypeId: decodedToken?.userTypeId || data?.userTypeId
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

  const fetchAmenities = async () => {
    // Fetch Amenity data after successful login and save to localStorage
    try {
      const amenityRes = await axios.get(
        "https://homeyatraapi.azurewebsites.net/api/Generic/GetActiveRecords?tableName=Amenity",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (
        amenityRes?.data?.statusCode === 200 &&
        amenityRes?.data?.data.length > 0
      ) {
        localStorage.setItem(
          "amenities",
          JSON.stringify(amenityRes?.data?.data)
        );
      } else {
        console.error("Failed to fetch amenities:", amenityRes.status);
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
    }
  };

  const fetchAllStates = async () => {
    // Fetch Amenity data after successful login and save to localStorage
    try {
      const allStatesRes = await axios.get(
        "https://homeyatraapi.azurewebsites.net/api/Generic/GetActiveRecords?tableName=State",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (
        allStatesRes?.data?.statusCode === 200 &&
        allStatesRes?.data?.data.length > 0
      ) {
        localStorage.setItem(
          "allStates",
          JSON.stringify(allStatesRes?.data?.data)
        );
      } else {
        console.error("Failed to fetch allStates:", allStatesRes.status);
      }
    } catch (err) {
      console.error("Error fetching allStates:", err);
    }
  };

  const fetchUserTypes = async () => {
    // Fetch Amenity data after successful login and save to localStorage
    try {
      const UserTypesRes = await axios.get(
        "https://homeyatraapi.azurewebsites.net/api/Generic/GetActiveRecords?tableName=userType",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (
        UserTypesRes?.data?.statusCode === 200 &&
        UserTypesRes?.data?.data.length > 0
      ) {
        localStorage.setItem(
          "userType",
          JSON.stringify(UserTypesRes?.data?.data)
        );
      } else {
        console.error("Failed to fetch userType:", UserTypesRes.status);
      }
    } catch (err) {
      console.error("Error fetching userType:", err);
    }
  };

  const fetchSuperCategory = async () => {
    // Fetch Amenity data after successful login and save to localStorage
    try {
      const superCategoryRes = await axios.get(
        "https://homeyatraapi.azurewebsites.net/api/Generic/GetActiveRecords?tableName=superCategory",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (
        superCategoryRes?.data?.statusCode === 200 &&
        superCategoryRes?.data?.data.length > 0
      ) {
        localStorage.setItem(
          "superCategory",
          JSON.stringify(superCategoryRes?.data?.data)
        );
      } else {
        console.error(
          "Failed to fetch superCategory:",
          superCategoryRes.status
        );
      }
    } catch (err) {
      console.error("Error fetching superCategory:", err);
    }
  };

  const logout = () => {
    // Clear user data and token
    setUser(null);
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
