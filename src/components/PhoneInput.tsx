import React, { useState, useRef, useEffect } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onComplete,
  className,
}) => {
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const length = 10; // Phone number is always 10 digits

  // Initialize refs array
  if (inputRefs.current.length === 0) {
    inputRefs.current = Array(length).fill(null);
  }

  useEffect(() => {
    if (value.length === length && value.split("").every((d) => d)) {
      if (onComplete) {
        onComplete();
      }
    }
  }, [value, length, onComplete]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "");

    // Update the value with the single digit
    const newPhone = value.split("");
    newPhone[index] = newValue.slice(-1);
    onChange(newPhone.join(""));

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
        const newPhone = value.split("");
        newPhone[index] = "";
        onChange(newPhone.join(""));
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
    const newPhone = Array(length).fill("");
    for (let i = 0; i < length; i++) {
      newPhone[i] = i < pastedData.length ? pastedData[i] : value[i] || "";
    }

    onChange(newPhone.join(""));

    // Focus the input after the last pasted digit
    const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
    setActiveInput(lastFilledIndex);
  };

  return (
    <div className={`flex justify-center items-center ${className || ""}`}>
      {/* Country Code */}
      <div className="flex items-center px-2 py-1.5 text-blue-600 font-medium bg-blue-50 border-2 border-r-0 border-gray-200 rounded-l-md text-xs sm:text-sm md:text-base h-7 sm:h-8 md:h-9">
        +91
      </div>
      
      {/* Phone Number Input Boxes */}
      <div className="flex gap-0">
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
              className={`h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-center text-xs sm:text-sm md:text-base font-semibold shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 border-2 border-gray-200 bg-white ${
                index === 0 ? 'border-l-0' : ''
              } ${
                index === length - 1 ? 'rounded-r-md' : 'border-r-0'
              }`}
            />
          ))}
      </div>
    </div>
  );
};
