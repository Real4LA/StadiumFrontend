import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
  const [currentSection, setCurrentSection] = useState("home");

  const renderSection = () => {
    switch (currentSection) {
      case "home":
        return (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        );
      case "login":
        return <Login setCurrentSection={setCurrentSection} />;
      case "signup":
        return <Signup setCurrentSection={setCurrentSection} />;
      case "profile":
        return (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        );
      case "verify":
        return <VerifyCode setCurrentSection={setCurrentSection} />;
      default:
        return (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        );
    }
  };

  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="App">
          <Header
            setCurrentSection={setCurrentSection}
            currentSection={currentSection}
          />
          <Routes>
            <Route path="/" element={renderSection()} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </LocalizationProvider>
    </AuthProvider>
  );
}

export default App;
