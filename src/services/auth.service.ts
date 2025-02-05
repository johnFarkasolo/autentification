import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Store access token in memory
let accessToken: string | null = null;

/**
 * Save the access token
 */
function setAccessToken(newAccessToken: string) {
  accessToken = newAccessToken;
}
/**
 * Login user
 */
export async function login(email: string, password: string) {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/login`,
			{ email,password },
			{ withCredentials: true } // Required to send cookies
		);

		setAccessToken(response.data.accessToken);
		return true;
	} catch (err: unknown) {
		const error = err as AxiosError<{ message: string }>;
		console.error('Login failed:', error.response?.data?.message || error.message);
    return false;
	}
}

/**
 * Logout user (removes tokens)
 */
export async function logout() {
	await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
	accessToken = null;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<boolean> {
	try {
    const response = await axios.post(`${API_BASE_URL}/refresh`, {}, { withCredentials: true });
    setAccessToken(response.data.accessToken);
    return true;
  } catch (err: unknown) {
		const error = err as AxiosError<{ message: string }>;
    console.error('Refresh token failed:', error.response?.data?.message || error.message);
    logout();
    return false;
  }
}

/**
 * Get authentication headers for API calls
 */
export function getAuthHeaders() {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}