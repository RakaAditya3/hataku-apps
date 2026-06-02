import { apiFetch } from "./client";

export type CheckinResult = {
  streak_day: number;
  points_earned: number;
  point_balance: number;
  is_bonus_day: boolean;
};

export type CheckinStatus = {
  current_streak: number;
  last_checkin_date: string | null;
  already_checked_in: boolean;
  next_streak_day: number;
  next_points_if_checkin: number;
  streak_started_at: string | null;
  point_balance: number;
};

export type PointTransaction = {
  id: number;
  type: "earn" | "redeem" | "refund" | "referral" | "checkin" | "adjustment";
  amount: number;
  balance_after: number;
  note: string | null;
  order_code: string | null;
  created_at: string;
};

export type Reward = {
  id: number;
  name: string;
  description: string | null;
  type: "discount" | "product";
  points_required: number;
  discount_value: number | null;
  is_active: boolean;
  product?: {
    id: number;
    name: string;
    price: number;
  } | null;
};

type ApiResponse<T> = { success: boolean; data: T };
type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
};

export const checkin = (token: string) =>
  apiFetch<ApiResponse<CheckinResult>>("/checkin", {
    method: "POST",
    token,
  });

export const getCheckinStatus = (token: string) =>
  apiFetch<ApiResponse<CheckinStatus>>("/checkin/status", { token });

export const getPointHistory = (token: string, page = 1) =>
  apiFetch<PaginatedResponse<PointTransaction>>(`/points/history?page=${page}`, { token });

export const getRewards = () =>
  apiFetch<ApiResponse<Reward[]>>("/rewards");

export const getReward = (id: number) =>
  apiFetch<ApiResponse<Reward>>(`/rewards/${id}`);

// Admin
export const getAdminRewards = (token: string) =>
  apiFetch<ApiResponse<Reward[]>>("/admin/rewards", { token });

export const createAdminReward = (data: Partial<Reward>, token: string) =>
  apiFetch<ApiResponse<Reward>>("/admin/rewards", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });

export const updateAdminReward = (id: number, data: Partial<Reward & { is_active: boolean }>, token: string) =>
  apiFetch<ApiResponse<Reward>>(`/admin/rewards/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });

export const deleteAdminReward = (id: number, token: string) =>
  apiFetch<{ success: boolean; message: string }>(`/admin/rewards/${id}`, {
    method: "DELETE",
    token,
  });
