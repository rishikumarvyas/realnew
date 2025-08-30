import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/OtpInput";
import { useToast } from "@/hooks/use-toast";

interface OtpStepProps {
  phone: string;
  onSubmit: (otp: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
  loading: boolean;
}

export const OtpStep = ({
  phone,
  onSubmit,
  onResendOtp,
  loading,
}: OtpStepProps) => {
  const [otpValue, setOtpValue] = useState("");
  const [resendTimeout, setResendTimeout] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const verifyButtonRef = useRef<HTMLButtonElement | null>(null);

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
      setIsResending(true);
      await onResendOtp();
      setResendTimeout(true);
      setTimeLeft(60);

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
      <div className="space-y-3 text-center">
        <p className="text-sm text-gray-600">
          A 6-digit code has been sent to
        </p>
        <p className="font-semibold text-base sm:text-lg text-gray-800">{phone}</p>
      </div>
      
      <div className="space-y-6">
        <OtpInput
          value={otpValue}
          onChange={setOtpValue}
          className="mb-4"
          verifyButtonRef={verifyButtonRef}
        />
        
        <Button
          ref={verifyButtonRef}
          onClick={handleOtpSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-colors duration-300 shadow-md hover:shadow-lg h-12 sm:h-14 text-base sm:text-lg font-medium"
          disabled={loading || otpValue.length !== 6}
        >
          {loading ? "Verifying..." : "Verify & Login"}
        </Button>
      </div>
      
      <div className="text-center pt-2">
        {resendTimeout ? (
          <p className="text-sm text-gray-500">
            Resend code in <span className="font-medium">{timeLeft}s</span>
          </p>
        ) : (
          <Button
            variant="link"
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
          >
            {isResending ? "Resending..." : "Resend Code"}
          </Button>
        )}
      </div>
    </div>
  );
};
