// Modified Signup.tsx with Terms & Conditions API call

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { X, ArrowLeft, Home, Phone, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OtpStep } from "@/components/login/OtpStep";
import { PhoneInput } from "@/components/PhoneInput";
import axiosInstance from "../axiosCalls/axiosInstance";

// Map user types to their respective IDs
const USER_TYPES = [
  { id: 1, name: "Owner" },
  { id: 2, name: "Broker" },
  { id: 4, name: "Guest" },
];

interface SignupProps {
  onClose?: () => void;
}

const Signup = ({ onClose }: SignupProps) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState<number>(0);
  const [step, setStep] = useState("form"); // form -> otp
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestOtp, signup, openLoginModal } = useAuth();

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

  const handleSwitchToLogin = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
      openLoginModal();
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!phone.trim() || phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    if (userType === 0) {
      toast({
        title: "User Type Required",
        description: "Please select your user type.",
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms & Conditions",
        description: "Please accept the Terms & Conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPhoneError(null);

    try {
      const payload = {
        phone: `+91${phone}`,
        templateId: 3,
        message: "Terms and Conditions accepted during signup.",
        action: "signup",
        name: name,
        userTypeId: userType.toString(),
        isTermsConditionsAccepted: termsAccepted,
      };
      const responseOtp = await axiosInstance.post(
        "/api/Message/Send",
        payload
      );

      if (
        responseOtp?.data?.statusCode === 200 &&
        responseOtp?.data?.message != null &&
        responseOtp?.data?.message != undefined &&
        responseOtp?.data?.message != ""
      ) {
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone.",
        });
        setStep("otp");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    setLoading(true);

    try {
      const result = await signup(
        "+91" + phone,
        name,
        otp,
        userType.toString()
      );

      if (result.success) {
        toast({
          title: "Registration Successful",
          description:
            "Your account has been created successfully. You are now logged in.",
        });
        handleClose();
      } else {
        toast({
          title: "Registration Failed",
          description:
            result.message ||
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
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const payload = {
        phone: `+91${phone}`,
        templateId: 3,
        message: "Terms and Conditions accepted during signup.",
        action: "signup",
        name: name,
        userTypeId: userType.toString(),
        isTermsConditionsAccepted: termsAccepted,
      };
      const responseOtp = await axiosInstance.post(
        "/api/Message/Send",
        payload
      );
      if (
        responseOtp?.data?.statusCode === 200 &&
        responseOtp?.data?.message != null &&
        responseOtp?.data?.message != undefined &&
        responseOtp?.data?.message != ""
      ) {
        toast({
          title: "OTP Sent",
          description: "A new verification code has been sent to your phone.",
        });
      }
    } catch (error) {
      toast({
        title: "Error while resending OTP",
        description:
          error?.response?.data?.message ||
          "There was an error resending the verification code. Please try again.",
        variant: "destructive",
      });
    }

    return Promise.resolve();
  };

  const handleBackToForm = () => {
    setStep("form");
  };

  const handleTermsClick = () => {
    // Open Terms & Conditions page in a new tab
    window.open("/terms", "_blank");
  };

  const handleUserTypeChange = (value: string) => {
    setUserType(parseInt(value));
  };

  const isFormValid =
    name.trim() !== "" && phone.length === 10 && userType > 0 && termsAccepted;

  const popupClasses = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10 pointer-events-none";

  const backdropClasses = isVisible
    ? "opacity-50"
    : "opacity-0 pointer-events-none";

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${backdropClasses}`}
          onClick={handleClose}
        ></div>

        {/* Popup card */}
        <div
          className={`w-full max-w-md z-10 transition-all duration-500 ease-out transform ${popupClasses}`}
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
                  onClick={handleBackToForm}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <CardTitle className="text-center text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent font-bold mb-1">
                Join HomeYatra
              </CardTitle>
              <CardDescription className="text-center text-gray-600 text-sm">
                {step === "form"
                  ? "Create your account to get started"
                  : `Enter the verification code sent to +91 ${phone}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-4">
              {step === "form" ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Full Name Input */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="name"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                      <User className="h-4 w-4 text-blue-500" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      autoComplete="name"
                    />
                  </div>

                  {/* Phone Number Input */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                      <Phone className="h-4 w-4 text-blue-500" />
                      Phone Number
                    </Label>
                    <div className="flex justify-center">
                      <PhoneInput
                        value={phone}
                        onChange={(val) => setPhone(val.slice(0, 10))}
                        onComplete={() => {
                          // Focus on user type select when phone is complete
                          const userTypeSelect =
                            document.getElementById("userType");
                          if (userTypeSelect) {
                            userTypeSelect.focus();
                          }
                        }}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-red-500 text-xs">{phoneError}</p>
                    )}
                  </div>

                  {/* User Type Selection */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="userType"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                      <Shield className="h-4 w-4 text-blue-500" />I am a
                    </Label>
                    <Select
                      value={userType > 0 ? userType.toString() : ""}
                      onValueChange={handleUserTypeChange}
                    >
                      <SelectTrigger id="userType" className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select your user type" />
                      </SelectTrigger>
                      <SelectContent className="z-[70] bg-white border border-gray-200 shadow-lg rounded-lg">
                        {USER_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start space-x-2 pt-1">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) =>
                        setTermsAccepted(checked === true)
                      }
                      className="mt-0.5"
                    />
                    <div>
                      <Label
                        htmlFor="terms"
                        className="text-xs text-gray-700 cursor-pointer leading-relaxed"
                      >
                        I have read and agree to the{" "}
                        <span
                          className="font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer transition-colors"
                          onClick={handleTermsClick}
                        >
                          Terms & Conditions
                        </span>{" "}
                        of HomeYatra.
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className={`w-full h-10 text-sm font-semibold transition-all duration-300 rounded-lg ${
                      isFormValid && !loading
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isFormValid || loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      "Continue with OTP"
                    )}
                  </Button>
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
              <div className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={handleSwitchToLogin}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer transition-colors"
                >
                  Log in
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signup;
