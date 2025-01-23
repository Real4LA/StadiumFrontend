import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Handle page refresh by redirecting based on environment
const isProduction =
  window.location.hostname === "stadium-frontend.onrender.com";
const currentPath = window.location.pathname;

// Only redirect if we're not already on the production URL
if (
  isProduction &&
  window.location.href !== `https://stadium-frontend.onrender.com${currentPath}`
) {
  window.location.href = `https://stadium-frontend.onrender.com${currentPath}`;
}

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
    <HashRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);
