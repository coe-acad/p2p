import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VoiceNarrationProps {
  content: string;
  className?: string;
  autoPlay?: boolean;
  storageKey?: string;
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
  storageKey = "samai_narration_played"
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
        localStorage.setItem(storageKey, 'true');
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
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

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
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div 
      className={`relative flex items-center gap-1.5 p-2 rounded-xl transition-all duration-500 ${
        showAttention || isSpeaking 
          ? 'bg-primary/10 border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' 
          : 'bg-secondary/50'
      } ${className}`}
    >
      {/* Pulsing ring when attention needed */}
      {showAttention && (
        <div className="absolute inset-0 rounded-xl border-2 border-primary/50 animate-[pulse_1.5s_ease-in-out_infinite]" />
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-0.5 mr-1">
          <div className="w-1 h-3 bg-primary rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" />
          <div className="w-1 h-4 bg-primary rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.1s]" />
          <div className="w-1 h-2 bg-primary rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s]" />
        </div>
      )}

      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 hover:bg-background text-2xs text-muted-foreground hover:text-foreground transition-colors border border-border/50">
            <Globe size={10} />
            <span>{selectedLang.flag} {selectedLang.name}</span>
            <ChevronDown size={10} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px]">
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang)}
              className={`text-xs cursor-pointer ${selectedLang.code === lang.code ? 'bg-primary/10' : ''}`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Play/Stop Button */}
      <button
        onClick={handleSpeak}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          isSpeaking 
            ? 'bg-primary text-primary-foreground' 
            : showAttention
              ? 'bg-primary text-primary-foreground animate-[pulse_1.5s_ease-in-out_infinite]'
              : 'bg-primary/15 text-primary hover:bg-primary/25'
        }`}
        title={isSpeaking ? "Stop narration" : "Listen to explanation"}
      >
        {isSpeaking ? (
          <>
            <VolumeX size={14} />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 size={14} className={showAttention ? "animate-bounce" : ""} />
            <span>{showAttention ? "Listening..." : "Listen"}</span>
          </>
        )}
      </button>

      {/* Helper text on first visit */}
      {showAttention && (
        <span className="text-2xs text-primary font-medium animate-fade-in">
          Samai is explaining...
        </span>
      )}
    </div>
  );
};

export default VoiceNarration;
