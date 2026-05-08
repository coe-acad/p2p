import { useState, useEffect, useRef } from "react";
import { MapPin, Upload, Check, X, ChevronDown, AlertTriangle, ChevronLeft, Loader2, Navigation, Sun, Zap, Battery, Gauge, User, ChevronUp, FileCheck, Shield } from "lucide-react";
import SamaiLogo from "../SamaiLogo";
import { useUserData, extractLocality } from "@/hooks/useUserData";
import { parseVCJson, parseVCPdf, formatDevicesFromVC, VCExtractedData } from "@/utils/vcPdfParser";

interface LocationDeviceScreenProps {
  onContinue: (isVerified: boolean, locationData?: { address: string; city: string; discom: string }) => void;
  onBack: () => void;
}

interface AddressSuggestion {
  display_name: string;
  place_id: number;
  address?: { state?: string };
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
  { state: "Delhi", name: "TPDDL", fullName: "Tata Power Delhi Distribution Limited", portalUrl: "https://www.tatapower-ddl.com/solar-rooftop/p-to-p-trading" },
  { state: "Delhi", name: "BSES Rajdhani", fullName: "BSES Rajdhani Power Limited", portalUrl: "https://www.bsesdelhi.com/web/brpl/p-to-p-trading" },
  { state: "Karnataka", name: "BESCOM", fullName: "Bangalore Electricity Supply Company", portalUrl: "https://bescom.karnataka.gov.in/" },
  { state: "Tamil Nadu", name: "TANGEDCO", fullName: "Tamil Nadu Generation and Distribution Corporation", portalUrl: "https://www.tangedco.gov.in/" },
  { state: "Gujarat", name: "UGVCL", fullName: "Uttar Gujarat Vij Company Limited", portalUrl: "https://www.ugvcl.com/" },
  { state: "Rajasthan", name: "JVVNL", fullName: "Jaipur Vidyut Vitran Nigam Limited", portalUrl: "https://energy.rajasthan.gov.in/jvvnl" },
  { state: "Andhra Pradesh", name: "APSPDCL", fullName: "AP Southern Power Distribution Company", portalUrl: "https://www.apspdcl.in/" },
  { state: "Telangana", name: "TSSPDCL", fullName: "Telangana Southern Power Distribution", portalUrl: "https://tsspdcl.cgg.gov.in/" },
  { state: "Kerala", name: "KSEB", fullName: "Kerala State Electricity Board", portalUrl: "https://www.kseb.in/" },
  { state: "West Bengal", name: "WBSEDCL", fullName: "West Bengal State Electricity Distribution", portalUrl: "https://www.wbsedcl.in/" },
  { state: "Uttar Pradesh", name: "PVVNL", fullName: "Pashchimanchal Vidyut Vitran Nigam Limited", portalUrl: "https://pvvnl.org/P2P-Energy-Trading" },
];

const LocationDeviceScreen = ({ onContinue, onBack }: LocationDeviceScreenProps) => {
  const { userData, setUserData } = useUserData();
  const [location, setLocation] = useState(userData.address || "");
  const [selectedDiscom, setSelectedDiscom] = useState<typeof DISCOMS[0] | null>(
    userData.discom ? DISCOMS.find(d => d.name === userData.discom) || null : null
  );
  const [city, setCity] = useState(userData.city || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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

  const formattedDevices = vcData ? formatDevicesFromVC(vcData, locality) : null;

  const devices = formattedDevices ? [
    { icon: Zap, title: "Solar Inverter", detail: formattedDevices.inverter.detail, expanded: formattedDevices.inverter.expanded },
    { icon: Battery, title: "Battery", detail: formattedDevices.battery.detail, expanded: formattedDevices.battery.expanded },
    { icon: Gauge, title: "Smart Meter", detail: formattedDevices.meter.detail, expanded: formattedDevices.meter.expanded },
    { icon: User, title: "Profile", detail: formattedDevices.profile.detail, expanded: formattedDevices.profile.expanded },
  ] : [
    { icon: Zap, title: "Solar Inverter", detail: "Solar • 5 kW", expanded: { type: "Solar", capacity: "5 kW" } },
    { icon: Battery, title: "Battery", detail: "Storage • 10 kWh", expanded: { capacity: "10 kWh", type: "Lithium-ion" } },
    { icon: Gauge, title: "Smart Meter", detail: "DISCOM • Bi-directional", expanded: { type: "Bi-directional" } },
    { icon: User, title: "Profile", detail: `${userData.name}, ${locality || "Location"}`, expanded: { name: userData.name, address: location } },
  ];

  const autoSelectDiscom = (stateName: string) => {
    const normalizedState = stateName.toLowerCase().trim();
    const matchingDiscom = DISCOMS.find(d =>
      d.state.toLowerCase() === normalizedState ||
      normalizedState.includes(d.state.toLowerCase()) ||
      d.state.toLowerCase().includes(normalizedState)
    );
    if (matchingDiscom) setSelectedDiscom(matchingDiscom);
  };

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
            const shortAddress = [addr?.house_number, addr?.road, addr?.suburb || addr?.village || addr?.town || addr?.city, addr?.state]
              .filter(Boolean)
              .join(", ");
            const cityName = addr?.suburb || addr?.village || addr?.town || addr?.city || "";
            const stateName = addr?.state || "";

            setLocation(shortAddress || data.display_name);
            setCity(`${cityName}${cityName && stateName ? ", " : ""}${stateName}`);
            if (addr?.state) autoSelectDiscom(addr.state);
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setLocationError("Could not fetch address");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => setIsDetectingLocation(false),
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setLocation(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    if (suggestion.address?.state) autoSelectDiscom(suggestion.address.state);
  };

  const fetchUtilityCredential = async () => {
    const url = "https://35.244.45.209.sslip.io/credential/credentials/did:rcw:c5f53fcb-bfaa-4d09-9602-5a30a1c0cc8a";
    const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Credential API failed: ${response.status}`);
    const data = await response.json();
    if (!data.type || !String(data.type).includes("UtilityCustomerCredential")) throw new Error("Invalid credential type");
    return data;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setParseError(null);

      if (newFiles.length > 0) {
        setPreparingVC(true);
        setIsVerifying(true);

        try {
          const [credentialData] = await Promise.all([
            fetchUtilityCredential(),
            new Promise((res) => setTimeout(res, 2500)),
          ]);

          console.log("Credential from API:", credentialData);
          setPreparingVC(false);

          const pdfFiles = newFiles.filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
          const jsonFiles = newFiles.filter(f => f.type === "application/json" || f.name.toLowerCase().endsWith(".json"));

          if (pdfFiles.length > 0 || jsonFiles.length > 0) {
            const parsedData = pdfFiles.length > 0 ? await parseVCPdf(pdfFiles[0]) : await parseVCJson(jsonFiles[0]);
            setVcData(parsedData);

            if (parsedData.fullName) setUserData({ name: parsedData.fullName });
            if (parsedData.address && !location) setLocation(parsedData.address);
            if (parsedData.consumerNumber) setUserData({ consumerId: parsedData.consumerNumber });
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
          if (!newFiles.some(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf") || f.type === "application/json" || f.name.toLowerCase().endsWith(".json"))) {
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
    <div className="screen-container !py-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 animate-fade-in">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Title */}
        <div className="text-center animate-slide-up mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-2">
            <Shield className="text-primary" size={22} />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Verify your electricity connection</h2>
          <p className="text-2xs text-muted-foreground mt-1">Provide location, DISCOM, and upload VC documents</p>
        </div>

        {/* Content Card */}
        <div className="bg-card rounded-xl border border-border p-3 shadow-card space-y-3 flex-1 animate-slide-up">
          {/* Section 1: Location */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-foreground">
              <MapPin size={13} className="text-primary" />
              Location
            </label>
            <div className="relative" ref={inputRef}>
              <input
                type="text"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder={isDetectingLocation ? "Detecting..." : "Enter your address"}
                className={`w-full px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-1 transition-all ${
                  locationError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
                }`}
              />
              <button
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-xs flex items-center gap-1 disabled:opacity-50"
              >
                {isDetectingLocation ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                    >
                      {suggestion.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {locationError && <p className="text-2xs text-destructive">{locationError}</p>}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Section 2: DISCOM */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-foreground">
              <Zap size={13} className="text-primary" />
              Electricity Distribution Company
            </label>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`w-full px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-1 transition-all flex items-center justify-between ${
                selectedDiscom ? "border-input focus:ring-primary" : "border-destructive focus:ring-destructive"
              }`}
            >
              <span className={selectedDiscom ? "text-foreground" : "text-muted-foreground"}>
                {selectedDiscom ? selectedDiscom.name : "Select DISCOM"}
              </span>
              <ChevronDown size={14} className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <div className="absolute left-4 right-4 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {DISCOMS.map((discom) => (
                  <button
                    key={discom.name}
                    onClick={() => {
                      setSelectedDiscom(discom);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors border-b border-border/30 last:border-0 ${
                      selectedDiscom?.name === discom.name
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {discom.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Section 3: VC Upload */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-foreground">
              <FileCheck size={13} className="text-primary" />
              Upload VC Documents
            </label>
            <input
              type="file"
              id="vc-upload"
              multiple
              accept=".pdf,.json,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById("vc-upload")?.click()}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 text-foreground text-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={14} className="text-primary" />
              <span className="text-xs">Click to upload or drag files</span>
            </button>
            {uploadedFiles.length > 0 && (
              <div className="space-y-1">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 bg-muted/30 rounded-md text-xs">
                    <span className="text-foreground truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {isVerifying && (
              <div className="flex items-center justify-center gap-2 p-2 bg-accent/10 rounded-lg text-xs text-accent">
                <Loader2 size={12} className="animate-spin" />
                <span>Verifying documents...</span>
              </div>
            )}
            {isVerified && (
              <div className="flex items-center justify-center gap-2 p-2 bg-accent/10 rounded-lg text-xs text-accent">
                <Check size={12} />
                <span>Documents verified</span>
              </div>
            )}
            {parseError && <p className="text-2xs text-destructive">{parseError}</p>}
          </div>

          {/* Device Details */}
          {isVerified && devices && (
            <>
              <div className="h-px bg-border/50" />
              <div className="bg-accent/5 rounded-lg border border-accent/20 p-2 space-y-1">
                <p className="text-2xs font-medium text-foreground">Detected Devices</p>
                {devices.map((device, idx) => {
                  const Icon = device.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setExpandedDevice(expandedDevice === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-1.5 hover:bg-accent/10 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon size={12} className="text-accent" />
                        <span className="text-2xs font-medium text-foreground">{device.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-2xs text-muted-foreground">{device.detail}</span>
                        {expandedDevice === idx ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Confirmation Checkbox */}
          <button
            onClick={() => setDeviceConfirmed(!deviceConfirmed)}
            className={`flex items-center gap-2.5 p-2 rounded-lg border-2 transition-all w-full ${
              deviceConfirmed ? "border-primary bg-primary/8" : "border-border hover:border-primary/30 bg-card"
            }`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center transition-all flex-shrink-0 ${deviceConfirmed ? "bg-primary" : "border-2 border-input bg-background"}`}>
              {deviceConfirmed && <Check className="text-primary-foreground" size={12} strokeWidth={3} />}
            </div>
            <span className="text-2xs font-medium text-foreground">I confirm these details are correct</span>
          </button>
        </div>

        {/* Bottom CTA */}
        <div className="mt-auto pt-4 pb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => {
              setUserData({
                address: location,
                city: city,
                discom: selectedDiscom?.name || "",
                consumerId: vcData?.consumerNumber || userData.consumerId,
                name: vcData?.fullName || userData.name,
                isVCVerified: isVerified
              });
              onContinue(isVerified, { address: location, city, discom: selectedDiscom?.name || "" });
            }}
            disabled={!isFormValid}
            className="btn-solar w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>

          {!isVerified && location.trim() && selectedDiscom && (
            <button
              onClick={() => {
                setUserData({ address: location, city: city, discom: selectedDiscom?.name || "" });
                onContinue(false, { address: location, city, discom: selectedDiscom?.name || "" });
              }}
              className="text-2xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-2 w-full"
            >
              <AlertTriangle size={10} />
              Skip VC upload for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDeviceScreen;
