import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneStep } from "@/components/login/PhoneStep";
import { OtpStep } from "@/components/login/OtpStep";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          {step === "otp" && (
            <Button
              variant="ghost"
              className="p-0 h-8 w-8 absolute left-4 top-4"
              onClick={() => setStep("phone")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="text-center text-2xl">Login to HomeYatra</CardTitle>
          <CardDescription className="text-center">
            {step === "phone"
              ? "Enter your phone number to continue"
              : `Enter the verification code sent to +91 ${phone}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
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
    </div>
  );
};

export default Login;