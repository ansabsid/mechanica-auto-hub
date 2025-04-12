
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Upload, Package, MoreHorizontal, Edit, Trash2, Car, Wrench } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { GarageProduct } from "@/hooks/useGarageProducts";
import { NewProductForm } from "./NewProductForm";

interface InventoryTabProps {
  products: any[];
  productsLoading: boolean;
  isMobile: boolean;
  handleEditProduct: (product: any) => void;
  setProductToDelete: (id: number) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  openStatusDialog: (product: any, status: string) => void;
  currentGarageId: string;
  productLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  manufacturers: any[];
  models: any[];
  years: number[];
  newProduct: GarageProduct;
  setNewProduct: (product: GarageProduct) => void;
  handleAddProduct: (e: React.FormEvent) => Promise<void>;
  productImage: File | null;
  setProductImage: (file: File | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredModels: any[];
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  productsLoading,
  isMobile,
  handleEditProduct,
  setProductToDelete,
  setDeleteDialogOpen,
  openStatusDialog,
  currentGarageId,
  productLoading,
  isUploading,
  uploadProgress,
  setUploadProgress,
  manufacturers,
  models,
  years,
  newProduct,
  setNewProduct,
  handleAddProduct,
  productImage,
  setProductImage,
  handleFileChange,
  filteredModels,
}) => {
  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="text-lg md:text-xl font-semibold">Products & Parts</h2>
        <Button
          onClick={() => document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' })}
          variant="mechanica"
          size={isMobile ? "sm" : "default"}
          className="w-full md:w-auto"
        >
          <Plus className="mr-1 md:mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      <NewProductForm 
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProduct}
        productLoading={productLoading}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        productImage={productImage}
        setProductImage={setProductImage}
        handleFileChange={handleFileChange}
        manufacturers={manufacturers}
        filteredModels={filteredModels}
        years={years}
        isMobile={isMobile}
      />

      <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full bg-white rounded-xl shadow-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b">
                <th className="text-left p-2 md:p-4 text-xs md:text-sm">Product</th>
                <th className="text-left p-2 md:p-4 text-xs md:text-sm">Category</th>
                <th className="text-left p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">Vehicle</th>
                <th className="text-left p-2 md:p-4 text-xs md:text-sm">Price</th>
                <th className="text-left p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">Install Fee</th>
                <th className="text-left p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">Quantity</th>
                <th className="text-left p-2 md:p-4 text-xs md:text-sm">Status</th>
                <th className="text-left p-2 md:p-4 text-xs md:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsLoading ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product: any) => (
                  <tr key={product.id} className="border-b">
                    <td className="p-2 md:p-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-md overflow-hidden mr-2 md:mr-3 bg-gray-200 shrink-0">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-full w-full p-2 text-gray-400" />
                          )}
                        </div>
                        <span className="font-medium text-xs md:text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-2 md:p-4 text-xs md:text-sm">{product.category || "Uncategorized"}</td>
                    <td className="p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-1 text-mechanica-500" />
                        <span>
                          {product.manufacturer_id && product.model_id ? 
                            `${product.manufacturer_id}-${product.model_id} (${product.year || 'N/A'})` : 
                            'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 md:p-4 text-xs md:text-sm">AED {product.price}</td>
                    <td className="p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">
                      <div className="flex items-center">
                        <Wrench className="h-4 w-4 mr-1 text-mechanica-500" />
                        <span>AED {product.installation_fee || 0}</span>
                      </div>
                    </td>
                    <td className="p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">{product.stock}</td>
                    <td className="p-2 md:p-4">
                      <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs ${
                        product.stock > 10 
                          ? "bg-green-100 text-green-800" 
                          : product.stock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Limited" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="p-2 md:p-4">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-blue-600"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => {
                            setProductToDelete(product.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openStatusDialog(product, "In Stock")}>
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-2" /> In Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openStatusDialog(product, "Limited")}>
                              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" /> Limited
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openStatusDialog(product, "Sold Out")}>
                              <span className="h-2 w-2 rounded-full bg-red-500 mr-2" /> Sold Out
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openStatusDialog(product, "Discontinued")}>
                              <span className="h-2 w-2 rounded-full bg-gray-500 mr-2" /> Discontinued
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setProductToDelete(product.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    <div className="py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No products available. Add your first product above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
