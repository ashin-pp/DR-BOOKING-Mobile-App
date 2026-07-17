import { UserRole } from '../constants/enums';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => Promise<void>;
  setToken: (token: string) => void;
  setUser: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadStorage: () => Promise<void>;
}
