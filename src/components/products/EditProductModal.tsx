
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { GarageProduct } from "@/hooks/useGarageProducts";
import { toast } from "sonner";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: GarageProduct | null;
  onSave: (updatedProduct: GarageProduct) => Promise<boolean>;
  manufacturers: any[];
  models: any[];
  years: number[];
}

const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  manufacturers,
  models,
  years
}: EditProductModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editedProduct, setEditedProduct] = useState<GarageProduct | null>(null);
  const [filteredModels, setFilteredModels] = useState<any[]>([]);

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      // Create a deep copy to prevent any reference issues
      setEditedProduct(JSON.parse(JSON.stringify(product)));
    }
  }, [product]);

  // Filter models based on selected manufacturer
  useEffect(() => {
    if (editedProduct?.manufacturer_id && models.length > 0) {
      const filtered = models.filter(model => model.manufacturer_id === editedProduct.manufacturer_id);
      setFilteredModels(filtered);
      
      // If current model is not in filtered list, select the first one
      if (filtered.length > 0 && 
          !filtered.some(model => model.id === editedProduct.model_id)) {
        setEditedProduct(prev => prev ? {
          ...prev,
          model_id: filtered[0].id
        } : null);
      }
    } else {
      setFilteredModels([]);
    }
  }, [editedProduct?.manufacturer_id, models]);

  const handleSave = async () => {
    if (!editedProduct) return;
    
    setIsLoading(true);
    try {
      // Explicitly convert quantity to number for consistent handling
      const productToSave = {
        ...editedProduct,
        quantity: Number(editedProduct.quantity) // Ensure it's a number
      };
      
      console.log("Saving product with data:", productToSave);
      const success = await onSave(productToSave);
      
      if (success) {
        toast.success("Product updated successfully!");
        onClose();
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!editedProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Product Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-product-name">Product Name*</Label>
            <Input 
              id="edit-product-name"
              value={editedProduct.name}
              onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
              required
              placeholder="e.g. Premium Brake Pads"
            />
          </div>
          
          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-product-category">Category*</Label>
            <Select 
              value={editedProduct.category}
              onValueChange={(value) => setEditedProduct({...editedProduct, category: value})}
              required
            >
              <SelectTrigger id="edit-product-category">
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
          
          {/* Description Field */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="edit-product-description">Description</Label>
            <Textarea 
              id="edit-product-description"
              value={editedProduct.description || ''}
              onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
              placeholder="Enter product description"
              className="resize-none h-20"
            />
          </div>
          
          {/* Manufacturer Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-product-manufacturer">Manufacturer*</Label>
            <Select 
              value={editedProduct.manufacturer_id?.toString()}
              onValueChange={(value) => setEditedProduct({...editedProduct, manufacturer_id: parseInt(value)})}
              required
            >
              <SelectTrigger id="edit-product-manufacturer">
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
          
          {/* Model Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-product-model">Model*</Label>
            <Select 
              value={editedProduct.model_id?.toString()}
              onValueChange={(value) => setEditedProduct({...editedProduct, model_id: parseInt(value)})}
              disabled={filteredModels.length === 0}
              required
            >
              <SelectTrigger id="edit-product-model">
                <SelectValue placeholder={filteredModels.length === 0 ? "Select a manufacturer first" : "Select model"} />
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
          
          {/* Year Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-product-year">Year*</Label>
            <Select 
              value={editedProduct.year?.toString()}
              onValueChange={(value) => setEditedProduct({...editedProduct, year: parseInt(value)})}
              required
            >
              <SelectTrigger id="edit-product-year">
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
          
          {/* Price Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-product-price">Price (AED)*</Label>
            <Input 
              id="edit-product-price"
              type="number"
              value={editedProduct.price.toString()}
              onChange={(e) => setEditedProduct({...editedProduct, price: parseFloat(e.target.value)})}
              placeholder="e.g. 299.99"
              required
            />
          </div>
          
          {/* Quantity Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-product-quantity">Stock Quantity*</Label>
            <Input 
              id="edit-product-quantity"
              type="number"
              value={typeof editedProduct.quantity === 'number' 
                ? editedProduct.quantity.toString() 
                : editedProduct.quantity}
              onChange={(e) => setEditedProduct({...editedProduct, quantity: e.target.value})}
              placeholder="e.g. 10"
              required
            />
          </div>
          
          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-product-status">Availability Status</Label>
            <Select 
              value={editedProduct.status}
              onValueChange={(value) => setEditedProduct({...editedProduct, status: value})}
            >
              <SelectTrigger id="edit-product-status">
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
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
