
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to get an appropriate image URL based on part name
export const getImageUrlForPart = (partName: string): string => {
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

// This function is run once to update all parts in the database with image URLs
export const initializePartImages = async (): Promise<void> => {
  console.log("Initializing part images...");
  
  try {
    // 1. First, get all parts without images
    const { data: parts, error } = await supabase
      .from('parts')
      .select('id, name, image_url');
      
    if (error) {
      throw new Error(`Error fetching parts: ${error.message}`);
    }
    
    if (!parts || parts.length === 0) {
      console.log("No parts found to update");
      return;
    }
    
    console.log(`Found ${parts.length} parts to check for images`);
    
    // 2. Filter out parts that already have images
    const partsWithoutImages = parts.filter(part => !part.image_url);
    
    console.log(`Found ${partsWithoutImages.length} parts without images`);
    
    if (partsWithoutImages.length === 0) {
      console.log("All parts already have images");
      return;
    }
    
    // 3. Update each part without an image
    const updatePromises = partsWithoutImages.map(async (part) => {
      const imageUrl = getImageUrlForPart(part.name);
      
      const { error: updateError } = await supabase
        .from('parts')
        .update({ image_url: imageUrl })
        .eq('id', part.id);
        
      if (updateError) {
        console.error(`Error updating part ${part.id}:`, updateError);
        return false;
      }
      
      console.log(`Updated part ${part.id} with image URL: ${imageUrl}`);
      return true;
    });
    
    const results = await Promise.all(updatePromises);
    const successCount = results.filter(Boolean).length;
    
    console.log(`Successfully updated ${successCount}/${partsWithoutImages.length} parts with images`);
    
    if (successCount > 0) {
      toast.success(`Updated ${successCount} parts with images`);
    }
  } catch (error: any) {
    console.error("Error initializing part images:", error);
  }
};
