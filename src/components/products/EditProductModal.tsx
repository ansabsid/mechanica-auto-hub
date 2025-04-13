
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GarageProduct } from "@/hooks/useGarageProducts";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: GarageProduct | null;
  onSave: (product: GarageProduct) => Promise<boolean>;
  manufacturers: any[];
  models: any[];
  years: number[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  open,
  onOpenChange,
  product,
  onSave,
  manufacturers,
  models,
  years
}) => {
  const [editedProduct, setEditedProduct] = useState<GarageProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filteredModels, setFilteredModels] = useState<any[]>([]);
  
  useEffect(() => {
    if (product) {
      setEditedProduct({...product});
    } else {
      setEditedProduct(null);
    }
  }, [product]);
  
  useEffect(() => {
    if (editedProduct?.manufacturer_id) {
      const filtered = models.filter(model => model.manufacturer_id === editedProduct.manufacturer_id);
      setFilteredModels(filtered);
    } else {
      setFilteredModels([]);
    }
  }, [editedProduct?.manufacturer_id, models]);
  
  const handleSave = async () => {
    if (!editedProduct) return;
    
    setIsSaving(true);
    try {
      const success = await onSave(editedProduct);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!editedProduct) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input 
                id="edit-name"
                value={editedProduct.name}
                onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select 
                value={editedProduct.category}
                onValueChange={(value) => setEditedProduct({...editedProduct, category: value})}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filters">Filters</SelectItem>
                  <SelectItem value="brakes">Brakes</SelectItem>
                  <SelectItem value="tires">Tires</SelectItem>
                  <SelectItem value="ignition">Ignition</SelectItem>
                  <SelectItem value="oils">Oils & Fluids</SelectItem>
                  <SelectItem value="engine">Engine Parts</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="cooling">Cooling System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-full">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                value={editedProduct.description || ''}
                onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
                className="resize-none h-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-manufacturer">Manufacturer</Label>
              <Select 
                value={editedProduct.manufacturer_id?.toString()}
                onValueChange={(value) => setEditedProduct({
                  ...editedProduct, 
                  manufacturer_id: parseInt(value),
                  model_id: undefined // Reset model when manufacturer changes
                })}
              >
                <SelectTrigger id="edit-manufacturer">
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map(manufacturer => (
                    <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                      {manufacturer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-model">Model</Label>
              <Select 
                value={editedProduct.model_id?.toString()}
                onValueChange={(value) => setEditedProduct({...editedProduct, model_id: parseInt(value)})}
                disabled={filteredModels.length === 0}
              >
                <SelectTrigger id="edit-model">
                  <SelectValue placeholder={
                    filteredModels.length === 0 
                      ? "Select a manufacturer first" 
                      : "Select model"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredModels.map(model => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-year">Year</Label>
              <Select 
                value={editedProduct.year?.toString()}
                onValueChange={(value) => setEditedProduct({...editedProduct, year: parseInt(value)})}
              >
                <SelectTrigger id="edit-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (AED)</Label>
              <Input 
                id="edit-price"
                type="number"
                value={editedProduct.price}
                onChange={(e) => setEditedProduct({...editedProduct, price: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Stock Quantity</Label>
              <Input 
                id="edit-quantity"
                type="number"
                value={editedProduct.quantity}
                onChange={(e) => setEditedProduct({...editedProduct, quantity: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-installation-fee">Installation Fee (AED)</Label>
              <Input 
                id="edit-installation-fee"
                type="number"
                value={editedProduct.installation_fee || 0}
                onChange={(e) => setEditedProduct({...editedProduct, installation_fee: e.target.value})}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Availability Status</Label>
              <Select 
                value={editedProduct.status}
                onValueChange={(value) => setEditedProduct({...editedProduct, status: value})}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Limited">Limited</SelectItem>
                  <SelectItem value="Sold Out">Sold Out</SelectItem>
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 z-10">
          <div className="flex flex-row justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="mechanica" 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
