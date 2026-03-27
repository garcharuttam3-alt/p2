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
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Profile Card */}
      <div className="rounded-xl bg-card border p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">Profile Information</h3>

          {/* 🔥 Smart Button */}
          {user?.role === "User" && (
            <>
              {canApply && (
                <Button
                  onClick={() => setOpenApply(true)}
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                >
                  <Icon icon="solar:case-round-bold-duotone" className="h-3 w-3 mr-1" />
                  {providerStatus === "rejected" ? "Re-Apply" : "Become Provider"}
                </Button>
              )}

              {isPending && (
                <Button size="sm" disabled className="text-xs h-8">
                  ⏳ Under Review
                </Button>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone:</strong> {user?.phone || "—"}</p>
          <p><strong>Address:</strong> {user?.address || "—"}</p>
        </div>
      </div>

      {/* Edit Profile */}
      <form onSubmit={handleUpdate} className="rounded-xl bg-card border p-4 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold">Edit Profile</h3>

        <div className="grid grid-cols-2 gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Input value={user?.email || ""} disabled />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {/* Provider Status */}
      {providerStatus !== "none" && (
        <div className="rounded-xl bg-card border p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold">Provider Status</h3>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Verification</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Documents</span>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-600">
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
                  Upload Docs
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      <Dialog open={openApply} onOpenChange={setOpenApply}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply as Service Provider</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleApply} className="space-y-3">
            <Input
  placeholder="Service Type"
  value={applyData.serviceType}
  onChange={(e) =>
    setApplyData({ ...applyData, serviceType: e.target.value })
  }
  required
/>

<Input
  placeholder="Address"
  value={applyData.address}
  onChange={(e) =>
    setApplyData({ ...applyData, address: e.target.value })
  }
  required
/>

<Input
  placeholder="City"
  value={applyData.city}
  onChange={(e) =>
    setApplyData({ ...applyData, city: e.target.value })
  }
  required
/>

<Input
  placeholder="Pincode"
  value={applyData.pincode}
  onChange={(e) =>
    setApplyData({ ...applyData, pincode: e.target.value })
  }
  required
/>

            <Button className="w-full">
              Submit Application
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ProfilePage;