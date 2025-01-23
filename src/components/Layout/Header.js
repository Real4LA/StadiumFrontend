import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  alpha,
} from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ setCurrentSection, currentSection }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    setCurrentSection("login");
  };

  const handleProfile = () => {
    handleClose();
    setCurrentSection("profile");
  };

  const handleLogoClick = () => {
    setCurrentSection("home");
  };

  const isAuthPage =
    currentSection === "login" ||
    currentSection === "signup" ||
    currentSection === "verify";

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleLogoClick}
          sx={{ color: "#2d4d2d" }}
        >
          <SportsSoccerIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            color: "#1a1a1a",
            fontWeight: 700,
            cursor: "pointer",
          }}
          onClick={handleLogoClick}
        >
          Stadium
        </Typography>

        {isAuthenticated && !isAuthPage && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              sx={{
                mr: 2,
                color: "#4a4a4a",
                fontWeight: 500,
              }}
            >
              {user?.first_name} {user?.last_name}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{
                color: "#2d4d2d",
                "&:hover": {
                  bgcolor: alpha("#2d4d2d", 0.1),
                },
              }}
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}

        {!isAuthenticated && !isAuthPage && (
          <Box>
            <Button
              onClick={() => setCurrentSection("login")}
              sx={{
                color: "#2d4d2d",
                textTransform: "none",
                fontWeight: 500,
                mr: 2,
              }}
            >
              Login
            </Button>
            <Button
              onClick={() => setCurrentSection("signup")}
              variant="contained"
              sx={{
                bgcolor: "#2d4d2d",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "#1a331a",
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
