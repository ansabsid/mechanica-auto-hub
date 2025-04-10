
import React from "react";
import { MapPin, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Part } from "@/hooks/useCarParts";
import { useCart } from "@/hooks/useCart";

interface PartCardProps {
  part: Part;
}

export const PartCard = ({ part }: PartCardProps) => {
  const { addToCart, isLoading } = useCart();
  
  const handleAddToCart = () => {
    addToCart(part.id, 1);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-subtle overflow-hidden card-hover">
      <div className="h-48 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format"
          alt={part.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{part.name}</h3>
          <span className={`bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full`}>
            {part.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        {part.description && (
          <div className="text-sm text-gray-500 mb-2">{part.description}</div>
        )}
        <p className="text-mechanica-600 font-bold text-lg mb-3">${part.price.toFixed(2)}</p>
        <div className="flex justify-between items-center">
          <div>
            {part.garages && (
              <>
                <div className="text-gray-700 font-medium">{part.garages.name}</div>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin size={14} className="mr-1" /> {part.garages.location}
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-mechanica-500 hover:bg-mechanica-600 flex items-center"
              onClick={handleAddToCart}
              disabled={isLoading || part.stock <= 0}
            >
              <ShoppingCart className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
