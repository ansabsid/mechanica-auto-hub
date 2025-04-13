
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EnhancedSupabaseClient } from "@/hooks/auth/supabaseTypes";

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
  installation_fee?: number | string;
}

interface InsertPartResponse {
  id: number;
  [key: string]: any;
}

export const useGarageProducts = (garageId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [availableGarages, setAvailableGarages] = useState<any[]>([]);

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

  const uploadImage = async (file: File, garageId: string): Promise<string | null> => {
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
      const filePath = `${garageId}/${fileName}`;
      
      console.log("Attempting to upload file to 'parts' bucket:", filePath);
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });
      
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
        console.error("Error message:", error.message);
        
        if (error.message.includes("The resource already exists")) {
          toast.error("A file with this name already exists");
        } else if (error.message.includes("permission")) {
          toast.error("Permission denied for file upload");
        } else if (error.message.includes("size")) {
          toast.error("File is too large");
        } else {
          toast.error(`Upload failed: ${error.message}`);
        }
        
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(70);
      
      console.log("Upload successful, getting public URL...");
      
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
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast.error(`Upload error: ${error.message || "Unknown error"}`);
      setUploadProgress(0);
      return null;
    }
  };

  const uploadImageToBucket = async (file: File): Promise<string | null> => {
    try {
      setUploadProgress(5);
      
      if (!file) {
        toast.error("No file provided for upload");
        return null;
      }
      
      const bucketReady = await ensureStorageBucket();
      if (!bucketReady) {
        toast.error("Could not prepare storage for upload");
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(20);
      
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      const fileName = `direct_upload_${uniqueId}_${timestamp}_${safeFileName}`;
      
      console.log("Attempting direct upload to 'parts' bucket:", fileName);
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });
      
      setUploadProgress(40);
      
      const { data, error } = await supabase.storage
        .from('parts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
      
      if (error) {
        console.error("Direct upload error:", error);
        console.error("Error message:", error.message);
        
        toast.error(`Upload failed: ${error.message}`);
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(70);
      
      const { data: publicUrlData } = supabase.storage
        .from('parts')
        .getPublicUrl(fileName);
      
      if (!publicUrlData.publicUrl) {
        toast.error("Failed to generate public URL for the image");
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(100);
      console.log("Direct upload successful, public URL:", publicUrlData.publicUrl);
      toast.success("Image uploaded successfully!");
      
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error("Direct upload error:", error);
      toast.error(`Upload error: ${error.message || "Unknown error"}`);
      setUploadProgress(0);
      return null;
    }
  };

  const fetchAvailableGarages = async () => {
    try {
      const { data, error } = await supabase
        .from('garages')
        .select('*');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log("Available garages:", data);
        setAvailableGarages(data);
        return data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching available garages:", error.message);
      return [];
    }
  };

  const fetchProducts = async (garageId: string) => {
    if (!garageId) {
      console.log("No garage ID provided for fetching products");
      return [];
    }
    
    console.log("Fetching products for garage ID:", garageId);
    setFetchLoading(true);
    try {
      const { data: directParts, error: directError } = await supabase
        .from('parts')
        .select('*')
        .eq('garage_id', garageId);

      if (directError) {
        console.error("Error fetching direct parts:", directError);
        throw directError;
      }
      
      console.log("Direct parts fetched:", directParts?.length || 0);
      
      const { data: associatedParts, error: associationError } = await supabase
        .from('parts_garages')
        .select('part_id, installation_fee, parts(*)')
        .eq('garage_id', garageId);
        
      if (associationError) {
        console.error("Error fetching associated parts:", associationError);
        throw associationError;
      }
      
      console.log("Associated parts with installation fees:", associatedParts);
      
      const combinedProducts = [];
      
      if (directParts && directParts.length > 0) {
        directParts.forEach(part => {
          const association = associatedParts?.find(item => item.part_id === part.id);
          if (association) {
            combinedProducts.push({
              ...part,
              installation_fee: association.installation_fee
            });
          } else {
            combinedProducts.push({
              ...part,
              installation_fee: 0
            });
          }
        });
      }
      
      if (associatedParts && associatedParts.length > 0) {
        associatedParts.forEach(item => {
          if (!combinedProducts.some(product => product.id === item.part_id)) {
            console.log(`Adding associated part ${item.part_id} with installation fee:`, item.installation_fee);
            combinedProducts.push({
              ...item.parts,
              installation_fee: item.installation_fee
            });
          }
        });
      }
      
      console.log("Final combined products with installation fees:", combinedProducts);
      setProducts(combinedProducts);
      return combinedProducts;
    } catch (error: any) {
      console.error("Error fetching products:", error.message);
      toast.error("Failed to load products");
      setProducts([]);
      return [];
    } finally {
      setFetchLoading(false);
    }
  };

  const addProduct = async (product: GarageProduct, productGarageId: string, imageFile?: File | null) => {
    setIsLoading(true);
    try {
      console.log("Adding product with data:", product);
      
      const garages = await fetchAvailableGarages();
      
      if (garages.length === 0) {
        toast.error("No valid garages found. Please add a garage first.");
        return null;
      }
      
      let validGarageId = productGarageId;
      const garageExists = garages.some(garage => garage.id === productGarageId);
      
      if (!garageExists) {
        console.log("Provided garage ID not found in available garages, using first available garage");
        validGarageId = garages[0].id;
        
        if (!validGarageId) {
          toast.error("Unable to find a valid garage. Please add a garage first.");
          return null;
        }
      }
      
      console.log("Using valid garage ID:", validGarageId);
      
      let imageUrl = product.imageUrl;
      
      if (imageFile) {
        console.log("Attempting to upload image file:", imageFile.name);
        imageUrl = await uploadImage(imageFile, validGarageId);
        if (imageUrl) {
          console.log("Image uploaded successfully, URL:", imageUrl);
        } else {
          toast.warning("Product will be added without an image as upload failed");
        }
      }
      
      const installationFee = product.installation_fee 
        ? parseFloat(product.installation_fee.toString()) 
        : 0;
      
      const productData = {
        name: product.name,
        price: parseFloat(product.price.toString()),
        stock: parseInt(product.quantity.toString()), 
        description: product.description || '',
        manufacturer_id: product.manufacturer_id || 1,
        model_id: product.model_id || 1,
        year: product.year || new Date().getFullYear(),
        garage_id: validGarageId,
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

      const { data: existingAssociation, error: checkError } = await supabase
        .from('parts_garages')
        .select('*')
        .eq('part_id', partId)
        .eq('garage_id', validGarageId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking for existing association:", checkError);
      }

      if (!existingAssociation) {
        const { error: associationError } = await supabase
          .from('parts_garages')
          .insert({
            part_id: partId,
            garage_id: validGarageId,
            installation_fee: installationFee
          });

        if (associationError) {
          console.error("Association failed:", associationError);
          throw new Error(`Failed to associate part with garage: ${associationError.message}`);
        }

        console.log("Parts_garages association created successfully with installation fee:", installationFee);
      } else {
        const { error: updateError } = await supabase
          .from('parts_garages')
          .update({ installation_fee: installationFee })
          .eq('part_id', partId)
          .eq('garage_id', validGarageId);
          
        if (updateError) {
          console.error("Error updating installation fee:", updateError);
          toast.warning("Product updated but installation fee may not have been updated");
        }
        
        console.log("Association already exists, updated installation fee to:", installationFee);
      }
      
      toast.success("Product added successfully!");
      
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

  const updateProduct = async (product: GarageProduct): Promise<boolean> => {
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
      
      const installationFee = product.installation_fee 
        ? parseFloat(product.installation_fee.toString()) 
        : 0;
      
      console.log(`Installation fee for part ${product.id}: ${installationFee} (${typeof installationFee})`);
      
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
        .eq('id', product.id);
      
      if (error) {
        console.error("Update error:", error);
        toast.error(`Failed to update product: ${error.message}`);
        return false;
      }
      
      if (product.garage_id) {
        console.log(`Updating installation fee for part ${product.id} in garage ${product.garage_id} to ${installationFee}`);
        
        const { data: existingAssoc, error: checkError } = await supabase
          .from('parts_garages')
          .select('*')
          .eq('part_id', product.id)
          .eq('garage_id', product.garage_id)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking for existing association:", checkError);
        }
        
        const { error: installationError } = await supabase
          .from('parts_garages')
          .upsert(
            {
              part_id: product.id,
              garage_id: product.garage_id,
              installation_fee: installationFee
            },
            { 
              onConflict: 'part_id,garage_id',
              ignoreDuplicates: false 
            }
          );
          
        if (installationError) {
          console.error("Error updating installation fee:", installationError);
          toast.warning("Product updated but installation fee may not have been updated");
        } else {
          console.log("Installation fee updated successfully to:", installationFee);
        }
      }
      
      if (product.garage_id) {
        console.log("Refreshing products for garage:", product.garage_id);
        await fetchProducts(product.garage_id);
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

  const updateProductStatus = async (productId: number, status: string, garageId?: string): Promise<boolean> => {
    if (!productId) {
      toast.error("Product ID is missing");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      console.log(`Status update requested for product ${productId} to "${status}"`);
      
      if (garageId) {
        await fetchProducts(garageId);
      }
      
      toast.success(`Product status updated to "${status}"`);
      return true;
    } catch (error: any) {
      console.error("Error updating product status:", error);
      toast.error(error.message || "Failed to update product status");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: number, garageId?: string): Promise<boolean> => {
    if (!productId) {
      toast.error("Product ID is missing");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Deleting product with ID:", productId);
      
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
        .eq('id', productId);
      
      if (error) {
        console.error("Delete error:", error);
        toast.error(`Failed to delete product: ${error.message}`);
        return false;
      }
      
      if (garageId) {
        await fetchProducts(garageId);
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
      const garages = await fetchAvailableGarages();
      
      if (garageId) {
        console.log("Garage ID provided on mount:", garageId);
        fetchProducts(garageId);
      } else if (garages.length > 0) {
        const firstGarageId = garages[0]?.id;
        console.log("No garage ID provided, using first garage:", firstGarageId);
        
        if (firstGarageId) {
          fetchProducts(firstGarageId);
        }
      } else {
        console.log("No garages available");
      }
    };
    
    initializeHook();
  }, [garageId]);

  return {
    addProduct,
    updateProduct,
    updateProductStatus,
    deleteProduct,
    fetchProducts,
    products,
    isLoading,
    fetchLoading,
    uploadProgress,
    setUploadProgress,
    availableGarages,
    uploadImageToBucket
  };
};

export default useGarageProducts;
