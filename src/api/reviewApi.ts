import api from "./axios";

interface AddReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

export const reviewApi = {
  add: (data: AddReviewPayload) =>
    api.post("/reviews/add", data),

  delete: (id: string) =>
    api.delete(`/reviews/${id}`),

  getProviderReviews: (providerId: string) =>
    api.get(`/reviews/provider/${providerId}`),

  flag: (id: string) =>
    api.put(`/reviews/flag/${id}`),
};