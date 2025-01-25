import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create a base URL constant
const BASE_URL = "https://stadium-frontend.onrender.com";

// Handle refresh detection
window.onload = function () {
  // Check if we're on the render.com domain
  if (window.location.hostname === "stadium-frontend.onrender.com") {
    // Get the current path
    const currentPath = window.location.pathname;

    // If we're not at the root and this is a direct page load
    if (currentPath !== "/" && !sessionStorage.getItem("app_initialized")) {
      // Store the intended path
      sessionStorage.setItem("redirect_after_load", currentPath);
      // Redirect to root
      window.location.href = BASE_URL;
    }
    // If we have a stored path and we're at root, redirect to the stored path
    else if (
      currentPath === "/" &&
      sessionStorage.getItem("redirect_after_load")
    ) {
      const redirectPath = sessionStorage.getItem("redirect_after_load");
      sessionStorage.removeItem("redirect_after_load");
      window.history.pushState({}, "", redirectPath);
    }
  }

  // Mark that the app has been initialized
  sessionStorage.setItem("app_initialized", "true");
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#2d4d2d",
    },
    secondary: {
      main: "#4a4a4a",
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
