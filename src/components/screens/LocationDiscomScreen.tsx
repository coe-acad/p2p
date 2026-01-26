import { useState, useEffect, useRef } from "react";
import { MapPin, Upload, HelpCircle, Check, X, ChevronDown, AlertTriangle, ChevronLeft, Loader2, Navigation } from "lucide-react";
import SamaiLogo from "../SamaiLogo";

interface LocationDiscomScreenProps {
  onContinue: (payload: { isVCVerified: boolean; devices?: any[] }) => void;
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
  const [location, setLocation] = useState("");
  const [selectedDiscom, setSelectedDiscom] = useState<typeof DISCOMS[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    consumption: string | null;
    utility: string | null;
    generation: string | null;
  }>({ consumption: null, utility: null, generation: null });
  const [credentialIds, setCredentialIds] = useState<{
    consumption: string | null;
    utility: string | null;
    generation: string | null;
  }>({ consumption: null, utility: null, generation: null });
  const [credentialJsons, setCredentialJsons] = useState<{
    consumption: Record<string, any> | null;
    utility: Record<string, any> | null;
    generation: Record<string, any> | null;
  }>({ consumption: null, utility: null, generation: null });
  const [verifiedFiles, setVerifiedFiles] = useState({
    consumption: false,
    utility: false,
    generation: false,
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
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
            
            setLocation(shortAddress || data.display_name);
            
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

  const resetFile = (type: "consumption" | "utility" | "generation") => {
    setUploadedFiles((prev) => ({ ...prev, [type]: null }));
    setCredentialIds((prev) => ({ ...prev, [type]: null }));
    setCredentialJsons((prev) => ({ ...prev, [type]: null }));
    setVerifiedFiles((prev) => ({ ...prev, [type]: false }));
  };

  const handleFileUpload = (
    type: "consumption" | "utility" | "generation",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [type]: file.name }));
      setVerifiedFiles((prev) => ({ ...prev, [type]: false }));
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = typeof reader.result === "string" ? reader.result : "";
          const parsed = JSON.parse(raw);
          const vcId = parsed?.id;
          if (!vcId) {
            throw new Error("Missing id in VC JSON");
          }
          setCredentialIds((prev) => ({ ...prev, [type]: vcId }));
          setCredentialJsons((prev) => ({ ...prev, [type]: parsed }));
        } catch (error) {
          console.error("Invalid VC JSON", error);
          alert("Invalid VC JSON file. Please upload a valid credential JSON.");
          resetFile(type);
        }
      };
      reader.onerror = () => {
        alert("Could not read the file. Please try again.");
        resetFile(type);
      };
      reader.readAsText(file);
    }
  };

  const isVerified = Object.values(verifiedFiles).every(Boolean);
  const allFilesReady = Object.values(credentialIds).every(Boolean);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  const handleVerifyContinue = async () => {
    if (isVerified) {
      if (isExtracting) return;
      const userId = localStorage.getItem("samai_user_id");
      if (!userId) {
        alert("Missing user ID. Please sign up again.");
        return;
      }
      const credentials = [credentialJsons.consumption, credentialJsons.generation].filter(Boolean) as Record<string, any>[];
      if (credentials.length === 0) {
        alert("Missing credentials. Please upload VC JSON files again.");
        return;
      }

      try {
        setIsExtracting(true);
        const response = await fetch(`${API_BASE_URL}/api/bpp/onboarding/extract-device`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, credentials }),
        });
        if (!response.ok) {
          console.error("Extract device failed", await response.text());
          alert("Extract device failed. Please try again.");
          return;
        }
        const result = await response.json();
        const devices = Array.isArray(result.devices) ? result.devices : [];

        if (devices.length === 0) {
          alert("No devices found from the credentials. Please try again.");
          return;
        }

        const baseUrl = API_BASE_URL;
        const userResponse = await fetch(`${baseUrl}/api/bpp/onboarding/user/${userId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem("samai_user_cache", JSON.stringify({ timestamp: Date.now(), data: userData }));
        }

        onContinue({ isVCVerified: true, devices });
      } catch (error) {
        console.error("Extract device failed", error);
        alert("Extract device failed. Please check your connection.");
      } finally {
        setIsExtracting(false);
      }
      return;
    }
    if (!allFilesReady) {
      alert("Please upload all three VC JSON files before verifying.");
      return;
    }
    const userId = localStorage.getItem("samai_user_id");
    if (!userId) {
      alert("Missing user ID. Please sign up again.");
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch(`${API_BASE_URL}/api/bpp/onboarding/verify-vc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          utilityCustomerId: credentialIds.utility,
          consumptionProfileId: credentialIds.consumption,
          generationProfileId: credentialIds.generation,
          role: localStorage.getItem("samai_user_role") || undefined,
        }),
      });

      if (!response.ok) {
        console.error("VC verification failed", await response.text());
        alert("VC verification failed. Please try again.");
        return;
      }

      setVerifiedFiles({ consumption: true, utility: true, generation: true });
    } catch (error) {
      console.error("VC verification failed", error);
      alert("VC verification failed. Please check your connection.");
    } finally {
      setIsVerifying(false);
    }
  };

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
    <div className="screen-container !py-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header with Back Button and Logo */}
        <div className="animate-slide-up mb-3">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <SamaiLogo size="sm" showText={false} />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-2xs text-muted-foreground">Step 1 of 3</span>
              <div className="flex gap-1">
                <div className="w-5 h-0.5 rounded-full bg-primary" />
                <div className="w-5 h-0.5 rounded-full bg-muted" />
                <div className="w-5 h-0.5 rounded-full bg-muted" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Confirm your electricity connection
            </h2>
          </div>
        </div>

        {/* Combined Location & DISCOM Card */}
        <div className="bg-card rounded-xl border border-border p-2.5 shadow-card animate-slide-up relative z-30 mb-3" style={{ animationDelay: "0.1s" }}>
          {/* Location Row */}
          <div className="pb-2.5 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="text-primary" size={14} />
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
                className="text-2xs text-primary flex items-center gap-1 disabled:opacity-50"
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
          <div className="pt-2.5 relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs text-muted-foreground">Your DISCOM</label>
              {selectedDiscom && (
                <span className="text-2xs text-accent">Auto-detected</span>
              )}
            </div>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-input bg-background text-left"
            >
              <span className={`text-xs ${selectedDiscom ? "font-medium text-foreground" : "text-muted-foreground"} truncate`}>
                {selectedDiscom?.name || "Select your DISCOM"}
              </span>
              <ChevronDown className={`text-muted-foreground transition-transform flex-shrink-0 ${showDropdown ? "rotate-180" : ""}`} size={14} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-36 overflow-y-auto">
                {DISCOMS.map((discom, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDiscom(discom);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-2.5 py-1.5 text-left hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedDiscom?.name === discom.name ? "bg-primary/5" : ""
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

        {/* VC Upload Section */}
        <div className="space-y-1.5 animate-slide-up z-10" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-start justify-between mb-0.5">
            <span className="text-xs font-medium text-foreground">Verifiable Credentials</span>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-2xs text-primary hover:underline flex items-center gap-0.5 flex-shrink-0"
            >
              <HelpCircle size={9} />
              Help
            </button>
          </div>
          <p className="text-2xs text-muted-foreground mb-1.5">
            Upload your DISCOM-issued Verifiable Credentials (JSON). Samai uses these to configure your trading
            settings.
          </p>

          <div className="space-y-2">
            {[
              { key: "consumption", label: "Consumption VC" },
              { key: "utility", label: "Utility VC" },
              { key: "generation", label: "Generation VC" },
            ].map(({ key, label }) => {
              const fileName = uploadedFiles[key as keyof typeof uploadedFiles];
              const isFileVerified = verifiedFiles[key as keyof typeof verifiedFiles];

              if (!fileName) {
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-2 px-2.5 py-2 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="text-muted-foreground" size={12} />
                      <span className="text-2xs text-muted-foreground">Upload {label} (JSON)</span>
                    </div>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={(e) => handleFileUpload(key as "consumption" | "utility" | "generation", e)}
                      className="hidden"
                    />
                  </label>
                );
              }

              return (
                <div
                  key={key}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg border border-border ${
                    isFileVerified ? "bg-accent/8" : "bg-secondary/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isFileVerified ? (
                      <Check className="text-accent" size={12} />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-muted-foreground/30 animate-pulse" />
                    )}
                    <div>
                      <p className="text-2xs font-medium text-foreground truncate max-w-[160px]">{fileName}</p>
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                      {isFileVerified ? (
                        <span className="text-[10px] text-accent ml-2">Verified ✓</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground ml-2">Ready to verify</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => resetFile(key as "consumption" | "utility" | "generation")}>
                    <X size={12} className="text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed bottom CTAs */}
        <div className="mt-auto pt-4 pb-6 space-y-1.5 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={handleVerifyContinue}
            disabled={!isFormValid || (!isVerified && !allFilesReady) || isVerifying || isExtracting}
            className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerified ? (isExtracting ? "Loading devices..." : "Continue") : isVerifying ? "Verifying..." : "Verify credentials"}
          </button>
          
          {!isVerified && isFormValid && (
            <button
              onClick={() => onContinue({ isVCVerified: false })}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-2"
            >
              <AlertTriangle size={12} />
              Skip for now
            </button>
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
