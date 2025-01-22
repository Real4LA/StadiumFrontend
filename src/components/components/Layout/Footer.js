import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: "center",
        py: 1,
        bgcolor: "rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "rgba(255, 255, 255, 0.8)",
          fontWeight: 500,
          fontSize: "0.75rem",
        }}
      >
        © {new Date().getFullYear()} All Rights Reserved | 4LA IT Solutions
      </Typography>
    </Box>
  );
};

export default Footer;
