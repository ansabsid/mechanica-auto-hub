
import { Part } from "@/hooks/useCarParts";

export interface InstallationOptions {
  installationRequired: boolean;
  garageId: string;
  garageName: string;
  installationFee: number;
}

export interface CartItem {
  id: string;
  cart_id: string;
  part_id: number;
  quantity: number;
  installation_options?: InstallationOptions;
  part: Part;
}

export interface Cart {
  id: string;
  user_id: string;
}
