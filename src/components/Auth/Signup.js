import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import Footer from "../Layout/Footer";
import LinearProgress from "@mui/material/LinearProgress";
import VerifyCode from "./VerifyCode";
import stadiumBackground from "../../assets/stadium-hero.jpg";
import { API_CONFIG, getApiUrl, getDefaultHeaders } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

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
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

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

    try {
      const signupUrl = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER);
      console.log("Making signup request to:", signupUrl);

      // Prepare the signup data with phone in profile object
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        profile: {
          phone: formData.phone,
        },
      };

      console.log("Sending signup data:", signupData);

      const response = await fetch(signupUrl, {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify(signupData),
      });

      const responseData = await response.text();
      console.log("Raw response:", responseData);

      if (!response.ok) {
        let errorMessage = "Registration failed. Please try again.";
        try {
          const errorData = JSON.parse(responseData);
          console.error("Error data:", errorData);

          // Handle specific error cases
          if (errorData.username) {
            errorMessage = `Username error: ${errorData.username}`;
          } else if (errorData.email) {
            errorMessage = `Email error: ${errorData.email}`;
          } else if (errorData.profile?.phone) {
            errorMessage = `Phone error: ${errorData.profile.phone}`;
          } else if (errorData.password) {
            errorMessage = `Password error: ${errorData.password}`;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }

      // Parse the successful response
      const data = JSON.parse(responseData);
      console.log("Signup successful:", data);

      if (data.user && data.user.email) {
        setVerificationSent(true);
        setVerificationEmail(data.user.email);
        setUserId(data.user.id);
        console.log("Setting user ID:", data.user.id);

        // Automatically trigger resend code
        try {
          const resendUrl = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESEND_CODE);
          console.log("Making resend code request to:", resendUrl);

          const resendResponse = await fetch(resendUrl, {
            method: "POST",
            headers: getDefaultHeaders(),
            body: JSON.stringify({
              userId: data.user.id,
            }),
          });

          if (!resendResponse.ok) {
            console.error("Failed to resend verification code");
          } else {
            console.log("Verification code resent successfully");
          }
        } catch (resendError) {
          console.error("Error resending verification code:", resendError);
        }
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred. Please try again.");
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
