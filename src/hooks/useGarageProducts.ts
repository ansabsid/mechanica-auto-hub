
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EnhancedSupabaseClient } from "@/hooks/auth/supabaseTypes";

// Cast supabase client to our enhanced type with RPC function signatures
const enhancedSupabase = supabase as unknown as EnhancedSupabaseClient;

export interface GarageProduct {
  id?: number;
  name: string;
  category: string;
  price: string | number;
  quantity: string | number;
  status: string;
  garage_id?: string;
  imageUrl?: string | null;
  manufacturer_id?: number;
  model_id?: number;
  year?: number;
  description?: string;
}

export const useGarageProducts = (garageId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Function to upload image to Supabase storage
  const uploadImage = async (file: File, garageId: string): Promise<string | null> => {
    try {
      setUploadProgress(10);
      
      if (!file) return null;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${garageId}/${fileName}`;
      
      console.log("Attempting to upload file:", filePath);
      
      setUploadProgress(30);
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('parts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Set the correct content type
        });
      
      if (error) {
        console.error("Storage upload error:", error);
        throw new Error(`Error uploading image: ${error.message}`);
      }
      
      setUploadProgress(90);
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('parts')
        .getPublicUrl(filePath);
      
      setUploadProgress(100);
      console.log("Image uploaded successfully, public URL:", publicUrlData.publicUrl);
      
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error("Image upload error:", error);
      setUploadProgress(0);
      throw error;
    }
  };

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

  const addProduct = async (product: GarageProduct, garageId: string, imageFile?: File | null) => {
    setIsLoading(true);
    try {
      console.log("Adding product with data:", product);
      
      // First, upload the image if provided
      let imageUrl = product.imageUrl;
      
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile, garageId);
          console.log("Image uploaded successfully, URL:", imageUrl);
        } catch (uploadError: any) {
          console.error("Error during image upload:", uploadError);
          toast.error(`Image upload failed: ${uploadError.message}`);
          // Continue with product creation without image
        }
      }
      
      // Now use the category field directly and store description separately
      const productData = {
        name: product.name,
        price: parseFloat(product.price.toString()),
        stock: parseInt(product.quantity.toString()), 
        description: product.description || '', // Use the description field
        manufacturer_id: product.manufacturer_id || 1,
        model_id: product.model_id || 1,
        year: product.year || new Date().getFullYear(),
        garage_id: garageId,
        image_url: imageUrl,
        category: product.category // Use the category field directly
      };

      console.log("Prepared data for database insertion:", productData);

      // Use RPC (Remote Procedure Call) function to bypass RLS
      const { data, error: partError } = await enhancedSupabase
        .rpc('insert_part', {
          part_data: productData
        });

      if (partError) {
        console.error("RPC error:", partError);
        throw new Error(`Failed to add part: ${partError.message}`);
      }

      if (!data || !data.id) {
        throw new Error("Part creation failed - no ID returned");
      }

      console.log("Part added successfully through RPC, id:", data.id);

      // 2. Create the association in the parts_garages table to ensure proper relationship
      const { error: associationError } = await supabase
        .from('parts_garages')
        .insert({
          part_id: data.id,
          garage_id: garageId,
          installation_fee: 0 // Default installation fee
        });

      if (associationError) {
        console.error("Association failed but part was created:", associationError);
        throw new Error(`Failed to associate part with garage: ${associationError.message}`);
      }

      console.log("Parts_garages association created successfully");
      
      toast.success("Product added successfully!");
      
      // Refresh the products list to show the newly added product
      await fetchProducts(garageId);
      return data.id;
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
    fetchLoading,
    uploadProgress,
    setUploadProgress
  };
};
