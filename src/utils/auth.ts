/**
 * Format a phone number to ensure it has the country code
 */
export const formatPhoneNumber = (phoneNumber: string): string | null => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if the phone number is valid
  if (digitsOnly.length < 10) {
    return null;
  }
  
  // If it's already in international format (starting with +91), return it
  if (digitsOnly.startsWith('91') && digitsOnly.length >= 12) {
    return digitsOnly;
  }
  
  // Otherwise, add +91 prefix if it's a 10-digit Indian mobile number
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  
  return digitsOnly;
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
