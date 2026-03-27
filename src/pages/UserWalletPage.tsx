import { useEffect, useState } from "react";
import { walletApi } from "@/api/walletApi";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Transaction {
  _id: string;
  type?: string;
  amount?: number;
  description?: string;
  createdAt?: string;
}

const UserWalletPage = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [balRes, txRes] = await Promise.all([
          walletApi.getBalance().catch(() => null),
          walletApi.getTransactions().catch(() => null),
        ]);

        console.log("BALANCE API:", balRes?.data);
        console.log("TRANSACTION API:", txRes?.data);

        // ✅ BALANCE (handles ALL formats)
        const balance =
          balRes?.data?.wallet?.balance ??
          balRes?.data?.balance ??
          balRes?.data?.walletBalance ??
          0;

        // ✅ TRANSACTIONS (handles ALL formats)
        const rawTransactions =
          txRes?.data?.wallet?.transactions ??
          txRes?.data?.transactions ??
          txRes?.data ??
          [];

        // ✅ SORT latest first (optional but recommended)
        const transactions = rawTransactions.sort(
          (a: Transaction, b: Transaction) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );

        setBalance(balance);
        setTransactions(transactions);

      } catch (error) {
        console.error(error);
        toast({
          title: "Failed to load wallet",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">
        Wallet 💸
      </h2>

      {/* BALANCE CARD */}
      <div className="rounded-xl bg-card border border-border p-6 premium-shadow max-w-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Icon icon="solar:wallet-bold-duotone" className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Balance
            </p>
            <p className="text-2xl font-extrabold text-foreground font-display">
              ₹{balance}
            </p>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Type
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Amount
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground text-xs">
                  No transactions yet
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                        t.type === "credit" || t.type === "refund"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {t.type || "—"}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {t.description || "—"}
                  </td>

                  <td className="px-5 py-3 text-xs font-semibold text-foreground">
                    ₹{t.amount || 0}
                  </td>

                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserWalletPage;