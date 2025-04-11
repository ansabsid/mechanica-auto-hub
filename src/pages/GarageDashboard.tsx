import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingBag,
  Calendar,
  Plus,
  Package,
  MoreHorizontal,
  MapPin,
  Check,
  X,
  Loader2,
  FileImage,
  Upload,
  Car,
  Factory,
  Edit,
  Trash2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGarageProducts, GarageProduct } from "@/hooks/useGarageProducts";
import { useGarageAppointments, ServiceSlot } from "@/hooks/useGarageAppointments";
import { useGarageManagement } from "@/hooks/useGarageManagement";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import EditProductModal from "@/components/products/EditProductModal";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const appointments = [
  {
    id: 1,
    customer: "Ahmed Hassan",
    service: "Oil Change",
    date: "2025-04-15",
    time: "09:00",
    status: "Confirmed",
    phone: "+971 50 123 4567",
    car: "Toyota Camry 2022",
  },
  {
    id: 2,
    customer: "Sara Khan",
    service: "Brake Service",
    date: "2025-04-16",
    time: "10:30",
    status: "Pending",
    phone: "+971 50 987 6543",
    car: "Honda Accord 2021",
  },
  {
    id: 3,
    customer: "Mohammed Ali",
    service: "Full Car Service",
    date: "2025-04-17",
    time: "14:00",
    status: "Confirmed",
    phone: "+971 50 567 8901",
    car: "BMW 3 Series 2023",
  },
];

const dubaiAreas = [
  "Dubai Marina",
  "Downtown Dubai",
  "Jumeirah",
  "Deira",
  "Business Bay",
  "JLT",
  "Palm Jumeirah",
  "Al Barsha",
  "Dubai Hills",
  "Mirdif",
  "Dubai Silicon Oasis",
  "International City",
  "Dubai Sports City",
  "JVC",
  "Arabian Ranches"
];

const GarageDashboard = () => {
  const [newProduct, setNewProduct] = useState<GarageProduct>({
    name: "",
    category: "",
    price: "",
    quantity: "",
    status: "In Stock",
    manufacturer_id: 1,
    model_id: 1,
    year: new Date().getFullYear(),
    description: "",
  });

  const [newSlot, setNewSlot] = useState<ServiceSlot>({
    service: "",
    date: "",
    startTime: "",
    endTime: "",
    interval: "60",
  });

  const [newGarage, setNewGarage] = useState({
    name: "",
    area: "",
    location: "",
    installationFee: ""
  });

  const [currentGarageId, setCurrentGarageId] = useState<string>("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [filteredModels, setFilteredModels] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const isMobile = useIsMobile();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<GarageProduct | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [statusProduct, setStatusProduct] = useState<{id: number, status: string} | null>(null);

  const { 
    addProduct, 
    fetchProducts, 
    products, 
    isLoading: productLoading, 
    fetchLoading: productsLoading,
    uploadProgress,
    setUploadProgress,
    availableGarages,
    updateProduct,
    updateProductStatus,
    deleteProduct
  } = useGarageProducts(currentGarageId);
  
  const { 
    createServiceSlots, 
    isLoading: slotLoading 
  } = useGarageAppointments();
  
  const { 
    addGarage, 
    fetchGarages, 
    garages, 
    isLoading: garageLoading,
    fetchLoading: garagesLoading
  } = useGarageManagement();

  useEffect(() => {
    const initializeGarageData = async () => {
      const garageData = await fetchGarages();
      
      if (garageData && garageData.length > 0) {
        const firstGarageId = garageData[0]?.id;
        console.log("Setting current garage ID to:", firstGarageId);
        
        if (firstGarageId) {
          setCurrentGarageId(firstGarageId);
        } else {
          toast.warning("No garages found. Please add a garage first.");
        }
      } else {
        toast.warning("No garages found. Please add a garage first.");
      }
    };
    
    initializeGarageData();
    
    fetchManufacturers();
    
    const currentYear = new Date().getFullYear();
    const yearList = Array.from({ length: 30 }, (_, i) => currentYear - i);
    setYears(yearList);
  }, []);

  const fetchManufacturers = async () => {
    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setManufacturers(data);
      }
      
      fetchAllModels();
    } catch (error: any) {
      console.error("Error fetching manufacturers:", error.message);
      toast.error("Failed to load manufacturers");
    }
  };

  const fetchAllModels = async () => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setModels(data);
        setFilteredModels([]);
      }
    } catch (error: any) {
      console.error("Error fetching models:", error.message);
      toast.error("Failed to load models");
    }
  };

  useEffect(() => {
    if (newProduct.manufacturer_id) {
      const filtered = models.filter(model => model.manufacturer_id === newProduct.manufacturer_id);
      setFilteredModels(filtered);
      
      if (filtered.length > 0 && 
          !filtered.some(model => model.id === newProduct.model_id)) {
        setNewProduct(prev => ({
          ...prev,
          model_id: filtered[0].id
        }));
      }
    } else {
      setFilteredModels([]);
    }
  }, [newProduct.manufacturer_id, models]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Maximum size is 5MB.");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed.");
        return;
      }
      
      setProductImage(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentGarageId) {
      toast.error("No garage selected. Please add a garage first.");
      return;
    }

    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    console.log("Adding product with garage ID:", currentGarageId);
    setIsUploading(true);
    
    try {
      console.log("Saving product with data:", newProduct);
      
      const productId = await addProduct(newProduct, currentGarageId, productImage);
      
      if (productId) {
        toast.success("Product added successfully!");
        
        setNewProduct({
          name: "",
          category: "",
          price: "",
          quantity: "",
          status: "In Stock",
          manufacturer_id: 1,
          model_id: 1,
          year: new Date().getFullYear(),
          description: "",
        });
        setProductImage(null);
        setUploadProgress(0);
      }
    } catch (error: any) {
      console.error("Error in handleAddProduct:", error);
      toast.error(error.message || "Failed to add product");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGarageId) {
      toast.error("Garage ID not found. Please try again.");
      return;
    }
    
    await createServiceSlots(newSlot, currentGarageId);
    
    setNewSlot({
      service: "",
      date: "",
      startTime: "",
      endTime: "",
      interval: "60",
    });
  };

  const handleAddGarage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addGarage(newGarage);
    
    setNewGarage({
      name: "",
      area: "",
      location: "",
      installationFee: "",
    });
  };

  const handleGarageChange = (garageId: string) => {
    console.log("Changing to garage ID:", garageId);
    setCurrentGarageId(garageId);
    fetchProducts(garageId);
  };

  const handleEditProduct = (product: any) => {
    const formattedProduct: GarageProduct = {
      id: product.id,
      name: product.name,
      category: product.category || "",
      price: product.price,
      quantity: product.stock,
      status: product.status || "In Stock",
      garage_id: product.garage_id,
      imageUrl: product.image_url,
      manufacturer_id: product.manufacturer_id,
      model_id: product.model_id,
      year: product.year,
      description: product.description
    };
    
    setSelectedProduct(formattedProduct);
    setEditModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: GarageProduct) => {
    return await updateProduct(updatedProduct);
  };

  const handleStatusUpdate = async () => {
    if (!statusProduct) return false;
    
    return await updateProductStatus(
      statusProduct.id, 
      statusProduct.status, 
      currentGarageId
    );
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    const success = await deleteProduct(productToDelete, currentGarageId);
    if (success) {
      setProductToDelete(null);
    }
  };

  const openStatusDialog = (product: any, newStatus: string) => {
    setStatusProduct({
      id: product.id,
      status: newStatus
    });
    setStatusUpdateDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-4 md:py-8 px-2 md:px-4">
      <div className="flex flex-col gap-4 md:gap-8">
        <section className="bg-mechanica-50 rounded-xl shadow-md p-3 md:p-6 border border-mechanica-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-mechanica-900">
                Garage Dashboard
              </h2>
              <p className="text-sm md:text-base text-gray-600">Manage your garage, products, and appointments</p>
            </div>
            
            {availableGarages.length > 0 && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <label htmlFor="garage-selector" className="text-sm font-medium whitespace-nowrap">
                  Current Garage:
                </label>
                <Select 
                  value={currentGarageId} 
                  onValueChange={handleGarageChange}
                >
                  <SelectTrigger id="garage-selector" className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select garage" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGarages.map(garage => (
                      <SelectItem key={garage.id} value={garage.id}>
                        {garage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="inventory" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-8 md:max-w-md md:mx-auto">
              <TabsTrigger value="inventory" className="flex items-center justify-center gap-1 md:gap-2 py-1 md:py-2 px-1 md:px-3 text-xs md:text-sm">
                <ShoppingBag size={isMobile ? 16 : 18} /> {isMobile ? "Items" : "Inventory"}
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center justify-center gap-1 md:gap-2 py-1 md:py-2 px-1 md:px-3 text-xs md:text-sm">
                <Calendar size={isMobile ? 16 : 18} /> {isMobile ? "Appts" : "Appointments"}
              </TabsTrigger>
              <TabsTrigger value="garages" className="flex items-center justify-center gap-1 md:gap-2 py-1 md:py-2 px-1 md:px-3 text-xs md:text-sm">
                <MapPin size={isMobile ? 16 : 18} /> Garages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
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
                          required
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
                          required
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
                          required
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
                          required
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

                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full bg-white rounded-xl shadow-sm">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b">
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Product</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Category</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">Vehicle</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Price</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">Quantity</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Status</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsLoading ? (
                          <tr>
                            <td colSpan={7} className="text-center p-4">
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
                            <td colSpan={7} className="text-center p-4 text-sm">No products found. Add your first product!</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appointments">
              <div className="flex flex-col space-y-4 md:space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <h2 className="text-lg md:text-xl font-semibold">Service Appointments</h2>
                  <Button 
                    onClick={() => document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="mechanica"
                    size={isMobile ? "sm" : "default"}
                    className="w-full md:w-auto"
                  >
                    <Plus className="mr-1 md:mr-2 h-4 w-4" /> Create Service Slots
                  </Button>
                </div>

                <div id="service-form" className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Add Service Slots</h3>
                  <form onSubmit={handleAddSlot} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-type">Service Type*</Label>
                        <Select
                          value={newSlot.service}
                          onValueChange={(value) => setNewSlot({...newSlot, service: value})}
                          required
                        >
                          <SelectTrigger id="service-type">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oil-change">Oil Change</SelectItem>
                            <SelectItem value="brake-service">Brake Service</SelectItem>
                            <SelectItem value="full-service">Full Car Service</SelectItem>
                            <SelectItem value="ac-service">AC Service</SelectItem>
                            <SelectItem value="tire-change">Tire Change</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-date">Date*</Label>
                        <Input 
                          id="service-date"
                          type="date"
                          value={newSlot.date}
                          onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time*</Label>
                        <Input 
                          id="start-time"
                          type="time"
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">End Time*</Label>
                        <Input 
                          id="end-time"
                          type="time"
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-interval">Appointment Duration (minutes)*</Label>
                        <Select
                          value={newSlot.interval}
                          onValueChange={(value) => setNewSlot({...newSlot, interval: value})}
                          required
                        >
                          <SelectTrigger id="service-interval">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                            <SelectItem value="180">3 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      variant="mechanica"
                      disabled={slotLoading}
                      className="w-full md:w-auto"
                    >
                      {slotLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : "Create Slots"}
                    </Button>
                  </form>
                </div>

                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full bg-white rounded-xl shadow-sm">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b">
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Customer</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Service</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Date & Time</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">Car</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Status</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b">
                            <td className="p-2 md:p-4">
                              <div>
                                <div className="font-medium text-xs md:text-sm">{appointment.customer}</div>
                                <div className="text-xs text-gray-500 hidden md:block">{appointment.phone}</div>
                              </div>
                            </td>
                            <td className="p-2 md:p-4 text-xs md:text-sm">{appointment.service}</td>
                            <td className="p-2 md:p-4">
                              <div>
                                <div className="text-xs md:text-sm">
                                  {new Date(appointment.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="text-xs text-gray-500">{appointment.time}</div>
                              </div>
                            </td>
                            <td className="p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">{appointment.car}</td>
                            <td className="p-2 md:p-4">
                              <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs ${
                                appointment.status === "Confirmed" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td className="p-2 md:p-4">
                              <div className="flex space-x-1 md:space-x-2">
                                {appointment.status === "Pending" && (
                                  <>
                                    <Button size="sm" variant="outline" className="h-7 md:h-8 w-7 md:w-8 p-0 bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 md:h-8 w-7 md:w-8 p-0 bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 md:h-8 w-7 md:w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="garages">
              <div className="flex flex-col space-y-4 md:space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <h2 className="text-lg md:text-xl font-semibold">Garage Management</h2>
                  <Button 
                    onClick={() => document.getElementById('garage-form')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="mechanica"
                    size={isMobile ? "sm" : "default"}
                    className="w-full md:w-auto"
                  >
                    <Plus className="mr-1 md:mr-2 h-4 w-4" /> Add New Garage
                  </Button>
                </div>

                <div id="garage-form" className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Onboard New Garage</h3>
                  <form onSubmit={handleAddGarage} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="garage-name">Garage Name*</Label>
                        <Input 
                          id="garage-name"
                          value={newGarage.name}
                          onChange={(e) => setNewGarage({...newGarage, name: e.target.value})}
                          required
                          placeholder="e.g. Mechanica Service Center - Dubai Marina"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="garage-area">Area*</Label>
                        <Select 
                          value={newGarage.area}
                          onValueChange={(value) => setNewGarage({...newGarage, area: value})}
                          required
                        >
                          <SelectTrigger id="garage-area">
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            {dubaiAreas.map((area) => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs md:text-sm text-gray-500">This groups garages by area for customer selection</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="garage-location">Full Address*</Label>
                        <Textarea 
                          id="garage-location"
                          value={newGarage.location}
                          onChange={(e) => setNewGarage({...newGarage, location: e.target.value})}
                          required
                          placeholder="e.g. Dubai Marina, Sheikh Zayed Road, Dubai, UAE"
                          className="resize-none h-20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="garage-fee">Base Installation Fee (AED)*</Label>
                        <Input 
                          id="garage-fee"
                          type="number"
                          value={newGarage.installationFee}
                          onChange={(e) => setNewGarage({...newGarage, installationFee: e.target.value})}
                          required
                          placeholder="e.g. 25.99"
                        />
                        <p className="text-xs md:text-sm text-gray-500">Base fee applied to installations at this garage</p>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      variant="mechanica"
                      disabled={garageLoading}
                      className="w-full md:w-auto"
                    >
                      {garageLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : "Add Garage"}
                    </Button>
                  </form>
                </div>

                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full bg-white rounded-xl shadow-sm">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b">
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Garage Name</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Area</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">Full Address</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Installation Fee</th>
                          <th className="text-left p-2 md:p-4 text-xs md:text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {garagesLoading ? (
                          <tr>
                            <td colSpan={5} className="text-center p-4">
                              <div className="flex justify-center items-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Loading garages...
                              </div>
                            </td>
                          </tr>
                        ) : garages.length > 0 ? (
                          garages.map((garage) => (
                            <tr key={garage.id} className="border-b">
                              <td className="p-2 md:p-4 text-xs md:text-sm">{garage.name}</td>
                              <td className="p-2 md:p-4 text-xs md:text-sm">{garage.area}</td>
                              <td className="p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">{garage.location}</td>
                              <td className="p-2 md:p-4 text-xs md:text-sm">AED {garage.installationFee || "0.00"}</td>
                              <td className="p-2 md:p-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 md:h-8 w-7 md:w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Edit Garage</DropdownMenuItem>
                                    <DropdownMenuItem>View Parts</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center p-4 text-sm">No garages found. Add your first garage!</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
      
      <EditProductModal 
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleUpdateProduct}
        manufacturers={manufacturers}
        models={models}
        years={years}
      />
      
      <ConfirmDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={productLoading}
      />
      
      <ConfirmDialog 
        isOpen={statusUpdateDialogOpen}
        onClose={() => setStatusUpdateDialogOpen(false)}
        onConfirm={handleStatusUpdate}
        title="Update Product Status"
        description={`Are you sure you want to change the status to "${statusProduct?.status}"?`}
        confirmText="Update"
        cancelText="Cancel"
        isLoading={productLoading}
      />
    </div>
  );
};

export default GarageDashboard;
