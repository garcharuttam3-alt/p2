
import api from "./axios";

/* =====================================
   TYPES
===================================== */

export interface ApplyProviderPayload {
  serviceType: string;
  address: string;
  city: string;
  pincode: string;
}

export interface ServicePayload {
  name: string;
  description: string;
  price: number;
  category?: string;
}

export type DocumentType = "Aadhaar" | "PAN" | "License";

export interface ProviderDocument {
  type: DocumentType;
  base64: string;
}

export interface WithdrawalRequest {
  amount: number;
}

/* =====================================
   API
===================================== */

export const providerApi = {
  apply: (data: ApplyProviderPayload) =>
    api.post("/providers/apply", data),

  addService: (data: ServicePayload) =>
    api.post("/providers/service", data),

  updateService: (serviceId: string, data: ServicePayload) =>
    api.put(`/providers/service/${serviceId}`, data),

  getMyServices: () =>
    api.get("/providers/providerServices"),

  getBookings: () =>
    api.get("/providers/bookings"),

  requestWithdrawal: (data: WithdrawalRequest) =>
    api.post("/providers/withdraw", data),

  uploadDocuments: (data: { documents: ProviderDocument[] }) =>
  api.post("/provider-documents/upload", data),
  
  getMyProviderProfile: () => api.get("/users/profile"),
};  