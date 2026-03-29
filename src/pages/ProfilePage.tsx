  import { useEffect, useState } from "react";
  import { useAuthStore } from "@/stores/authStore";
  import { userApi } from "@/api/userApi";
  import { providerApi } from "@/api/providerApi";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
  import { useToast } from "@/hooks/use-toast";
  import { Icon } from "@iconify/react";

  type ProviderStatus = "none" | "pending" | "rejected" | "approved";

  const ProfilePage = () => {
    const { user, setUser } = useAuthStore();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [openApply, setOpenApply] = useState(false);

    const [providerStatus, setProviderStatus] = useState<ProviderStatus>("none");
    const [documentStatus, setDocumentStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");

    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");

    const [applyData, setApplyData] = useState({
      serviceType: "",
      address: "",
      city: "",
      pincode: "",
    });

    // 🔍 Load status
    const loadProviderStatus = async () => {
      try {
        const res = await providerApi.getMyProviderProfile();
        if (!res.data.success) return;

        const profile = res.data.profile;

        if (!profile) {
          setProviderStatus("none");
          setDocumentStatus("none");
          return;
        }

        setProviderStatus(profile.providerStatus || "pending");
        setDocumentStatus(profile.documentStatus || "pending");
      } catch {}
    };

    useEffect(() => {
      loadProviderStatus();
    }, []);

    // 🧠 Smart UI logic
    const canApply = providerStatus === "none" || providerStatus === "rejected";
    const isPending = providerStatus === "pending";

    const getStatusColor = () => {
      if (providerStatus === "approved") return "bg-green-100 text-green-600";
      if (providerStatus === "rejected") return "bg-red-100 text-red-600";
      return "bg-yellow-100 text-yellow-600";
    };

    const getStatusLabel = () => {
      if (providerStatus === "none") return "Not Applied";
      if (providerStatus === "pending") return "Under Review";
      if (providerStatus === "rejected") return "Rejected";
      return "Approved";
    };

    // ✏ Update profile
    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const res = await userApi.updateProfile({ name, phone, address });
        setUser(res.data.user || { ...user!, name, phone, address });
        toast({ title: "Profile updated" });
      } catch {
        toast({ title: "Update failed", variant: "destructive" });
      }

      setLoading(false);
    };

    // 🚀 Apply
    const handleApply = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        await providerApi.apply(applyData);
        setProviderStatus("pending");
        setDocumentStatus("pending");
        toast({ title: "Application submitted" });
        setOpenApply(false);
      } catch {
        toast({ title: "Application failed", variant: "destructive" });
      }
    };

return (
  <div className="min-h-screen bg-background px-4 py-8">

    <div className="max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account & provider access
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-r 
        from-indigo-500 via-purple-500 to-pink-500">

        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-5">

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Profile Overview
            </h3>

            {canApply && (
              <button
                onClick={() => setOpenApply(true)}
                className="px-4 py-2 text-xs rounded-lg 
                bg-gradient-to-r from-indigo-500 to-purple-500 
                text-white shadow-md hover:opacity-90 transition"
              >
                Become Provider
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

            {[
              { label: "Name", value: user?.name },
              { label: "Email", value: user?.email },
              { label: "Phone", value: user?.phone || "—" },
              { label: "Address", value: user?.address || "—" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-3 bg-muted/40 dark:bg-muted/20 border border-border"
              >
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* EDIT PROFILE */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">

        <h3 className="text-sm font-semibold text-foreground">
          Edit Profile
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Input value={user?.email || ""} disabled />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* STATUS */}
      {providerStatus !== "none" && (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">

          <h3 className="text-sm font-semibold text-foreground">
            Provider Status
          </h3>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Verification</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Documents</span>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400">
                {documentStatus}
              </span>

              {providerStatus === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() =>
                    (window.location.href = "/provider/upload-documents")
                  }
                >
                  Upload
                </Button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  </div>
);
  };

  export default ProfilePage;