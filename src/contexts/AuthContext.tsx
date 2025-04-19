import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BASE_URL } from '@/constants/api';
import { formatPhoneNumber, parseJwt } from '@/utils/auth';

// Define types
interface User {
  userId?: string;
  phone: string;
  name?: string;
  token?: string;
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
  name:string;
  userDetails: UserProperty[];
}

interface AuthContextType {
  user: User | null;
  userProperties: UserProperty[];
  isAuthenticated: boolean;
  loading: boolean;
  requestOtp: (phoneNumber: string) => Promise<boolean>;
  login: (phoneNumber: string, otp: string) => Promise<boolean>;
  signup: (phoneNumber: string, fullName: string, otp: string) => Promise<boolean>;
  logout: () => void;
  fetchUserDetails: (userId: string) => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to get a persistent user ID based on phone number
const getPersistentUserId = (phone: string): string | null => {
  try {
    // Try to get the stored phone-to-userId mapping
    const userMappingStr = localStorage.getItem('userIdMapping');
    if (userMappingStr) {
      const userMapping = JSON.parse(userMappingStr);
      
      // If we have a mapping for this phone, return it
      if (userMapping[phone]) {
        return userMapping[phone];
      }
    }
    return null;
  } catch (e) {
    console.error('Error getting persistent user ID:', e);
    return null;
  }
};

// Function to store a persistent user ID for a phone number
const storePersistentUserId = (phone: string, userId: string): void => {
  try {
    // Get existing mapping or create new one
    const userMappingStr = localStorage.getItem('userIdMapping');
    const userMapping = userMappingStr ? JSON.parse(userMappingStr) : {};
    
    // Add/update the mapping
    userMapping[phone] = userId;
    
    // Store back to localStorage
    localStorage.setItem('userIdMapping', JSON.stringify(userMapping));
    console.log(`Stored userId '${userId}' for phone '${phone}' in persistent storage`);
  } catch (e) {
    console.error('Error storing persistent user ID:', e);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProperties, setUserProperties] = useState<UserProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing auth on mount
  useEffect(() => {
    const loadAuth = async () => {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        try {
          const userData = JSON.parse(storedAuth);
          
          // Verify the token is still valid if it exists
          if (userData.token) {
            const tokenData = parseJwt(userData.token);
            if (tokenData && tokenData.exp * 1000 > Date.now()) {
              setUser(userData);
              
              // Fetch user details with user's ID
              if (userData.userId) {
                await fetchUserDetails(userData.userId);
              }
            }
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          localStorage.removeItem('auth');
        }
      }
      setLoading(false);
    };

    loadAuth();
  }, []);

  const fetchUserDetails = async (userId: string): Promise<boolean> => {
    try {
      console.log("Fetching user details for userId:", userId);
      const response = await fetch(`${BASE_URL}/api/Account/GetUserDetails?userId=${userId}`);
      
      if (!response.ok) {
        console.error('Failed to fetch user details', response.status);
        return false;
      }
      
      const data: UserDetailsResponse = await response.json();
      console.log('User details:', data);
      
      if (data.statusCode === 200) {
        // If the API returns a userId and user exists with a phone
        if (data.userId && user && user.phone) {
          // Always store the API-provided userId for this phone number
          storePersistentUserId(user.phone, data.userId);
          
          // Update user state with userId, name, and any other fields from API
          const updatedUser = { 
            ...user, 
            userId: data.userId,
            name: data.name || user.name // Keep the name if it exists
          };
          setUser(updatedUser);
          localStorage.setItem('auth', JSON.stringify(updatedUser));
          console.log(`Updated user with API data: userId=${data.userId}, name=${data.name || user.name}`);
        }
        
        setUserProperties(data.userDetails || []);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return false;
    }
  };
  const requestOtp = async (phoneNumber: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;
      
      const response = await fetch(`${BASE_URL}/api/Message/Send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          templateId: 3,
          message: "Your OTP for Home Yatra login is: {{otp}}",
          from: "HomeYatra"
        }),
      });

      const data = await response.json();
      console.log('OTP request response:', data);
      
      return response.ok && data?.statusCode === 200;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      return false;
    }
  };

  const signup = async (phoneNumber: string, fullName: string, otp: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;
  
      console.log("Attempting signup with:", { phone: formattedPhone, name: fullName, otp });
      
      const signupResponse = await fetch(`${BASE_URL}/api/Auth/SignUp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          name: fullName,
          otp
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
        const userId = data.userId || data.id || (data.user && data.user.userId);
        const token = typeof data.token === 'string' ? data.token : data.token?.token;
        
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
          token
        };
        
        // Store user data for immediate use
        setUser(userData);
        localStorage.setItem('auth', JSON.stringify(userData));
        
        return true;
      } catch (e) {
        console.error("Error parsing signup response:", e);
        return false;
      }
    } catch (error) {
      console.error('Error during signup:', error);
      return false;
    }
  };

  const login = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) return false;
      
      console.log("Starting login process for phone:", formattedPhone);
      
      const loginResponse = await fetch(`${BASE_URL}/api/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formattedPhone, 
          otp 
        }),
      });
  
      console.log("Login response status:", loginResponse.status);
      
      if (!loginResponse.ok) return false;
      
      try {
        const data = await loginResponse.json();
        console.log('Login response data:', data);
        
        // Get userId directly from API response - don't fallback to generating one
        const userId = data.userId || data.id || (data.user && data.user.userId) || (data.token && data.token.userId);
        
        if (!userId) {
          console.error("API did not provide a userId. Cannot proceed with login.");
          return false;
        }
        
        // Get token from response
        const token = typeof data.token === 'string' ? data.token : data.token?.token;
        
        // Get name from response
        const name = data.name || (data.user && data.user.name);
        
        // Store the mapping
        storePersistentUserId(formattedPhone, userId);
        
        // Create user data with API values
        const userData = {
          userId,
          phone: formattedPhone,
          token,
          name
        };
        
        console.log("Final user data for login:", userData);
        setUser(userData);
        localStorage.setItem('auth', JSON.stringify(userData));
        
        // Clear signup data after successful login
        localStorage.removeItem('signupData');
        
        // Fetch user details with userId
        await fetchUserDetails(userId);
        
        return true;
      } catch (e) {
        console.error("Error parsing login response:", e);
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setUserProperties([]);
    localStorage.removeItem('auth');
    localStorage.removeItem('signupData'); // Also clear any signup data
    // IMPORTANT: We do NOT remove userIdMapping to maintain persistent phone -> userId mapping
    console.log("User logged out but userIdMapping is preserved in localStorage");
  };

  const value = {
    user,
    userProperties,
    isAuthenticated: !!user,
    loading,
    requestOtp,
    login,
    signup,
    logout,
    fetchUserDetails
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};