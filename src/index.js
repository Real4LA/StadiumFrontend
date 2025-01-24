import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Handle refresh detection
window.onload = function () {
  // Set a flag in sessionStorage when the page is about to unload
  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("isRefresh", "true");
  });

  // Check if this is a refresh and we're not on the main page
  if (
    sessionStorage.getItem("isRefresh") === "true" &&
    window.location.hostname === "stadium-frontend.onrender.com" &&
    window.location.pathname !== "/"
  ) {
    sessionStorage.removeItem("isRefresh");
    window.location.replace("https://stadium-frontend.onrender.com");
  } else {
    sessionStorage.removeItem("isRefresh");
  }
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
