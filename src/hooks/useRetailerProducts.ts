import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EnhancedSupabaseClient } from "@/hooks/auth/supabaseTypes";

const enhancedSupabase = supabase as unknown as EnhancedSupabaseClient;

export interface RetailerProduct {
  id?: number;
  name: string;
  category: string;
  price: string | number;
  quantity: string | number;
  status: string;
  retailer_id?: string;
  source_type: 'retailer';
  imageUrl?: string | null;
  manufacturer_id?: number;
  model_id?: number;
  year?: number;
  description?: string;
}

interface InsertPartResponse {
  id: number;
  [key: string]: any;
}

// This is the corrected interface for what actually comes back from the database
interface PartFromDB {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  manufacturer_id: number;
  model_id: number;
  year: number;
  garage_id: string | null;
  retailer_id: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string | null;
  updated_at: string | null;
  source_type?: 'garage' | 'retailer' | null;
  retailers?: {
    name: string;
  };
}

export const useRetailerProducts = (retailerId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<RetailerProduct[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [availableRetailers, setAvailableRetailers] = useState<any[]>([]);

  const ensureStorageBucket = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const partsBucketExists = buckets?.some(bucket => bucket.name === 'parts');
      
      if (!partsBucketExists) {
        console.log("Parts bucket doesn't exist, attempting to create it...");
        
        const { error } = await supabase.storage.createBucket('parts', {
          public: true,
          fileSizeLimit: 10485760
        });
        
        if (error) {
          console.error("Error creating storage bucket:", error);
          return false;
        }
        
        console.log("Parts bucket created successfully");
      }
      
      return true;
    } catch (error) {
      console.error("Error checking/creating storage bucket:", error);
      return false;
    }
  };

  const uploadImage = async (file: File, retailerId: string): Promise<string | null> => {
    try {
      setUploadProgress(5);
      
      if (!file) return null;
      
      const bucketReady = await ensureStorageBucket();
      if (!bucketReady) {
        toast.error("Could not prepare storage for upload");
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(15);
      
      const fileExt = file.name.split('.').pop();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}_${safeFileName}`;
      const filePath = `retailers/${retailerId}/${fileName}`;
      
      console.log("Attempting to upload file to 'parts' bucket:", filePath);
      
      setUploadProgress(30);
      
      const { data, error } = await supabase.storage
        .from('parts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      if (error) {
        console.error("Storage upload error:", error);
        toast.error(`Upload failed: ${error.message}`);
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(70);
      
      const { data: publicUrlData } = supabase.storage
        .from('parts')
        .getPublicUrl(filePath);
      
      if (!publicUrlData.publicUrl) {
        console.error("Failed to get public URL");
        toast.error("Failed to generate public URL for the image");
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(100);
      console.log("Image uploaded successfully, public URL:", publicUrlData.publicUrl);
      
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(`Upload error: ${error.message || "Unknown error"}`);
      setUploadProgress(0);
      return null;
    }
  };

  const fetchAvailableRetailers = async () => {
    try {
      // Use RPC function to get retailers
      const { data, error } = await supabase.rpc('get_retailers');
          
      if (error) {
        console.error("Query error:", error);
        return [];
      }
      
      if (data && data.length > 0) {
        console.log("Available retailers (from RPC):", data);
        setAvailableRetailers(data);
        return data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching available retailers:", error.message);
      return [];
    }
  };

  const fetchProducts = async (retailerId: string) => {
    if (!retailerId) {
      console.log("No retailer ID provided for fetching products");
      return [];
    }
    
    console.log("Fetching products for retailer ID:", retailerId);
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .eq('retailer_id', retailerId)
        .eq('source_type', 'retailer');

      if (error) {
        console.error("Error fetching retailer parts:", error);
        throw error;
      }
      
      console.log("Retailer parts fetched:", data?.length || 0);
      
      // Map the database parts to RetailerProduct format
      const typedData = data as PartFromDB[] || [];
      const formattedProducts: RetailerProduct[] = typedData.map(part => ({
        id: part.id,
        name: part.name,
        description: part.description || '',
        category: part.category || '',
        price: part.price,
        quantity: part.stock,
        status: part.stock > 0 ? 'In Stock' : 'Out of Stock',
        retailer_id: part.retailer_id || undefined,
        source_type: 'retailer',
        imageUrl: part.image_url,
        manufacturer_id: part.manufacturer_id,
        model_id: part.model_id,
        year: part.year
      }));
      
      setProducts(formattedProducts);
      return formattedProducts;
    } catch (error: any) {
      console.error("Error fetching products:", error.message);
      toast.error("Failed to load products");
      setProducts([]);
      return [];
    } finally {
      setFetchLoading(false);
    }
  };

  const addProduct = async (product: RetailerProduct, productRetailerId: string, imageFile?: File | null) => {
    setIsLoading(true);
    try {
      console.log("Adding product with data:", product);
      
      const retailers = await fetchAvailableRetailers();
      
      if (retailers.length === 0) {
        toast.error("No valid retailers found. Please add a retailer first.");
        return null;
      }
      
      let validRetailerId = productRetailerId;
      // Check if the provided retailer ID exists in the available retailers
      const retailerExists = retailers.some(retailer => retailer.id === productRetailerId);
      
      if (!retailerExists) {
        console.log("Provided retailer ID not found in available retailers, using first available retailer");
        validRetailerId = retailers[0].id;
        
        if (!validRetailerId) {
          toast.error("Unable to find a valid retailer. Please add a retailer first.");
          return null;
        }
      }
      
      console.log("Using valid retailer ID:", validRetailerId);
      
      let imageUrl = product.imageUrl;
      
      if (imageFile) {
        console.log("Attempting to upload image file:", imageFile.name);
        imageUrl = await uploadImage(imageFile, validRetailerId);
        if (imageUrl) {
          console.log("Image uploaded successfully, URL:", imageUrl);
        } else {
          toast.warning("Product will be added without an image as upload failed");
        }
      }
      
      const productData = {
        name: product.name,
        price: parseFloat(product.price.toString()),
        stock: parseInt(product.quantity.toString()), 
        description: product.description || '',
        manufacturer_id: product.manufacturer_id || 1,
        model_id: product.model_id || 1,
        year: product.year || new Date().getFullYear(),
        retailer_id: validRetailerId,
        source_type: 'retailer',
        image_url: imageUrl,
        category: product.category
      };

      console.log("Prepared data for database insertion:", productData);

      const { data, error } = await enhancedSupabase.rpc('insert_part', {
        part_data: productData
      });

      if (error) {
        console.error("RPC error:", error);
        throw new Error(`Failed to create part: ${error.message}`);
      }

      const response = data as InsertPartResponse;
      const partId = response.id;

      if (!partId) {
        throw new Error("No part ID returned from database");
      }

      console.log("Part created with ID:", partId);
      
      toast.success("Product added successfully!");
      
      await fetchProducts(validRetailerId);
      return partId;
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
      console.error("Add product error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (product: RetailerProduct): Promise<boolean> => {
    if (!product.id) {
      toast.error("Product ID is missing");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Updating product with data:", product);
      
      const quantity = typeof product.quantity === 'string' 
        ? parseInt(product.quantity, 10) 
        : product.quantity;
      
      const updateData = {
        name: product.name,
        price: parseFloat(product.price.toString()),
        stock: quantity,
        description: product.description || '',
        manufacturer_id: product.manufacturer_id || 1,
        model_id: product.model_id || 1,
        year: product.year || new Date().getFullYear(),
        category: product.category
      };
      
      console.log("Prepared data for database update:", updateData);
      
      const { error } = await supabase
        .from('parts')
        .update(updateData)
        .eq('id', product.id)
        .eq('source_type', 'retailer');
      
      if (error) {
        console.error("Update error:", error);
        toast.error(`Failed to update product: ${error.message}`);
        return false;
      }
      
      if (product.retailer_id) {
        console.log("Refreshing products for retailer:", product.retailer_id);
        await fetchProducts(product.retailer_id);
      }
      
      toast.success("Product updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: number, retailerId?: string): Promise<boolean> => {
    if (!productId) {
      toast.error("Product ID is missing");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Deleting product with ID:", productId);
      
      // First remove any garage associations
      const { error: associationError } = await supabase
        .from('parts_garages')
        .delete()
        .eq('part_id', productId);
      
      if (associationError) {
        console.error("Error removing product associations:", associationError);
      }
      
      const { error } = await supabase
        .from('parts')
        .delete()
        .eq('id', productId)
        .eq('source_type', 'retailer');
      
      if (error) {
        console.error("Delete error:", error);
        toast.error(`Failed to delete product: ${error.message}`);
        return false;
      }
      
      if (retailerId) {
        await fetchProducts(retailerId);
      }
      
      toast.success("Product deleted successfully!");
      return true;
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeHook = async () => {
      const retailers = await fetchAvailableRetailers();
      
      if (retailerId) {
        console.log("Retailer ID provided on mount:", retailerId);
        fetchProducts(retailerId);
      } else if (retailers.length > 0) {
        const firstRetailerId = retailers[0]?.id;
        console.log("No retailer ID provided, using first retailer:", firstRetailerId);
        
        if (firstRetailerId) {
          fetchProducts(firstRetailerId);
        }
      } else {
        console.log("No retailers available");
      }
    };
    
    initializeHook();
  }, [retailerId]);

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
    products,
    isLoading,
    fetchLoading,
    uploadProgress,
    setUploadProgress,
    availableRetailers,
    fetchAvailableRetailers
  };
};

export default useRetailerProducts;
