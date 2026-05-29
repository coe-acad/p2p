import { createTheme } from "@mui/material/styles";

const primaryColor = "#f59e0b"; // amber (primary)
const secondaryColor = "#1a9e7a"; // teal (secondary)
const backgroundColor = "#fef9f5"; // warm beige/cream background
const surfaceColor = "#fffcf9"; // warm white surface
const borderColor = "#f5ddc8"; // warm border
const textPrimary = "#2d2520"; // warm dark
const textSecondary = "#8b7d70"; // warm gray

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
      main: "#f59e0b",
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
    borderRadius: 16,
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
          boxShadow: "0 8px 16px rgba(245, 158, 11, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)",
          borderRadius: "16px",
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          "&:hover": {
            boxShadow: "0 12px 24px rgba(245, 158, 11, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)",
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
          "&:last-child": {
            paddingBottom: "12px",
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
          transition: "box-shadow 0.3s ease, background-color 0.3s ease",
        },
        contained: {
          backgroundColor: primaryColor,
          color: "#ffffff",
          boxShadow: "0 6px 16px rgba(245, 158, 11, 0.2), 0 2px 4px rgba(0, 0, 0, 0.08)",
          border: "none",
          "&:hover": {
            backgroundColor: "#d97706",
            boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3), 0 4px 8px rgba(0, 0, 0, 0.12)",
          },
          "&:active": {
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.08)",
          },
        },
        outlined: {
          borderColor: "transparent",
          color: primaryColor,
          backgroundColor: "rgba(245, 158, 11, 0.08)",
          boxShadow: "0 2px 8px rgba(245, 158, 11, 0.08)",
          "&:hover": {
            backgroundColor: "rgba(245, 158, 11, 0.12)",
            borderColor: "transparent",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.12)",
          },
        },
        text: {
          color: primaryColor,
          "&:hover": {
            backgroundColor: "rgba(245, 158, 11, 0.08)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          transition: "background-color 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(245, 158, 11, 0.08)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: backgroundColor,
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
            transition: "box-shadow 0.3s ease, border-color 0.3s ease",
            "& fieldset": {
              borderColor: "transparent",
            },
            "&:hover fieldset": {
              borderColor: "transparent",
            },
            "&.Mui-focused": {
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05), 0 0 0 3px rgba(245, 158, 11, 0.1)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "transparent",
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
          boxShadow: "4px 0 16px rgba(245, 158, 11, 0.06), 2px 0 4px rgba(0, 0, 0, 0.04)",
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
          borderColor: "transparent",
          color: primaryColor,
          bgcolor: "rgba(245, 158, 11, 0.08)",
        },
        filled: {
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          color: primaryColor,
          border: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          backgroundColor: surfaceColor,
          boxShadow:
            "0 16px 32px rgba(245, 158, 11, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06)",
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
          backgroundColor: primaryColor,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          border: "none",
        },
        standardInfo: {
          backgroundColor: "rgba(245, 158, 11, 0.05)",
          color: primaryColor,
        },
        standardWarning: {
          backgroundColor: "rgba(245, 158, 11, 0.08)",
          color: primaryColor,
        },
        standardError: {
          backgroundColor: "rgba(245, 158, 11, 0.08)",
          color: primaryColor,
        },
        standardSuccess: {
          backgroundColor: "rgba(26, 158, 122, 0.05)",
          color: secondaryColor,
        },
      },
    },
  },
});
