import { useState } from "react";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

const SettingsPage = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      await authApi.resetPassword({ email: user?.email || "", otp: currentPassword, newPassword });
      toast({ title: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: "Failed to change password", variant: "destructive" });
    } finally { setSaving(false); }
  };

return (
  <div className="min-h-screen flex items-center justify-center px-4 py-10">

    <div className="w-full max-w-md">

      {/* PROFILE CARD */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">

        <div className="rounded-3xl bg-card/80 backdrop-blur-xl border border-border p-6 space-y-6">

          {/* PROFILE HEADER */}
          <div className="flex flex-col items-center text-center space-y-3">
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.name?.charAt(0) || "U"}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {user?.name || "User"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>

          </div>

          {/* DIVIDER */}
          <div className="border-t border-border" />

          {/* CHANGE PASSWORD */}
          <form onSubmit={handleChangePassword} className="space-y-4">

            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon icon="solar:lock-keyhole-bold-duotone" className="h-4 w-4 text-primary" />
              Change Password
            </h3>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">
                Current Password / OTP
              </Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">
                New Password
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">
                Confirm Password
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:opacity-90"
            >
              {saving
                ? <Icon icon="svg-spinners:ring-resize" className="h-4 w-4" />
                : <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4" />
              }
              Update Password
            </Button>

          </form>

        </div>
      </div>

    </div>
  </div>
);
};

export default SettingsPage;
