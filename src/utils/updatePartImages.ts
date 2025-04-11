
import { supabase } from "@/integrations/supabase/client";
import { Part } from "@/hooks/car-parts/types";
import { toast } from "sonner";

// Function to get an appropriate image URL based on part name
const getImageUrlForPart = (partName: string): string => {
  const name = partName.toLowerCase();
  
  if (name.includes('oil')) {
    return "https://images.unsplash.com/photo-1635954749253-a0642359cdfa?w=800&h=600&auto=format";
  } else if (name.includes('filter')) {
    return "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1?w=800&h=600&auto=format";
  } else if (name.includes('brake')) {
    return "https://images.unsplash.com/photo-1615384340342-28de71316d2a?w=800&h=600&auto=format";
  } else if (name.includes('spark') || name.includes('ignition')) {
    return "https://images.unsplash.com/photo-1602079836063-583166fbeba2?w=800&h=600&auto=format";
  } else if (name.includes('tire') || name.includes('wheel')) {
    return "https://images.unsplash.com/photo-1591839728094-39242732d4c1?w=800&h=600&auto=format";
  } else if (name.includes('battery') || name.includes('electrical')) {
    return "https://images.unsplash.com/photo-1619641464045-b201ebd9ec0c?w=800&h=600&auto=format";
  } else if (name.includes('belt')) {
    return "https://images.unsplash.com/photo-1629584603667-e9eda1c06851?w=800&h=600&auto=format"; 
  } else {
    // Default auto parts image for other categories
    return "https://images.unsplash.com/photo-1647427060118-4911c9821b82?w=800&h=600&auto=format";
  }
};

// Function to download image from URL
const downloadImage = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
};

// Helper function to convert database part to Part type
const convertDbPartToPart = (dbPart: any): Part => {
  return {
    ...dbPart,
    garages: dbPart.garage_id ? { 
      name: 'AutoCare Dubai',
      location: 'Dubai Marina'
    } : { 
      name: 'Mechanica Service Center',
      location: 'Dubai, UAE'
    },
    // Ensure image_url is present
    image_url: dbPart.image_url || getImageUrlForPart(dbPart.name)
  };
};

// Function to update a single part with image
const updatePartWithImage = async (dbPart: any): Promise<boolean> => {
  try {
    // Convert to our application's Part type
    const part = convertDbPartToPart(dbPart);
    
    // Skip if part already has an image_url
    if (part.image_url) {
      console.log(`Part ${part.id} already has an image: ${part.image_url}`);
      return true;
    }
    
    // Get appropriate image URL based on part name
    const sourceImageUrl = getImageUrlForPart(part.name);
    
    // Download the image
    const imageBlob = await downloadImage(sourceImageUrl);
    
    // Generate unique filename
    const fileExt = sourceImageUrl.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `part_${part.id}_${Date.now()}.${fileExt}`;
    const filePath = `parts/${fileName}`;
    
    console.log(`Uploading image to 'parts' bucket with path: ${filePath}`);
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('parts')
      .upload(filePath, imageBlob, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error(`Error uploading image for part ${part.id}:`, uploadError);
      return false;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('parts')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;
    
    // Update part record with image URL
    const { error: updateError } = await supabase
      .from('parts')
      .update({ image_url: publicUrl })
      .eq('id', part.id);
      
    if (updateError) {
      console.error(`Error updating part ${part.id} with image URL:`, updateError);
      return false;
    }
    
    console.log(`Successfully updated part ${part.id} with image URL: ${publicUrl}`);
    return true;
    
  } catch (error) {
    console.error(`Error processing part ${dbPart.id}:`, error);
    return false;
  }
};

// Main function to update all parts
export const updateAllPartImages = async (): Promise<void> => {
  try {
    toast.info("Starting image update for all parts...");
    
    // Fetch all parts from the database
    const { data: parts, error } = await supabase
      .from('parts')
      .select('*');
      
    if (error) {
      throw new Error(`Error fetching parts: ${error.message}`);
    }
    
    if (!parts || parts.length === 0) {
      toast.info("No parts found to update");
      return;
    }
    
    toast.info(`Found ${parts.length} parts. Starting image updates...`);
    
    // Process parts in batches to avoid overwhelming the system
    const batchSize = 5;
    let successCount = 0;
    
    for (let i = 0; i < parts.length; i += batchSize) {
      const batch = parts.slice(i, i + batchSize);
      
      // Process batch in parallel
      const results = await Promise.all(
        batch.map(part => updatePartWithImage(part))
      );
      
      // Count successes
      successCount += results.filter(Boolean).length;
      
      // Progress update
      toast.info(`Processed ${Math.min(i + batchSize, parts.length)}/${parts.length} parts`);
    }
    
    toast.success(`Completed image updates. Successfully updated ${successCount}/${parts.length} parts.`);
    
  } catch (error: any) {
    console.error("Error updating part images:", error);
    toast.error(`Failed to update part images: ${error.message}`);
  }
};
