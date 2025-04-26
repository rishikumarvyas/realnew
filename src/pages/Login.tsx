import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneStep } from "@/components/login/PhoneStep";
import { OtpStep } from "@/components/login/OtpStep";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestOtp, login, isAuthenticated, user } = useAuth();

  // Log the user object whenever it changes
  useEffect(() => {
    console.log("Current auth state in Login:", { isAuthenticated, user });
  }, [isAuthenticated, user]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneSubmit = async (phoneNumber: string) => {
    setLoading(true);
    
    try {
      // Set phone state for OTP step
      setPhone(phoneNumber);
      
      // Send OTP API call
      const success = await requestOtp(phoneNumber);
      
      if (success) {
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone.",
        });
        setStep("otp");
      } else {
        toast({
          title: "Failed to Send OTP",
          description: "There was an error sending the verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("OTP request error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    setLoading(true);
    
    try {
      console.log(`Submitting login with phone: ${phone}, OTP: ${otp}`);
      
      // Call the login function
      const success = await login(phone, otp);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully.",
        });
        
        // Direct navigation without delay 
        console.log("Login successful, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        toast({
          title: "Login Failed",
          description: "The verification code may be incorrect or expired. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    return handlePhoneSubmit(phone);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80')",
          filter: "brightness(0.7)"
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col md:flex-row items-center gap-8">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 text-white mb-6 md:mb-0">
          <div className="flex items-center mb-6">
            <Home className="h-8 w-8 mr-2 text-blue-400" />
            <h1 className="text-3xl font-bold">HomeYatra</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4">Find Your Dream Home</h2>
          <p className="text-lg mb-8 text-gray-100">
            Join thousands of users who have found their perfect property with HomeYatra. Sign in to continue your journey.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg flex-1 min-w-[120px]">
              <p className="text-2xl font-bold">10,000+</p>
              <p className="text-sm">Properties</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg flex-1 min-w-[120px]">
              <p className="text-2xl font-bold">5,000+</p>
              <p className="text-sm">Happy Customers</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg flex-1 min-w-[120px]">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm">Cities</p>
            </div>
          </div>
        </div>
        
        {/* Right Content - Login Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-1/2"
          >
            <Card className="w-full backdrop-blur-md bg-white bg-opacity-95 shadow-xl">
              <CardHeader className="relative space-y-2 pb-2">
                {step === "otp" && (
                  <Button
                    variant="ghost"
                    className="p-0 h-8 w-8 absolute left-4 top-4"
                    onClick={() => setStep("phone")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <CardTitle className="text-center text-2xl font-bold">
                  {step === "phone" ? "Welcome Back" : "Verify Your Phone"}
                </CardTitle>
                <CardDescription className="text-center">
                  {step === "phone"
                    ? "Enter your phone number to continue"
                    : `Enter the verification code sent to +91 ${phone}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                {step === "phone" ? (
                  <PhoneStep 
                    onSubmit={handlePhoneSubmit}
                    loading={loading}
                  />
                ) : (
                  <OtpStep
                    phone={phone}
                    onSubmit={handleOtpSubmit}
                    onResendOtp={handleResendOtp}
                    loading={loading}
                  />
                )}
              </CardContent>
              
              <CardFooter className="flex justify-center border-t p-6">
                <div className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Trust Signals */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-6 py-2 flex items-center space-x-4">
          <span className="text-xs text-gray-600">Trusted by</span>
          <div className="flex items-center space-x-6">
            <span className="text-sm font-semibold text-gray-800">MakeMyHome</span>
            <span className="text-sm font-semibold text-gray-800">PropertyHub</span>
            <span className="text-sm font-semibold text-gray-800">HomeFinance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;