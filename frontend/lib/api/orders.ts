import { apiFetch } from "./client";
import type { ApiResponse } from "./auth";
import type { Order, CreateOrderPayload } from "@/types/api";

type OrderListResponse = {
  success: boolean;
  data: Order[];
  meta: { current_page: number; last_page: number; total: number };
};

export const createOrder = (data: CreateOrderPayload, token: string) =>
  apiFetch<ApiResponse<Order>>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });

export const getOrders = (token: string) =>
  apiFetch<OrderListResponse>("/orders", { token });

export const getOrder = (code: string, token: string) =>
  apiFetch<ApiResponse<Order>>(`/orders/${code}`, { token });

export const cancelOrder = (code: string, token: string) =>
  apiFetch<ApiResponse<Order>>(`/orders/${code}`, {
    method: "DELETE",
    token,
  });
