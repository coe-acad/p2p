import { useNavigate } from "react-router-dom";
import { ChevronLeft, FileCheck, FileX, Upload } from "lucide-react";

const VCDocumentsPage = () => {
  const navigate = useNavigate();

  const documents = [
    { id: "connection", label: "Connection VC", status: "verified", required: true },
    { id: "consumer", label: "Consumer VC", status: "pending", required: false },
    { id: "generation", label: "Generation VC", status: "pending", required: false },
  ];

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <div className="w-full max-w-md flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button 
            onClick={() => navigate("/profile")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">VC Documents</h1>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground animate-fade-in">
          Upload your DISCOM Verifiable Credentials to enable energy trading
        </p>

        {/* Documents List */}
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div 
              key={doc.id}
              className="bg-card rounded-xl p-4 shadow-card animate-slide-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {doc.status === "verified" ? (
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileCheck size={16} className="text-accent" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <FileX size={16} className="text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.label}</p>
                    <p className={`text-xs ${doc.status === "verified" ? "text-accent" : "text-muted-foreground"}`}>
                      {doc.status === "verified" ? "Verified ✓" : "Not uploaded"}
                    </p>
                  </div>
                </div>
                {doc.status !== "verified" && (
                  <button className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                    <Upload size={14} className="text-primary" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Requirement Note */}
        <div className="bg-muted/50 rounded-xl p-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Required:</span> Connection VC + either Consumer or Generation VC to list energy for trading
          </p>
        </div>
      </div>
    </div>
  );
};

export default VCDocumentsPage;
