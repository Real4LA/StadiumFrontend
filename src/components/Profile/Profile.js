import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
import stadiumBackground from "../../assets/stadium-hero.jpg";
import { API_CONFIG, getApiUrl, getAuthHeaders } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    fetchUpcomingReservations();
  }, []);

  const fetchUpcomingReservations = async () => {
    try {
      console.log("Fetching upcoming reservations...");
      const token = localStorage.getItem("accessToken");
      console.log("Using token:", token ? "Token exists" : "No token found");

      const bookingsUrl = getApiUrl(API_CONFIG.ENDPOINTS.CALENDAR.MY_BOOKINGS);
      console.log("Fetching from URL:", bookingsUrl);

      const response = await fetch(bookingsUrl, {
        headers: getAuthHeaders(token),
      });

      if (response.status === 401) {
        // Token expired, try to refresh auth
        await checkAuth();
        // Retry the request
        return fetchUpcomingReservations();
      }

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log("Parsed bookings data:", data);

        if (!data.bookings) {
          console.log("No bookings found in response");
          setUpcomingReservations([]);
          return;
        }

        // Sort bookings by start time
        const sortedBookings = data.bookings.sort((a, b) => {
          return new Date(a.start_time) - new Date(b.start_time);
        });

        console.log("Sorted bookings:", sortedBookings);
        setUpcomingReservations(sortedBookings);
      } else {
        let errorMessage = "Failed to fetch reservations";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        console.error("Error fetching reservations:", errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Network error:", error);
      setError(
        "Failed to connect to the server. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setOpenCancelDialog(true);
    setCancelError(null);
    setCancelSuccess(false);
    setConfirmationText("");
  };

  const handleCancelClose = () => {
    setOpenCancelDialog(false);
    setSelectedReservation(null);
    setCancelError(null);
    setConfirmationText("");
    if (cancelSuccess) {
      fetchUpcomingReservations();
    }
  };

  const handleCancelConfirm = async () => {
    if (confirmationText !== "I AGREE") {
      setCancelError("Please type 'I AGREE' to cancel the booking");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const cancelUrl = getApiUrl(API_CONFIG.ENDPOINTS.CALENDAR.CANCEL_BOOKING);
      const response = await fetch(cancelUrl, {
        method: "POST",
        headers: {
          ...getAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendar_id: selectedReservation.calendar_id,
          event_id: selectedReservation.event_id,
        }),
      });

      if (response.ok) {
        setCancelSuccess(true);
        setTimeout(handleCancelClose, 2000);
      } else {
        const errorData = await response.json();
        setCancelError(errorData.error || "Failed to cancel reservation");
      }
    } catch (error) {
      console.error("Network error:", error);
      setCancelError(
        "Failed to connect to the server. Please try again later."
      );
    }
  };

  if (loading) {
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
        }}
      >
        <CircularProgress sx={{ color: "#2d4d2d" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
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
      }}
    >
      <Header />
      <Container
        maxWidth="md"
        sx={{
          pt: 12,
          pb: 6,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#2d4d2d",
                fontSize: "2rem",
                mr: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  color: "#1a1a1a",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                {user.first_name} {user.last_name}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#4a4a4a",
                  fontWeight: 500,
                }}
              >
                @{user.username}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.1)" }} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: "#1a1a1a",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Personal Information
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4a4a4a",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        Email
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#1a1a1a",
                          fontWeight: 500,
                        }}
                      >
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4a4a4a",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        Phone
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#1a1a1a",
                          fontWeight: 500,
                        }}
                      >
                        {user.profile?.phone || "Not provided"}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4a4a4a",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        Username
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#1a1a1a",
                          fontWeight: 500,
                        }}
                      >
                        {user.username}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: "#1a1a1a",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Upcoming Reservations
              </Typography>
              {error && (
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: alpha("#ff3333", 0.1),
                    color: "#cc0000",
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography>{error}</Typography>
                </Paper>
              )}
              <List>
                {upcomingReservations.length > 0 ? (
                  upcomingReservations.map((reservation, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        px: 0,
                        borderBottom:
                          index !== upcomingReservations.length - 1
                            ? "1px solid rgba(0,0,0,0.1)"
                            : "none",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 1, sm: 0 },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#1a1a1a",
                              fontWeight: 600,
                              mb: 0.5,
                            }}
                          >
                            {format(
                              parseISO(reservation.start_time),
                              "EEEE, MMMM d, yyyy"
                            )}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#2d4d2d",
                                fontWeight: 500,
                                mb: 0.5,
                              }}
                            >
                              {`${format(
                                parseISO(reservation.start_time),
                                "h:mm a"
                              )} - ${format(
                                parseISO(reservation.end_time),
                                "h:mm a"
                              )}`}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#4a4a4a",
                                fontWeight: 500,
                              }}
                            >
                              {reservation.stadium_name}
                            </Typography>
                          </>
                        }
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancelClick(reservation)}
                        sx={{
                          mt: { xs: 1, sm: 0 },
                          borderRadius: 2,
                          textTransform: "none",
                          minWidth: 100,
                        }}
                      >
                        Cancel
                      </Button>
                    </ListItem>
                  ))
                ) : (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            color: "#4a4a4a",
                            fontStyle: "italic",
                          }}
                        >
                          No upcoming reservations
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCancelClose}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 500,
            borderRadius: 3,
            p: 2,
            bgcolor: "#f5f5f5",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            fontWeight: 600,
            color: "#1a1a1a",
          }}
        >
          Cancel Reservation
        </DialogTitle>
        <Divider sx={{ bgcolor: "rgba(0,0,0,0.1)" }} />
        <DialogContent>
          {cancelSuccess ? (
            <Box
              sx={{
                bgcolor: alpha("#4CAF50", 0.1),
                p: 2,
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Typography sx={{ color: "#1b5e20", fontWeight: 500 }}>
                Reservation cancelled successfully. You cannot make a new
                booking for 1 hour.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography
                gutterBottom
                sx={{
                  fontSize: "1.1rem",
                  mb: 3,
                  color: "#1a1a1a",
                }}
              >
                Are you sure you want to cancel your reservation at{" "}
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {selectedReservation?.stadium_name}
                </Box>{" "}
                for{" "}
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {selectedReservation &&
                    format(
                      parseISO(selectedReservation.start_time),
                      "MMMM d, yyyy"
                    )}{" "}
                  at{" "}
                  {selectedReservation &&
                    format(parseISO(selectedReservation.start_time), "h:mm a")}
                </Box>
                ?
              </Typography>

              <Box
                sx={{
                  bgcolor: alpha("#ff9800", 0.1),
                  p: 2,
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <Typography sx={{ color: "#e65100", fontWeight: 500 }}>
                  Note: After cancelling, you will not be able to make a new
                  booking for 1 hour.
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Type 'I AGREE' to confirm cancellation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                error={cancelError !== null}
                helperText={cancelError}
                sx={{ mt: 2 }}
              />

              {cancelError && (
                <Box
                  sx={{
                    bgcolor: alpha("#f44336", 0.1),
                    p: 2,
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Typography sx={{ color: "#d32f2f", fontWeight: 500 }}>
                    {cancelError}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        {!cancelSuccess && (
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleCancelClose}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                color: "#4a4a4a",
                "&:hover": {
                  backgroundColor: "rgba(74, 74, 74, 0.1)",
                },
              }}
            >
              Keep Reservation
            </Button>
            <Button
              onClick={handleCancelConfirm}
              variant="contained"
              color="error"
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
              }}
            >
              Cancel Reservation
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Footer />
    </Box>
  );
};

export default Profile;
