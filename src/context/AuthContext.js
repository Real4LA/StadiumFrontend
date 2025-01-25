import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG, getApiUrl, getDefaultHeaders } from "../config/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN),
        {
          method: "POST",
          headers: getDefaultHeaders(),
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      if (!response.ok) throw new Error("Token refresh failed");

      const data = await response.json();
      localStorage.setItem("accessToken", data.access);
      return data.access;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return null;
    }
  }, [logout]);

  const checkAuth = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");

      if (!storedUser || !accessToken) {
        setUser(null);
        return;
      }

      if (isTokenExpired(accessToken)) {
        const newToken = await refreshToken();
        if (!newToken) {
          setUser(null);
          return;
        }
      }

      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [isTokenExpired, refreshToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((userData, tokens) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", tokens.access);
    localStorage.setItem("refreshToken", tokens.refresh);
    setUser(userData);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    refreshToken,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
