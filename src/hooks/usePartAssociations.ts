import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Part } from "./car-parts/types";

export interface RetailerPartWithAssociation {
  part_id: number;
  part_name: string;
  part_description: string | null;
  part_price: number;
  part_stock: number;
  part_image_url: string | null;
  retailer_id: string;
  retailer_name: string;
  current_installation_fee: number;
  is_associated: boolean;
}

export const usePartAssociations = (garageId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [retailerParts, setRetailerParts] = useState<RetailerPartWithAssociation[]>([]);
  const [associationLoading, setAssociationLoading] = useState(false);

  const fetchRetailerParts = async () => {
    setIsLoading(true);
    try {
      // Use the alternative approach for now until we have the RPC function
      return await fetchRetailerPartsAlternative();
    } catch (error: any) {
      console.error("Error fetching retailer parts:", error.message);
      toast.error("Failed to load retailer parts");
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alternative implementation if the RPC isn't available yet
  const fetchRetailerPartsAlternative = async () => {
    try {
      console.log("Using alternative approach to fetch retailer parts");
      
      // First get all retailer parts
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select(`
          id,
          name,
          description,
          price,
          stock,
          image_url,
          retailer_id,
          retailers (name)
        `)
        .eq('source_type', 'retailer');

      if (partsError) throw partsError;

      if (!partsData || partsData.length === 0) {
        setRetailerParts([]);
        return [];
      }

      // Then check which ones are associated with this garage
      const formattedParts: RetailerPartWithAssociation[] = await Promise.all(
        partsData.map(async (part: any) => {
          // Check if this part is associated with the current garage
          const { data: association, error: assocError } = await supabase
            .from('parts_garages')
            .select('installation_fee')
            .eq('part_id', part.id)
            .eq('garage_id', garageId)
            .maybeSingle();

          if (assocError) {
            console.error("Error checking part association:", assocError);
          }

          return {
            part_id: part.id,
            part_name: part.name,
            part_description: part.description,
            part_price: part.price,
            part_stock: part.stock,
            part_image_url: part.image_url,
            retailer_id: part.retailer_id,
            retailer_name: part.retailers?.name || "Unknown Retailer",
            current_installation_fee: association?.installation_fee || 0,
            is_associated: !!association
          };
        })
      );

      console.log("Retailer parts (alternative method):", formattedParts);
      setRetailerParts(formattedParts);
      return formattedParts;
    } catch (error: any) {
      console.error("Error in alternative retailer parts fetch:", error.message);
      toast.error("Failed to load retailer parts");
      setRetailerParts([]);
      return [];
    }
  };

  const associateWithPart = async (partId: number, installationFee: number) => {
    setAssociationLoading(true);
    try {
      console.log(`Associating garage ${garageId} with part ${partId} and fee ${installationFee}`);
      
      const { error } = await supabase
        .from('parts_garages')
        .upsert(
          {
            part_id: partId,
            garage_id: garageId,
            installation_fee: installationFee
          },
          { 
            onConflict: 'part_id,garage_id',
            ignoreDuplicates: false 
          }
        );
      
      if (error) throw error;
      
      // Update the local state
      setRetailerParts(prev => 
        prev.map(part => 
          part.part_id === partId 
            ? { 
                ...part, 
                is_associated: true, 
                current_installation_fee: installationFee 
              } 
            : part
        )
      );
      
      toast.success("Part association saved successfully");
      return true;
    } catch (error: any) {
      console.error("Error associating with part:", error.message);
      toast.error("Failed to associate with part");
      return false;
    } finally {
      setAssociationLoading(false);
    }
  };

  const removeAssociation = async (partId: number) => {
    setAssociationLoading(true);
    try {
      console.log(`Removing association between garage ${garageId} and part ${partId}`);
      
      const { error } = await supabase
        .from('parts_garages')
        .delete()
        .eq('part_id', partId)
        .eq('garage_id', garageId);
      
      if (error) throw error;
      
      // Update the local state
      setRetailerParts(prev => 
        prev.map(part => 
          part.part_id === partId 
            ? { 
                ...part, 
                is_associated: false, 
                current_installation_fee: 0 
              } 
            : part
        )
      );
      
      toast.success("Part association removed successfully");
      return true;
    } catch (error: any) {
      console.error("Error removing part association:", error.message);
      toast.error("Failed to remove part association");
      return false;
    } finally {
      setAssociationLoading(false);
    }
  };

  const updateInstallationFee = async (partId: number, installationFee: number) => {
    setAssociationLoading(true);
    try {
      console.log(`Updating installation fee for part ${partId} to ${installationFee}`);
      
      const { error } = await supabase
        .from('parts_garages')
        .update({ installation_fee: installationFee })
        .eq('part_id', partId)
        .eq('garage_id', garageId);
      
      if (error) throw error;
      
      // Update the local state
      setRetailerParts(prev => 
        prev.map(part => 
          part.part_id === partId 
            ? { 
                ...part, 
                current_installation_fee: installationFee 
              } 
            : part
        )
      );
      
      toast.success("Installation fee updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating installation fee:", error.message);
      toast.error("Failed to update installation fee");
      return false;
    } finally {
      setAssociationLoading(false);
    }
  };

  return {
    fetchRetailerParts,
    retailerParts,
    isLoading,
    associateWithPart,
    removeAssociation,
    updateInstallationFee,
    associationLoading
  };
};

export default usePartAssociations;
