import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { OtpInput } from "@/components/OtpInput";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestOtp, signup } = useAuth();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
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

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
  };

  const handleOtpSubmit = async () => {
    if (loading) return;
    
    if (!otpValue || otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Submitting signup with phone: ${phone}, name: ${name}, OTP: ${otpValue}`);
      
      // Call the signup function - this will use consistent userId behind the scenes
      const success = await signup(phone, name, otpValue);
      
      if (success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully. Please log in to continue.",
        });
        // Navigate to login instead of dashboard
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          {step === "otp" && (
            <Button
              variant="ghost"
              className="p-0 h-8 w-8 absolute left-4 top-4"
              onClick={() => setStep("form")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="text-center text-2xl">Sign up for HomeYatra</CardTitle>
          <CardDescription className="text-center">
            {step === "form"
              ? "Create an account to start your real estate journey"
              : `Enter the verification code sent to +91 ${phone}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === "form" ? (
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                      +91
                    </div>
                    <Input
                      id="phone"
                      placeholder="Enter 10 digit phone number"
                      value={phone}
                      onChange={(e) => {
                        // Allow only numbers and limit to 10 digits
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(value);
                      }}
                      type="tel"
                      className="rounded-l-none"
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading || phone.length !== 10}
                >
                  {loading ? "Sending OTP..." : "Continue"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-500">
                  A 6-digit code has been sent to your phone
                </p>
              </div>
              <OtpInput 
                value={otpValue}
                onChange={handleOtpChange}
                className="mb-6" 
              />
              <Button 
                onClick={handleOtpSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || otpValue.length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Register"}
              </Button>
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className="text-blue-600"
                >
                  {loading ? "Resending..." : "Resend Code"}
                </Button>
              </div>
            </div>
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
  );
};

export default Signup;