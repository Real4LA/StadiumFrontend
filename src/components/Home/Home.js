import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Rating,
  Button,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  alpha,
  IconButton,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../Layout/Header";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { format } from "date-fns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Footer from "../Layout/Footer";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import { debounce } from "@mui/material/utils";
import { API_CONFIG, getApiUrl, getAuthHeaders } from "../../config/api";

const testimonials = [
  {
    name: "John Doe",
    rating: 5,
    comment:
      "Best stadium I've ever played in! Great facilities and excellent service.",
    avatar: "JD",
  },
  {
    name: "Sarah Clarck",
    rating: 4,
    comment: "Very well maintained and professional staff. Highly recommended!",
    avatar: "SS",
  },
  {
    name: "Mike Johnson",
    rating: 5,
    comment: "Perfect for our weekly matches. Booking process is super easy.",
    avatar: "MJ",
  },
];

const features = [
  {
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    title: "Player Capacity",
    description: "Up to 14 players",
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
    title: "Play Time",
    description: "90 minute sessions",
  },
  {
    icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
    title: "Pricing",
    description: "120 DT per session",
  },
];

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [openBooking, setOpenBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const navigate = useNavigate();
  const slotsRef = useRef(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const stadiums = useMemo(
    () => [
      {
        id: 1,
        name: "Main Field",
        calendarId:
          "433adde78c577df19c67e7d18b2e932c8aa5b60b05098687a13a227712510f5d@group.calendar.google.com",
        color: "#2d4d2d",
      },
      {
        id: 2,
        name: "Academy Stadium",
        calendarId:
          "c0981f9f07e185a73808a13deb4e2648915ff7f9a28cfe35bb212ff87115a435@group.calendar.google.com",
        color: "#4a2d4d",
      },
      {
        id: 3,
        name: "FG Field",
        calendarId:
          "a233987f0f4b9c95f17c3abf7055ab3287b7765b2c24c02968360fe68a3f2071@group.calendar.google.com",
        color: "#2d3d4d",
      },
    ],
    []
  );

  const handleTokenError = useCallback(
    async (response) => {
      if (response.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(
              getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN),
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh: refreshToken }),
              }
            );

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              localStorage.setItem("accessToken", data.access);
              return true;
            }
          } catch (error) {
            console.error("Error refreshing token:", error);
          }
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        navigate("/login");
        return false;
      }
      return true;
    },
    [navigate]
  );

  const fetchAvailableSlots = useCallback(
    async (date) => {
      setSlotsLoading(true);
      setError(null);
      try {
        let allSlots = [];

        for (const stadium of stadiums) {
          try {
            console.log(
              `Fetching slots for ${stadium.name} with calendar ID: ${stadium.calendarId}`
            );

            const url =
              getApiUrl(API_CONFIG.ENDPOINTS.CALENDAR.AVAILABLE_SLOTS) +
              `?date=${format(
                date,
                "yyyy-MM-dd"
              )}&calendar_id=${encodeURIComponent(stadium.calendarId)}`;

            console.log("Fetching slots from URL:", url);

            const response = await fetch(url, {
              headers: getAuthHeaders(localStorage.getItem("accessToken")),
            });

            if (!(await handleTokenError(response))) continue;

            if (response.ok) {
              const data = await response.json();
              console.log(`Received data for ${stadium.name}:`, data);
              const stadiumSlots = data.slots || [];

              const slotsWithStadium = stadiumSlots.map((slot) => ({
                ...slot,
                stadiumId: stadium.id,
                stadiumName: stadium.name,
                color: stadium.color,
                calendarId: stadium.calendarId,
              }));

              console.log(
                `Processed slots for ${stadium.name}:`,
                slotsWithStadium
              );

              allSlots = [...allSlots, ...slotsWithStadium];
            } else {
              const errorText = await response.text();
              console.error(
                `Error fetching slots for ${stadium.name}:`,
                errorText
              );
            }
          } catch (error) {
            console.error(`Error fetching slots for ${stadium.name}:`, error);
          }
        }

        console.log("All slots before sorting:", allSlots);

        const now = new Date();
        const isToday =
          format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
        const currentTime = format(now, "HH:mm");

        const validSlots = allSlots
          .filter((slot) => {
            if (!slot || !slot.start || !slot.end) return false;
            if (isToday) {
              return slot.start > currentTime;
            }
            return true;
          })
          .sort((a, b) => {
            if (!a.start || !b.start) return 0;
            return a.start.localeCompare(b.start);
          });

        console.log("Final processed slots:", validSlots);
        setAvailableSlots(validSlots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setError("Failed to fetch available slots. Please try again later.");
      }
      setSlotsLoading(false);
    },
    [stadiums, handleTokenError]
  );

  const debouncedFetchSlots = useMemo(
    () =>
      debounce(async (date, fetchFunction) => {
        await fetchFunction(date);
      }, 300),
    []
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (selectedDate) {
      debouncedFetchSlots(selectedDate, fetchAvailableSlots);
    }
    return () => {
      debouncedFetchSlots.clear();
    };
  }, [selectedDate, debouncedFetchSlots, fetchAvailableSlots]);

  const scrollToSlots = useCallback(() => {
    if (slotsRef.current) {
      window.scrollTo({
        top: slotsRef.current.offsetTop - 100,
        behavior: "smooth",
      });
    }
  }, []);

  const handleBookingClick = useCallback((slot) => {
    setSelectedSlot(slot);
    setOpenBooking(true);
  }, []);

  const handleBookingConfirm = useCallback(async () => {
    if (confirmation !== "I CONFIRM") {
      setError("Please type 'I CONFIRM' exactly to proceed with the booking");
      return;
    }

    try {
      const checkResponse = await fetch(
        `${getApiUrl(
          API_CONFIG.ENDPOINTS.CALENDAR.AVAILABLE_SLOTS
        )}?date=${format(
          selectedDate,
          "yyyy-MM-dd"
        )}&calendar_id=${encodeURIComponent(selectedSlot.calendarId)}`,
        {
          headers: getAuthHeaders(localStorage.getItem("accessToken")),
        }
      );

      if (!(await handleTokenError(checkResponse))) return;

      if (checkResponse.ok) {
        const data = await checkResponse.json();
        const isStillAvailable = data.slots.some(
          (slot) => slot.event_id === selectedSlot.event_id && !slot.booked
        );

        if (!isStillAvailable) {
          setError(
            "Sorry, this slot has just been taken. Please choose another time slot."
          );
          setTimeout(() => {
            setOpenBooking(false);
            setConfirmation("");
            fetchAvailableSlots(selectedDate);
          }, 2000);
          return;
        }
      }

      const bookingData = {
        start_time: `${format(selectedDate, "yyyy-MM-dd")}T${
          selectedSlot.start
        }`,
        end_time: `${format(selectedDate, "yyyy-MM-dd")}T${selectedSlot.end}`,
        event_id: selectedSlot.event_id,
        calendar_id: selectedSlot.calendarId,
        stadium_name: selectedSlot.stadiumName,
        confirmation: confirmation,
      };

      console.log("Sending booking data:", bookingData);

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.CALENDAR.BOOK_SLOT),
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(localStorage.getItem("accessToken")),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      if (!(await handleTokenError(response))) return;

      if (response.ok) {
        const responseData = await response.json();
        console.log("Booking response:", responseData);
        fetchAvailableSlots(selectedDate);
        navigate("/profile");
      } else {
        const errorData = await response.json();
        console.error("Booking error:", errorData);
        setError(errorData.message || errorData.error || "Booking failed");
      }
    } catch (error) {
      console.error("Error during booking:", error);
      setError("Failed to connect to the server. Please try again later.");
    }
    setOpenBooking(false);
    setConfirmation("");
  }, [
    confirmation,
    selectedDate,
    selectedSlot,
    handleTokenError,
    fetchAvailableSlots,
    navigate,
  ]);

  const handleBookingCancel = useCallback(() => {
    setOpenBooking(false);
    setSelectedSlot(null);
    setConfirmation("");
    setError(null);
  }, []);

  const handleConfirmationChange = useCallback((e) => {
    setConfirmation(e.target.value);
    setError(null);
  }, []);

  const handleOpenDatePicker = useCallback(() => {
    setTempDate(selectedDate);
    setOpenDatePicker(true);
  }, [selectedDate]);

  const handleCloseDatePicker = useCallback(() => {
    setOpenDatePicker(false);
  }, []);

  const handleDateConfirm = useCallback(() => {
    if (tempDate && tempDate >= new Date().setHours(0, 0, 0, 0)) {
      setSelectedDate(tempDate);
      setOpenDatePicker(false);
      setTimeout(() => {
        scrollToSlots();
      }, 100);
    } else {
      setError("Please select a valid date");
    }
  }, [tempDate, scrollToSlots]);

  const getFilteredSlots = useMemo(() => {
    return stadiums.map((stadium) => ({
      ...stadium,
      slots: availableSlots.filter(
        (slot) => slot.calendarId === stadium.calendarId
      ),
    }));
  }, [availableSlots, stadiums]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", pb: 8 }}>
      <Header />

      {/* Hero Section */}
      <Box
        sx={{
          pt: 15,
          pb: 10,
          background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('/stadium-hero.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundAttachment: "fixed",
          color: "white",
          textAlign: "center",
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
            zIndex: 1,
          },
          "& > *": {
            position: "relative",
            zIndex: 2,
          },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              mb: 3,
              fontSize: { xs: "2.5rem", md: "3.75rem" },
              letterSpacing: "-0.5px",
            }}
          >
            Welcome to Tottenham Stadium
          </Typography>
          <Typography
            variant="h5"
            paragraph
            sx={{
              mb: 4,
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              fontWeight: 300,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              maxWidth: "800px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Experience world-class facilities and create unforgettable moments
            on our pristine pitch
          </Typography>
          <Box
            sx={{
              mt: 6,
              maxWidth: 400,
              mx: "auto",
              backgroundColor: "rgba(40, 40, 40, 0.6)",
              borderRadius: 3,
              p: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              value={format(selectedDate, "MMMM d, yyyy")}
              onClick={handleOpenDatePicker}
              InputProps={{
                disableUnderline: true,
                readOnly: true,
                endAdornment: (
                  <IconButton
                    onClick={handleOpenDatePicker}
                    sx={{ color: "#4a4a4a" }}
                  >
                    <CalendarTodayIcon />
                  </IconButton>
                ),
                sx: {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 2,
                  height: "48px",
                  transition: "all 0.2s ease-in-out",
                  padding: "0 12px",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                  },
                  "& input": {
                    color: "#1a1a1a",
                    fontWeight: 500,
                    fontSize: "1.1rem",
                    cursor: "pointer",
                  },
                },
              }}
            />
          </Box>

          {/* Date Picker Dialog */}
          <Dialog
            open={openDatePicker}
            onClose={handleCloseDatePicker}
            PaperProps={{
              sx: {
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "white",
                maxWidth: "100%",
                margin: { xs: 2, sm: 3 },
              },
            }}
          >
            <DialogContent sx={{ p: 0 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StaticDatePicker
                  displayStaticWrapperAs="desktop"
                  value={tempDate}
                  onChange={(newValue) => setTempDate(newValue)}
                  minDate={new Date()}
                  sx={{
                    width: "100%",
                    "& .MuiPickersDay-root": {
                      color: "#1a1a1a",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "#4a4a4a",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "#333333",
                        },
                      },
                    },
                    "& .MuiDayCalendar-weekDayLabel": {
                      color: "#4a4a4a",
                    },
                    "& .MuiPickersCalendarHeader-root": {
                      color: "#1a1a1a",
                    },
                    "& .MuiPickersArrowSwitcher-button": {
                      color: "#4a4a4a",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={handleCloseDatePicker}
                sx={{
                  color: "#4a4a4a",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDateConfirm}
                variant="contained"
                sx={{
                  bgcolor: "#4a4a4a",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "#333333",
                  },
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>

      {/* Available Slots Section */}
      <Box ref={slotsRef} sx={{ py: 6, bgcolor: "white", mb: 4 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              textAlign: "center",
              color: "#1a1a1a",
              fontWeight: 600,
              mb: 4,
            }}
          >
            Available Time Slots
          </Typography>

          {slotsLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center">
              {error}
            </Typography>
          ) : availableSlots.length === 0 ? (
            <Typography align="center" color="textSecondary">
              No available slots for the selected date.
            </Typography>
          ) : (
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {getFilteredSlots.map((stadium) => (
                <Grid item xs={12} md={4} key={stadium.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      height: "100%",
                      borderTop: `4px solid ${stadium.color}`,
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: stadium.color,
                        fontWeight: 600,
                        mb: 2,
                        textAlign: "center",
                      }}
                    >
                      {stadium.name}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      {stadium.slots.map((slot, index) => (
                        <Button
                          key={`${slot.event_id}-${index}`}
                          variant={slot.booked ? "outlined" : "contained"}
                          disabled={slot.booked}
                          fullWidth
                          onClick={() => handleBookingClick(slot)}
                          sx={{
                            mb: 1,
                            bgcolor: slot.booked
                              ? "transparent"
                              : alpha(stadium.color, 0.9),
                            color: slot.booked ? "text.secondary" : "white",
                            borderColor: slot.booked
                              ? "divider"
                              : "transparent",
                            "&:hover": {
                              bgcolor: slot.booked
                                ? "transparent"
                                : alpha(stadium.color, 1),
                              borderColor: slot.booked
                                ? "divider"
                                : "transparent",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">
                              {slot.start} - {slot.end}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {slot.booked ? "Booked" : "Available"}
                            </Typography>
                          </Box>
                        </Button>
                      ))}
                      {stadium.slots.length === 0 && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          align="center"
                          sx={{ mt: 2 }}
                        >
                          No available slots
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: "#e8e8e8", py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 6, color: "#1a1a1a" }}
          >
            Why Choose Us
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    height: "100%",
                    borderRadius: 3,
                    bgcolor: "white",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: "#2d4d2d",
                      mb: 2,
                      transform: "scale(1.2)",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#4a4a4a" }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, bgcolor: "#f5f5f5" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 6, color: "#1a1a1a" }}
          >
            What Our Customers Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    bgcolor: "white",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "#2d4d2d",
                          color: "white",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                          fontSize: "1.2rem",
                          fontWeight: 600,
                        }}
                      >
                        {testimonial.avatar}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#1a1a1a" }}
                      >
                        {testimonial.name}
                      </Typography>
                    </Box>
                    <Rating
                      value={testimonial.rating}
                      readOnly
                      sx={{ mb: 2 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#4a4a4a",
                        fontStyle: "italic",
                        lineHeight: 1.6,
                      }}
                    >
                      "{testimonial.comment}"
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Booking Confirmation Dialog */}
      <Dialog
        open={openBooking}
        onClose={handleBookingCancel}
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
          Confirm Booking
        </DialogTitle>
        <Divider sx={{ bgcolor: "rgba(0,0,0,0.1)" }} />
        <DialogContent>
          <Typography
            gutterBottom
            sx={{
              fontSize: "1.1rem",
              mb: 3,
              color: "#1a1a1a",
            }}
          >
            Are you sure you want to book {selectedSlot?.stadiumName} for{" "}
            <Box
              component="span"
              sx={{ fontWeight: 600, color: selectedSlot?.color }}
            >
              {selectedSlot &&
                format(
                  new Date(`2000-01-01T${selectedSlot.start}`),
                  "h:mm a"
                )}{" "}
              to{" "}
              {selectedSlot &&
                format(new Date(`2000-01-01T${selectedSlot.end}`), "h:mm a")}
            </Box>{" "}
            on{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {format(selectedDate, "MMMM d, yyyy")}
            </Box>
            ?
          </Typography>

          <Box
            sx={{
              bgcolor: alpha("#2d4d2d", 0.1),
              p: 2,
              borderRadius: 2,
              mb: 3,
              border: "1px solid",
              borderColor: alpha("#2d4d2d", 0.2),
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#2d4d2d",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              📞 You will receive a confirmation call from our team shortly
              after booking to confirm your reservation.
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ mb: 2, fontWeight: 500, color: "#4a4a4a" }}
          >
            To confirm this booking, please type "I CONFIRM" in the field below:
          </Typography>
          <TextField
            fullWidth
            value={confirmation}
            onChange={handleConfirmationChange}
            onPaste={(e) => {
              e.preventDefault();
              setError("Please type the confirmation text - do not paste");
            }}
            placeholder="Type 'I CONFIRM'"
            error={error !== null}
            helperText={error}
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                borderColor: "#2d4d2d",
                "&:hover": {
                  borderColor: "#2d4d2d",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleBookingCancel}
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
            Cancel
          </Button>
          <Button
            onClick={handleBookingConfirm}
            variant="contained"
            disabled={confirmation !== "I CONFIRM"}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              bgcolor: "#2d4d2d",
              "&:hover": {
                bgcolor: "#1a331a",
              },
              "&:disabled": {
                bgcolor: "#4a4a4a",
              },
            }}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Section */}
      <Box
        sx={{
          bgcolor: "#e8e8e8", // Matching the Why Choose Us section
          py: 8,
          mt: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            sx={{
              color: "#1a1a1a",
              fontWeight: 700,
              mb: 6,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Contact Information
          </Typography>
          <Grid container spacing={4} alignItems="center">
            {/* Logo and Company Info */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: "center",
                  mb: { xs: 3, md: 0 },
                  p: 3,
                }}
              >
                <img
                  src={require("./logo.png")}
                  alt="Stadium Logo"
                  style={{ height: "80px", marginBottom: "1rem" }}
                />
                <Typography
                  variant="h6"
                  sx={{ color: "#4a4a4a", fontWeight: 600, mb: 1 }}
                >
                  Tottenham Stadium
                </Typography>
              </Box>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#4a4a4a", fontWeight: 600, mb: 2 }}
                >
                  Contact Us
                </Typography>
                <Link
                  href="tel:+21600000000"
                  sx={{
                    color: "#4a4a4a",
                    textDecoration: "none",
                    display: "block",
                    mb: 1,
                    "&:hover": {
                      color: "#2d4d2d",
                      textDecoration: "underline",
                    },
                  }}
                >
                  <Typography variant="body1">
                    Phone: +216 XX XXX XXX
                  </Typography>
                </Link>
                <Link
                  href="mailto:contact@tottenhamstadium.com"
                  sx={{
                    color: "#4a4a4a",
                    textDecoration: "none",
                    display: "block",
                    mb: 1,
                    "&:hover": {
                      color: "#2d4d2d",
                      textDecoration: "underline",
                    },
                  }}
                >
                  <Typography variant="body1">
                    Email: contact@tottenhamstadium.com
                  </Typography>
                </Link>
                <Link
                  href="https://maps.google.com/?q=Tunis,Tunisia"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#4a4a4a",
                    textDecoration: "none",
                    "&:hover": {
                      color: "#2d4d2d",
                      textDecoration: "underline",
                    },
                  }}
                >
                  <Typography variant="body1">
                    Address: Tunis, Tunisia
                  </Typography>
                </Link>
              </Box>
            </Grid>

            {/* Social Media Links */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#4a4a4a", fontWeight: 600, mb: 2 }}
                >
                  Follow Us
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <IconButton
                    href="https://facebook.com"
                    target="_blank"
                    sx={{
                      color: "#4a4a4a",
                      "&:hover": { color: "#1877f2" },
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                  <IconButton
                    href="https://instagram.com"
                    target="_blank"
                    sx={{
                      color: "#4a4a4a",
                      "&:hover": { color: "#e4405f" },
                    }}
                  >
                    <InstagramIcon />
                  </IconButton>
                  <IconButton
                    href="https://twitter.com"
                    target="_blank"
                    sx={{
                      color: "#4a4a4a",
                      "&:hover": { color: "#1da1f2" },
                    }}
                  >
                    <TwitterIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
