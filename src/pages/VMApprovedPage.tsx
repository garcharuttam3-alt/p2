import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Provider {
  _id: string;
  user?: {
    name?: string;
    email?: string;
  };
  serviceType?: string;
  city?: string;
  address?: string;
  pincode?: string;
  verificationStatus?: string;
  documents?: { type: string; url: string }[];
  createdAt?: string;
}

const VMApprovedPage = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminApi.getAllProviders(); // ✅ SAME API
        const all = res.data.providers || res.data || [];

        // ✅ FIXED FILTER
        setProviders(all.filter((p: Provider) => p.verificationStatus === "approved"));
      } catch {
        toast({ title: "Failed to load", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" />
      </div>
    );

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">
        Approved Providers
      </h2>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-muted-foreground">
                Provider
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-muted-foreground">
                Service
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-muted-foreground">
                Location
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-muted-foreground">
                Documents
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-muted-foreground">
                Date
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {providers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-xs">
                  No approved providers
                </td>
              </tr>
            ) : (
              providers.map((p) => (
                <tr key={p._id} className="hover:bg-secondary/30 transition-colors">
                  
                  {/* Provider */}
                  <td className="px-5 py-3">
                    <p className="text-xs font-semibold text-foreground">
                      {p.user?.name || "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.user?.email}
                    </p>
                  </td>

                  {/* Service */}
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {p.serviceType || "—"}
                  </td>

                  {/* Location */}
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {p.city}, {p.address}
                  </td>

                  {/* Documents */}
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.documents?.map((doc, i) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:underline"
                        >
                          {doc.type}
                        </a>
                      ))}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3 text-[10px] text-muted-foreground">
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold bg-success/10 text-success">
                      Approved
                    </span>
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

export default VMApprovedPage;