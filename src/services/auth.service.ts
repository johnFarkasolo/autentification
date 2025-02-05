// src/services/auth.service.ts

import { LoginResponse } from '../types/login-response';
import { post } from './http.service';

/**
 * Логин:
 * Отправляет { email, password } на сервер.
 * Ожидается, что сервер вернёт { accessToken, refreshToken }.
 */
export async function login(email: string, password: string): Promise<boolean> {
    // Если сервер вернёт ошибку (401, 500 и т.д.),
		// она «пробросится» вызвавшему коду.
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

/**
 * Логаут:
 * Вызывает при необходимости /logout (если на сервере есть такой маршрут),
 * а затем удаляет токены из localStorage.
 */
export async function logout(): Promise<void> {
  await post('logout');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
}
