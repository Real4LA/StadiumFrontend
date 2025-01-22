import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Home from "./components/Home/Home";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Profile from "./components/Profile/Profile";
import VerifyCode from "./components/Auth/VerifyCode";
import Header from "./components/Layout/Header";

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </LocalizationProvider>
  );
}

export default App;
