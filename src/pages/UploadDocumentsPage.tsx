import { useEffect, useState } from "react";
import { providerApi } from "@/api/providerApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

type DocumentType = "Aadhaar" | "PAN" | "License";

interface ProviderDocument {
  type: DocumentType;
  file: File;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // ✅ 2MB limit

const UploadDocumentsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<ProviderDocument[]>([]);

  const [kycStatus, setKycStatus] = useState<"none" | "pending" | "rejected" | "approved">("none");
  const [providerStatus, setProviderStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");

  // 🔍 Load status
  const loadStatus = async () => {
    try {
      const res = await providerApi.getMyProviderProfile();
      if (!res.data.success) return;

      const profile = res.data.profile;

      setProviderStatus(profile.providerStatus || "none");
      setKycStatus(profile.documentStatus || "none");

      // 🚨 Only pending allowed
      if (profile.providerStatus !== "pending") {
        toast({
          title: "Access Denied",
          description: "Upload allowed only when status is pending",
          variant: "destructive",
        });
        navigate("/profile");
      }

    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // 🔁 Convert file → base64
  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  // 📂 Handle file select
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🚨 File size validation
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Max size is 2MB",
        variant: "destructive",
      });
      return;
    }

    setDocuments((prev) => [
      ...prev.filter((doc) => doc.type !== type), // replace same type
      { type, file },
    ]);
  };

  // 🚀 Upload
  const handleUpload = async () => {
    if (documents.length === 0) {
      toast({ title: "No documents selected", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // ⚡ Convert all files
      const payload = await Promise.all(
        documents.map(async (doc) => {
          const base64 = await convertToBase64(doc.file);
          return { type: doc.type, base64 };
        })
      );

      const res = await providerApi.uploadDocuments({ documents: payload });

      console.log("UPLOAD SUCCESS:", res);

      toast({
        title: "Documents uploaded",
        description: "Verification in progress",
      });

      setKycStatus("pending");
      setDocuments([]);

    } catch (err: any) {
      console.log("UPLOAD ERROR:", err?.response?.data || err);

      toast({
        title: "Upload failed",
        description: err?.response?.data?.message || "Server error",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // ================= UI STATES =================

  if (kycStatus === "pending") {
    return (
      <div className="max-w-xl mx-auto text-center p-8 rounded-2xl bg-card border">
        <Icon icon="solar:clock-circle-bold-duotone" className="h-12 w-12 mx-auto mb-3 text-warning" />
        <h2 className="text-xl font-bold mb-2">KYC Under Review</h2>
        <p className="text-sm text-muted-foreground">
          Your documents are being verified.
        </p>
      </div>
    );
  }

  if (kycStatus === "approved") {
    return (
      <div className="max-w-xl mx-auto text-center p-8 rounded-2xl bg-card border">
        <Icon icon="solar:verified-check-bold-duotone" className="h-12 w-12 mx-auto mb-3 text-accent" />
        <h2 className="text-xl font-bold mb-2">Provider Verified</h2>
        <Button onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (kycStatus === "rejected") {
    return (
      <div className="max-w-xl mx-auto text-center p-8 rounded-2xl bg-card border">
        <Icon icon="solar:danger-triangle-bold-duotone" className="h-12 w-12 mx-auto mb-3 text-destructive" />
        <h2 className="text-xl font-bold mb-2">Documents Rejected</h2>
        <p className="text-sm mb-4">Upload valid documents again</p>
        <Button onClick={() => setKycStatus("none")}>
          Re-upload
        </Button>
      </div>
    );
  }

  // ================= MAIN UI =================

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <h2 className="text-xl font-bold">Upload Documents</h2>

      {(["Aadhaar", "PAN", "License"] as DocumentType[]).map((type) => (
        <div key={type}>
          <Label>{type}</Label>
          <Input type="file" accept="image/*" onChange={(e) => handleFile(e, type)} />
        </div>
      ))}

      {/* 📌 Selected files */}
      {documents.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Selected: {documents.map((d) => d.type).join(", ")}
        </div>
      )}

      <Button onClick={handleUpload} disabled={loading}>
        <Icon
          icon={loading ? "svg-spinners:ring-resize" : "solar:upload-bold-duotone"}
          className="h-4 w-4 mr-1"
        />
        {loading ? "Uploading..." : "Submit Documents"}
      </Button>

    </div>
  );
};

export default UploadDocumentsPage;