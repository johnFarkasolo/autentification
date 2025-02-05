import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/auth.service';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext)!;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const refreshed = await authService.refreshAccessToken();
      setIsLoggedIn(refreshed);
    };
    checkAuth();
  }, []);

  async function login(email: string, password: string): Promise<boolean> {
    const success = await authService.login(email, password);
    setIsLoggedIn(success);
    return success;
  }

  function logout() {
    authService.logout();
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
