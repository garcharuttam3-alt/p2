import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [commission, setCommission] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminApi.getSettings();
        const settings = res.data.settings || res.data || {};
        setCommission(String(settings.commissionPercentage || settings.commission || ""));
      } catch { /* settings may not exist yet */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.updateSettings({ commissionPercentage: Number(commission) });
      toast({ title: "Settings updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

 return (
  <div className="min-h-screen flex items-center justify-center px-4 py-10">

    <div className="w-full max-w-md space-y-5">

      {/* TITLE */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">
          Platform Commission
        </h2>
        <p className="text-xs text-muted-foreground">
          Control how much commission the platform takes per booking
        </p>
      </div>

      {/* COMMISSION CARD */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">

        <div className="rounded-3xl bg-card/80 backdrop-blur-xl border border-border p-6 space-y-5">

          {/* HEADER */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:wallet-money-bold-duotone" className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Commission Settings
            </h3>
          </div>

          {/* INPUT */}
          <div className="space-y-2">
            <Label className="text-[11px] text-muted-foreground">
              Commission Percentage (%)
            </Label>
            <Input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="e.g. 10"
            />
            <p className="text-[10px] text-muted-foreground">
              Applied to every successful booking.
            </p>
          </div>

          {/* LIVE PREVIEW */}
          <div className="rounded-xl bg-muted/40 p-4 text-sm space-y-2">
            <p className="text-xs text-muted-foreground">Preview</p>

            <div className="flex justify-between">
              <span>Booking Amount</span>
              <span>₹1000</span>
            </div>

            <div className="flex justify-between text-red-500">
              <span>Commission ({commission || 0}%)</span>
              <span>
                ₹{((1000 * Number(commission || 0)) / 100).toFixed(0)}
              </span>
            </div>

            <div className="border-t border-border my-2" />

            <div className="flex justify-between font-semibold text-green-500">
              <span>Provider Gets</span>
              <span>
                ₹{(1000 - (1000 * Number(commission || 0)) / 100).toFixed(0)}
              </span>
            </div>
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          >
            {saving ? (
              <Icon icon="svg-spinners:ring-resize" className="h-4 w-4" />
            ) : (
              <Icon icon="solar:diskette-bold-duotone" className="h-4 w-4" />
            )}
            Save Settings
          </Button>

        </div>
      </div>
    </div>
  </div>
);};

export default AdminSettingsPage;
