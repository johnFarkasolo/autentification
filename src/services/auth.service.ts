import { LoginResponse } from '../types/login-response';
import { post } from './http.service';

export async function login(email: string, password: string): Promise<boolean> {
		const response = await post<LoginResponse>(
			'http://localhost:5000/login',
			{ email, password },
		);

		if (response.accessToken && response.refreshToken) {
			localStorage.setItem('auth_token', response.accessToken);
			localStorage.setItem('refresh_token', response.refreshToken);
			return true;
		}

		return false;
}


export async function logout(): Promise<void> {
  await post('logout');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
}
