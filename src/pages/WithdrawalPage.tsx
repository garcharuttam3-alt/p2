import { useEffect, useState } from "react";
import { providerApi } from "@/api/providerApi";
import { walletApi } from "@/api/walletApi"; // ✅ IMPORTANT
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

const WithdrawalPage = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const { toast } = useToast();

  // ✅ LOAD BALANCE FROM WALLET (NOT PROFILE)
  const loadBalance = async () => {
    try {
      const res = await walletApi.getBalance();

      const wallet = res.data.wallet;

      setBalance(wallet?.balance || 0);

    } catch (error) {
      console.error(error);
      setBalance(0);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawAmount = Number(amount);

    // ✅ VALIDATION
    if (!withdrawAmount || withdrawAmount <= 0) {
      return toast({
        title: "Enter valid amount",
        variant: "destructive",
      });
    }

    if (withdrawAmount > balance) {
      return toast({
        title: "Insufficient balance",
        variant: "destructive",
      });
    }

    setLoading(true);

    try {
      await providerApi.requestWithdrawal({ amount: withdrawAmount });

      toast({ title: "Withdrawal request submitted ✅" });

      setAmount("");

      // ✅ Refresh wallet after withdraw
      await loadBalance();

    } catch (error) {
      console.error(error);
      toast({
        title: "Withdrawal failed",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">
        Withdrawal 💸
      </h2>

      {/* BALANCE */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-5 py-4 text-xs font-semibold text-muted-foreground">
                Available Balance
              </td>

              <td className="px-5 py-4 text-right text-xl font-extrabold text-foreground font-display">
                {profileLoading ? (
                  <Icon icon="svg-spinners:ring-resize" className="h-4 w-4 text-primary inline" />
                ) : (
                  `₹${balance.toLocaleString()}`
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-5 space-y-4"
      >
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Amount (₹)</Label>

          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            className="h-9"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9 gap-1.5 text-xs font-semibold"
        >
          <Icon
            icon={loading ? "svg-spinners:ring-resize" : "solar:hand-money-bold-duotone"}
            className="h-3.5 w-3.5"
          />

          {loading ? "Submitting..." : "Request Withdrawal"}
        </Button>
      </form>
    </div>
  );
};

export default WithdrawalPage;