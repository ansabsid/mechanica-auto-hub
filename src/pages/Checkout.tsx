import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, ShoppingCart, Loader2, Check, Apple } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  postalCode: z.string().min(3, { message: "Postal code is required" }),
  cardNumber: z.string().min(13, { message: "Valid card number is required" }),
  cardExpiry: z.string().min(5, { message: "Expiry date required (MM/YY)" }),
  cardCVC: z.string().min(3, { message: "CVC is required" }),
});

const Checkout = () => {
  const { cartItems, calculateTotal, clearCart, isLoading: cartLoading, refreshCart } = useCart();
  const { createOrder, isProcessing } = useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "applepay">("card");
  const isMobile = useIsMobile();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: user?.email || "",
      address: "",
      city: "",
      postalCode: "",
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
    },
  });
  
  useEffect(() => {
    console.log("Checkout page mounted");
    refreshCart();
  }, [refreshCart]);
  
  useEffect(() => {
    if (cartItems.length === 0 && !isSuccess) {
      console.log("Cart is empty but staying on checkout page");
    }
  }, [cartItems, isSuccess]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to place an order",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Processing order with values:", values);
      
      const order = await createOrder(cartItems, calculateTotal());
      
      if (order) {
        setIsSuccess(true);
        setOrderId(order.id || "");
        await clearCart();
        
        setTimeout(() => {
          navigate(`/orders/${order.id}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Order processing error:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your order",
        variant: "destructive",
      });
    }
  };

  const handleApplePaySubmit = async () => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to place an order",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Processing Apple Pay order");
      
      const order = await createOrder(cartItems, calculateTotal());
      
      if (order) {
        setIsSuccess(true);
        setOrderId(order.id || "");
        await clearCart();
        
        setTimeout(() => {
          navigate(`/orders/${order.id}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Apple Pay processing error:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your Apple Pay payment",
        variant: "destructive",
      });
    }
  };
  
  if (isSuccess) {
    return (
      <div className="container-custom max-w-3xl py-8 md:py-20 px-4 md:px-6">
        <Card className="border-green-100 shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl mb-2">Order Successful!</CardTitle>
            <CardDescription className="text-base md:text-lg mb-6">
              Your order has been placed successfully.
            </CardDescription>
            
            <p className="text-sm text-muted-foreground mb-2">
              Order ID: {orderId}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You will be redirected to your order details in a moment...
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/customer-dashboard")}
                className="w-full md:w-auto"
              >
                Continue Shopping
              </Button>
              <Button 
                onClick={() => navigate(`/orders/${orderId}`)}
                className="bg-mechanica-500 hover:bg-mechanica-600 w-full md:w-auto"
              >
                View Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const OrderSummaryContent = () => (
    <div className="space-y-4">
      {cartItems.map((item) => (
        <div key={item.id} className="flex justify-between gap-2">
          <div>
            <p className="font-medium">{item.part.name}</p>
            <p className="text-sm text-muted-foreground">
              Qty: {item.quantity}
            </p>
          </div>
          <p className="font-medium">
            ${(item.part.price * item.quantity).toFixed(2)}
          </p>
        </div>
      ))}
      
      <Separator />
      
      <div className="flex justify-between">
        <p className="font-medium">Subtotal</p>
        <p className="font-medium">${calculateTotal().toFixed(2)}</p>
      </div>
      <div className="flex justify-between">
        <p className="font-medium">Shipping</p>
        <p className="font-medium">$0.00</p>
      </div>
      <div className="flex justify-between">
        <p className="font-medium">Tax</p>
        <p className="font-medium">$0.00</p>
      </div>
      
      <Separator />
      
      <div className="flex justify-between">
        <p className="font-bold text-lg">Total</p>
        <p className="font-bold text-lg">
          ${calculateTotal().toFixed(2)}
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full mt-2"
        onClick={() => navigate(-1)}
      >
        Continue Shopping
      </Button>
    </div>
  );
  
  return (
    <>
      <div className="py-6 md:py-8 bg-mechanica-50">
        <div className="container-custom px-4 md:px-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-3 md:mb-4" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase</p>
          
          {isMobile && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 flex justify-between items-center"
                >
                  <span className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Order Summary
                  </span>
                  <span className="font-bold">${calculateTotal().toFixed(2)}</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" /> Order Summary
                  </DrawerTitle>
                  <DrawerDescription>
                    {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  <OrderSummaryContent />
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>

      <div className="container-custom py-6 md:py-10 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-xl md:text-2xl">Payment Method</CardTitle>
                <CardDescription>
                  Choose how you'd like to pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3 md:space-x-4 mb-6 max-w-none">
                  <Button
                    type="button"
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    className={`flex-1 text-sm md:text-base px-3 md:px-6 h-12 ${paymentMethod === "card" ? "bg-mechanica-500 hover:bg-mechanica-600" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Credit Card
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "applepay" ? "default" : "outline"}
                    className={`flex-1 text-sm md:text-base px-3 md:px-6 h-12 ${paymentMethod === "applepay" ? "bg-black hover:bg-gray-800" : ""}`}
                    onClick={() => setPaymentMethod("applepay")}
                  >
                    <Apple className="mr-2 h-5 w-5" />
                    Apple Pay
                  </Button>
                </div>

                {paymentMethod === "applepay" ? (
                  <div className="py-4 md:py-6">
                    <Card className="border-2 bg-black text-white">
                      <CardContent className="pt-6 pb-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-4">
                            <Apple className="h-6 md:h-8 w-6 md:w-8" />
                            <span className="text-lg md:text-xl font-medium ml-2">Pay</span>
                          </div>
                          <p className="mb-4">Pay with Apple Pay</p>
                          <Button 
                            onClick={handleApplePaySubmit}
                            className="w-full bg-white text-black hover:bg-gray-100 h-12 text-base"
                            disabled={isProcessing || cartLoading}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>Pay ${calculateTotal().toFixed(2)}</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-base">Contact Information</h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator className="my-3 md:my-4" />
                        <h3 className="font-medium text-base">Shipping Address</h3>
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator className="my-3 md:my-4" />
                        <div className="flex items-center mb-2">
                          <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
                          <h3 className="font-medium text-base">Payment Details</h3>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="1234 5678 9012 3456" 
                                  type="text"
                                  maxLength={19}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="MM/YY" 
                                    maxLength={5}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardCVC"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVC</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="123" 
                                    maxLength={4}
                                    type="password"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2 md:pt-4">
                        <Button 
                          type="submit" 
                          className="w-full bg-mechanica-500 hover:bg-mechanica-600"
                          disabled={isProcessing || cartLoading}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Complete Order (${calculateTotal().toFixed(2)})
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>

          {!isMobile && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <ShoppingCart className="mr-2 h-5 w-5" /> Order Summary
                  </CardTitle>
                  <CardDescription>
                    {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderSummaryContent />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;
