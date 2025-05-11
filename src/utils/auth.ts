/**
 * Format a phone number to ensure it has the country code
 */
export const formatPhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber) return null;

  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // If the phone number starts with 91 and is longer than 10 digits, remove the 91 prefix
  if (cleaned.startsWith("91") && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }

  // Ensure the number is exactly 10 digits
  if (cleaned.length !== 10) {
    console.error("Phone number must be exactly 10 digits");
    return null;
  }

  // Return with +91 prefix as requested
  return "+91" + cleaned;
};

/**
 * Parse JWT token to extract payload
 */
export const parseJwt = (token: string): any => {
  try {
    // Split the token into its components
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    // Replace characters and create base64 string
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Decode and parse the payload
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT token:", e);
    return null;
  }
};