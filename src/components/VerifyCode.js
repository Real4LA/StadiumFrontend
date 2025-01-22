import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

const VerifyCode = ({ email, userId }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 6) {
      setCode(value);
      setError("");
    }
  };

  const handleVerify = async () => {
    if (!code.trim() || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending verification request:", {
        code: code.trim(),
        userId: userId,
      });

      const response = await axios.post(
        "/api/users/verify-code/",
        {
          code: code.trim(),
          userId: userId,
        },
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      console.log("Verification response:", response.data);

      // Store tokens
      localStorage.setItem("accessToken", response.data.tokens.access);
      localStorage.setItem("refreshToken", response.data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to home
      navigate("/");
    } catch (err) {
      console.error("Verification error:", {
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        error: err.message,
      });
      setError(
        err.response?.data?.error || "Verification failed. Please try again."
      );
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError("");

    try {
      console.log("Sending resend code request for userId:", userId);

      const response = await axios.post(
        "/api/users/resend-code/",
        { userId },
        {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      console.log("Resend code response:", response.data);
      setResendDisabled(true);
      setCountdown(60);
    } catch (err) {
      console.error("Resend error:", {
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        error: err.message,
      });
      setError(
        err.response?.data?.error || "Failed to resend code. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8))",
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
          <Typography variant="h5" component="h1" gutterBottom>
            Verify Your Email
          </Typography>

          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{ mb: 3 }}
          >
            We've sent a verification code to:
            <br />
            <strong>{email}</strong>
          </Typography>

          <TextField
            fullWidth
            label="Verification Code"
            value={code}
            onChange={handleCodeChange}
            error={!!error}
            helperText={error}
            sx={{ mb: 3 }}
            inputProps={{
              maxLength: 6,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            sx={{
              mb: 2,
              height: 48,
              backgroundColor: "#1a472a",
              "&:hover": {
                backgroundColor: "#2a573a",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Verify"
            )}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleResendCode}
            disabled={resendLoading || resendDisabled}
            sx={{
              height: 48,
              borderColor: "#1a472a",
              color: "#1a472a",
              "&:hover": {
                borderColor: "#2a573a",
                backgroundColor: "rgba(26, 71, 42, 0.04)",
              },
            }}
          >
            {resendLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : countdown > 0 ? (
              `Resend Code (${countdown}s)`
            ) : (
              "Resend Code"
            )}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyCode;
