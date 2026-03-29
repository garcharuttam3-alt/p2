import { useEffect, useState } from "react";
import { reviewApi } from "@/api/reviewApi";
import api from "@/api/axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";

interface Booking {
  _id: string;
  provider: {
    _id: string;
    name: string;
  };
}

interface ReviewForm {
  rating: number;
  comment: string;
}

const ReviewsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState<Record<string, ReviewForm>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  /* ======================================================
     FETCH BOOKINGS
  ====================================================== */
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings/my-completed");
      setBookings(res.data.bookings || []);
    } catch {
      toast({
        title: "Failed to load completed bookings",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ======================================================
     SET RATING
  ====================================================== */
  const setRating = (bookingId: string, rating: number) => {
    setForm((prev) => ({
      ...prev,
      [bookingId]: {
        rating,
        comment: prev[bookingId]?.comment || "",
      },
    }));
  };

  /* ======================================================
     SET COMMENT
  ====================================================== */
  const setComment = (bookingId: string, comment: string) => {
    setForm((prev) => ({
      ...prev,
      [bookingId]: {
        rating: prev[bookingId]?.rating || 5, // ⭐ default
        comment,
      },
    }));
  };

  /* ======================================================
     SUBMIT REVIEW
  ====================================================== */
  const submitReview = async (bookingId: string) => {
    const data = form[bookingId];

    if (!data || !data.rating) {
      toast({
        title: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [bookingId]: true }));

      await reviewApi.add({
        bookingId,
        rating: data.rating,
        comment: data.comment,
      });

      toast({
        title: "Review submitted successfully ⭐",
      });

      // remove booking
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));

      // clear form
      setForm((prev) => {
        const updated = { ...prev };
        delete updated[bookingId];
        return updated;
      });
    } catch {
      toast({
        title: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <h2 className="text-xl font-bold">Give Reviews ⭐</h2>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          🎉 No pending reviews — all done!
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const currentRating = form[b._id]?.rating || 0;

            return (
              <div
                key={b._id}
                className="border border-border rounded-2xl p-5 bg-card space-y-4"
              >
                {/* PROVIDER */}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Service Provider
                  </p>
                  <p className="font-semibold text-foreground">
                    {b.provider?.name || "Unknown"}
                  </p>
                </div>

                {/* STAR RATING */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(b._id, star)}
                    >
                      <Icon
                        icon="solar:star-bold"
                        className={`h-6 w-6 transition ${
                          star <= currentRating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* COMMENT */}
                <Textarea
                  placeholder="Write your experience..."
                  value={form[b._id]?.comment || ""}
                  onChange={(e) =>
                    setComment(b._id, e.target.value)
                  }
                />

                {/* SUBMIT */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={!currentRating || submitting[b._id]}
                    onClick={() => submitReview(b._id)}
                    className="gap-1.5"
                  >
                    {submitting[b._id] ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;