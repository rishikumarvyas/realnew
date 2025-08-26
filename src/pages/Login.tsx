import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, X, Phone, Key, Home } from "lucide-react";
import { OtpStep } from "@/components/login/OtpStep";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneInput } from "@/components/PhoneInput";

const Login = ({ onClose }) => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestOtp, login, openSignupModal } = useAuth();
  const continueBtnRef = useRef(null);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        navigate("/");
      }
    }, 300);
  };

  const handleSwitchToSignup = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
      openSignupModal();
    }, 300);
  };

  const handlePhoneSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!phone.trim() || phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const success = await requestOtp(phone);

      if (success) {
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone.",
        });
        setStep("otp");
      } else {
        toast({
          title: "Failed to Send OTP",
          description: "Your number is not registered. Please sign up first.",
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

  const handleOtpSubmit = async (otpValue) => {
    setLoading(true);

    try {
      const result = await login(phone, otpValue);

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully.",
        });
        handleClose();
      } else {
        toast({
          title: "Login Failed",
          description:
            result.message ||
            "Your number is not registered. Please sign up first.",
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
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${backdropClasses}`}
        onClick={handleClose}
      ></div>

      {/* Popup card */}
      <div
        className={`w-full max-w-sm sm:max-w-md z-10 transition-all duration-500 ease-out transform ${popupClasses}`}
      >
        <Card className="w-full shadow-xl border-none overflow-hidden">
          {/* House icon at the top */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-full p-3 shadow-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 p-1"
          >
            <X className="h-5 w-5" />
          </button>

          <CardHeader className="relative pt-12 px-4 sm:px-6">
            {step === "otp" && (
              <Button
                variant="ghost"
                className="p-0 h-8 w-8 absolute left-4 top-4"
                onClick={() => setStep("phone")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-center text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent font-bold">
              Login
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              {step === "phone"
                ? "Enter your phone number"
                : "Enter the verification code sent to your phone"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6">
            {step === "phone" ? (
              <form
                onSubmit={handlePhoneSubmit}
                className="transition-all duration-300"
              >
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4 text-blue-500" />
                      Phone Number
                    </Label>
                    <div className="space-y-3">
                      {/* Phone Number Input Boxes with inline country code */}
                      <div className="flex justify-center">
                        <PhoneInput
                          value={phone}
                          onChange={(val) => setPhone(val.slice(0, 10))}
                          onComplete={() => {
                            if (continueBtnRef.current) {
                              continueBtnRef.current.focus();
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-colors duration-300 shadow-md hover:shadow-lg h-12 sm:h-14 text-base sm:text-lg font-medium"
                    disabled={loading || phone.length !== 10}
                    ref={continueBtnRef}
                  >
                    {loading ? "Sending OTP..." : "Continue"}
                  </Button>
                </div>
              </form>
            ) : (
              <OtpStep
                phone={phone}
                onSubmit={handleOtpSubmit}
                onResendOtp={handlePhoneSubmit}
                loading={loading}
              />
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t p-4 sm:p-6 px-4 sm:px-6">
            <div className="text-sm text-gray-500 text-center">
              Don't have an account?{" "}
              <button
                onClick={handleSwitchToSignup}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
