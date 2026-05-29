import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, Globe, ChevronDown } from "lucide-react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";

interface VoiceNarrationProps {
  content: string;
  className?: string;
  autoPlay?: boolean;
  storageKey?: string;
  onSpeechComplete?: () => void;
}

const LANGUAGES = [
  { code: "hi-IN", name: "हिंदी", flag: "🇮🇳" },
  { code: "en-IN", name: "English", flag: "🇮🇳" },
  { code: "ta-IN", name: "தமிழ்", flag: "🇮🇳" },
  { code: "te-IN", name: "తెలుగు", flag: "🇮🇳" },
  { code: "kn-IN", name: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "mr-IN", name: "मराठी", flag: "🇮🇳" },
  { code: "bn-IN", name: "বাংলা", flag: "🇮🇳" },
  { code: "gu-IN", name: "ગુજરાતી", flag: "🇮🇳" },
];

const VoiceNarration = ({ 
  content, 
  className = "", 
  autoPlay = false,
  storageKey = "samai_narration_played",
  onSpeechComplete
}: VoiceNarrationProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]); // Hindi default
  const [isSupported, setIsSupported] = useState(true);
  const [showAttention, setShowAttention] = useState(false);
  const hasAutoPlayed = useRef(false);
  const voicesLoaded = useRef(false);

  useEffect(() => {
    // Check if Web Speech API is supported
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    // Load voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoaded.current = true;
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Auto-play on first visit
  useEffect(() => {
    if (!autoPlay || !isSupported || hasAutoPlayed.current) return;

    const hasPlayed = localStorage.getItem(storageKey);
    if (hasPlayed) return;

    // Show attention animation first
    setShowAttention(true);

    // Wait for voices to load and a brief delay for user to see the UI
    const timer = setTimeout(() => {
      if (!hasAutoPlayed.current) {
        hasAutoPlayed.current = true;
        startSpeaking();
        // Note: localStorage is set in onSpeechComplete callback, not here
        // This ensures we track when narration actually completes
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [autoPlay, isSupported, storageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startSpeaking = useCallback(() => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = selectedLang.code;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang === selectedLang.code || v.lang.startsWith(selectedLang.code.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setShowAttention(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      // Mark narration as played only after it completes
      localStorage.setItem(storageKey, 'true');
      onSpeechComplete?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      // Also mark as played on error to prevent infinite retry
      localStorage.setItem(storageKey, 'true');
      onSpeechComplete?.();
    };

    window.speechSynthesis.speak(utterance);
  }, [content, selectedLang]);

  const handleSpeak = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    startSpeaking();
  }, [isSpeaking, startSpeaking]);

  const handleLanguageChange = (lang: typeof LANGUAGES[0]) => {
    setSelectedLang(lang);
    // If currently speaking, restart with new language
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      // Small delay then restart
      setTimeout(() => startSpeaking(), 100);
    }
    handleLangMenuClose();
  };

  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);

  const handleLangMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1,
        borderRadius: 2,
        transition: "all 0.5s ease",
        bgcolor: showAttention || isSpeaking
          ? "rgba(245, 158, 11, 0.1)"
          : "rgba(26, 158, 122, 0.05)",
        border: showAttention || isSpeaking ? "1px solid" : "none",
        borderColor: showAttention || isSpeaking ? "primary.main" : "transparent",
        boxShadow: showAttention || isSpeaking ? "0 0 20px rgba(245, 158, 11, 0.2)" : "none",
        ...(!className ? {} : { className }),
      }}
    >
      {/* Speaking indicator */}
      {isSpeaking && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 0.5 }}>
          <Box sx={{ width: 4, height: 12, bgcolor: "primary.main", borderRadius: "50%", animation: "pulse 0.5s ease-in-out infinite" }} />
          <Box sx={{ width: 4, height: 16, bgcolor: "primary.main", borderRadius: "50%", animation: "pulse 0.5s ease-in-out 0.1s infinite" }} />
          <Box sx={{ width: 4, height: 8, bgcolor: "primary.main", borderRadius: "50%", animation: "pulse 0.5s ease-in-out 0.2s infinite" }} />
        </Box>
      )}

      {/* Language Selector */}
      <Button
        onClick={handleLangMenuClick}
        size="small"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: "20px",
          bgcolor: "rgba(0, 0, 0, 0.05)",
          color: "text.secondary",
          fontSize: "0.75rem",
          textTransform: "none",
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <Globe size={10} />
        <span>{selectedLang.flag} {selectedLang.name}</span>
        <ChevronDown size={10} />
      </Button>

      <Menu
        anchorEl={langAnchorEl}
        open={Boolean(langAnchorEl)}
        onClose={handleLangMenuClose}
        slotProps={{
          paper: {
            sx: {
              minWidth: 140,
              bgcolor: "background.paper",
            },
          },
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            sx={{
              py: 0.75,
              bgcolor: selectedLang.code === lang.code ? "rgba(245, 158, 11, 0.1)" : "transparent",
            }}
          >
            <span style={{ marginRight: 8 }}>{lang.flag}</span>
            <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
              {lang.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Play/Stop Button */}
      <Button
        onClick={handleSpeak}
        size="small"
        variant={isSpeaking || showAttention ? "contained" : "outlined"}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.5,
          py: 0.75,
          borderRadius: "20px",
          fontSize: "0.75rem",
          textTransform: "none",
          fontWeight: 600,
          transition: "all 0.3s ease",
          bgcolor: showAttention && !isSpeaking ? "primary.main" : undefined,
          animation: showAttention && !isSpeaking ? "pulse 1.5s ease-in-out infinite" : "none",
        }}
        title={isSpeaking ? "Stop narration" : "Listen to explanation"}
      >
        {isSpeaking ? (
          <>
            <VolumeX size={14} />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 size={14} sx={{ animation: showAttention ? "bounce 1s infinite" : "none" }} />
            <span>{showAttention ? "Listening..." : "Listen"}</span>
          </>
        )}
      </Button>

      {/* Helper text on first visit */}
      {showAttention && (
        <Typography variant="caption" sx={{ fontSize: "0.65rem", fontWeight: 600, color: "primary.main" }}>
          Samai is explaining...
        </Typography>
      )}
    </Box>
  );
};

export default VoiceNarration;
