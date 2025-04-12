
import React from "react";
import GarageSearch from "./GarageSearch";

interface GarageHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const GarageHero = ({ searchQuery, setSearchQuery }: GarageHeroProps) => {
  return (
    <section className="bg-mechanica-50 py-8 md:py-16">
      <div className="container-custom text-center px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">Find Trusted Garages</h1>
        <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8">
          Connect with our network of professional garages and service centers across the UAE
        </p>
        
        <GarageSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
    </section>
  );
};

export default GarageHero;
