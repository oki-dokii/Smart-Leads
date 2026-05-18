import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser, Role } from '../types';
import { getMe, login as apiLogin, register as apiRegister, LoginParams, RegisterParams } from '../api/auth';
import axios from 'axios';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginParams) => Promise<void>;
  register: (data: RegisterParams) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
        } catch (error) {
          console.error('Failed to authenticate:', error);
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (data: LoginParams) => {
    const res = await apiLogin(data);
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(res.data.user);
  };

  const register = async (data: RegisterParams) => {
    const res = await apiRegister(data);
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === Role.Admin;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
