import api from "./axios";

export const paymentApi = {
  // 💳 Create Razorpay Order
  createOrder: (bookingId: string) =>
    api.post("/payment/create-order", { bookingId }),

  // 🔐 Verify Payment
  verify: (data: {
    bookingId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    api.post("/payment/verify", data),

  // 🔁 Refund (Admin)
  refund: (paymentId: string) =>
    api.put(`/payment/refund/${paymentId}`),
};