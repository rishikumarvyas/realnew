import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/OtpInput";
import { useToast } from "@/hooks/use-toast";

interface OtpStepProps {
  phone: string;
  onSubmit: (otp: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
  loading: boolean;
}

export const OtpStep = ({ phone, onSubmit, onResendOtp, loading }: OtpStepProps) => {
  const [otpValue, setOtpValue] = useState("");
  const [resendTimeout, setResendTimeout] = useState(true); // Start with timeout active
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false); // Separate loading state for resend
  const { toast } = useToast();
  
  // Effect for countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (resendTimeout && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setResendTimeout(false);
      setTimeLeft(60);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimeout, timeLeft]);

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
    
    await onSubmit(otpValue);
  };
  
  const handleResendOtp = async () => {
    try {
      setIsResending(true); // Show loading state for resend button only
      await onResendOtp();
      setResendTimeout(true); // Restart timeout
      setTimeLeft(60); // Reset timer to 60 seconds
      
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your phone.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm text-gray-500">
          A 6-digit code has been sent to your phone
        </p>
        <p className="font-medium">+91 {phone}</p>
      </div>
      <OtpInput 
        value={otpValue}
        onChange={setOtpValue}
        className="mb-6"
      />
      <Button 
        onClick={handleOtpSubmit}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
        disabled={loading || otpValue.length !== 6}
      >
        {loading ? "Verifying..." : "Verify & Login"}
      </Button>
      <div className="text-center mt-4">
        {resendTimeout ? (
          <p className="text-sm text-gray-500">Resend code in {timeLeft}s</p>
        ) : (
          <Button
            variant="link"
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-blue-600"
          >
            {isResending ? "Resending..." : "Resend Code"}
          </Button>
        )}
      </div>
    </div>
  );
}