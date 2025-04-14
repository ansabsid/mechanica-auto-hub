
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
  installation_fee: number;
  is_associated: boolean;
  current_installation_fee: number;
}

export const usePartAssociations = (garageId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [retailerParts, setRetailerParts] = useState<RetailerPartWithAssociation[]>([]);
  const [associationLoading, setAssociationLoading] = useState(false);

  const fetchRetailerParts = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching retailer parts that garage ${garageId} can offer installation for`);
      
      // Use a stored procedure to get retailer parts to avoid type issues
      const { data, error } = await supabase.rpc('get_retailer_parts_for_garage', {
        garage_id_param: garageId
      });

      if (error) {
        console.error("Error fetching retailer parts:", error.message);
        toast.error("Failed to load retailer parts");
        setRetailerParts([]);
        return [];
      }

      console.log("RPC function result for retailer parts:", data);
      
      if (!data || data.length === 0) {
        setRetailerParts([]);
        return [];
      }
      
      const formattedParts: RetailerPartWithAssociation[] = data.map(part => ({
        part_id: part.part_id,
        part_name: part.part_name,
        part_description: part.part_description,
        part_price: part.part_price,
        part_stock: part.part_stock,
        part_image_url: part.part_image_url,
        retailer_id: part.retailer_id,
        retailer_name: part.retailer_name,
        installation_fee: part.installation_fee || 0,
        is_associated: part.is_associated,
        current_installation_fee: part.installation_fee || 0
      }));

      console.log("Formatted retailer parts:", formattedParts);
      setRetailerParts(formattedParts);
      return formattedParts;
    } catch (error: any) {
      console.error("Error in retailer parts fetch:", error.message);
      toast.error("Failed to load retailer parts");
      setRetailerParts([]);
      return [];
    } finally {
      setIsLoading(false);
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
