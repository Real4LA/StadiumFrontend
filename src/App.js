import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Home from "./components/Home/Home";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Profile from "./components/Profile/Profile";
import VerifyCode from "./components/Auth/VerifyCode";
import Header from "./components/Layout/Header";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Add event listener for page refresh
    const handleBeforeUnload = () => {
      // Store the current path before refresh
      sessionStorage.setItem("lastPath", location.pathname);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Check if this is a page load after refresh
    const lastPath = sessionStorage.getItem("lastPath");
    if (lastPath) {
      // Clear the stored path
      sessionStorage.removeItem("lastPath");
      // Redirect to home page
      navigate("/", { replace: true });
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigate, location]);

  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="App">
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/verify" element={<VerifyCode />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </LocalizationProvider>
    </AuthProvider>
  );
}

export default App;
