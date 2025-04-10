
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  zipCode: z.string().min(3, { message: "Zip/Postal code is required" }),
  cardNumber: z.string().min(16, { message: "Card number is required" }),
  cardExpiry: z.string().min(5, { message: "Expiry date is required" }),
  cardCvc: z.string().min(3, { message: "CVC is required" }),
});

type CheckoutFormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const { cartItems, calculateTotal, clearCart, isLoading: cartLoading } = useCart();
  const { createOrder, isProcessing } = useOrders();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && !orderComplete) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      navigate("/customer-dashboard");
    }
  }, [cartItems, cartLoading, navigate, orderComplete]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }
    
    // Process payment here (mock)
    // In a real app, this would call a payment processor API
    
    // Create order in the database
    const totalAmount = calculateTotal();
    const order = await createOrder(cartItems, totalAmount);
    
    if (order) {
      setOrderId(order.id);
      setOrderComplete(true);
      clearCart();
    }
  };

  const continueShopping = () => {
    navigate("/customer-dashboard");
  };

  const viewOrder = () => {
    // Navigate to the order details page
    navigate(`/orders/${orderId}`);
  };

  return (
    <MainLayout>
      <div className="py-8 bg-mechanica-50">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase</p>
        </div>
      </div>

      <div className="container-custom py-10">
        {orderComplete ? (
          <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Order Complete!</CardTitle>
              <CardDescription>
                Thank you for your purchase. Your order has been placed successfully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-xl font-semibold">Order ID: {orderId}</p>
                  <p className="text-muted-foreground mt-1">
                    You will receive an email confirmation shortly.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                onClick={viewOrder} 
                className="w-full bg-mechanica-500 hover:bg-mechanica-600"
              >
                View Order Details
              </Button>
              <Button 
                onClick={continueShopping} 
                variant="outline" 
                className="w-full"
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping & Payment</CardTitle>
                  <CardDescription>
                    Enter your details to complete the purchase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
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
                                  <Input type="email" placeholder="email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St, Apt 4B" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Dubai" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Zip/Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="12345" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Card Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="4111 1111 1111 1111" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/YY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cardCvc"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVC</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button 
                          type="submit" 
                          className="bg-mechanica-500 hover:bg-mechanica-600 px-8"
                          disabled={isProcessing || cartItems.length === 0}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Complete Order"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {cartLoading ? (
                    <div className="py-6 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-muted-foreground">Loading cart...</p>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="py-6 text-center">
                      <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between py-2">
                          <div>
                            <p className="font-medium">{item.part.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
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
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={continueShopping}
                  >
                    Continue Shopping
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Checkout;
