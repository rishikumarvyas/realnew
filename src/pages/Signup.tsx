import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OtpStep } from "@/components/login/OtpStep";
import { FormStep } from "@/components/login/FormStep";

const Signup = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestOtp, signup } = useAuth();

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate("/");
    }, 300);
  };

  const handleFormSubmit = async (formData) => {
    const { name: fullName, phone: phoneNumber } = formData;
    
    setName(fullName);
    setPhone(phoneNumber);
    setLoading(true);
    
    try {
      // Skip formatPhoneNumber and directly pass the correctly formatted number
      const success = await requestOtp("+91" + phoneNumber);
      
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
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    setLoading(true);
    
    try {
      // Skip formatPhoneNumber and directly pass the correctly formatted number
      console.log(`Submitting signup with phone: +91${phone}, name: ${name}, OTP: ${otp}`);
      
      const success = await signup("+91" + phone, name, otp);
      
      if (success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully. Please log in to continue.",
        });
        navigate("/login");
      } else {
        toast({
          title: "Registration Failed",
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
    setLoading(true);
    
    try {
      // Skip formatPhoneNumber and directly pass the correctly formatted number
      const success = await requestOtp("+91" + phone);
      
      if (success) {
        toast({
          title: "OTP Sent",
          description: "A new verification code has been sent to your phone.",
        });
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
    } finally {
      setLoading(false);
    }
  };

  const popupClasses = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10 pointer-events-none";

  const backdropClasses = isVisible
    ? "opacity-50"
    : "opacity-0 pointer-events-none";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${backdropClasses}`}
        onClick={handleClose}
      ></div>

      {/* Popup card */}
      <div className={`w-full max-w-md px-4 z-10 transition-all duration-500 ease-out transform ${popupClasses}`}>
        <Card className="w-full shadow-xl border-none overflow-hidden">
          {/* House icon at the top */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-full p-5 shadow-lg">
              <Home className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <CardHeader className="relative pt-12">
            {step === "otp" && (
              <Button
                variant="ghost"
                className="p-0 h-8 w-8 absolute left-4 top-4"
                onClick={() => setStep("form")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-center text-2xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Sign up for HomeYatra
            </CardTitle>
            <CardDescription className="text-center">
              {step === "form"
                ? "Create an account to start your real estate journey"
                : `Enter the verification code sent to +91 ${phone}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === "form" ? (
              <FormStep onSubmit={handleFormSubmit} loading={loading} />
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
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;