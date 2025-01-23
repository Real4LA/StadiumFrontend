import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import Footer from "../Layout/Footer";
import stadiumBackground from "../../assets/stadium-hero.jpg";
import API_CONFIG, {
  getApiUrl,
  getDefaultHeaders,
  getAuthHeaders,
} from "../../config/api";

const VerifyCode = ({ email, userId }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Add countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const verifyUrl = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_CODE);
      console.log("Making verification request to:", verifyUrl);
      console.log("Verification data:", {
        code: verificationCode.trim(),
        userId,
      });

      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          code: verificationCode.trim(),
          userId: userId,
        }),
      });

      const responseData = await response.text();
      console.log("Raw verification response:", responseData);

      if (!response.ok) {
        let errorMessage = "Verification failed";
        try {
          const errorData = JSON.parse(responseData);
          errorMessage =
            errorData.detail || errorData.error || "Verification failed";
        } catch (e) {
          console.error("Error parsing verification error:", e);
        }
        throw new Error(errorMessage);
      }

      try {
        const data = JSON.parse(responseData);
        console.log("Verification successful:", data);

        if (data.tokens) {
          localStorage.setItem("accessToken", data.tokens.access);
          localStorage.setItem("refreshToken", data.tokens.refresh);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/home");
        } else {
          throw new Error("Invalid response format");
        }
      } catch (e) {
        console.error("Error parsing success response:", e);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(error.message || "An error occurred. Please try again.");
      setVerificationCode(""); // Clear the input on error
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setResendLoading(true);
    setResendDisabled(true);
    setCountdown(60); // 60 seconds cooldown

    try {
      if (!userId) {
        throw new Error("User ID is missing. Please try signing up again.");
      }

      console.log("Sending resend code request with userId:", userId);
      const resendUrl = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESEND_CODE);
      console.log("Making resend code request to:", resendUrl);
      console.log("Resend data:", { userId });

      const response = await fetch(resendUrl, {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          userId: userId,
        }),
      });

      const responseData = await response.text();
      console.log("Raw resend response:", responseData);

      if (!response.ok) {
        let errorMessage = "Failed to resend code";
        try {
          const errorData = JSON.parse(responseData);
          errorMessage =
            errorData.detail || errorData.error || "Failed to resend code";
        } catch (e) {
          console.error("Error parsing resend error:", e);
        }
        throw new Error(errorMessage);
      }

      setError("New verification code sent to your email");
      setVerificationCode(""); // Clear the input when new code is sent
    } catch (error) {
      console.error("Resend error:", error);
      setError(error.message || "An error occurred. Please try again.");
      setResendDisabled(false);
      setCountdown(0);
    } finally {
      setResendLoading(false);
    }
  };

  // Handle verification code input
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setVerificationCode(value);
    setError("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
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
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "white",
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: "center", width: "100%" }}>
            <SportsSoccerIcon
              sx={{
                color: "#2d4d2d",
                fontSize: 60,
                mb: 2,
              }}
            />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Verify Your Email
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We've sent a verification code to:
              <br />
              <strong>{email}</strong>
            </Typography>

            {error && (
              <Alert
                severity={error.includes("sent") ? "success" : "error"}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  width: "100%",
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleVerify} style={{ width: "100%" }}>
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={handleCodeChange}
                sx={{ mb: 3 }}
                inputProps={{
                  maxLength: 6,
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || verificationCode.length !== 6}
                sx={{
                  mb: 2,
                  bgcolor: "#2d4d2d",
                  "&:hover": {
                    bgcolor: "#1a331a",
                  },
                  "&:disabled": {
                    bgcolor: "#4a4a4a",
                  },
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>

            <Button
              onClick={handleResendCode}
              disabled={resendLoading || resendDisabled}
              sx={{
                color: "#2d4d2d",
                "&:hover": {
                  bgcolor: "rgba(45, 77, 45, 0.1)",
                },
                textTransform: "none",
              }}
            >
              {resendLoading ? (
                <CircularProgress size={24} sx={{ color: "#2d4d2d" }} />
              ) : (
                `Resend Code (${countdown > 0 ? countdown : "Resend"})`
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default VerifyCode;
