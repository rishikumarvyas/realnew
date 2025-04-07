
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

const Signup = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const { requestOtp, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      const success = await signup(phone, name, otp);
      
      if (success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully.",
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
              onClick={() => setStep("form")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle>Sign up for PropVerse</CardTitle>
          <CardDescription>
            {step === "form"
              ? "Create an account to start your real estate journey"
              : `Enter the verification code sent to ${phone}`}
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
                  onClick={handleFormSubmit}
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
            Already have an account?{" "}
            <Link to="/login" className="text-real-blue hover:underline font-medium">
              Log In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
