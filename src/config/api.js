// API Configuration
const API_CONFIG = {
  BASE_URL:
    process.env.REACT_APP_API_URL || "https://stadiumbackend.onrender.com/api",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "token/",
      VERIFY_CODE: "users/verify-code/",
      RESEND_CODE: "users/resend-code/",
      USER_INFO: "users/me/",
      REGISTER: "users/",
    },
    // Add other endpoint configurations here
  },
};

// Helper function to ensure proper URL formatting
export const getApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith("/")
    ? API_CONFIG.BASE_URL.slice(0, -1)
    : API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Default headers for API requests
export const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

// Auth headers for protected routes
export const getAuthHeaders = (token) => ({
  ...getDefaultHeaders(),
  Authorization: `Bearer ${token}`,
});

export default API_CONFIG;
