import { createTheme } from "@mui/material/styles";

const primaryColor = "#1a9e7a"; // teal
const secondaryColor = "#f59e0b"; // amber
const backgroundColor = "#f8f9fa";
const surfaceColor = "#ffffff";
const borderColor = "#e5e7eb";
const textPrimary = "#111827";
const textSecondary = "#6b7280";

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: "#2fb88a",
      dark: "#0d8a6a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: secondaryColor,
      light: "#fbbf24",
      dark: "#d97706",
      contrastText: "#ffffff",
    },
    background: {
      default: backgroundColor,
      paper: surfaceColor,
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
    },
    divider: borderColor,
    action: {
      disabled: "#d1d5db",
      disabledBackground: "#f3f4f6",
    },
    success: {
      main: "#10b981",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
    info: {
      main: "#3b82f6",
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: surfaceColor,
          color: textPrimary,
          boxShadow: "none",
          borderBottom: `1px solid ${borderColor}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: surfaceColor,
          border: `1px solid ${borderColor}`,
          boxShadow: "none",
          borderRadius: "12px",

          "&:hover": {
            borderColor: "#d1d5db",
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px",
          "&:last-child": {
            paddingBottom: "16px",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: borderColor,
          color: textPrimary,
          "&:hover": {
            backgroundColor: backgroundColor,
            borderColor: borderColor,
          },
        },
        text: {
          color: primaryColor,
          "&:hover": {
            backgroundColor: "rgba(26, 158, 122, 0.04)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: backgroundColor,
            border: "none",
            "& fieldset": {
              borderColor: borderColor,
            },
            "&:hover fieldset": {
              borderColor: "#c4b5fd",
            },
            "&.Mui-focused fieldset": {
              borderColor: primaryColor,
            },
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: surfaceColor,
          borderTop: `1px solid ${borderColor}`,
          boxShadow: "none",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: textSecondary,
          "&.Mui-selected": {
            color: primaryColor,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: surfaceColor,
          borderRight: `1px solid ${borderColor}`,
          boxShadow: "none",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: borderColor,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
        outlined: {
          borderColor: borderColor,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "16px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: backgroundColor,
          borderRadius: "4px",
          height: "8px",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          border: `1px solid`,
        },
        standardInfo: {
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderColor: "rgba(59, 130, 246, 0.2)",
          color: "#1e3a8a",
        },
        standardWarning: {
          backgroundColor: "rgba(245, 158, 11, 0.05)",
          borderColor: "rgba(245, 158, 11, 0.2)",
          color: "#92400e",
        },
        standardError: {
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          borderColor: "rgba(239, 68, 68, 0.2)",
          color: "#7f1d1d",
        },
        standardSuccess: {
          backgroundColor: "rgba(16, 185, 129, 0.05)",
          borderColor: "rgba(16, 185, 129, 0.2)",
          color: "#065f46",
        },
      },
    },
  },
});
