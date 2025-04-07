
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  className?: string;
}

export function OtpInput({ length = 6, onComplete, className }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Focus on first input on component mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Allow only one digit
    if (/^\d*$/.test(value) && value.length <= 1) {
      // Make a copy of current OTP array
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Check if we filled a digit and need to move to next input
      if (value && index < length - 1) {
        inputRefs.current[index + 1].focus();
      }
      
      // Check if OTP is complete
      if (newOtp.every(digit => digit !== '') && !newOtp.includes('')) {
        onComplete(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace and delete
    if ((e.key === 'Backspace' || e.key === 'Delete') && !otp[index]) {
      // Move to previous input if current is empty
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Only proceed if we have a valid numeric string
    if (!/^\d*$/.test(pastedData)) return;
    
    // Extract digits up to the OTP length
    const digits = pastedData.split('').slice(0, length);
    
    // Fill the OTP array with pasted digits
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });
    
    // Update state with new OTP
    setOtp(newOtp);
    
    // Focus on appropriate input based on how many digits were pasted
    if (digits.length < length) {
      inputRefs.current[digits.length].focus();
    } else {
      // If all spaces are filled, trigger the onComplete callback
      onComplete(newOtp.join(''));
    }
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          ref={(el) => el && (inputRefs.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined}
          className="w-10 h-12 rounded-md border border-gray-300 text-center text-lg font-semibold 
                    focus:outline-none focus:ring-2 focus:ring-real-blue focus:border-transparent"
        />
      ))}
    </div>
  );
}
