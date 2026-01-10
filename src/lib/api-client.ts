import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import type { AuthContextType } from "./auth-context"; // Import AuthContextType as a type

// This instance will be configured with base URL and interceptors
let api: AxiosInstance;
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

// New: Error feedback callback
let errorFeedbackCallback: ((message: string) => void) | null = null;

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupApiClient = (auth: AuthContextType) => {
  api = axios.create({
    baseURL: "/api", // Assuming your API routes start with /api
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // Add access token to requests if available
      if (auth.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${auth.accessToken}`;
      }
      return config;
    },
    (error: AxiosError) => {
      errorFeedbackCallback?.(error.message || "Request error");
      return Promise.reject(error);
    },
  );

  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Only proceed if it's a 401 error and not already refreshing
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          // If already refreshing, queue the original request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return api(originalRequest);
            })
            .catch((err) => {
              errorFeedbackCallback?.(
                err.response?.data?.message ||
                  err.message ||
                  "Token refresh failed",
              );
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true; // Mark request as retried
        isRefreshing = true;

        try {
          // Call the refresh endpoint
          const refreshResponse = await axios.post("/api/auth/refresh");
          const newAccessToken = refreshResponse.data.accessToken;

          // Update AuthContext with new access token
          auth.updateAccessToken(newAccessToken);

          // Process the queue with the new token
          processQueue(null, newAccessToken);

          // Retry the original request with the new access token
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError: any) {
          // If refresh fails, clear auth state and redirect to login
          processQueue(refreshError);
          auth.logout(); // auth.logout already handles redirection
          errorFeedbackCallback?.(
            refreshError.response?.data?.message ||
              refreshError.message ||
              "Session expired. Please log in again.",
          );
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      errorFeedbackCallback?.(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
      );
      return Promise.reject(error);
    },
  );

  return api;
};

// New: Function to set an error feedback callback
export const setErrorFeedbackCallback = (
  callback: (message: string) => void,
) => {
  errorFeedbackCallback = callback;
};

export default api; // Export the instance for direct use after setup
