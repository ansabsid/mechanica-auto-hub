
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGarageManagement } from "@/hooks/useGarageManagement";

import GarageHero from "@/components/garage/GarageHero";
import GarageList from "@/components/garage/GarageList";
import GarageJoinBanner from "@/components/garage/GarageJoinBanner";

interface Garage {
  id: string;
  name: string;
  area: string | null;
  location: string;
  images?: string | null;
  installationFee?: number | null;
}

const GaragePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  
  const { 
    garages, 
    fetchLoading: loading, 
    error, 
    fetchGarages, 
    isLoading 
  } = useGarageManagement();

  useEffect(() => {
    console.log("GaragePage component mounted, fetching garages...");
    // Force refresh the garages data
    fetchGarages().then(fetchedGarages => {
      console.log("Garages fetched:", fetchedGarages);
    }).catch(err => {
      console.error("Error fetching garages:", err);
      toast.error("Failed to load garages. Please try again.");
    });
  }, []);

  useEffect(() => {
    console.log("Garages or search query changed, filtering garages...", { garagesCount: garages.length, searchQuery });
    
    if (garages.length > 0) {
      const filtered = garages.filter(garage => {
        const searchLower = searchQuery.toLowerCase();
        return (
          garage.name.toLowerCase().includes(searchLower) ||
          garage.location.toLowerCase().includes(searchLower) ||
          (garage.area && garage.area.toLowerCase().includes(searchLower))
        );
      });

      console.log(`Filtered ${garages.length} garages to ${filtered.length} based on search: "${searchQuery}"`);
      setFilteredGarages(filtered);
    } else {
      console.log("No garages to filter, setting empty array");
      setFilteredGarages([]);
    }
  }, [searchQuery, garages]);

  const handleRetry = () => {
    toast.info("Retrying...");
    fetchGarages();
  };

  const toggleView = () => {
    setView(prev => prev === "grid" ? "list" : "grid");
  };

  return (
    <>
      <GarageHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <section className="py-8 md:py-16 container-custom px-4 md:px-8">
        <GarageList 
          filteredGarages={filteredGarages}
          loading={loading}
          searchQuery={searchQuery}
          view={view}
          toggleView={toggleView}
          handleRetry={handleRetry}
          isLoading={isLoading}
          garages={garages}
          error={error}
          setSearchQuery={setSearchQuery}
        />
        
        <GarageJoinBanner />
      </section>
    </>
  );
};

export default GaragePage;
