import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import Footer from "../Layout/Footer";
import LinearProgress from "@mui/material/LinearProgress";
import VerifyCode from "./VerifyCode";
import stadiumBackground from "../../assets/stadium-hero.jpg";
import API_CONFIG, { getApiUrl, getDefaultHeaders } from "../../config/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    let strength = 0;
    let errors = [];

    // Minimum length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      errors.push("Password must be at least 8 characters long");
    }

    // Uppercase letter check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      errors.push("Password must contain at least one uppercase letter");
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      errors.push("Password must contain at least one special character");
    }

    // Number check
    if (/[0-9]/.test(password)) {
      strength += 25;
    } else {
      errors.push("Password must contain at least one number");
    }

    setPasswordStrength(strength);
    setPasswordError(errors.length > 0 ? errors[0] : "");
    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password before submission
    if (!validatePassword(formData.password)) {
      setLoading(false);
      return;
    }

    const signupUrl = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER);
    console.log("Making signup request to:", signupUrl);

    try {
      const response = await fetch(signupUrl, {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        }),
      });

      // Log response details for debugging
      console.log("Response status:", response.status);
      console.log("Response headers:", Array.from(response.headers.entries()));

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || "Registration failed. Please try again."
          );
        } else {
          throw new Error("Registration failed. Server error occurred.");
        }
      }

      // Check if response is empty
      const text = await response.text();
      console.log("Response text:", text);

      if (!text) {
        // If we get a 200 OK but empty response, assume success
        console.log("Empty but successful response");
        setVerificationSent(true);
        setVerificationEmail(formData.email);
        setUserId(formData.username);
        return;
      }

      // Try to parse JSON
      try {
        const data = JSON.parse(text);
        setVerificationSent(true);
        setVerificationEmail(data.email || formData.email);
        setUserId(data.userId || formData.username);
      } catch (e) {
        console.error("Failed to parse response:", text);
        // If JSON parsing fails but we got a 200 OK, still treat it as success
        if (response.ok) {
          setVerificationSent(true);
          setVerificationEmail(formData.email);
          setUserId(formData.username);
        } else {
          throw new Error("Invalid response format from server");
        }
      }
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to get the color for the strength indicator
  const getStrengthColor = (strength) => {
    if (strength <= 25) return "#ff4444";
    if (strength <= 50) return "#ffbb33";
    if (strength <= 75) return "#00C851";
    return "#007E33";
  };

  if (verificationSent) {
    return <VerifyCode email={verificationEmail} userId={userId} />;
  }

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
              Create Account
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
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleChange}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!passwordError}
                  helperText={passwordError}
                  sx={{ mb: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2, width: "100%" }}>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    sx={{
                      height: 8,
                      borderRadius: 5,
                      bgcolor: "rgba(0,0,0,0.1)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: getStrengthColor(passwordStrength),
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: getStrengthColor(passwordStrength),
                      mt: 0.5,
                      display: "block",
                      textAlign: "right",
                    }}
                  >
                    {passwordStrength <= 25 && "Weak"}
                    {passwordStrength > 25 && passwordStrength <= 50 && "Fair"}
                    {passwordStrength > 50 && passwordStrength <= 75 && "Good"}
                    {passwordStrength > 75 && "Strong"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  sx={textFieldStyle}
                />
              </Grid>
            </Grid>

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
                "Create Account"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link
                component={RouterLink}
                to="/login"
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
                Already have an account? Sign in
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

export default Signup;
