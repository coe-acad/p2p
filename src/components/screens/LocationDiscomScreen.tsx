import { useState, useEffect, useRef } from "react";
import { MapPin, Upload, HelpCircle, Check, X, ChevronDown, AlertTriangle, ChevronLeft, Loader2, Navigation, Sun, Sparkles } from "lucide-react";
import SamaiLogo from "../SamaiLogo";
import { useUserData } from "@/hooks/useUserData";

interface LocationDiscomScreenProps {
  onContinue: (isVerified: boolean, locationData?: { address: string; city: string; discom: string }) => void;
  onBack: () => void;
}

interface AddressSuggestion {
  display_name: string;
  place_id: number;
  address?: {
    state?: string;
  };
}

interface ReverseGeocodeResult {
  display_name: string;
  address?: {
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    road?: string;
    house_number?: string;
  };
}

const DISCOMS = [
  { state: "Maharashtra", name: "MSEDCL", fullName: "Maharashtra State Electricity Distribution Co. Ltd" },
  { state: "Delhi", name: "TPDDL", fullName: "Tata Power Delhi Distribution Limited" },
  { state: "Delhi", name: "BSES Rajdhani", fullName: "BSES Rajdhani Power Limited" },
  { state: "Karnataka", name: "BESCOM", fullName: "Bangalore Electricity Supply Company" },
  { state: "Tamil Nadu", name: "TANGEDCO", fullName: "Tamil Nadu Generation and Distribution Corporation" },
  { state: "Gujarat", name: "UGVCL", fullName: "Uttar Gujarat Vij Company Limited" },
  { state: "Rajasthan", name: "JVVNL", fullName: "Jaipur Vidyut Vitran Nigam Limited" },
  { state: "Andhra Pradesh", name: "APSPDCL", fullName: "AP Southern Power Distribution Company" },
  { state: "Telangana", name: "TSSPDCL", fullName: "Telangana Southern Power Distribution" },
  { state: "Kerala", name: "KSEB", fullName: "Kerala State Electricity Board" },
  { state: "West Bengal", name: "WBSEDCL", fullName: "West Bengal State Electricity Distribution" },
  { state: "Uttar Pradesh", name: "UPPCL", fullName: "Uttar Pradesh Power Corporation" },
];

const LocationDiscomScreen = ({ onContinue, onBack }: LocationDiscomScreenProps) => {
  const { userData, setUserData } = useUserData();
  const [location, setLocation] = useState(userData.address || "");
  const [selectedDiscom, setSelectedDiscom] = useState<typeof DISCOMS[0] | null>(
    userData.discom ? DISCOMS.find(d => d.name === userData.discom) || null : null
  );
  const [city, setCity] = useState(userData.city || "");
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Address autocomplete state
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFormValid = location.trim() !== "" && selectedDiscom !== null;

  // Auto-select DISCOM based on state
  const autoSelectDiscom = (stateName: string) => {
    const normalizedState = stateName.toLowerCase().trim();
    const matchingDiscom = DISCOMS.find(d => 
      d.state.toLowerCase() === normalizedState ||
      normalizedState.includes(d.state.toLowerCase()) ||
      d.state.toLowerCase().includes(normalizedState)
    );
    if (matchingDiscom) {
      setSelectedDiscom(matchingDiscom);
    }
  };

  // Fetch current location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept': 'application/json',
              }
            }
          );
          
          const data: ReverseGeocodeResult = await response.json();
          
          if (data.display_name) {
            // Create a shorter, readable address
            const addr = data.address;
            const shortAddress = [
              addr?.house_number,
              addr?.road,
              addr?.suburb || addr?.village || addr?.town || addr?.city,
              addr?.state
            ].filter(Boolean).join(", ");
            
            const cityName = addr?.suburb || addr?.village || addr?.town || addr?.city || "";
            const stateName = addr?.state || "";
            
            setLocation(shortAddress || data.display_name);
            setCity(`${cityName}${cityName && stateName ? ", " : ""}${stateName}`);
            
            // Auto-select DISCOM based on state
            if (addr?.state) {
              autoSelectDiscom(addr.state);
            }
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setLocationError("Could not fetch address");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable");
            break;
          default:
            setLocationError("Could not detect location");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fetch address suggestions from OpenStreetMap Nominatim
  const fetchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setLocationError(null);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setLocation(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsEditing(false);
    
    // Auto-select DISCOM based on state from suggestion
    if (suggestion.address?.state) {
      autoSelectDiscom(suggestion.address.state);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Check if at least one file is uploaded for verification
  useEffect(() => {
    setIsVerified(uploadedFiles.length >= 1);
  }, [uploadedFiles]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="screen-container !py-4 relative overflow-hidden">
      {/* Background gradient effects - Vibrant & Warm */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top warm sunlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-orange-300/30 via-amber-200/15 to-transparent rounded-full blur-3xl" />
        
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_4s_ease-in-out_infinite]" />
        
        {/* Colorful accent orbs */}
        <div className="absolute top-1/3 -left-20 w-[200px] h-[200px] bg-gradient-to-br from-orange-400/15 to-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/2 -right-16 w-[180px] h-[180px] bg-gradient-to-bl from-teal-400/12 to-green-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
        
        {/* Decorative icons */}
        <div className="absolute top-14 right-6 text-orange-400/15">
          <Sun size={32} className="animate-[pulse_6s_ease-in-out_infinite]" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-24 left-8 w-1.5 h-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] shadow-lg shadow-orange-400/30" />
        <div className="absolute bottom-32 right-12 w-1.5 h-1.5 bg-gradient-to-br from-teal-400 to-green-500 rounded-full animate-[pulse_3s_ease-in-out_infinite] shadow-lg shadow-teal-400/30" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md flex flex-col h-full px-4 relative z-10">
        {/* Header with Back Button and Logo */}
        <div className="animate-slide-up mb-3">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <SamaiLogo size="sm" showText={false} />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-2xs text-muted-foreground">Step 1 of 3</span>
              <div className="flex gap-1">
                <div className="w-5 h-1 rounded-full bg-gradient-to-r from-orange-400 to-amber-500" />
                <div className="w-5 h-1 rounded-full bg-muted" />
                <div className="w-5 h-1 rounded-full bg-muted" />
              </div>
            </div>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 mb-2">
              <MapPin className="text-primary" size={18} />
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Confirm your electricity connection
            </h2>
          </div>
        </div>

        {/* Combined Location & DISCOM Card */}
        <div className="bg-card rounded-xl border border-primary/20 p-2.5 shadow-card animate-slide-up relative z-30 mb-3 overflow-hidden" style={{ animationDelay: "0.1s" }}>
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/30 pointer-events-none" />
          {/* Location Row */}
          <div className="pb-2.5 border-b border-border/50 relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <MapPin className="text-white" size={12} />
                </div>
                <span className="text-xs font-medium text-foreground">Location</span>
                {isDetectingLocation && (
                  <span className="text-2xs text-muted-foreground flex items-center gap-1">
                    <Loader2 size={9} className="animate-spin" /> Detecting...
                  </span>
                )}
              </div>
              <button
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="text-2xs text-primary flex items-center gap-1 disabled:opacity-50 font-medium hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
              >
                <Navigation size={10} />
                Detect
              </button>
            </div>
            
            <div className="relative" ref={inputRef}>
              <input
                type="text"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => setIsEditing(true)}
                placeholder={isDetectingLocation ? "Detecting your location..." : "Search your address..."}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              
              {isLoadingSuggestions && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <Loader2 size={12} className="animate-spin text-muted-foreground" />
                </div>
              )}
              
              {/* Address Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-36 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full px-2.5 py-1.5 text-left hover:bg-secondary transition-colors text-2xs text-foreground truncate"
                    >
                      {suggestion.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {locationError && (
              <p className="text-2xs text-destructive mt-1">{locationError}</p>
            )}
          </div>
          
          {/* DISCOM Selector */}
          <div className="pt-2.5 relative z-[100]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs text-muted-foreground">Your DISCOM</label>
              {selectedDiscom && (
                <span className="text-2xs text-accent font-medium">Auto-detected</span>
              )}
            </div>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-input bg-background text-left hover:border-primary/40 transition-colors"
            >
              <span className={`text-xs ${selectedDiscom ? "font-medium text-foreground" : "text-muted-foreground"} truncate`}>
                {selectedDiscom?.name || "Select your DISCOM"}
              </span>
              <ChevronDown className={`text-muted-foreground transition-transform flex-shrink-0 ${showDropdown ? "rotate-180" : ""}`} size={14} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card border border-border rounded-xl shadow-xl z-[200] max-h-48 overflow-y-auto">
                {DISCOMS.map((discom, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDiscom(discom);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-primary/5 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      selectedDiscom?.name === discom.name ? "bg-primary/10 border-l-2 border-primary" : ""
                    }`}
                  >
                    <p className="text-xs font-medium text-foreground">{discom.name}</p>
                    <p className="text-2xs text-muted-foreground">{discom.state}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* VC Upload Section - Simplified */}
        <div className="space-y-2 animate-slide-up z-10" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-foreground">Upload DISCOM Documents</span>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-2xs text-primary hover:underline flex items-center gap-0.5 flex-shrink-0"
            >
              <HelpCircle size={9} />
              Help
            </button>
          </div>

          {/* Single Upload Button */}
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all bg-card">
            <Upload className="text-primary mb-1.5" size={20} />
            <span className="text-xs font-medium text-foreground">Tap to upload files</span>
            <span className="text-2xs text-muted-foreground mt-0.5">Connection, Consumer, or Generation VCs</span>
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png" 
              multiple 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-1.5">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between px-2.5 py-2 bg-accent/8 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Check className="text-accent flex-shrink-0" size={12} />
                    <span className="text-2xs text-foreground truncate">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(index)} className="p-1 hover:bg-destructive/10 rounded transition-colors">
                    <X size={12} className="text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 pb-6 space-y-1.5 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={() => {
              // Save location data
              setUserData({ 
                address: location, 
                city: city,
                discom: selectedDiscom?.name || "" 
              });
              onContinue(isVerified, { address: location, city, discom: selectedDiscom?.name || "" });
            }}
            disabled={!isFormValid || !isVerified}
            className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          
          {!isVerified && isFormValid && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setUserData({ 
                    address: location, 
                    city: city,
                    discom: selectedDiscom?.name || "" 
                  });
                  onContinue(false, { address: location, city, discom: selectedDiscom?.name || "" });
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 py-1.5"
              >
                <AlertTriangle size={10} />
                Skip for now
              </button>
              
              {/* TODO: Remove this dummy button before production */}
              <span className="text-muted-foreground/30">|</span>
              <button
                onClick={() => {
                  setIsVerified(true);
                  setUserData({ 
                    address: location, 
                    city: city,
                    discom: selectedDiscom?.name || "" 
                  });
                  onContinue(true, { address: location, city, discom: selectedDiscom?.name || "" });
                }}
                className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1.5"
              >
                [Dev] Mark as Verified
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl p-4 animate-slide-up shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground">How to get this document</h3>
              <button onClick={() => setShowHelpModal(false)}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              {[
                { step: 1, text: `Open ${selectedDiscom?.name || "your DISCOM"} app or website` },
                { step: 2, text: "Download your Verifiable Credentials (VC)" },
                { step: 3, text: "Upload it here to start trading!" },
              ].map((item) => (
                <div key={item.step} className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
            
            <button onClick={() => setShowHelpModal(false)} className="btn-outline-calm w-full mt-3 !py-2 text-sm">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDiscomScreen;
