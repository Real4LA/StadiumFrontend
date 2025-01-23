import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Handle page refresh by redirecting to the deployed frontend URL while preserving the path
if (
  window.performance &&
  window.performance.navigation.type ===
    window.performance.navigation.TYPE_RELOAD
) {
  const currentPath = window.location.pathname;
  window.location.replace(
    `https://stadium-frontend.onrender.com${currentPath}`
  );
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
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
