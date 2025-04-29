/**
 * Format a phone number to ensure it has the country code
 */
// Update this function in your utils/auth.ts file
export const formatPhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters except for the leading plus sign
  let cleaned = phoneNumber.replace(/[^\d+]/g, "");
  
  // Check if the phone number starts with +
  const startsWithPlus = cleaned.startsWith("+");
  
  // If it doesn't start with +, but starts with 91, add the +
  if (!startsWithPlus && cleaned.startsWith("91")) {
    cleaned = "+" + cleaned;
  }
  
  // If it doesn't start with + or 91, add +91
  if (!startsWithPlus && !cleaned.startsWith("91")) {
    cleaned = "+91" + cleaned;
  }
  
  return cleaned;
};
/**
 * Parse JWT token to extract payload
 */
export const parseJwt = (token: string): any => {
  try {
    // Split the token into its components
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // Replace characters and create base64 string
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode and parse the payload
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT token:', e);
    return null;
  }
};
