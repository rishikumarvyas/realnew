interface decodedToken {
  UserId: string;
  Phone: string;
  UserName: string;
  exp: number;
  userType?: string;
  userTypeId?: string;
  Role?: string;
}

interface User {
  userId: string;
  phone: string;
  name: string;
  token: string;
  userType?: string;
  role?: string;
  userTypeId?: string;
}

export type { decodedToken, User };
