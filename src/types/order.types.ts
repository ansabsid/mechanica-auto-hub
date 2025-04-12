
import { Part } from "@/hooks/useCarParts";
import { CartItem } from "@/types/cart.types";

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'confirmed';
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
  installation_fee?: number;
  installation_status?: 'new' | 'contacted' | 'scheduled';
  scheduled_date?: string;
  scheduled_time?: string;
  part?: {
    name: string;
    description?: string;
  };
  garage?: {
    name: string;
    location: string;
  };
}

export interface CreateOrderItem {
  part_id: number;
  garage_id: string | null;
  quantity: number;
  price: number;
  installation_fee?: number | null;
}

export interface InstallationRequestGarage {
  id: string;
  order_item_id: string;
  garage_id: string;
  created_at: string;
}
