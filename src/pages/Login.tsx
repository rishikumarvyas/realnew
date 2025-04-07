
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OtpInput } from "@/components/OtpInput";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const { requestOtp, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim() || phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
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

  const handleOtpComplete = async (otp: string) => {
    setLoading(true);
    
    try {
      const success = await login(phone, otp);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully.",
        });
        navigate("/");
      } else {
        toast({
          title: "Invalid OTP",
          description: "The verification code you entered is incorrect. Please try again.",
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

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          {step === "otp" && (
            <Button
              variant="ghost"
              className="p-0 h-8 w-8 absolute left-4 top-4"
              onClick={() => setStep("phone")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle>Log in to PropVerse</CardTitle>
          <CardDescription>
            {step === "phone"
              ? "Enter your phone number to receive a verification code"
              : `Enter the verification code sent to ${phone}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-real-blue hover:bg-blue-600"
                  disabled={loading}
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
              <OtpInput onComplete={handleOtpComplete} className="mb-6" />
              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={handlePhoneSubmit}
                  disabled={loading}
                  className="text-real-blue"
                >
                  {loading ? "Resending..." : "Resend Code"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center border-t p-6">
          <div className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-real-blue hover:underline font-medium">
              Sign Up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
