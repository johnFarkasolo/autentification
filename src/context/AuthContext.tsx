import { createContext, useContext, useState } from "react";
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
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('auth_token'));

	async function login(email: string, password: string): Promise<boolean> {
    const success = await authService.login(email, password);

    if (success) {
      setIsLoggedIn(true);
    }

    return success ;
  }

	async function logout() {
    await authService.logout();
    setIsLoggedIn(false);
  }

	const value: AuthContextType = {
		isLoggedIn,
		login,
		logout
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};