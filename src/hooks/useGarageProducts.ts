
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

// Define the expected response type from the insert_part RPC function
interface InsertPartResponse {
  id: number;
  [key: string]: any; // Allow for other properties that might be in the response
}

export const useGarageProducts = (garageId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [availableGarages, setAvailableGarages] = useState<any[]>([]);

  // Function to check if storage bucket exists and create it if it doesn't
  const ensureStorageBucket = async () => {
    try {
      // Check if the 'parts' bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const partsBucketExists = buckets?.some(bucket => bucket.name === 'parts');
      
      if (!partsBucketExists) {
        console.log("Parts bucket doesn't exist, attempting to create it...");
        
        // Create the bucket
        const { error } = await supabase.storage.createBucket('parts', {
          public: true, // Make the bucket public
          fileSizeLimit: 10485760 // 10MB limit
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

  // Function to upload image to Supabase storage
  const uploadImage = async (file: File, garageId: string): Promise<string | null> => {
    try {
      setUploadProgress(5);
      
      if (!file) return null;
      
      // Ensure the storage bucket exists
      const bucketReady = await ensureStorageBucket();
      if (!bucketReady) {
        toast.error("Could not prepare storage for upload");
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(15);
      
      const fileExt = file.name.split('.').pop();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize filename
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}_${safeFileName}`;
      const filePath = `${garageId}/${fileName}`;
      
      console.log("Attempting to upload file to 'parts' bucket:", filePath);
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });
      
      setUploadProgress(30);
      
      // Upload the file to the 'parts' bucket with appropriate options
      const { data, error } = await supabase.storage
        .from('parts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Set the correct content type
        });
      
      if (error) {
        console.error("Storage upload error:", error);
        console.error("Error message:", error.message);
        
        // More specific error handling without using error.code
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
      
      // Get the public URL
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

  // Function to directly upload an image to the parts bucket
  const uploadImageToBucket = async (file: File): Promise<string | null> => {
    try {
      setUploadProgress(5);
      
      if (!file) {
        toast.error("No file provided for upload");
        return null;
      }
      
      // Ensure the storage bucket exists
      const bucketReady = await ensureStorageBucket();
      if (!bucketReady) {
        toast.error("Could not prepare storage for upload");
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(20);
      
      // Generate a safe and unique filename
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize filename
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
      
      // Upload the file to the 'parts' bucket root directory
      const { data, error } = await supabase.storage
        .from('parts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Use upsert true for direct uploads to avoid name conflicts
          contentType: file.type
        });
      
      if (error) {
        console.error("Direct upload error:", error);
        console.error("Error message:", error.message);
        
        // Handle specific error cases
        toast.error(`Upload failed: ${error.message}`);
        setUploadProgress(0);
        return null;
      }
      
      setUploadProgress(70);
      
      // Get the public URL
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

  // Fetch all available garages to ensure we use valid IDs
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

  // Fetch products for a specific garage
  const fetchProducts = async (garageId: string) => {
    if (!garageId) {
      console.log("No garage ID provided for fetching products");
      return;
    }
    
    console.log("Fetching products for garage ID:", garageId);
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
      
      console.log("Fetched products:", uniqueProducts);
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
      
      // Validate the garage ID exists in the database
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
      
      // First, upload the image if provided
      let imageUrl = product.imageUrl;
      
      if (imageFile) {
        console.log("Attempting to upload image file:", imageFile.name);
        imageUrl = await uploadImage(imageFile, validGarageId);
        if (imageUrl) {
          console.log("Image uploaded successfully, URL:", imageUrl);
        } else {
          // If upload failed, continue with product creation without an image
          console.log("Image upload failed, proceeding without image");
          toast.warning("Product will be added without an image as upload failed");
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

      // Call the insert_part function to create a new part with proper typing
      const { data, error } = await enhancedSupabase.rpc('insert_part', {
        part_data: productData
      });

      if (error) {
        console.error("RPC error:", error);
        throw new Error(`Failed to create part: ${error.message}`);
      }

      console.log("Part created with response:", data);

      // Safely extract part ID from response by casting to our expected type
      const response = data as InsertPartResponse;
      const partId = response.id;

      if (!partId) {
        throw new Error("No part ID returned from database");
      }

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
    const initializeHook = async () => {
      const garages = await fetchAvailableGarages();
      
      // If a garageId is provided, use it to fetch products
      if (garageId) {
        console.log("Garage ID provided on mount:", garageId);
        fetchProducts(garageId);
      } 
      // If no garageId is provided but we have garages, use the first one
      else if (garages.length > 0) {
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
    fetchProducts,
    products,
    isLoading,
    fetchLoading,
    uploadProgress,
    setUploadProgress,
    availableGarages,
    uploadImageToBucket // Add the new direct upload function to the return object
  };
};
