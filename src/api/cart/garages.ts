
import { supabase } from "@/integrations/supabase/client";
import { Garage } from "@/types/cart.types";

/**
 * Gets garages available for installing a specific part
 * @param partId The ID of the part to get garages for
 * @returns Promise resolving to an array of garages
 */
export async function getGaragesForPart(partId: number): Promise<Garage[]> {
  try {
    // Using RPC function with proper type casting
    const { data, error } = await supabase
      .rpc('get_garages_for_part', { part_id_param: partId }) as unknown as {
        data: Array<{
          id: string;
          name: string;
          location: string;
          installation_fee: number;
        }> | null;
        error: any;
      };
    
    if (error) {
      console.error("RPC error:", error);
      
      // If RPC fails, return empty array
      console.error("Falling back to empty array due to RPC error");
      return [];
    }
    
    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      installationFee: item.installation_fee
    }));
  } catch (error) {
    console.error("Error getting garages for part:", error);
    throw error;
  }
}
