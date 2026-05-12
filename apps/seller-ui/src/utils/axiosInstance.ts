import axios from "axios";

// Create a pre-configured axios instance that uses your backend server URL
// and automatically sends cookies with every request (needed for auth)
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: ((error?: any) => void)[] = [];

// Redirect user to /login and prevent infinite redirect loops
const handleLogout = () => {
    if (typeof window !== "undefined") {
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }
};

// Queue up any requests that come in while a token refresh is in progress
const subscribeTokenRefresh = (callback: (error?: any) => void) => {
    refreshSubscribers.push(callback);
};

// Once we have a new token, retry all queued requests
const onRefreshSuccess = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
};

// If token refresh fails, reject all queued requests
const onRefreshFailure = (error: any) => {
    refreshSubscribers.forEach((callback) => callback(error));
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
            // Don't try to refresh if this IS the refresh request itself
            if (originalRequest.url?.includes("/api/refresh-token")) {
                return Promise.reject(error);
            }

            // If a refresh is already happening, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((err?: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(axiosInstance(originalRequest));
                        }
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Use raw axios (NOT axiosInstance) to avoid interceptor loop/deadlock
                await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                isRefreshing = false;
                onRefreshSuccess();
                // Retry the original request with the new token
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                onRefreshFailure(refreshError);
                handleLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;