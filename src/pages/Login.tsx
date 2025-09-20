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
      const { success, message } = await requestOtp(phone);

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
            message || "Your number is not registered. Please sign up first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleResendOtp = async () => {
    try {
      const { success, message } = await requestOtp(phone);

      if (success) {
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone.",
        });
        setStep("otp");
      } else {
        toast({
          title: "Failed to ReSend OTP",
          description:
            message || "Your number is not registered. Please sign up first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    return Promise.resolve();
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
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${backdropClasses}`}
        onClick={handleClose}
      ></div>

      {/* Popup card */}
      <div
        className={`w-full max-w-sm sm:max-w-md z-10 transition-all duration-500 ease-out transform ${popupClasses}`}
      >
        <Card className="w-full shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-md">
          {/* Close button - positioned at top right corner */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200 group"
          >
            <X className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
          </button>

          {/* House icon integrated within the form */}
          <div className="flex justify-center pt-6 pb-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-full p-3 shadow-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
          </div>

          <CardHeader className="relative pt-2 pb-3 px-6">
            {step === "otp" && (
              <Button
                variant="ghost"
                className="p-2 h-10 w-10 absolute left-4 top-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setStep("phone")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-center text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent font-bold mb-1">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm">
              {step === "phone"
                ? "Enter your phone number to continue"
                : "Enter the verification code sent to your phone"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-4">
            {step === "phone" ? (
              <form
                onSubmit={handlePhoneSubmit}
                className="transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                      <Phone className="h-4 w-4 text-blue-500" />
                      Phone Number
                    </Label>
                    <div className="space-y-2">
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
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl h-10 text-sm font-semibold rounded-lg"
                    disabled={loading || phone.length !== 10}
                    ref={continueBtnRef}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending OTP...
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <OtpStep
                phone={phone}
                onSubmit={handleOtpSubmit}
                onResendOtp={handleResendOtp}
                loading={loading}
              />
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-gray-100 p-4">
            <div className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <button
                onClick={handleSwitchToSignup}
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer transition-colors"
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
