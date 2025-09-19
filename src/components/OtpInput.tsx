import React, { useState, useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
  verifyButtonRef?: React.RefObject<HTMLButtonElement>;
  onComplete?: () => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  className,
  verifyButtonRef,
  onComplete,
}) => {
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  if (inputRefs.current.length === 0) {
    inputRefs.current = Array(length).fill(null);
  }

  useEffect(() => {
    if (value.length === length && value.split("").every((d) => d)) {
      if (onComplete) {
        onComplete();
      } else if (verifyButtonRef?.current) {
        verifyButtonRef.current.focus();
      }
    }
  }, [value, length, verifyButtonRef, onComplete]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "");

    // Update the value with the single digit
    const newOtp = value.split("");
    newOtp[index] = newValue.slice(-1);
    onChange(newOtp.join(""));

    // Move focus to next input if available and there is a value
    if (index < length - 1 && newValue) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1]?.focus();
        setActiveInput(index - 1);
      } else if (value[index]) {
        // If there's a value, clear it but stay in the current input
        const newOtp = value.split("");
        newOtp[index] = "";
        onChange(newOtp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleFocus = (index: number) => {
    setActiveInput(index);
    // Select the content when focused for easy replacement
    inputRefs.current[index]?.select();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, length);

    if (!pastedData) return;

    // Fill the inputs with pasted data
    const newOtp = Array(length).fill("");
    for (let i = 0; i < length; i++) {
      newOtp[i] = i < pastedData.length ? pastedData[i] : value[i] || "";
    }

    onChange(newOtp.join(""));

    // Focus the input after the last pasted digit
    const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
    setActiveInput(lastFilledIndex);
  };

  // Determine sizing based on length (phone number vs OTP)
  const isPhoneNumber = length === 10;
  
  const getInputClasses = () => {
    if (isPhoneNumber) {
      // Smaller boxes for phone number (10 digits)
      return "h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-md border-2 border-gray-200 bg-white text-center text-sm sm:text-base md:text-lg font-semibold shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50";
    } else {
      // Larger boxes for OTP (6 digits)
      return "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-lg border-2 border-gray-200 bg-white text-center text-lg sm:text-xl md:text-2xl font-semibold shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50";
    }
  };

  const getContainerClasses = () => {
    if (isPhoneNumber) {
      // Tighter spacing for phone number
      return `flex justify-center gap-0.5 sm:gap-1 md:gap-1.5 ${className || ""}`;
    } else {
      // More spacing for OTP
      return `flex justify-center gap-1.5 sm:gap-2 md:gap-3 ${className || ""}`;
    }
  };

  return (
    <div className={getContainerClasses()}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <input
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            autoFocus={index === 0}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            onClick={() => handleFocus(index)}
            className={getInputClasses()}
          />
        ))}
    </div>
  );
};
