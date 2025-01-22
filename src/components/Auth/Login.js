import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Footer from "../Layout/Footer";
import stadiumBackground from "../../assets/stadium-hero.jpg";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);

        const userResponse = await fetch(
          "http://localhost:8000/api/users/me/",
          {
            headers: {
              Authorization: `Bearer ${data.access}`,
            },
          }
        );
        const userData = await userResponse.json();
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/home");
      } else {
        setError(data.detail || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${stadiumBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(2px)",
          zIndex: -2,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6))",
          zIndex: -1,
        },
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 4,
              gap: 1,
            }}
          >
            <SportsSoccerIcon
              sx={{
                color: "#2d4d2d",
                fontSize: 40,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: "-0.5px",
              }}
            >
              Sign In
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                width: "100%",
                mb: 3,
                borderRadius: 2,
                bgcolor: "rgba(211, 47, 47, 0.1)",
                color: "#d32f2f",
                "& .MuiAlert-icon": {
                  color: "#d32f2f",
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={textFieldStyle}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: "#4a4a4a" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyle}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                bgcolor: "#2d4d2d",
                borderRadius: 2,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#1a331a",
                },
                "&:disabled": {
                  bgcolor: "#4a4a4a",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Sign In"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link
                component={RouterLink}
                to="/signup"
                variant="body2"
                sx={{
                  color: "#2d4d2d",
                  textDecoration: "none",
                  fontWeight: 500,
                  "&:hover": {
                    textDecoration: "underline",
                    color: "#1a331a",
                  },
                }}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover fieldset": {
      borderColor: "#2d4d2d",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2d4d2d",
    },
  },
};

export default Login;
