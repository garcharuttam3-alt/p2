import { useEffect, useState } from "react";
import { walletApi } from "@/api/walletApi";
import { Icon } from "@iconify/react";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
}

const ProviderWalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await walletApi.getBalance();

        console.log("API RESPONSE:", res.data); // 🔍 debug

        const wallet = res.data.wallet;

        // ✅ EXACT MAPPING FROM YOUR RESPONSE
        setBalance(wallet?.balance || 0);
        setTransactions(wallet?.transactions || []);

      } catch (error) {
        console.error("Wallet Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold">Wallet 💸</h2>
        <p className="text-sm text-muted-foreground">
          Manage your earnings and transactions
        </p>
      </div>

      {/* BALANCE CARD */}
      <div className="rounded-xl bg-card border p-6">
        <p className="text-sm text-muted-foreground">Wallet Balance</p>
        <h1 className="text-3xl font-bold mt-2">₹{balance}</h1>
      </div>

      {/* TRANSACTIONS */}
      <div className="rounded-xl bg-card border p-5">
        <h3 className="text-sm font-bold mb-4">Recent Transactions</h3>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div
                key={t._id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {t.description || "Transaction"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>

                <p
                  className={`font-bold ${
                    t.type === "credit" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {t.type === "credit" ? "+" : "-"}₹{t.amount}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-5">
            No transactions yet
          </p>
        )}
      </div>
    </div>
  );
};

export default ProviderWalletPage;