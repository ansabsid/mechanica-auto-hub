
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GarageProduct {
  id?: number;
  name: string;
  category: string;
  price: string | number;
  quantity: string | number;
  status: string;
  garage_id?: string;
}

export const useGarageProducts = () => {
  const [isLoading, setIsLoading] = useState(false);

  const addProduct = async (product: GarageProduct, garageId: string) => {
    setIsLoading(true);
    try {
      // Convert string values to appropriate types
      const productData = {
        name: product.name,
        category: product.category,
        price: parseFloat(product.price.toString()),
        stock: parseInt(product.quantity.toString()),
        description: null,
        manufacturer_id: 1, // Default values, in a real app these would be selected
        model_id: 1,        // Default values, in a real app these would be selected
        year: new Date().getFullYear(),
        garage_id: garageId
      };

      // 1. Insert the part into the parts table
      const { data: partData, error: partError } = await supabase
        .from('parts')
        .insert(productData)
        .select('id')
        .single();

      if (partError) {
        throw new Error(`Failed to add part: ${partError.message}`);
      }

      // 2. Create the association in the parts_garages table
      const { error: associationError } = await supabase
        .from('parts_garages')
        .insert({
          part_id: partData.id,
          garage_id: garageId,
          installation_fee: 0 // Default installation fee
        });

      if (associationError) {
        // If association fails, we should ideally rollback the part creation
        // but for simplicity we'll just report the error
        console.error("Association failed but part was created:", associationError);
        throw new Error(`Failed to associate part with garage: ${associationError.message}`);
      }

      toast.success("Product added successfully!");
      return partData.id;
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
      console.error("Add product error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addProduct,
    isLoading
  };
};
