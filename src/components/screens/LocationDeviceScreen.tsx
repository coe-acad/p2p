import { useState, useEffect, useRef } from "react";
import { MapPin, Upload, HelpCircle, Check, X, ChevronDown, AlertTriangle, ChevronLeft, Loader2, Navigation, Sun, ExternalLink, Zap, Battery, Gauge, User, ChevronUp, Cpu, FileCheck, Sparkles } from "lucide-react";
import SamaiLogo from "../SamaiLogo";
import { useUserData, extractLocality } from "@/hooks/useUserData";
 import { parseVCPdf, formatDevicesFromVC, VCExtractedData } from "@/utils/vcPdfParser";

interface LocationDeviceScreenProps {
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
  { state: "Maharashtra", name: "MSEDCL", fullName: "Maharashtra State Electricity Distribution Co. Ltd", portalUrl: "https://www.mahadiscom.in/" },
  { state: "Delhi", name: "TPDDL", fullName: "Tata Power Delhi Distribution Limited", portalUrl: "https://www.tatapower-ddl.com/" },
  { state: "Delhi", name: "BSES Rajdhani", fullName: "BSES Rajdhani Power Limited", portalUrl: "https://www.bsesdelhi.com/" },
  { state: "Karnataka", name: "BESCOM", fullName: "Bangalore Electricity Supply Company", portalUrl: "https://bescom.karnataka.gov.in/" },
  { state: "Tamil Nadu", name: "TANGEDCO", fullName: "Tamil Nadu Generation and Distribution Corporation", portalUrl: "https://www.tangedco.gov.in/" },
  { state: "Gujarat", name: "UGVCL", fullName: "Uttar Gujarat Vij Company Limited", portalUrl: "https://www.ugvcl.com/" },
  { state: "Rajasthan", name: "JVVNL", fullName: "Jaipur Vidyut Vitran Nigam Limited", portalUrl: "https://energy.rajasthan.gov.in/jvvnl" },
  { state: "Andhra Pradesh", name: "APSPDCL", fullName: "AP Southern Power Distribution Company", portalUrl: "https://www.apspdcl.in/" },
  { state: "Telangana", name: "TSSPDCL", fullName: "Telangana Southern Power Distribution", portalUrl: "https://tsspdcl.cgg.gov.in/" },
  { state: "Kerala", name: "KSEB", fullName: "Kerala State Electricity Board", portalUrl: "https://www.kseb.in/" },
  { state: "West Bengal", name: "WBSEDCL", fullName: "West Bengal State Electricity Distribution", portalUrl: "https://www.wbsedcl.in/" },
  { state: "Uttar Pradesh", name: "UPPCL", fullName: "Uttar Pradesh Power Corporation", portalUrl: "https://www.uppcl.org/" },
];

const LocationDeviceScreen = ({ onContinue, onBack }: LocationDeviceScreenProps) => {
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
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Address autocomplete state
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Device confirmation state
  const [deviceConfirmed, setDeviceConfirmed] = useState(false);
  const [expandedDevice, setExpandedDevice] = useState<number | null>(null);

   // VC extracted data state
   const [vcData, setVcData] = useState<VCExtractedData | null>(null);
   const [parseError, setParseError] = useState<string | null>(null);
   const [preparingVC, setPreparingVC] = useState(false);

 
  const isFormValid = location.trim() !== "" && selectedDiscom !== null && deviceConfirmed;
  const locality = extractLocality(location);

   // Device data - dynamic based on VC or fallback to defaults
   const formattedDevices = vcData ? formatDevicesFromVC(vcData, locality) : null;
   
   const devices = formattedDevices ? [
     { 
       icon: Zap, 
       title: "Solar Inverter", 
       detail: formattedDevices.inverter.detail,
       expanded: formattedDevices.inverter.expanded
     },
     { 
       icon: Battery, 
       title: "Battery", 
       detail: formattedDevices.battery.detail,
       expanded: formattedDevices.battery.expanded
     },
     { 
       icon: Gauge, 
       title: "Smart Meter", 
       detail: formattedDevices.meter.detail,
       expanded: formattedDevices.meter.expanded
     },
     { 
       icon: User, 
       title: "Profile", 
       detail: formattedDevices.profile.detail,
       expanded: formattedDevices.profile.expanded
     },
   ] : [
     { 
       icon: Zap, 
       title: "Solar Inverter", 
       detail: "Solar • 5 kW",
       expanded: {
         type: "Solar",
         capacity: "5 kW",
         commissioningDate: "N/A",
         manufacturer: "N/A",
         model: "N/A"
       }
     },
     { 
       icon: Battery, 
       title: "Battery", 
       detail: "Storage • 10 kWh",
       expanded: {
         capacity: "10 kWh",
         type: "Lithium-ion",
         estimatedCycles: "6000+"
       }
     },
     { 
       icon: Gauge, 
       title: "Smart Meter", 
       detail: "DISCOM • Bi-directional",
       expanded: {
         meterNumber: "N/A",
         sanctionedLoad: "N/A",
         connectionType: "N/A",
         premisesType: "N/A"
       }
     },
     { 
       icon: User, 
       title: "Profile", 
       detail: `${userData.name}, ${locality || "Location"}`,
       expanded: {
         name: userData.name,
         consumerNumber: userData.consumerId || "N/A",
         address: location,
         tariffCategory: "N/A",
         serviceDate: "N/A"
       }
     },
   ];
 
   // Summary stats for card display
   const summaryStats = formattedDevices?.summary || {
     inverterKw: "5",
     batteryKwh: "10",
     meterType: "Bi-dir"
   };

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
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept': 'application/json' } }
          );
          
          const data: ReverseGeocodeResult = await response.json();
          
          if (data.display_name) {
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

  const fetchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`,
        { headers: { 'Accept': 'application/json' } }
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
    
    if (suggestion.address?.state) {
      autoSelectDiscom(suggestion.address.state);
    }
  };

  const fetchUtilityCredential = async () => {
    const url =
      "https://35.244.45.209.sslip.io/credential/credentials/did:rcw:c5f53fcb-bfaa-4d09-9602-5a30a1c0cc8a";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Credential API failed: ${response.status}`);
    }

    const data = await response.json();

    // Basic validation like your Postman test
    if (
      !data.type ||
      !String(data.type).includes("UtilityCustomerCredential")
    ) {
      throw new Error("Invalid credential type");
    }

    return data;
  };


   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files) {
       const newFiles = Array.from(e.target.files);
       setUploadedFiles(prev => [...prev, ...newFiles]);
       setParseError(null);
       
       // Parse PDF files to extract VC data
       if (newFiles.length > 0) {
         setPreparingVC(true);
         setIsVerifying(true);
         
         try {
            const [credentialData] = await Promise.all([
              fetchUtilityCredential(),

              // keep UI visible at least 2.5 sec
              new Promise((res) => setTimeout(res, 2500)),
            ]);

            console.log("Credential from API:", credentialData);

           setPreparingVC(false);
           setIsVerifying(true);
           // Find PDF files and parse them
           const pdfFiles = newFiles.filter(
             (f) => f.type === "application/pdf" || f.name.endsWith(".pdf"),
           );

           if (pdfFiles.length > 0) {
             // Parse the first PDF (or merge data from multiple)
             const parsedData = await parseVCPdf(pdfFiles[0]);
             setVcData(parsedData);

             // Update user data with extracted info
             if (parsedData.fullName) {
               setUserData({ name: parsedData.fullName });
             }
             if (parsedData.address && !location) {
               setLocation(parsedData.address);
             }
             if (parsedData.consumerNumber) {
               setUserData({ consumerId: parsedData.consumerNumber });
             }

             // Store VC data in localStorage for earnings calculation
             localStorage.setItem("samai_vc_data", JSON.stringify(parsedData));

             console.log("VC data extracted:", parsedData);
           }

           setIsVerifying(false);
           setIsVerified(true);
           setUserData({ isVCVerified: true });
         } catch (error) {
           console.error('Error parsing VC:', error);
           setParseError('Could not parse document. Please try again.');
           setIsVerifying(false);
           // Still mark as verified for non-PDF files
           if (!newFiles.some(f => f.type === 'application/pdf')) {
             setIsVerified(true);
             setUserData({ isVCVerified: true });
           }
         }
       }
     }
   };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setIsVerified(false);
      setVcData(null);
    }
  };

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
    <div className="screen-container !py-3 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gradient-to-b from-orange-300/25 via-amber-200/12 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_4s_ease-in-out_infinite]" />
        <div className="absolute top-1/4 -left-20 w-[180px] h-[180px] bg-gradient-to-br from-orange-400/12 to-amber-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/2 -right-16 w-[160px] h-[160px] bg-gradient-to-bl from-teal-400/10 to-green-400/6 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute top-12 right-5 text-orange-400/12">
          <Sun size={28} className="animate-[pulse_6s_ease-in-out_infinite]" />
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col h-full px-4 relative z-10 overflow-y-auto">
        {/* Header */}
        <div className="animate-slide-up mb-3">
          <div className="flex items-center justify-between mb-1">
            <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <SamaiLogo size="sm" showText={false} />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xs text-muted-foreground">Step 1 of 2</span>
              <div className="flex gap-1">
                <div className="w-6 h-1 rounded-full bg-gradient-to-r from-orange-400 to-amber-500" />
                <div className="w-6 h-1 rounded-full bg-muted" />
              </div>
            </div>
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 mb-1">
              <Zap className="text-primary" size={14} />
            </div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Verify your electricity connection
            </h2>
          </div>
        </div>

        {/* Section 1: Verify Electricity Connection */}
        <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          {/* Location & DISCOM Card */}
          <div className="bg-card rounded-xl border border-primary/20 p-2.5 shadow-card relative z-30">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/30 pointer-events-none" />
            
            {/* Location Row */}
            <div className="pb-2 border-b border-border/50 relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                    <MapPin className="text-white" size={10} />
                  </div>
                  <span className="text-2xs font-medium text-foreground">Location</span>
                  {isDetectingLocation && (
                    <span className="text-2xs text-muted-foreground flex items-center gap-1">
                      <Loader2 size={8} className="animate-spin" /> Detecting...
                    </span>
                  )}
                </div>
                <button onClick={detectLocation} disabled={isDetectingLocation} className="text-2xs text-primary flex items-center gap-0.5 disabled:opacity-50 font-medium hover:bg-primary/10 px-1.5 py-0.5 rounded-md transition-colors">
                  <Navigation size={8} />
                  Detect
                </button>
              </div>
              
              <div className="relative" ref={inputRef}>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => setIsEditing(true)}
                  placeholder={isDetectingLocation ? "Detecting..." : "Search address..."}
                  className="w-full text-2xs px-2 py-1.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                
                {isLoadingSuggestions && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 size={10} className="animate-spin text-muted-foreground" />
                  </div>
                )}
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card border border-border rounded-lg shadow-xl z-[300] max-h-28 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <button key={suggestion.place_id} onClick={() => handleSuggestionSelect(suggestion)} className="w-full px-2 py-1.5 text-left hover:bg-primary/5 transition-colors text-2xs text-foreground first:rounded-t-lg last:rounded-b-lg">
                        <span className="line-clamp-2">{suggestion.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {locationError && <p className="text-2xs text-destructive mt-0.5">{locationError}</p>}
            </div>
            
            {/* DISCOM Selector */}
            <div className="pt-2 relative z-[100]">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-2xs text-muted-foreground">DISCOM</label>
                {selectedDiscom && <span className="text-2xs text-accent font-medium">Auto-detected</span>}
              </div>
              <button onClick={() => setShowDropdown(!showDropdown)} className="w-full flex items-center justify-between px-2 py-1.5 rounded-md border border-input bg-background text-left hover:border-primary/40 transition-colors">
                <span className={`text-2xs ${selectedDiscom ? "font-medium text-foreground" : "text-muted-foreground"} truncate`}>
                  {selectedDiscom?.name || "Select DISCOM"}
                </span>
                <ChevronDown className={`text-muted-foreground transition-transform flex-shrink-0 ${showDropdown ? "rotate-180" : ""}`} size={12} />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card border border-border rounded-lg shadow-xl z-[200] max-h-36 overflow-y-auto">
                  {DISCOMS.map((discom, index) => (
                    <button key={index} onClick={() => { setSelectedDiscom(discom); setShowDropdown(false); }} className={`w-full px-2.5 py-1.5 text-left hover:bg-primary/5 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedDiscom?.name === discom.name ? "bg-primary/10 border-l-2 border-primary" : ""}`}>
                      <p className="text-2xs font-medium text-foreground">{discom.name}</p>
                      <p className="text-2xs text-muted-foreground">{discom.state}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* VC Upload Section */}
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-medium text-foreground">Upload DISCOM Documents</span>
              <button onClick={() => setShowHelpModal(true)} className="text-2xs text-primary hover:underline flex items-center gap-0.5 flex-shrink-0">
                <HelpCircle size={8} />
                How to get VC?
              </button>
            </div>

            <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all bg-card">
              <Upload className="text-primary mb-1" size={16} />
              <span className="text-2xs font-medium text-foreground">Tap to upload files</span>
              <span className="text-2xs text-muted-foreground">Connection, Consumer, or Generation VCs</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={handleFileUpload} className="hidden" />
            </label>

            {uploadedFiles.length > 0 && (
              <div className="space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between px-2 py-1.5 bg-accent/8 rounded-md border border-accent/20">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Check className="text-accent flex-shrink-0" size={10} />
                      <span className="text-2xs text-foreground truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(index)} className="p-0.5 hover:bg-destructive/10 rounded transition-colors">
                      <X size={10} className="text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {preparingVC && (
            <div className="flex flex-col items-center justify-center gap-2 py-3 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-2xs font-medium text-primary">
                Getting credentials...
              </span>
              <span className="text-[10px] text-muted-foreground">
                Connecting to DISCOM registry
              </span>
            </div>
          )}


            {/* Verification Status */}
            {isVerifying && (
              <div className="flex items-center justify-center gap-2 py-2 text-primary">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-2xs font-medium">Verifying documents...</span>
              </div>
            )}

            {isVerified && !isVerifying && (
              <div className="flex items-center justify-center gap-2 py-2 bg-accent/10 rounded-lg border border-accent/30">
                <FileCheck size={14} className="text-accent" />
                <span className="text-2xs font-medium text-accent">Documents verified successfully!</span>
              </div>
            )}
 
               {parseError && (
                 <div className="flex items-center justify-center gap-2 py-2 bg-destructive/10 rounded-lg border border-destructive/30">
                   <AlertTriangle size={14} className="text-destructive" />
                   <span className="text-2xs font-medium text-destructive">{parseError}</span>
                 </div>
               )}
          </div>
        </div>

        {/* Section 2: Confirm Solar Setup - Only shown after verification */}
        {isVerified && (
          <div className="mt-4 space-y-2 animate-slide-up">
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center shadow-md">
                <Cpu className="text-white" size={12} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Confirm your solar setup</h3>
                <p className="text-2xs text-muted-foreground">Detected from your VC documents</p>
              </div>
            </div>

            {/* Device Summary Card */}
            <div className="relative rounded-lg p-2 shadow-card overflow-hidden border border-accent/30" 
              style={{ background: "linear-gradient(135deg, hsl(165 60% 42% / 0.08) 0%, hsl(155 55% 42% / 0.04) 100%)" }}>
              
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-teal-400/20 to-green-400/10 rounded-full blur-2xl" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <p className="text-2xs font-semibold text-foreground flex items-center gap-1">
                      <Sparkles size={10} className="text-accent" />
                      Solar System Detected
                    </p>
                    <p className="text-2xs text-muted-foreground">{locality || "Your Location"}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-teal-500/15 to-green-500/10 px-1.5 py-0.5 rounded-full border border-accent/20">
                    <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                    <span className="text-2xs font-medium text-accent">Verified</span>
                  </div>
                </div>
                
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-card/80 backdrop-blur-sm rounded-md p-1.5 text-center border border-border/50">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-0.5">
                      <Zap className="text-white" size={11} />
                    </div>
                    <p className="text-xs font-bold text-foreground">{summaryStats.inverterKw} kW</p>
                    <p className="text-2xs text-muted-foreground">Inverter</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm rounded-md p-1.5 text-center border border-border/50">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center mx-auto mb-0.5">
                      <Battery className="text-white" size={11} />
                    </div>
                    <p className="text-xs font-bold text-foreground">{summaryStats.batteryKwh} kWh</p>
                    <p className="text-2xs text-muted-foreground">Battery</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm rounded-md p-1.5 text-center border border-border/50">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mx-auto mb-0.5">
                      <Gauge className="text-white" size={11} />
                    </div>
                    <p className="text-xs font-bold text-foreground">{summaryStats.meterType}</p>
                    <p className="text-2xs text-muted-foreground">Meter</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Device Details */}
            <div className="bg-card rounded-lg border border-border shadow-card divide-y divide-border">
              {devices.map((device, index) => {
                const Icon = device.icon;
                const isExpanded = expandedDevice === index;
                
                return (
                  <div key={index}>
                    <button onClick={() => setExpandedDevice(isExpanded ? null : index)} className="w-full flex items-center justify-between p-2 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <Icon className="text-muted-foreground" size={12} />
                        <span className="text-2xs font-medium text-foreground">{device.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-2xs text-muted-foreground">{device.detail}</span>
                        {isExpanded ? <ChevronUp size={10} className="text-muted-foreground" /> : <ChevronDown size={10} className="text-muted-foreground" />}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-2 pb-2 pt-0.5 bg-secondary/30 animate-slide-up">
                        <div className="space-y-0.5 text-2xs">
                          {Object.entries(device.expanded).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-muted-foreground capitalize min-w-[70px]">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-foreground font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Confirmation Checkbox */}
            <button 
              onClick={() => setDeviceConfirmed(!deviceConfirmed)}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border-2 transition-all w-full ${
                deviceConfirmed ? "border-primary bg-primary/8" : "border-border hover:border-primary/30 bg-card"
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center transition-all flex-shrink-0 ${deviceConfirmed ? "bg-primary" : "border-2 border-input bg-background"}`}>
                {deviceConfirmed && <Check className="text-primary-foreground" size={12} strokeWidth={3} />}
              </div>
              <span className="text-2xs font-medium text-foreground">I confirm these details are correct</span>
            </button>
          </div>
        )}

        {/* Fixed bottom CTA */}
        <div className="mt-auto pt-3 pb-4 space-y-1 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={() => {
              setUserData({ 
                address: location, 
                city: city, 
                discom: selectedDiscom?.name || "",
                consumerId: vcData?.consumerNumber || userData.consumerId,
                name: vcData?.fullName || userData.name,
                isVCVerified: true
              });
              onContinue(true, { address: location, city, discom: selectedDiscom?.name || "" });
            }}
            disabled={!isFormValid || !isVerified}
            className="btn-solar w-full text-sm !py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          
          {!isVerified && location.trim() && selectedDiscom && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setUserData({ address: location, city: city, discom: selectedDiscom?.name || "" });
                  onContinue(false, { address: location, city, discom: selectedDiscom?.name || "" });
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 py-1"
              >
                <AlertTriangle size={9} />
                Skip VC for now
              </button>
              
              <span className="text-muted-foreground/30">|</span>
              <button
                onClick={() => {
                  setIsVerified(true);
                  setUserData({ isVCVerified: true, address: location, city: city, discom: selectedDiscom?.name || "" });
                }}
                className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1"
              >
                [Dev] Mark Verified
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
              <h3 className="text-sm font-bold text-foreground">How to get your VC in 3 simple steps</h3>
              <button onClick={() => setShowHelpModal(false)}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-2.5 text-sm">
              {[
                { step: 1, text: `Open ${selectedDiscom?.name || "your DISCOM"} portal`, hasLink: true },
                { step: 2, text: "Login and download your Verifiable Credentials (VC)" },
                { step: 3, text: "Upload it here to start trading!" },
              ].map((item) => (
                <div key={item.step} className="flex gap-2 items-start">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-2xs text-muted-foreground">{item.text}</p>
                    {item.hasLink && selectedDiscom?.portalUrl && (
                      <a href={selectedDiscom.portalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-0.5 text-2xs text-primary font-medium hover:underline">
                        <ExternalLink size={10} />
                        Visit {selectedDiscom.name} Portal
                      </a>
                    )}
                    {item.hasLink && !selectedDiscom && (
                      <p className="text-2xs text-amber-600 mt-0.5 italic">Select your DISCOM above to get the direct link</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={() => setShowHelpModal(false)} className="btn-outline-calm w-full mt-3 !py-1.5 text-sm">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDeviceScreen;
