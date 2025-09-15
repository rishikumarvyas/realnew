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
        <p className="font-semibold text-base text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{phone}</p>
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
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl h-12 text-base font-semibold rounded-xl"
          disabled={loading || otpValue.length !== 6}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Verifying...
            </div>
          ) : (
            "Verify & Continue"
          )}
        </Button>
      </div>
      
      <div className="text-center pt-2">
        {resendTimeout ? (
          <p className="text-sm text-gray-500">
            Resend code in <span className="font-semibold text-blue-600">{timeLeft}s</span>
          </p>
        ) : (
          <Button
            variant="link"
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
          >
            {isResending ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                Resending...
              </div>
            ) : (
              "Resend Code"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
