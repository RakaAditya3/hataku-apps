export type Category = {
  id: number;
  name: string;
  sort_order: number;
};

export type OptionItem = {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export type OptionGroup = {
  id: number;
  name: string;
  is_required: boolean;
  min_select: number;
  max_select: number;
  items: OptionItem[];
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  is_available: boolean;
  category: Category;
  option_groups: OptionGroup[];
};

export type OrderStatus = 'pending' | 'paid' | 'in_progress' | 'done' | 'cancelled' | 'expired';

export type OrderItemOption = {
  id: number;
  option_group_id: number;
  option_item_id: number;
  option_name: string;
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  options: OrderItemOption[];
};

export type Order = {
  id: number;
  order_code: string;
  order_type: 'dine_in' | 'takeaway';
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  points_redeemed: number;
  points_value: number;
  reward_discount: number;
  total: number;
  points_earned: number | null;
  is_valid_transaction: boolean;
  promo_code_used: string | null;
  expires_at: string;
  paid_at: string | null;
  done_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  user: { name: string };
  items: OrderItem[];
};

export type SelectedOptionPayload = {
  option_group_id: number;
  option_item_id: number;
};

export type OrderItemPayload = {
  product_id: number;
  quantity: number;
  selected_options: SelectedOptionPayload[];
};

export type CreateOrderPayload = {
  order_type: 'dine_in' | 'takeaway';
  items: OrderItemPayload[];
  promo_code?: string;
  points_to_redeem?: number;
  reward_id?: number;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
};

export type AdminOptionGroup = {
  id: number;
  name: string;
  is_required: boolean;
  default_min_select: number;
  default_max_select: number;
  min_select: number;
  max_select: number;
};

export type AdminProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  is_available: boolean;
  is_deleted: boolean;
  sort_order: number;
  daily_stock_limit: number | null;
  category: Category;
  option_groups: AdminOptionGroup[];
  created_at: string;
  updated_at: string;
};

export type AdminCategory = {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
  is_deleted: boolean;
  products_count: number;
};

export type CreateProductPayload = {
  name: string;
  category_id: number;
  description?: string;
  price: number;
  photo_url?: string;
  is_available?: boolean;
  sort_order?: number;
  option_group_ids?: number[];
  option_group_overrides?: { option_group_id: number; min_select: number; max_select: number }[];
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export type CustomerTier = 'bamboo' | 'jade' | 'imperial' | 'dragon';

export type AdminCustomer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  tier: CustomerTier;
  point_balance: number;
  valid_transaction_count: number;
  current_streak: number;
  referral_code: string | null;
  created_at: string;
};

export type PointTransaction = {
  id: number;
  type: 'earn' | 'redeem' | 'refund' | 'referral' | 'checkin' | 'adjustment';
  amount: number;
  balance_after: number;
  note: string | null;
  order_code: string | null;
  created_at: string;
};

export type AdminCustomerDetail = AdminCustomer & {
  avatar_url: string | null;
  recent_orders: Order[];
  recent_point_transactions: PointTransaction[];
};
