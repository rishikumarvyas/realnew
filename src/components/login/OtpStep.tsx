import { useState } from "react";
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
  const { toast } = useToast();

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
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={loading || otpValue.length !== 6}
      >
        {loading ? "Verifying..." : "Verify & Login"}
      </Button>
      <div className="text-center mt-4">
        <Button 
          variant="link" 
          onClick={onResendOtp}
          disabled={loading}
          className="text-blue-600"
        >
          {loading ? "Resending..." : "Resend Code"}
        </Button>
      </div>
    </div>
  );
};