import { apiFetch } from "./client";

export type UserData = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  tier: "bamboo" | "jade" | "imperial" | "dragon";
  point_balance: number;
  valid_transaction_count: number;
  current_streak: number;
  referral_code: string | null;
  created_at: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const getMe = (token: string) =>
  apiFetch<ApiResponse<UserData>>("/user/me", { token });

export const updateProfile = (
  data: { name?: string; phone: string },
  token: string
) =>
  apiFetch<ApiResponse<UserData>>("/user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
