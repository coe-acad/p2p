import { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, Menu, MenuItem, Typography, Box } from "@mui/material";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
];

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || "en");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLang(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem("preferredLanguage", langCode);
    handleClose();
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];

  return (
    <>
      <Button
        onClick={handleClick}
        size="small"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 1,
          py: 0.5,
          borderRadius: "20px",
          bgcolor: "rgba(245, 158, 11, 0.05)",
          color: "text.primary",
          textTransform: "none",
          fontSize: "0.75rem",
          "&:hover": {
            bgcolor: "rgba(245, 158, 11, 0.1)",
          },
        }}
      >
        <Globe size={12} style={{ color: "inherit" }} />
        <span>{currentLang.name}</span>
        <ChevronDown size={10} />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: 176,
              maxHeight: 256,
              bgcolor: "background.paper",
            },
          },
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            sx={{
              py: 1,
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                {lang.nativeName}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                ({lang.name})
              </Typography>
            </Box>
            {selectedLang === lang.code && (
              <Check size={12} style={{ color: "inherit" }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageToggle;
