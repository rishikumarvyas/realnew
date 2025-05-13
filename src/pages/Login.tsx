import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const Login = ({ onClose }) => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestOtp, login } = useAuth();

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
          description:
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

  const handleOtpSubmit = async (otpValue) => {
    setLoading(true);

    try {
      console.log(`Submitting login with phone: ${phone}, OTP: ${otpValue}`);

      // Call the login function
      const success = await login(phone, otpValue);

      if (success) {
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully.",
        });
        handleClose(); // Close modal and navigate after success
      } else {
        toast({
          title: "Login Failed",
          description:
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
      console.error("OTP verification error:", error);
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
      <div
        className={`w-full max-w-md px-4 z-10 transition-all duration-500 ease-out transform ${popupClasses}`}
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

          <CardHeader className="relative pt-12">
            {step === "otp" && (
              <Button
                variant="ghost"
                className="p-0 h-8 w-8 absolute left-4 top-4"
                onClick={() => setStep("phone")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-center text-2xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Login
            </CardTitle>
            <CardDescription className="text-center">
              {step === "phone"
                ? "Enter your phone number"
                : "Enter the verification code sent to your phone"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "phone" ? (
              <form
                onSubmit={handlePhoneSubmit}
                className="transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="space-y-4">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      Phone Number
                    </Label>
                    <div className="flex">
                      <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-blue-50 text-blue-600 font-medium">
                        +91
                      </div>
                      <Input
                        id="phone"
                        placeholder="Enter 10 digit phone number"
                        value={phone}
                        onChange={(e) => {
                          // Allow only numbers and limit to 10 digits
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setPhone(value);
                        }}
                        type="tel"
                        className="rounded-l-none border-blue-100 focus:border-blue-300"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-colors duration-300 shadow-md hover:shadow-lg"
                    disabled={loading || phone.length !== 10}
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

          <CardFooter className="flex justify-center border-t p-6">
            <div className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;