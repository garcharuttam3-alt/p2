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
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your bookings & payments
        </p>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-20 border rounded-lg">
          No bookings yet
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="p-5 border rounded-xl bg-card shadow-sm hover:shadow-md transition space-y-4"
          >
            {/* TOP */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-base">
                  Booking #{shortId(b._id)}
                </h2>

                <p className="text-xs text-muted-foreground">
                  👤 Provider ID:{" "}
                  <span className="font-mono">
                    {shortId(b.provider)}
                  </span>
                </p>

                <p className="text-xs text-muted-foreground">
                  🛠 Service ID:{" "}
                  <span className="font-mono">
                    {shortId(b.service)}
                  </span>
                </p>
              </div>

              <span className={`text-xs px-2 py-1 rounded ${statusColor[b.status]}`}>
                {b.status}
              </span>
            </div>

            {/* INFO */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Price</p>
                <p className="font-semibold">₹{b.priceAtBooking}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Payment</p>
                <p className={b.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}>
                  {b.paymentStatus}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">OTP</p>
                <p className="font-mono">
                  {b.paymentStatus === "paid" ? b.serviceOtp : "—"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              {b.status === "accepted" && b.paymentStatus === "pending" && (
                <button
                  onClick={() => handlePayment(b._id)}
                  disabled={payingId === b._id}
                  className="px-3 py-1.5 bg-primary text-white rounded"
                >
                  {payingId === b._id ? "Processing..." : "Pay"}
                </button>
              )}

              {canChat(b.status, b.paymentStatus) && (
                <Link to={`/chat?booking=${b._id}`} className="px-3 py-1.5 border rounded">
                  Chat
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsPage;