
import React from "react";
import { Button } from "@/components/ui/button";

const GarageJoinBanner = () => {
  return (
    <div className="mt-8 md:mt-16 bg-mechanica-50 rounded-xl p-4 md:p-8 text-center">
      <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Own a Garage? Join Our Network</h2>
      <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-4 md:mb-6">
        Partner with BookMyParts to reach more customers, manage your business digitally, 
        and grow your service revenue.
      </p>
      <Button className="bg-mechanica-600 hover:bg-mechanica-700">
        Register Your Garage
      </Button>
    </div>
  );
};

export default GarageJoinBanner;
