// Desc: Configuration file for the client side
// e.g. serverUrl, apiBase, imageBase, socketUrl

import axios from 'axios';
import { toast } from 'sonner';

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const apiBase = axios.create({
	baseURL: `${SERVER_URL}/api/v1`,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json'
	}
});

// Request interceptor for debugging
apiBase.interceptors.request.use(
	(config) => {
		return config;
	},
	(error) => Promise.reject(error)
);

// Global error interceptor
apiBase.interceptors.response.use(
	(response) => response,
	(error) => {
		const isBrowser = typeof window !== 'undefined';
		const currentPath = isBrowser ? window.location.pathname : '';

		// Handle network errors
		if (!error.response) {
			toast.error('Network error. Please check your connection.');
			return Promise.reject(error);
		}

		const status = error.response.status;
		const message = error.response.data?.message || error.message;

		// Handle different HTTP status codes
		switch (status) {
			case 401:
				// Unauthorized - only redirect to login if on a dashboard page
				const pathname = isBrowser ? window.location.pathname : currentPath;
				const isDashboardPage = pathname.startsWith('/dashboard');

				if (process.env.NODE_ENV === 'development') {
					console.log('401 Error encountered.', { pathname, isDashboardPage });
				}

				if (isDashboardPage) {
					if (isBrowser) {
						window.location.href = '/';
					}
				}
				break;
			case 403:
				// Forbidden - permission denied
				break;
			case 404:
				break;
			case 500:
			case 502:
			case 503:
				// Server errors
				toast.error('Server error. Please try again later.');
				break;
			default:
			// Other errors
		}

		// Log errors in development
		if (process.env.NODE_ENV === 'development') {
			console.error('API Error:', {
				status,
				message,
				url: error.config?.url,
				method: error.config?.method,
				data: error.response?.data
			});
		}

		return Promise.reject(error);
	}
);
