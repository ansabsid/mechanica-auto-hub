
import { Part, Garage as PartGarage } from "@/hooks/car-parts/types";

export interface Garage {
  id: string;
  name: string;
  location: string;
  installationFee: number;
}

export interface Retailer {
  id: string;
  name: string;
  location: string;
}

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
  installation_data?: InstallationOptions;
  part: Part;
}

export interface Cart {
  id: string;
  user_id: string;
}
