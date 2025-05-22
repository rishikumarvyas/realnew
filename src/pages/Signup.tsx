// Modified Signup.tsx to fix the signup call and remove stateId parameter

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { X, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OtpStep } from "@/components/login/OtpStep";
import { FormStep } from "@/components/login/FormStep";

// Map user types to their respective IDs
const USER_TYPES = [
  { id: 1, name: "Owner" },
  { id: 2, name: "Broker" },
  { id: 3, name: "Builder" },
  { id: 4, name: "Normal" },
];

interface SignupProps {
  onClose?: () => void;
}

const Signup = ({ onClose }: SignupProps) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState(1); // Default to Owner (id: 1)
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestOtp, signup } = useAuth();

  const handleClose = () => {
    // First hide the modal with animation
    setIsVisible(false);

    // Then call the onClose prop if provided or navigate away
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        navigate("/");
      }
    }, 300);
  };

  const handleFormSubmit = async (formData: any) => {
    const {
      name: fullName,
      phone: phoneNumber,
      userType: selectedUserType,
    } = formData;

    setLoading(true);
    setPhoneError(null);

    try {
      // Check if the user already exists (we'll manually check here since we don't have checkPhoneExists)
      const users = localStorage.getItem("homeYatra_users");
      const existingUsers = users ? JSON.parse(users) : {};
      const fullPhoneNumber = "+91" + phoneNumber;

      if (existingUsers[fullPhoneNumber]) {
        setPhoneError(
          "This number is already registered. Please login or use another number."
        );
        setLoading(false);
        return;
      }

      setName(fullName);
      setPhone(phoneNumber);
      setUserType(selectedUserType);

      // Request OTP for validation
      const success = await requestOtp(fullPhoneNumber);

      if (success) {
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone.",
        });
        setStep("otp");
      } else {
        toast({
          title: "Failed to Send OTP",
          description:
            "There was an error sending the verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    setLoading(true);

    try {
      // Pass only the required parameters according to the API spec
      const success = await signup(
        "+91" + phone,
        name,
        otp,
        userType.toString() // Convert to string as API expects string
      );

      if (success) {
        toast({
          title: "Registration Successful",
          description:
            "Your account has been created successfully. You are now logged in.",
        });
        handleClose(); // Close modal and navigate to dashboard after success
      } else {
        toast({
          title: "Registration Failed",
          description:
            "Your number is already registered. Please sign in or use another number.",
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
          description:
            "There was an error sending the verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("Resend OTP error:", error);
    }

    return Promise.resolve();
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
      <div
        className={`w-full max-w-md px-4 z-10 transition-all duration-500 ease-out transform mt-8 md:mt-12 ${popupClasses}`}
      >
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
            className="absolute top-4 right-8 text-gray-500 hover:text-gray-700 z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <CardHeader className="relative pt-14 pb-3">
            {step === "otp" && (
              <Button
                variant="ghost"
                className="p-0 h-8 w-8 absolute left-4 top-4"
                onClick={() => setStep("form")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Sign up
            </CardTitle>
            <CardDescription className="text-center text-sm mt-1">
              {step === "form"
                ? "Create an account"
                : `Enter the verification code sent to +91 ${phone}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-2">
            {step === "form" ? (
              <FormStep
                onSubmit={handleFormSubmit}
                loading={loading}
                userTypes={USER_TYPES}
                states={[]}
                initialUserType={userType}
                phoneError={phoneError}
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

          <CardFooter className="flex justify-center border-t p-3">
            <div className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
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
