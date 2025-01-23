// API Configuration
const API_CONFIG = {
  BASE_URL:
    process.env.REACT_APP_API_URL || "https://stadiumbackend.onrender.com/api",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/users/",
      VERIFY_CODE: "/users/verify-code",
      RESEND_CODE: "/users/resend-code",
      USER_INFO: "/users/me",
    },
    // Add other endpoint configurations here
  },
};

// Helper function to ensure proper URL formatting
export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;

// Default headers for API requests
export const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
});

// Auth headers for protected routes
export const getAuthHeaders = (token) => ({
  ...getDefaultHeaders(),
  Authorization: `Bearer ${token}`,
});

export default API_CONFIG;
