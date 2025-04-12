
import React from "react";
import { DollarSign, Star, RotateCw } from "lucide-react";

const BusinessModelSlide: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
        <div className="bg-blue-100 p-3 rounded-full">
          <span className="font-bold text-blue-600">1</span>
        </div>
        <div>
          <h3 className="font-medium">Commission Fee</h3>
          <p className="text-sm text-muted-foreground">8-12% from part suppliers and garages</p>
        </div>
        <div className="ml-auto transform transition-transform hover:scale-110">
          <DollarSign className="h-8 w-8 text-green-500" />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
        <div className="bg-blue-100 p-3 rounded-full">
          <span className="font-bold text-blue-600">2</span>
        </div>
        <div>
          <h3 className="font-medium">Premium Listing</h3>
          <p className="text-sm text-muted-foreground">Featured placement for partner garages</p>
        </div>
        <div className="ml-auto transform transition-transform hover:scale-110">
          <Star className="h-8 w-8 text-yellow-400" />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
        <div className="bg-blue-100 p-3 rounded-full">
          <span className="font-bold text-blue-600">3</span>
        </div>
        <div>
          <h3 className="font-medium">Subscription Model</h3>
          <p className="text-sm text-muted-foreground">Pro features for high-volume garages</p>
        </div>
        <div className="ml-auto transform transition-transform hover:scale-110">
          <RotateCw className="h-8 w-8 text-blue-500" />
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <h4 className="text-lg font-semibold text-mechanica-600 mb-2">Revenue Split</h4>
        <div className="flex justify-between bg-white rounded-xl p-3 shadow-sm">
          <div className="text-center">
            <div className="text-xs font-medium">Parts Sales</div>
            <div className="text-2xl font-bold text-blue-600">65%</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium">Premium</div>
            <div className="text-2xl font-bold text-yellow-600">20%</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium">Subscriptions</div>
            <div className="text-2xl font-bold text-green-600">15%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelSlide;
