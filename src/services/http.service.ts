import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { getAuthHeaders, refreshAccessToken } from './auth.service';

const API_BASE_URL = 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
	config.headers = config.headers as AxiosHeaders;
  const authHeaders = getAuthHeaders();

  Object.entries(authHeaders).forEach(([key, value]) => {
    config.headers.set(key, value);
  });

	return config;
});

// Response Interceptor: Auto-refresh token on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        error.config!.headers = new AxiosHeaders();
        Object.entries(getAuthHeaders()).forEach(([key, value]) => {
          (error.config!.headers as AxiosHeaders).set(key, value);
        });

        return apiClient(error.config!);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
