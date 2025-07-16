export interface orderDto {
  _id?: string;
  userId: string;
  courseId: string;
  paymentId: string;
  amount: number;
  currency: "inr" | "usd";
  planType: string;
  paymentStatus?: "paid" | "failed";
  sessionId: string;
}
