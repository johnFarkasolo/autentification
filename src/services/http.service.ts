import axios, { AxiosRequestConfig } from 'axios';

//
// 1) create and setup singleton axios-instance
//

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// === Request interceptor ===
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === Response interceptor ===
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('auth_token');
		}
		return Promise.reject(error);
	}
);

//
// 2) export methods get, post, put, delete
//

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
	const response = await axiosInstance.get<T>(url, config);
	return response.data;
}

export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.post<T>(url, data, config);
  return response.data;
}

export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
	const response = await axiosInstance.put<T>(url, data, config);
	return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
	const response = await axiosInstance.delete<T>(url, config);
	return response.data;
}

export { axiosInstance };