export const formatPhoneNumber = (phoneNumber: string): string | null => {
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    
    if (digitsOnly.length !== 10) {
      return null;
    }
    
    return `+91${digitsOnly}`;
  };
  
  export const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };