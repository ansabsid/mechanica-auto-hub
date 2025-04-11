
import React from "react";
import { MapPin, ShoppingCart, Info, Star, Tag, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mechanica-100 transition-all duration-300 hover:shadow-xl hover:border-mechanica-300 group">
      <div className="h-48 overflow-hidden relative">
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format"
          alt={part.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start">
          <Badge className={`${part.stock > 0 ? 'bg-green-500' : 'bg-red-500'} text-white px-2 py-1 text-xs font-medium`}>
            {part.stock > 0 ? (
              <div className="flex items-center">
                <CheckCircle className="mr-1 h-3 w-3" />
                In Stock
              </div>
            ) : "Out of Stock"}
          </Badge>
          
          <Badge className="bg-mechanica-600 text-white" variant="outline">
            <Tag className="mr-1 h-3 w-3" />
            {part.price > 100 ? "Premium" : "Standard"}
          </Badge>
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-mechanica-600 transition-colors">{part.name}</h3>
          {part.description && (
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{part.description}</div>
          )}
        </div>

        <div className="flex items-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">4.0 (12 reviews)</span>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-mechanica-600 font-bold text-xl mb-1">${part.price.toFixed(2)}</p>
            {part.garages && (
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin size={14} className="mr-1" /> {part.garages.location}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="flex items-center"
            >
              <Info className="mr-1 h-4 w-4" /> Details
            </Button>
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
