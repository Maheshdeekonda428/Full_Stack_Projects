import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token rotation
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true
                });

                if (response.status === 200) {
                    const { access_token } = response.data;
                    localStorage.setItem('token', access_token);

                    // Update header and retry original request
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, clear auth and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                    toast.error('Session expired. Please login again.');
                }
                return Promise.reject(refreshError);
            }
        }

        // Generic error handling
        const message = error.response?.data?.detail || error.message || 'Something went wrong';

        if (error.response?.status === 401) {
            // If it's still 401 after retry, or if refresh failed above
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action.');
        } else if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.');
        } else if (!error.response) {
            toast.error('Unable to connect to the server. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

export default api;
