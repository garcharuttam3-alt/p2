import { useEffect, useState } from "react";
import { bookingApi } from "@/api/bookingApi";
import { paymentApi } from "@/api/paymentApi";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

interface Booking {
  _id: string;
  service?: string;
  provider?: string;
  priceAtBooking: number;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  paymentStatus?: "pending" | "paid";
  createdAt: string;
  serviceOtp?: string;
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getUserBookings();
      setBookings(res.data.bookings || []);
    } catch {
      toast({ title: "Failed to load bookings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const shortId = (id?: string) => id?.slice(-6).toUpperCase();

  const handlePayment = async (bookingId: string) => {
    try {
      if (!(window as any).Razorpay) {
        toast({ title: "Razorpay not loaded ❌", variant: "destructive" });
        return;
      }

      setPayingId(bookingId);

      const res = await paymentApi.createOrder(bookingId);
      const { order } = res.data;

      const rzp = new (window as any).Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "ServiceBridge",
        description: "Service Payment",
        order_id: order.id,

        handler: async (response: any) => {
          try {
            await paymentApi.verify({
              bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast({ title: "Payment successful 🎉" });
            fetchBookings();
          } catch {
            toast({ title: "Verification failed ❌", variant: "destructive" });
          } finally {
            setPayingId(null);
          }
        },
      });

      rzp.open();
    } catch {
      toast({ title: "Payment failed ❌", variant: "destructive" });
      setPayingId(null);
    }
  };

  const canChat = (status: string, paymentStatus?: string) =>
    status !== "cancelled" && paymentStatus === "paid";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Icon icon="svg-spinners:ring-resize" className="text-3xl text-primary" />
      </div>
    );
  }
return (
  <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

    {/* HEADER */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bookings
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of all your service bookings
        </p>
      </div>
    </div>

    {/* EMPTY */}
    {bookings.length === 0 && (
      <div className="border rounded-xl py-20 text-center text-muted-foreground">
        No bookings available
      </div>
    )}

    {/* TABLE */}
    <div className="border rounded-xl overflow-hidden bg-card">

      {/* TABLE HEADER */}
      <div className="grid grid-cols-6 text-xs font-medium text-muted-foreground border-b px-4 py-3 bg-muted/40">
        <span>ID</span>
        <span>Provider</span>
        <span>Status</span>
        <span>Payment</span>
        <span>Price</span>
        <span className="text-right">Action</span>
      </div>

      {/* ROWS */}
      {bookings.map((b) => {

        const isPaid = b.paymentStatus === "paid";

        return (
          <div
            key={b._id}
            className="grid grid-cols-6 items-center px-4 py-3 text-sm border-b last:border-none hover:bg-muted/40 transition"
          >

            {/* ID */}
            <span className="font-mono text-xs">
              #{shortId(b._id)}
            </span>

            {/* PROVIDER */}
            <span className="text-xs text-muted-foreground font-mono">
              {shortId(b.provider)}
            </span>

            {/* STATUS */}
            <span>
              <span className={`px-2 py-1 rounded-md text-[11px] font-medium ${statusColor[b.status]}`}>
                {b.status.replace("_", " ")}
              </span>
            </span>

            {/* PAYMENT */}
            <span className={`text-xs font-medium ${
              isPaid ? "text-green-600" : "text-yellow-600"
            }`}>
              {b.paymentStatus}
            </span>

            {/* PRICE */}
            <span className="font-semibold">
              ₹{b.priceAtBooking}
            </span>

            {/* ACTION */}
            <div className="flex justify-end gap-2">

              {b.status === "accepted" && !isPaid && (
                <button
                  onClick={() => handlePayment(b._id)}
                  disabled={payingId === b._id}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-white hover:opacity-90 transition"
                >
                  {payingId === b._id ? "Processing..." : "Pay"}
                </button>
              )}

              {canChat(b.status, b.paymentStatus) && (
                <Link
                  to={`/chat?booking=${b._id}`}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border hover:bg-muted transition"
                >
                  Chat
                </Link>
              )}

            </div>

          </div>
        );
      })}
    </div>
  </div>
);
};

export default BookingsPage;