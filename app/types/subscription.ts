export interface SubscriptionPlan {
  _id: string;
  name: string;
  tokens: number;
  price: number;
  description: string;
  save_percentage: number | null;
}
