import axios from "axios";

// Create a pre-configured axios instance that uses your backend server URL
// and automatically sends cookies with every request (needed for auth)
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// Redirect user to /login and prevent infinite redirect loops
const handleLogout = () => {
    if (typeof window !== "undefined") {
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }
};

// Queue up any requests that come in while a token refresh is in progress
const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
};

// Once we have a new token, retry all queued requests
const onRefreshSuccess = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
};

// Pass through all outgoing requests as-is
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Handle 401 (Unauthorized) responses by attempting a token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // If a refresh is already happening, queue this request
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => {
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Ask the server to issue a new access token using the refresh token cookie
                await axiosInstance.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token`);
                isRefreshing = false;
                onRefreshSuccess();
                // Retry the original request with the new token
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                handleLogout();
                isRefreshing = false;
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;