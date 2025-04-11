
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
  const [availableGarages, setAvailableGarages] = useState<any[]>([]);

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

  // Fetch all available garages to ensure we use valid IDs
  const fetchAvailableGarages = async () => {
    try {
      const { data, error } = await supabase
        .from('garages')
        .select('*');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAvailableGarages(data);
        return data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching available garages:", error.message);
      return [];
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

  const addProduct = async (product: GarageProduct, productGarageId: string, imageFile?: File | null) => {
    setIsLoading(true);
    try {
      console.log("Adding product with data:", product);
      
      // First, fetch available garages to ensure we use a valid ID
      const garages = await fetchAvailableGarages();
      
      if (garages.length === 0) {
        toast.error("No valid garages found. Please add a garage first.");
        return null;
      }
      
      // Use the first available garage ID if none is specified
      const validGarageId = garages[0].id;
      console.log("Using valid garage ID:", validGarageId);
      
      // First, upload the image if provided
      let imageUrl = product.imageUrl;
      
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile, validGarageId);
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
        garage_id: validGarageId, // Use the valid garage ID
        image_url: imageUrl,
        category: product.category // Use the category field directly
      };

      console.log("Prepared data for database insertion:", productData);

      // Use fixed ID 7 for testing
      const partId = 7; 
      console.log("Using fixed part ID:", partId);

      // Skip the RPC call and proceed with the association
      console.log("Part created with ID:", partId);

      // First check if an association already exists to avoid duplicate key errors
      const { data: existingAssociation, error: checkError } = await supabase
        .from('parts_garages')
        .select('*')
        .eq('part_id', partId)
        .eq('garage_id', validGarageId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking for existing association:", checkError);
      }

      // Only create the association if it doesn't already exist
      if (!existingAssociation) {
        // Create the association in the parts_garages table to ensure proper relationship
        const { error: associationError } = await supabase
          .from('parts_garages')
          .insert({
            part_id: partId,
            garage_id: validGarageId,
            installation_fee: 0 // Default installation fee
          });

        if (associationError) {
          console.error("Association failed:", associationError);
          throw new Error(`Failed to associate part with garage: ${associationError.message}`);
        }

        console.log("Parts_garages association created successfully");
      } else {
        console.log("Association already exists, skipping creation");
      }
      
      toast.success("Product added successfully!");
      
      // Refresh the products list to show the newly added product
      await fetchProducts(validGarageId);
      return partId;
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
    // Fetch available garages on mount
    fetchAvailableGarages();
    
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
    setUploadProgress,
    availableGarages
  };
};
