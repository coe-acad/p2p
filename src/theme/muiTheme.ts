import { createTheme } from "@mui/material/styles";

const primaryColor = "#f59e0b"; // amber
const secondaryColor = "#1a9e7a"; // teal
const backgroundColor = "#fafbfc";
const surfaceColor = "#ffffff";
const borderColor = "#e5e7eb";
const textPrimary = "#111827";
const textSecondary = "#6b7280";

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: "#fbbf24",
      dark: "#d97706",
      contrastText: "#ffffff",
    },
    secondary: {
      main: secondaryColor,
      light: "#2fb88a",
      dark: "#0d8a6a",
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
      hover: "rgba(0, 0, 0, 0.04)",
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
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: surfaceColor,
          border: "none",
          boxShadow: "0 1px 3px rgba(26, 158, 122, 0.08)",
          borderRadius: "12px",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 16px rgba(26, 158, 122, 0.15)",
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "20px",
          "&:last-child": {
            paddingBottom: "20px",
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
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0d8a6a 100%)`,
          boxShadow: "0 4px 12px rgba(26, 158, 122, 0.25)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(26, 158, 122, 0.35)",
          },
        },
        outlined: {
          borderColor: primaryColor,
          color: primaryColor,
          "&:hover": {
            backgroundColor: "rgba(26, 158, 122, 0.06)",
            borderColor: primaryColor,
          },
        },
        text: {
          color: primaryColor,
          "&:hover": {
            backgroundColor: "rgba(26, 158, 122, 0.08)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: backgroundColor,
            transition: "all 0.2s ease",
            "& fieldset": {
              borderColor: borderColor,
            },
            "&:hover fieldset": {
              borderColor: primaryColor,
            },
            "&.Mui-focused fieldset": {
              borderColor: primaryColor,
              boxShadow: `0 0 0 3px rgba(26, 158, 122, 0.1)`,
            },
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: surfaceColor,
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: textSecondary,
          transition: "all 0.2s ease",
          "&.Mui-selected": {
            color: primaryColor,
          },
          "&:hover": {
            backgroundColor: "rgba(26, 158, 122, 0.05)",
            color: primaryColor,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: surfaceColor,
          borderRight: "none",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(0, 0, 0, 0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 500,
        },
        outlined: {
          borderColor: primaryColor,
          color: primaryColor,
        },
        filled: {
          backgroundColor: "rgba(26, 158, 122, 0.1)",
          color: primaryColor,
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
          height: "6px",
        },
        bar: {
          borderRadius: "4px",
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
