
import { Part } from "@/hooks/useCarParts";
import { CartItem } from "@/types/cart.types";

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  part_id: number;
  garage_id?: string;
  quantity: number;
  price: number;
  created_at: string;
  part?: {
    name: string;
    description?: string;
  };
}

export interface CreateOrderItem {
  part_id: number;
  garage_id: string | null;
  quantity: number;
  price: number;
}
