import React from "react";
import { Building2, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import GarageCard from "./GarageCard";
import GarageTable from "./GarageTable";
import { Garage } from "@/hooks/useGarageManagement";

interface GarageListProps {
  filteredGarages: Garage[];
  loading: boolean;
  searchQuery: string;
  view: "grid" | "list";
  toggleView: () => void;
  handleRetry: () => void;
  isLoading: boolean;
  garages: Garage[];
  error: string | null;
  setSearchQuery: (query: string) => void;
}

const GarageList = ({ 
  filteredGarages, 
  loading, 
  searchQuery, 
  view, 
  toggleView, 
  handleRetry,
  isLoading,
  garages,
  error,
  setSearchQuery
}: GarageListProps) => {
  return (
    <>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">
            {loading ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Fetching garages...
              </span>
            ) : (
              <>
                Showing <span className="font-medium">{filteredGarages.length}</span> garages
                {searchQuery && <span> for "<span className="font-medium">{searchQuery}</span>"</span>}
              </>
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleView}
            className="text-gray-600 border-gray-200"
          >
            {view === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="md" className="mr-2" />
          <span className="text-lg text-gray-600">Loading garages...</span>
        </div>
      ) : filteredGarages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-4">
            <Building2 className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <p className="text-lg text-gray-600 mb-4">
            {loading ? "Loading garages..." : "No garages found matching your search criteria."}
          </p>
          {!loading && searchQuery && (
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery("")}
              className="mb-4"
            >
              Clear Search
            </Button>
          )}
          {!loading && garages.length === 0 && (
            <div className="mt-4">
              <p className="text-gray-600 mb-4">No garages found in the database.</p>
              <Button 
                onClick={handleRetry}
                className="bg-mechanica-600 flex items-center mx-auto"
                disabled={isLoading}
              >
                {isLoading ? "Fetching Data..." : "Retry Fetching Garages"}
              </Button>
            </div>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGarages.map((garage) => (
            <GarageCard key={garage.id} garage={garage} />
          ))}
        </div>
      ) : (
        <GarageTable garages={filteredGarages} loading={loading} />
      )}
    </>
  );
};

export default GarageList;
