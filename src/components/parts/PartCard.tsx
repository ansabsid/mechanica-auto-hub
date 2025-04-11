
import React, { useState } from "react";
import { MapPin, ShoppingCart, Info, Star, Tag, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Part } from "@/hooks/useCarParts";
import { useCart } from "@/hooks/useCart";
import { PurchaseOptionsDialog } from "@/components/parts/PurchaseOptionsDialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

interface PartCardProps {
  part: Part;
}

// Function to get an appropriate image URL based on part name
const getPartImageUrl = (part: Part): string => {
  // If the part has an image_url, use it
  if (part.image_url) {
    return part.image_url;
  }
  
  const name = part.name.toLowerCase();
  
  if (name.includes('oil')) {
    return "https://images.unsplash.com/photo-1635954749253-a0642359cdfa?w=800&h=600&auto=format";
  } else if (name.includes('filter')) {
    return "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1?w=800&h=600&auto=format";
  } else if (name.includes('brake')) {
    return "https://images.unsplash.com/photo-1615384340342-28de71316d2a?w=800&h=600&auto=format";
  } else if (name.includes('spark') || name.includes('ignition')) {
    return "https://images.unsplash.com/photo-1602079836063-583166fbeba2?w=800&h=600&auto=format";
  } else if (name.includes('tire') || name.includes('wheel')) {
    return "https://images.unsplash.com/photo-1591839728094-39242732d4c1?w=800&h=600&auto=format";
  } else if (name.includes('battery') || name.includes('electrical')) {
    return "https://images.unsplash.com/photo-1619641464045-b201ebd9ec0c?w=800&h=600&auto=format";
  } else if (name.includes('belt')) {
    return "https://images.unsplash.com/photo-1629584603667-e9eda1c06851?w=800&h=600&auto=format"; 
  } else {
    // Default auto parts image for other categories
    return "https://images.unsplash.com/photo-1647427060118-4911c9821b82?w=800&h=600&auto=format";
  }
};

export const PartCard = ({ part }: PartCardProps) => {
  const { cartItems, addToCart, refreshCart, isLoading } = useCart();
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);
  const { toast } = useToast();
  
  // Check if this part with installation is already in cart
  const existingCartItem = cartItems.find(item => item.part_id === part.id);
  const existingInstallation = existingCartItem?.installation_data;
  
  const handleAddToCartClick = async () => {
    if (part.stock <= 0) return;
    
    if (existingCartItem) {
      try {
        // If already in cart, just add one more with same installation option
        await addToCart(part.id, 1, existingInstallation);
        // Refresh cart to make sure we see the updated items
        await refreshCart();
        toast({
          title: "Added to cart",
          description: `${part.name} added to cart${existingInstallation ? " with installation" : ""}`,
        });
      } catch (error) {
        console.error("Error adding part with existing installation:", error);
        toast({
          title: "Error",
          description: "Failed to add part to cart",
          variant: "destructive",
        });
      }
      return;
    }
    
    // If not in cart, show purchase options
    setShowPurchaseOptions(true);
  };
  
  const handleAddToCartOnly = async () => {
    try {
      await addToCart(part.id, 1);
      // Explicitly refresh the cart to ensure we see the updated items
      await refreshCart();
      toast({
        title: "Added to cart",
        description: `${part.name} added to your cart`,
      });
    } catch (error) {
      console.error("Error adding part only to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add part to cart",
        variant: "destructive",
      });
    }
  };
  
  const onDialogClose = () => {
    setShowPurchaseOptions(false);
  };
  
  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl group border border-gray-200 rounded-xl h-full flex flex-col">
        <div className="h-48 overflow-hidden relative">
          <img
            src={getPartImageUrl(part)}
            alt={part.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start">
            <Badge className={`${part.stock > 0 ? 'bg-green-500' : 'bg-red-500'} text-white px-2 py-1 text-xs font-medium shadow-sm`}>
              {part.stock > 0 ? (
                <div className="flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  In Stock
                </div>
              ) : "Out of Stock"}
            </Badge>
            
            <Badge className="bg-blue-600 text-white shadow-sm" variant="outline">
              <Tag className="mr-1 h-3 w-3" />
              {part.price > 100 ? "Premium" : "Standard"}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-5 flex-grow">
          <div className="mb-3">
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">{part.name}</h3>
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
          
          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-blue-600 font-bold text-xl mb-1">{formatPrice(part.price)}</p>
              {part.garages && (
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin size={14} className="mr-1" /> {part.garages.location}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 border-t border-gray-100 mt-auto">
          <div className="flex gap-2 w-full">
            <Button 
              size="sm" 
              variant="outline"
              className="flex items-center flex-1 h-9"
            >
              <Info className="mr-1 h-4 w-4" /> Details
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600 flex items-center flex-1 shadow-sm transition-all duration-200 hover:translate-y-[-2px] h-9"
              onClick={handleAddToCartClick}
              disabled={isLoading || part.stock <= 0}
            >
              <ShoppingCart className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        </CardFooter>
      </Card>

      <PurchaseOptionsDialog 
        isOpen={showPurchaseOptions}
        onClose={onDialogClose}
        part={part}
        onAddToCartOnly={handleAddToCartOnly}
      />
    </>
  );
};
