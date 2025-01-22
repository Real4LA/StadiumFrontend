import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import Footer from "../Layout/Footer";
import VerifyCode from "./VerifyCode";
import stadiumBackground from "../../assets/stadium-hero.jpg";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/users/verify-email/?token=${token}`
        );
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          // Store tokens and user data
          localStorage.setItem("accessToken", data.tokens.access);
          localStorage.setItem("refreshToken", data.tokens.refresh);
          localStorage.setItem("user", JSON.stringify(data.user));
          // Redirect to home after 2 seconds
          setTimeout(() => navigate("/home"), 2000);
        } else {
          setStatus("error");
          setError(data.error || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setError("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [token, navigate]);

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
          <Box sx={{ textAlign: "center" }}>
            <SportsSoccerIcon
              sx={{
                color: "#2d4d2d",
                fontSize: 60,
                mb: 2,
              }}
            />

            {status === "verifying" && (
              <>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Verifying Your Email
                </Typography>
                <CircularProgress size={40} sx={{ color: "#2d4d2d" }} />
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircleIcon
                  sx={{
                    color: "#2d4d2d",
                    fontSize: 60,
                    mb: 2,
                  }}
                />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Email Verified Successfully!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Your account has been activated. Redirecting to home page...
                </Typography>
              </>
            )}

            {status === "error" && (
              <>
                <ErrorIcon
                  sx={{
                    color: "#d32f2f",
                    fontSize: 60,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{ mb: 2, fontWeight: 600, color: "#d32f2f" }}
                >
                  Verification Failed
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: "#d32f2f" }}>
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    bgcolor: "#2d4d2d",
                    "&:hover": {
                      bgcolor: "#1a331a",
                    },
                    borderRadius: 2,
                    py: 1,
                    px: 4,
                  }}
                >
                  Go to Login
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default VerifyEmail;
