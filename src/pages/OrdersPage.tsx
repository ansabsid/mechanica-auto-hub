
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useOrders } from "@/hooks/useOrders";
import { Package, Clock, Check, X, ChevronLeft, Loader2, AlertTriangle, Bug } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { fetchOrderDetails, currentOrder, isLoading, cancelOrder } = useOrders();
  const { user } = useAuth();
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugDetails, setDebugDetails] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderId) {
        console.error("No order ID provided in URL parameters");
        setDebugInfo("Missing order ID in URL");
        return;
      }
      
      const { data } = await supabase.auth.getSession();
      const isAuthenticated = !!data.session;
      
      console.log("Authentication status:", isAuthenticated ? "Logged in" : "Not logged in");
      console.log("Current user ID:", data.session?.user?.id);
      console.log("Loading order details for:", orderId);
      
      setDebugDetails({
        orderIdRequested: orderId,
        authenticated: isAuthenticated,
        currentUserId: data.session?.user?.id || 'not-authenticated'
      });
      
      if (!isAuthenticated) {
        console.log("No authenticated user found, redirecting to login");
        setDebugInfo("Authentication required. Redirecting to login.");
        navigate('/login', { state: { from: `/orders/${orderId}` } });
        return;
      }
      
      try {
        const orderData = await fetchOrderDetails(orderId);
        setHasAttemptedFetch(true);
        
        if (!orderData) {
          console.error("Order data is null after fetch attempt");
          setDebugDetails(prev => ({
            ...prev,
            orderFound: false,
            fetchAttempted: true,
            timestamp: new Date().toISOString(),
          }));
          setDebugInfo("Order data not found or you don't have permission to view it.");
        } else {
          console.log("Order data loaded successfully:", orderData.id);
          console.log("Order items count:", orderData.items?.length || 0);
          setDebugDetails(prev => ({
            ...prev,
            orderFound: true,
            orderStatus: orderData.status,
            totalAmount: orderData.total_amount,
            itemsCount: orderData.items?.length || 0,
            items: orderData.items?.map(i => ({
              id: i.id,
              partId: i.part_id,
              partName: i.part?.name,
              garageId: i.garage_id,
              garageName: i.garage?.name
            })) || [],
            fetchAttempted: true,
            timestamp: new Date().toISOString(),
          }));
          
          if (orderData.items?.length === 0) {
            setDebugInfo("Order found but it has no items. This might be a database permission issue.");
          } else {
            setDebugInfo(null);
          }
        }
      } catch (error) {
        console.error("Error in loadOrderDetails:", error);
        setHasAttemptedFetch(true);
        setDebugInfo(`Error loading order: ${error}`);
        setDebugDetails(prev => ({
          ...prev,
          error: JSON.stringify(error),
          fetchAttempted: true,
          timestamp: new Date().toISOString(),
        }));
      }
    };
    
    loadOrderDetails();
  }, [orderId, user]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><Check className="mr-1 h-3 w-3" /> Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500"><Clock className="mr-1 h-3 w-3" /> Processing</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500"><X className="mr-1 h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    }
  };
  
  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
  };
  
  const handleCancel = async () => {
    if (orderId && currentOrder?.status === 'pending') {
      await cancelOrder(orderId);
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  return (
    <MainLayout>
      <div className="py-8 bg-mechanica-50">
        <div className="container-custom">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4" 
            onClick={goBack}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
          <p className="text-muted-foreground">
            {orderId ? `Order ID: ${orderId}` : 'View your order information'}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2" 
            onClick={toggleDebugPanel}
          >
            <Bug className="mr-1 h-4 w-4" /> {showDebugPanel ? 'Hide Debug' : 'Show Debug'}
          </Button>
        </div>
      </div>

      <div className="container-custom py-10">
        {debugInfo && (
          <Card className="mb-6 border-yellow-500">
            <CardContent className="pt-4 flex items-start">
              <AlertTriangle className="text-yellow-500 mr-2 mt-1" />
              <div>
                <p className="font-bold">Debug Information:</p>
                <p className="text-sm text-muted-foreground">{debugInfo}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {showDebugPanel && (
          <Card className="mb-6 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bug className="mr-2 text-blue-500" /> Debug Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-80">
                {JSON.stringify(debugDetails, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-mechanica-500" />
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
          </div>
        ) : !currentOrder && hasAttemptedFetch ? (
          <div className="text-center py-12">
            <p className="text-xl font-medium mb-2">Order not found</p>
            <p className="text-muted-foreground mb-6">
              The order you are looking for does not exist or you don't have permission to view it.
            </p>
            <Button onClick={goBack} className="bg-mechanica-500 hover:bg-mechanica-600">
              Go Back
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order Items</CardTitle>
                      <CardDescription>
                        {currentOrder && currentOrder.created_at ? 
                          `Ordered on ${format(new Date(currentOrder.created_at), 'MMMM d, yyyy')}` : 
                          'Order date not available'}
                      </CardDescription>
                    </div>
                    {currentOrder && getStatusBadge(currentOrder.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {currentOrder && currentOrder.items && currentOrder.items.length > 0 ? (
                    <div className="space-y-4">
                      {currentOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium">{item.part?.name || `Part #${item.part_id}`}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </p>
                              {item.garage && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Installation at: {item.garage.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            {item.installation_fee > 0 && (
                              <p className="text-xs text-muted-foreground">
                                + {formatPrice(item.installation_fee)} (installation)
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-muted-foreground">
                      No items found in this order
                    </p>
                  )}
                </CardContent>
                {currentOrder && currentOrder.status === 'pending' && (
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive hover:bg-destructive/10"
                      onClick={handleCancel}
                    >
                      Cancel Order
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>

            <div>
              {currentOrder && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <p className="font-medium">Order Status</p>
                        <div>{getStatusBadge(currentOrder.status)}</div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between">
                        <p className="font-medium">Subtotal</p>
                        <p className="font-medium">{formatPrice(currentOrder.total_amount)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-medium">Shipping</p>
                        <p className="font-medium">{formatPrice(0)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-medium">Tax</p>
                        <p className="font-medium">{formatPrice(0)}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between">
                        <p className="font-bold text-lg">Total</p>
                        <p className="font-bold text-lg">
                          {formatPrice(currentOrder.total_amount)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-mechanica-500 hover:bg-mechanica-600"
                      onClick={() => navigate('/customer-dashboard')}
                    >
                      Continue Shopping
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrderDetailPage;
