
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      
      // Since we can't use typed RPC call, use direct SQL query through the function API
      const { data, error } = await supabase.from('parts')
        .select(`
          id,
          name,
          description,
          price,
          stock,
          image_url,
          retailer_id,
          retailers(name),
          parts_garages(garage_id, installation_fee)
        `)
        .eq('source_type', 'retailer');

      if (error) {
        console.error("Error fetching retailer parts:", error.message);
        toast.error("Failed to load retailer parts");
        setRetailerParts([]);
        return [];
      }

      if (!data || data.length === 0) {
        console.log("No retailer parts found");
        setRetailerParts([]);
        return [];
      }
      
      console.log(`Found ${data.length} retailer parts`, data);
      
      // Format the data to match our interface
      const formattedParts: RetailerPartWithAssociation[] = data.map(part => {
        // Find if this part is associated with the current garage
        const garageAssociation = part.parts_garages?.find(pg => pg.garage_id === garageId);
        const isAssociated = !!garageAssociation;
        const installationFee = garageAssociation?.installation_fee || 0;
        
        return {
          part_id: part.id,
          part_name: part.name,
          part_description: part.description,
          part_price: part.price,
          part_stock: part.stock,
          part_image_url: part.image_url,
          retailer_id: part.retailer_id,
          retailer_name: part.retailers?.name || 'Unknown Retailer',
          installation_fee: installationFee,
          is_associated: isAssociated,
          current_installation_fee: installationFee
        };
      });

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
