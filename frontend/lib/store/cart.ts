import { create } from "zustand";

export type SelectedOption = {
  optionGroupId: number;
  optionGroupName: string;
  optionItemId: number;
  optionName: string;
};

export type CartItem = {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  selectedOptions: SelectedOption[];
  subtotal: number;
};

type CartStore = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "subtotal">) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
};

function derived(items: CartItem[]) {
  return {
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    totalPrice: items.reduce((s, i) => s + i.subtotal, 0),
  };
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,

  addItem: (item) =>
    set((state) => {
      const next = [
        ...state.items,
        { ...item, subtotal: item.productPrice * item.quantity },
      ];
      return { items: next, ...derived(next) };
    }),

  removeItem: (index) =>
    set((state) => {
      const next = state.items.filter((_, i) => i !== index);
      return { items: next, ...derived(next) };
    }),

  updateQuantity: (index, qty) => {
    if (qty < 1) return;
    set((state) => {
      const next = state.items.map((item, i) =>
        i === index
          ? { ...item, quantity: qty, subtotal: item.productPrice * qty }
          : item
      );
      return { items: next, ...derived(next) };
    });
  },

  clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
}));
