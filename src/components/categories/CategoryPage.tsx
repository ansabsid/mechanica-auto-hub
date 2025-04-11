import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCarParts } from "@/hooks/useCarParts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Part } from "@/hooks/car-parts/types";
import { PartCard } from "@/components/parts/PartCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CategoryItem {
  id: number;
  name: string;
}

const CategoryPage = () => {
  const navigate = useNavigate();
  const {
    manufacturers,
    models,
    parts,
    isLoading,
    searchCompleted,
    fetchManufacturers,
    fetchModels,
    searchParts
  } = useCarParts();

  // State for tracking selected categories
  const [selectedManufacturer, setSelectedManufacturer] = useState<CategoryItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<CategoryItem | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [currentParts, setCurrentParts] = useState<Part[]>([]);
  const [navigationStep, setNavigationStep] = useState<'manufacturer' | 'model' | 'year' | 'parts'>('manufacturer');

  // Load manufacturers on mount
  useEffect(() => {
    fetchManufacturers();
  }, [fetchManufacturers]);

  // When manufacturer is selected, fetch models
  useEffect(() => {
    if (selectedManufacturer) {
      fetchModels(selectedManufacturer.id.toString());
    }
  }, [selectedManufacturer, fetchModels]);

  // Generate available years (2010-2024)
  useEffect(() => {
    const years = [];
    for (let year = 2010; year <= 2024; year++) {
      years.push(year);
    }
    setAvailableYears(years);
  }, []);

  // Update parts when search is completed
  useEffect(() => {
    if (searchCompleted && parts) {
      setCurrentParts(parts);
      setNavigationStep('parts');
    }
  }, [searchCompleted, parts]);

  const handleManufacturerSelect = (manufacturer: CategoryItem) => {
    setSelectedManufacturer(manufacturer);
    setSelectedModel(null);
    setSelectedYear(null);
    setNavigationStep('model');
  };

  const handleModelSelect = (model: CategoryItem) => {
    setSelectedModel(model);
    setNavigationStep('year');
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year.toString());
    
    // Search for parts with the complete selection
    if (selectedManufacturer && selectedModel) {
      searchParts(
        selectedManufacturer.id.toString(),
        selectedModel.id.toString(),
        year.toString()
      );
    }
  };

  const handleBack = () => {
    if (navigationStep === 'model') {
      setNavigationStep('manufacturer');
      setSelectedManufacturer(null);
    } else if (navigationStep === 'year') {
      setNavigationStep('model');
      setSelectedModel(null);
    } else if (navigationStep === 'parts') {
      setNavigationStep('year');
      setSelectedYear(null);
      setCurrentParts([]);
    }
  };

  // Show current step title
  const getStepTitle = () => {
    switch (navigationStep) {
      case 'manufacturer': return 'Select Manufacturer';
      case 'model': return `Select Model for ${selectedManufacturer?.name}`;
      case 'year': return `Select Year for ${selectedManufacturer?.name} ${selectedModel?.name}`;
      case 'parts': return `Parts for ${selectedManufacturer?.name} ${selectedModel?.name} (${selectedYear})`;
      default: return 'Select Category';
    }
  };

  // Render breadcrumb navigation
  const renderBreadcrumb = () => {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span 
          className={`cursor-pointer hover:text-mechanica-600 ${navigationStep !== 'manufacturer' ? 'text-mechanica-600 font-medium' : ''}`}
          onClick={() => navigationStep !== 'manufacturer' && setNavigationStep('manufacturer')}
        >
          Manufacturers
        </span>
        
        {selectedManufacturer && (
          <>
            <span>/</span>
            <span 
              className={`cursor-pointer hover:text-mechanica-600 ${navigationStep !== 'manufacturer' && navigationStep !== 'model' ? 'text-mechanica-600 font-medium' : ''}`}
              onClick={() => navigationStep !== 'model' && navigationStep !== 'manufacturer' && setNavigationStep('model')}
            >
              {selectedManufacturer.name}
            </span>
          </>
        )}
        
        {selectedModel && (
          <>
            <span>/</span>
            <span 
              className={`cursor-pointer hover:text-mechanica-600 ${navigationStep === 'parts' ? 'text-mechanica-600 font-medium' : ''}`}
              onClick={() => navigationStep === 'parts' && setNavigationStep('year')}
            >
              {selectedModel.name}
            </span>
          </>
        )}
        
        {selectedYear && (
          <>
            <span>/</span>
            <span className="text-mechanica-600 font-medium">{selectedYear}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container-custom py-8">
      {navigationStep !== 'manufacturer' && (
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      )}
      
      <h1 className="text-3xl font-bold mb-2">{getStepTitle()}</h1>
      {renderBreadcrumb()}
      
      <Separator className="my-4" />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Manufacturers Step */}
          {navigationStep === 'manufacturer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {manufacturers.map(manufacturer => (
                <Card 
                  key={manufacturer.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleManufacturerSelect(manufacturer)}
                >
                  <CardContent className="p-4 flex items-center">
                    <Car className="mr-3 h-6 w-6 text-mechanica-600" />
                    <span className="font-medium">{manufacturer.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Models Step */}
          {navigationStep === 'model' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {models.map(model => (
                <Card 
                  key={model.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleModelSelect(model)}
                >
                  <CardContent className="p-4 flex items-center">
                    <Car className="mr-3 h-6 w-6 text-mechanica-600" />
                    <span className="font-medium">{model.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Years Step */}
          {navigationStep === 'year' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableYears.map(year => (
                <Card 
                  key={year} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleYearSelect(year)}
                >
                  <CardContent className="p-4 flex items-center">
                    <Calendar className="mr-3 h-6 w-6 text-mechanica-600" />
                    <span className="font-medium">{year}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Parts Step */}
          {navigationStep === 'parts' && (
            <>
              {currentParts.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No parts found</h3>
                  <p className="text-gray-500">
                    No parts available for {selectedManufacturer?.name} {selectedModel?.name} ({selectedYear}).
                  </p>
                  <Button onClick={handleBack} className="mt-4">
                    Go Back
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentParts.map(part => (
                    <PartCard key={part.id} part={part} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryPage;
