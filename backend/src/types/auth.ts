export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface RegisterBody {
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
}
