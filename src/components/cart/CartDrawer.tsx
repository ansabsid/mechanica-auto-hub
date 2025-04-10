
import React from "react";
import { ShoppingCart, X, Trash, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const CartDrawer = () => {
  const { cartItems, isLoading, updateCartItemQuantity, removeFromCart, clearCart, calculateTotal } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/checkout");
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-mechanica-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" /> Your Cart
          </SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="py-6 text-center">Loading your cart...</div>
        ) : cartItems.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <div className="py-4 flex flex-col h-full">
            <div className="flex-1 overflow-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.part.name}</h4>
                      <p className="text-sm text-muted-foreground">${item.part.price.toFixed(2)} each</p>
                      {item.part.garages && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Sold by: {item.part.garages.name}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center border rounded">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        disabled={isLoading}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="font-medium">
                      ${(item.part.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  
                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
            
            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={clearCart}
                  disabled={isLoading}
                >
                  <Trash className="mr-1 h-4 w-4" /> Clear
                </Button>
                <SheetClose asChild>
                  <Button
                    size="sm"
                    className="flex-1 bg-mechanica-500 hover:bg-mechanica-600"
                    onClick={handleCheckout}
                    disabled={isLoading || cartItems.length === 0}
                  >
                    Checkout <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
