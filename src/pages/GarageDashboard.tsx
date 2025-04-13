import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useGarageProducts, GarageProduct } from "@/hooks/useGarageProducts";
import { useGarageManagement } from "@/hooks/useGarageManagement";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import EditProductModal from "@/components/products/EditProductModal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import ServiceSlotManager from "@/components/garage/ServiceSlotManager";
import AppointmentManager from "@/components/garage/AppointmentManager";
import { DebugInstallationRequests } from "@/components/garage/DebugInstallationRequests";
import { GarageHeader } from "@/components/garage/dashboard/GarageHeader";
import { DashboardTabs } from "@/components/garage/dashboard/DashboardTabs";
import { InventoryTab } from "@/components/garage/dashboard/InventoryTab";
import { GarageTab } from "@/components/garage/dashboard/GarageTab";
import { EmptyTabContent } from "@/components/garage/dashboard/EmptyTabContent";
import { Calendar, Clock } from "lucide-react";
import InstallationOrdersDebugger from "@/components/garage/InstallationOrdersDebugger";

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
    installation_fee: 0,
  });

  const [newGarage, setNewGarage] = useState({
    name: "",
    area: "",
    location: "",
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
          installation_fee: 0,
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

  const handleAddGarage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addGarage(newGarage);
    
    setNewGarage({
      name: "",
      area: "",
      location: "",
    });
  };

  const handleGarageChange = (garageId: string) => {
    console.log("Changing to garage ID:", garageId);
    setCurrentGarageId(garageId);
    fetchProducts(garageId);
  };

  const handleEditProduct = (product: any) => {
    console.log("Editing product:", product);
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
      description: product.description,
      installation_fee: product.installation_fee || 0
    };
    
    setSelectedProduct(formattedProduct);
    setEditModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: GarageProduct) => {
    console.log("Updating product:", updatedProduct);
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

  console.log("Current products in GarageDashboard:", products);
  console.log("Current garage ID:", currentGarageId);

  return (
    <div className="container mx-auto py-4 md:py-8 px-2 md:px-4">
      <div className="flex flex-col gap-4 md:gap-8">
        <section className="bg-mechanica-50 rounded-xl shadow-md p-3 md:p-6 border border-mechanica-100">
          <GarageHeader 
            title="Garage Dashboard"
            description="Manage your garage, products, and appointments"
            currentGarageId={currentGarageId}
            availableGarages={availableGarages}
            onGarageChange={handleGarageChange}
          />
          
          <div className="flex justify-end mb-4">
            <div className="flex space-x-2">
              <InstallationOrdersDebugger />
            </div>
          </div>
          
          <DashboardTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            isMobile={isMobile}
          >
            <TabsContent value="inventory">
              <InventoryTab 
                products={products}
                productsLoading={productsLoading}
                isMobile={isMobile}
                handleEditProduct={handleEditProduct}
                setProductToDelete={setProductToDelete}
                setDeleteDialogOpen={setDeleteDialogOpen}
                openStatusDialog={openStatusDialog}
                currentGarageId={currentGarageId}
                productLoading={productLoading}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                setUploadProgress={setUploadProgress}
                manufacturers={manufacturers}
                models={models}
                years={years}
                newProduct={newProduct}
                setNewProduct={setNewProduct}
                handleAddProduct={handleAddProduct}
                productImage={productImage}
                setProductImage={setProductImage}
                handleFileChange={handleFileChange}
                filteredModels={filteredModels}
              />
            </TabsContent>

            <TabsContent value="appointments">
              {currentGarageId ? (
                <AppointmentManager garageId={currentGarageId} />
              ) : (
                <EmptyTabContent 
                  Icon={Calendar} 
                  message="Please select a garage to view appointments" 
                />
              )}
            </TabsContent>
            
            <TabsContent value="service-slots">
              {currentGarageId ? (
                <ServiceSlotManager garageId={currentGarageId} />
              ) : (
                <EmptyTabContent 
                  Icon={Clock} 
                  message="Please select a garage to manage service slots" 
                />
              )}
            </TabsContent>

            <TabsContent value="garages">
              <GarageTab 
                newGarage={newGarage}
                setNewGarage={setNewGarage}
                handleAddGarage={handleAddGarage}
                garageLoading={garageLoading}
                dubaiAreas={dubaiAreas}
                isMobile={isMobile}
              />
            </TabsContent>
          </DashboardTabs>
        </section>
      </div>
      
      <EditProductModal 
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        product={selectedProduct}
        onSave={handleUpdateProduct}
        manufacturers={manufacturers}
        models={models}
        years={years}
      />
      
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDeleteProduct}
      />
      
      <ConfirmDialog
        isOpen={statusUpdateDialogOpen}
        onClose={() => setStatusUpdateDialogOpen(false)}
        onOpenChange={setStatusUpdateDialogOpen}
        title="Update Product Status"
        description={`Are you sure you want to update the product status to "${statusProduct?.status}"?`}
        onConfirm={handleStatusUpdate}
      />
      
      <DebugInstallationRequests />
    </div>
  );
};

export default GarageDashboard;
