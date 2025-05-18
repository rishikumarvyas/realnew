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
import axios from "axios";
// Define types
interface User {
  userId?: string;
  phone: string;
  name?: string;
  token?: string;
  userTypeId?: string;
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

interface UserDetailsResponse {
  statusCode: number;
  message: string;
  userId: string;
  name: string;
  userDetails: UserProperty[];
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
  fetchUserDetails: (userId: string) => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to store a persistent user ID for a phone number
const storePersistentUserId = (phone: string, userId: string): void => {
  try {
    // Get existing mapping or create new one
    const userMappingStr = localStorage.getItem("userIdMapping");
    const userMapping = userMappingStr ? JSON.parse(userMappingStr) : {};

    // Add/update the mapping
    userMapping[phone] = userId;

    // Store back to localStorage
    localStorage.setItem("userIdMapping", JSON.stringify(userMapping));
    console.log(
      `Stored userId '${userId}' for phone '${phone}' in persistent storage`
    );
  } catch (e) {
    console.error("Error storing persistent user ID:", e);
  }
};

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

  // Check for existing auth on mount
  useEffect(() => {
    const loadAuth = async () => {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        try {
          const userData = JSON.parse(storedAuth);

          // Verify the token is still valid if it exists
          if (userData.token) {
            const tokenData = parseJwt(userData.token);
            if (tokenData && tokenData.exp * 1000 > Date.now()) {
              setUser(userData);
            }
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.error("Error parsing stored auth data:", error);
          localStorage.removeItem("auth");
        }
      }
      setLoading(false);
    };

    loadAuth();
  }, []);

  const fetchUserDetails = async (userId: string): Promise<boolean> => {
    try {
      console.log("Fetching user details for userId:", userId);
      const response = await fetch(
        `${BASE_URL}/api/Account/GetUserDetails?userId=${userId}`
      );

      if (!response.ok) {
        console.error("Failed to fetch user details", response.status);
        return false;
      }

      const data: UserDetailsResponse = await response.json();
      console.log("User details:", data);

      if (data.statusCode === 200) {
        // If the API returns a userId and user exists with a phone
        if (data.userId && user && user.phone) {
          // Always store the API-provided userId for this phone number
          storePersistentUserId(user.phone, data.userId);

          // Update user state with userId, name, and any other fields from API
          const updatedUser = {
            ...user,
            userId: data.userId,
            name: data.name || user.name, // Keep the name if it exists
          };
          setUser(updatedUser);
          localStorage.setItem("auth", JSON.stringify(updatedUser));
          console.log(
            `Updated user with API data: userId=${data.userId}, name=${
              data.name || user.name
            }`
          );
        }

        setUserProperties(data.userDetails || []);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return false;
    }
  };

  const requestOtp = async (phoneNumber: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;

      console.log("Requesting OTP for:", formattedPhone);

      const response = await fetch(`${BASE_URL}/api/Message/Send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          templateId: 3,
          message: "Your OTP for Home Yatra login is: {{otp}}",
          action: "HomeYatra",
          name: "HomeYatra",
          userTypeId: "0", // Use "0" string value as shown in your API screenshot
        }),
      });

      const data = await response.json();
      console.log("OTP request response:", data);

      return response.ok && data?.statusCode === 200;
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

      // Match the API format exactly as shown in the WhatsApp curl command
      const signupResponse = await fetch(`${BASE_URL}/api/Auth/SignUp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          phone: formattedPhone,
          otp: otp,
          userTypeId: userTypeId,
        }),
      });

      console.log("Signup response status:", signupResponse.status);

      if (!signupResponse.ok) {
        console.error("Signup failed with status:", signupResponse.status);
        return false;
      }

      try {
        const data = await signupResponse.json();
        console.log("Signup response data:", data);

        // Extract userId and token from response
        const userId =
          data.userId || data.id || (data.user && data.user.userId);
        const token =
          typeof data.token === "string" ? data.token : data.token?.token;

        // If API didn't provide a userId, we can't proceed
        if (!userId) {
          console.error("API did not provide a userId during signup");
          return false;
        }

        // Store this as the persistent userId for this phone number
        storePersistentUserId(formattedPhone, userId);

        // Create user data object
        const userData = {
          userId,
          phone: formattedPhone,
          name: fullName,
          token,
          userTypeId,
        };

        // Store user data for immediate use
        setUser(userData);
        localStorage.setItem("auth", JSON.stringify(userData));

        // Close the auth modal after successful signup
        closeAuthModal();

        return true;
      } catch (e) {
        console.error("Error parsing signup response:", e);
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

        // Clear signup data after successful login
        localStorage.removeItem("signupData");

        // Close the auth modal after successful login
        closeAuthModal();

        // Set empty user properties array (initial state)
        setUserProperties([]);

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
    setUserProperties([]);
    localStorage.removeItem("auth");
    localStorage.removeItem("signupData"); // Also clear any signup data
    // IMPORTANT: We do NOT remove userIdMapping to maintain persistent phone -> userId mapping
    console.log(
      "User logged out but userIdMapping is preserved in localStorage"
    );
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
    fetchUserDetails,
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
