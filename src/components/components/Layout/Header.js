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
import { useNavigate } from "react-router-dom";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "#2d4d2d",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}
    >
      <Toolbar>
        {/* Logo and Brand */}
        <SportsSoccerIcon
          sx={{
            display: "flex",
            mr: 1,
            fontSize: 28,
            color: alpha("#fff", 0.9),
          }}
        />
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            mr: 2,
            display: "flex",
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: alpha("#fff", 0.9),
            textDecoration: "none",
            cursor: "pointer",
            fontSize: "1.25rem",
            "&:hover": {
              color: "#fff",
            },
          }}
          onClick={() => navigate("/home")}
        >
          STADIUM
        </Typography>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* User Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body1"
            sx={{
              display: { xs: "none", sm: "block" },
              color: alpha("#fff", 0.9),
              fontWeight: 500,
            }}
          >
            {user.first_name} {user.last_name}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{
              color: alpha("#fff", 0.9),
              "&:hover": {
                bgcolor: alpha("#fff", 0.1),
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
            PaperProps={{
              sx: {
                mt: 1,
                bgcolor: "#f5f5f5",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                "& .MuiMenuItem-root": {
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  py: 1,
                  px: 2,
                  "&:hover": {
                    bgcolor: alpha("#2d4d2d", 0.1),
                  },
                },
              },
            }}
          >
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
