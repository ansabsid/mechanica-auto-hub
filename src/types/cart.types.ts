
import { Part } from "@/hooks/useCarParts";

export interface CartItem {
  id: string;
  cart_id: string;
  part_id: number;
  quantity: number;
  part: Part;
}

export interface Cart {
  id: string;
  user_id: string;
}
