// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.REACT_APP_API_URL || "https://stadiumbackend.onrender.com/api",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "auth/login/",
      REGISTER: "auth/register/",
      VERIFY_CODE: "auth/verify-code/",
      RESEND_CODE: "auth/resend-code/",
      USER_INFO: "auth/me/",
      REFRESH_TOKEN: "auth/token/refresh/",
    },
    // Add other endpoint configurations here
  },
};

// Helper function to ensure proper URL formatting
export const getApiUrl = (endpoint) => {
  // Remove any leading slashes from the endpoint
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  // Combine base URL with endpoint, ensuring a single slash between them
  return `${API_CONFIG.BASE_URL.replace(/\/+$/, "")}/${cleanEndpoint}`;
};

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
