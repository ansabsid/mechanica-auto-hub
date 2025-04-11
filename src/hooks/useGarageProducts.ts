
import { useState, useEffect } from "react";
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
  imageUrl?: string | null;
}

export const useGarageProducts = (garageId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Fetch products for a specific garage
  const fetchProducts = async (garageId: string) => {
    if (!garageId) return;
    
    setFetchLoading(true);
    try {
      // First try to fetch from parts where garage_id matches
      const { data: directParts, error: directError } = await supabase
        .from('parts')
        .select('*')
        .eq('garage_id', garageId);

      if (directError) throw directError;
      
      // Then fetch from parts_garages association table
      const { data: associatedParts, error: associationError } = await supabase
        .from('parts_garages')
        .select('part_id, installation_fee, parts(*)')
        .eq('garage_id', garageId);
        
      if (associationError) throw associationError;
      
      // Combine results, giving priority to direct parts
      const combinedProducts = [
        ...(directParts || []), 
        ...(associatedParts?.map(item => ({
          ...item.parts,
          installation_fee: item.installation_fee
        })) || [])
      ];
      
      // Remove duplicates based on id
      const uniqueProducts = combinedProducts.filter((product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
      );
      
      setProducts(uniqueProducts);
      return uniqueProducts;
    } catch (error: any) {
      console.error("Error fetching products:", error.message);
      toast.error("Failed to load products");
      return [];
    } finally {
      setFetchLoading(false);
    }
  };

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
        garage_id: garageId,
        image_url: product.imageUrl // Use the image URL directly
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
      
      // Refresh the products list
      await fetchProducts(garageId);
      return partData.id;
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
      console.error("Add product error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Use effect to fetch products when garageId changes
  useEffect(() => {
    if (garageId) {
      fetchProducts(garageId);
    }
  }, [garageId]);

  return {
    addProduct,
    fetchProducts,
    products,
    isLoading,
    fetchLoading
  };
};
