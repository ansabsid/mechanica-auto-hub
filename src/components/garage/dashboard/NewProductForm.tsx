
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileImage, Loader2, Upload, Wrench } from "lucide-react";
import { GarageProduct } from "@/hooks/useGarageProducts";

interface NewProductFormProps {
  newProduct: GarageProduct;
  setNewProduct: (product: GarageProduct) => void;
  handleAddProduct: (e: React.FormEvent) => Promise<void>;
  productLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  productImage: File | null;
  setProductImage: (file: File | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manufacturers: any[];
  filteredModels: any[];
  years: number[];
  isMobile: boolean;
}

export const NewProductForm: React.FC<NewProductFormProps> = ({
  newProduct,
  setNewProduct,
  handleAddProduct,
  productLoading,
  isUploading,
  uploadProgress,
  productImage,
  setProductImage,
  handleFileChange,
  manufacturers,
  filteredModels,
  years,
  isMobile,
}) => {
  return (
    <div id="product-form" className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Add New Product</h3>
      <form onSubmit={handleAddProduct} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name*</Label>
            <Input 
              id="product-name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              required
              placeholder="e.g. Premium Brake Pads"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">Category*</Label>
            <Select 
              value={newProduct.category}
              onValueChange={(value) => setNewProduct({...newProduct, category: value})}
            >
              <SelectTrigger id="product-category">
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
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea 
              id="product-description"
              value={newProduct.description || ''}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              placeholder="Enter product description"
              className="resize-none h-20 md:h-24"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product-manufacturer">Manufacturer*</Label>
            <Select 
              value={newProduct.manufacturer_id?.toString()}
              onValueChange={(value) => setNewProduct({...newProduct, manufacturer_id: parseInt(value)})}
            >
              <SelectTrigger id="product-manufacturer">
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
            <Label htmlFor="product-model">Model*</Label>
            <Select 
              value={newProduct.model_id?.toString()}
              onValueChange={(value) => setNewProduct({...newProduct, model_id: parseInt(value)})}
              disabled={filteredModels.length === 0}
            >
              <SelectTrigger id="product-model">
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
          
          <div className="space-y-2">
            <Label htmlFor="product-year">Year*</Label>
            <Select 
              value={newProduct.year?.toString()}
              onValueChange={(value) => setNewProduct({...newProduct, year: parseInt(value)})}
            >
              <SelectTrigger id="product-year">
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
            <Label htmlFor="product-price">Price (AED)*</Label>
            <Input 
              id="product-price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              placeholder="e.g. 299.99"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-quantity">Stock Quantity*</Label>
            <Input 
              id="product-quantity"
              type="number"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
              placeholder="e.g. 10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-installation-fee" className="flex items-center gap-1">
              <Wrench className="h-4 w-4 text-mechanica-500" />
              Installation Fee (AED)
            </Label>
            <Input 
              id="product-installation-fee"
              type="number"
              value={newProduct.installation_fee}
              onChange={(e) => setNewProduct({...newProduct, installation_fee: e.target.value})}
              placeholder="e.g. 50.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-status">Availability Status</Label>
            <Select 
              value={newProduct.status}
              onValueChange={(value) => setNewProduct({...newProduct, status: value})}
            >
              <SelectTrigger id="product-status">
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
          
          <div className="space-y-2">
            <Label htmlFor="product-image">Product Image</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Input 
                  id="product-image" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="flex-1 text-xs md:text-sm"
                />
                {productImage && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setProductImage(null)}
                    className="shrink-0"
                  >
                    Clear
                  </Button>
                )}
              </div>
              
              {productImage && (
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-mechanica-500 shrink-0" />
                  <span className="text-xs md:text-sm text-gray-500 truncate">
                    {productImage.name} ({(productImage.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
              
              {isUploading && uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-mechanica-500 h-2 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Button 
          type="submit" 
          variant="mechanica"
          disabled={productLoading || isUploading}
          className="w-full md:w-auto"
        >
          {(productLoading || isUploading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? `Uploading (${Math.round(uploadProgress)}%)` : "Adding..."}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Add Product
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
