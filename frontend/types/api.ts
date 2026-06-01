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
