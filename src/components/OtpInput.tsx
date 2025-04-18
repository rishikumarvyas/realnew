import React, { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  className
}) => {
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  if (inputRefs.current.length === 0) {
    inputRefs.current = Array(length).fill(null);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "");
    if (newValue === "") return;

    // Update the value with the single digit
    const newOtp = value.split("");
    newOtp[index] = newValue.slice(-1);
    onChange(newOtp.join(""));

    // Move focus to next input if available
    if (index < length - 1 && newValue) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1]?.focus();
        setActiveInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    
    if (!pastedData) return;
    
    // Fill the inputs with pasted data
    const newOtp = value.split("");
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    onChange(newOtp.join(""));
    
    // Focus the input after the last pasted digit
    const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
    setActiveInput(lastFilledIndex);
  };

  return (
    <div className={cn("flex justify-center gap-2", className)}>
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
            className="h-12 w-12 rounded-md border border-input bg-background text-center text-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            onFocus={() => setActiveInput(index)}
          />
        ))}
    </div>
  );
};