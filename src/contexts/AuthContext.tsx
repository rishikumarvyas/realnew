
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  phone: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  requestOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  signup: (phone: string, name: string, otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulate checking if user is logged in on initial load
  React.useEffect(() => {
    const storedUser = localStorage.getItem('propverse-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock OTP request - in real app this would call your .NET Core API
  const requestOtp = async (phone: string): Promise<boolean> => {
    try {
      // Simulate API call
      console.log(`OTP requested for ${phone}`);
      
      // In a real app, this would be an actual API call
      // For demo, always return true as if OTP was sent
      return true;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      return false;
    }
  };

  // Mock OTP verification - in real app this would call your .NET Core API
  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    try {
      // Simulate API call
      console.log(`Verifying OTP ${otp} for ${phone}`);
      
      // For demo purposes, accept "123456" as valid OTP
      return otp === "123456";
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  };

  // Mock login function - in real app this would call your .NET Core API
  const login = async (phone: string, otp: string): Promise<boolean> => {
    try {
      // Simulate API call
      const isValid = await verifyOtp(phone, otp);
      
      if (isValid) {
        // Create a mock user
        const mockUser = {
          id: `user-${Date.now()}`,
          phone
        };
        
        setUser(mockUser);
        localStorage.setItem('propverse-user', JSON.stringify(mockUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Mock signup function - in real app this would call your .NET Core API
  const signup = async (phone: string, name: string, otp: string): Promise<boolean> => {
    try {
      // Verify OTP first
      const isValid = await verifyOtp(phone, otp);
      
      if (isValid) {
        // Create a mock user
        const mockUser = {
          id: `user-${Date.now()}`,
          phone,
          name
        };
        
        setUser(mockUser);
        localStorage.setItem('propverse-user', JSON.stringify(mockUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('propverse-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        requestOtp,
        verifyOtp,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
