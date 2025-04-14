
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Package, Wrench, Car, Search, Plus, Minus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import usePartAssociations, { RetailerPartWithAssociation } from "@/hooks/usePartAssociations";
import { toast } from "sonner";

interface RetailerPartsTabProps {
  currentGarageId: string;
  isMobile: boolean;
}

export const RetailerPartsTab: React.FC<RetailerPartsTabProps> = ({
  currentGarageId,
  isMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPart, setCurrentPart] = useState<RetailerPartWithAssociation | null>(null);
  const [installationFee, setInstallationFee] = useState<string>("");
  
  const {
    fetchRetailerParts,
    retailerParts,
    isLoading,
    associateWithPart,
    removeAssociation,
    updateInstallationFee,
    associationLoading
  } = usePartAssociations(currentGarageId);
  
  useEffect(() => {
    if (currentGarageId) {
      fetchRetailerParts();
    }
  }, [currentGarageId]);
  
  const filteredParts = retailerParts.filter(part => 
    part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.retailer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (part.part_description && part.part_description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleOpenDialog = (part: RetailerPartWithAssociation) => {
    setCurrentPart(part);
    setInstallationFee(part.current_installation_fee.toString());
    setDialogOpen(true);
  };
  
  const handleSaveAssociation = async () => {
    if (!currentPart) return;
    
    const fee = parseFloat(installationFee);
    if (isNaN(fee) || fee < 0) {
      toast.error("Please enter a valid installation fee");
      return;
    }
    
    let success;
    if (currentPart.is_associated) {
      // Update existing association
      success = await updateInstallationFee(currentPart.part_id, fee);
    } else {
      // Create new association
      success = await associateWithPart(currentPart.part_id, fee);
    }
    
    if (success) {
      setDialogOpen(false);
    }
  };
  
  const handleRemoveAssociation = async () => {
    if (!currentPart) return;
    
    const success = await removeAssociation(currentPart.part_id);
    if (success) {
      setDialogOpen(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="text-lg md:text-xl font-semibold">Retailer Parts</h2>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts or retailers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-mechanica-500 mr-2" />
          <span>Loading retailer parts...</span>
        </div>
      ) : filteredParts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParts.map((part) => (
            <Card key={part.part_id} className={`overflow-hidden ${part.is_associated ? 'border-mechanica-200 bg-mechanica-50' : ''}`}>
              <div className="h-40 bg-gray-100 relative">
                {part.part_image_url ? (
                  <img 
                    src={part.part_image_url} 
                    alt={part.part_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium">
                  {part.retailer_name}
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{part.part_name}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {part.part_description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Retail Price:</span>
                  <span>AED {part.part_price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Stock:</span>
                  <span>{part.part_stock} units</span>
                </div>
                {part.is_associated && (
                  <div className="flex justify-between text-sm mt-2 text-mechanica-700">
                    <span className="font-medium flex items-center">
                      <Wrench className="h-3 w-3 mr-1" />
                      Installation Fee:
                    </span>
                    <span>AED {part.current_installation_fee}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant={part.is_associated ? "outline" : "mechanica"} 
                  className="w-full"
                  onClick={() => handleOpenDialog(part)}
                >
                  {part.is_associated ? (
                    <>
                      <Wrench className="h-4 w-4 mr-2" />
                      Update Fee
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Installation Service
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No retailer parts found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? "Try adjusting your search terms" 
              : "Retailers haven't uploaded any parts yet"}
          </p>
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPart?.is_associated 
                ? "Update Installation Fee" 
                : "Add Installation Service"}
            </DialogTitle>
            <DialogDescription>
              {currentPart?.is_associated 
                ? "Update the installation fee for this retailer part" 
                : "Set an installation fee to offer your services for this part"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label className="text-sm font-medium">Part Name</Label>
              <div className="text-base mt-1">{currentPart?.part_name}</div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Retailer</Label>
              <div className="text-sm mt-1">{currentPart?.retailer_name}</div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Part Price</Label>
              <div className="text-sm mt-1">AED {currentPart?.part_price}</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="installation-fee">Installation Fee (AED)</Label>
              <Input
                id="installation-fee"
                type="number"
                min="0"
                step="0.01"
                value={installationFee}
                onChange={(e) => setInstallationFee(e.target.value)}
                placeholder="Enter fee amount"
              />
            </div>
          </div>
          
          <DialogFooter className={`${currentPart?.is_associated ? 'justify-between' : 'justify-end'}`}>
            {currentPart?.is_associated && (
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700"
                onClick={handleRemoveAssociation}
                disabled={associationLoading}
              >
                <Minus className="h-4 w-4 mr-2" />
                Remove Association
              </Button>
            )}
            <Button 
              onClick={handleSaveAssociation}
              disabled={associationLoading}
            >
              {associationLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {currentPart?.is_associated ? 'Update Fee' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RetailerPartsTab;
