import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bug, Save, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const InstallationOrdersDebugger = () => {
  const [open, setOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { toast } = useToast();

  const fetchOrderItems = async () => {
    setIsLoading(true);
    try {
      const garageId = "c64a9350-d34a-4903-b34c-16c0e4699a44";
      
      const { data: items, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          part_id,
          garage_id,
          installation_status
        `)
        .eq('garage_id', garageId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      setOrderItems(items || []);
      setDebugInfo(prev => ({ ...prev, fetchedItems: items }));
      
      if (items && items.length > 0) {
        fetchOrderDetails(items[0].order_id);
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch installation orders",
        variant: "destructive"
      });
      setDebugInfo(prev => ({ ...prev, fetchError: error }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchOrderDetails = async (orderId: string) => {
    if (!orderId) return;
    
    setIsLoading(true);
    setOrderId(orderId);
    
    try {
      console.log(`Fetching order details for ID: ${orderId}`);
      
      const { data: orderItem, error: orderItemError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          scheduled_date,
          scheduled_time,
          installation_status,
          orders (
            id,
            user_name,
            user_email,
            user_phone,
            user_id
          )
        `)
        .eq('order_id', orderId)
        .maybeSingle();
        
      if (orderItemError) {
        console.error("Error fetching order item with order data:", orderItemError);
        setDebugInfo(prev => ({ ...prev, orderItemError }));
      }
      
      console.log("Order item with order data:", orderItem);
      setDebugInfo(prev => ({ ...prev, orderItemWithOrderData: orderItem }));
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
        
      if (orderError) {
        console.error("Error fetching order:", orderError);
        setDebugInfo(prev => ({ ...prev, orderError }));
      } else {
        console.log("Direct order data:", orderData);
        setDebugInfo(prev => ({ ...prev, directOrderData: orderData }));
      }
      
      let customerInfo = {
        name: '',
        email: '',
        phone: ''
      };
      
      if (orderData) {
        customerInfo.name = orderData.user_name || '';
        customerInfo.email = orderData.user_email || '';
        customerInfo.phone = orderData.user_phone || '';
        
        console.log("Got customer info from orders table:", customerInfo);
        setDebugInfo(prev => ({ ...prev, customerSourceInfo: 'From orders table' }));
      } 
      else if (orderItem?.orders) {
        customerInfo.name = orderItem.orders.user_name || '';
        customerInfo.email = orderItem.orders.user_email || '';
        customerInfo.phone = orderItem.orders.user_phone || '';
        
        console.log("Got customer info from order_items join:", customerInfo);
        setDebugInfo(prev => ({ ...prev, customerSourceInfo: 'From order_items join' }));
      }
      
      const userId = orderData?.user_id || orderItem?.orders?.user_id;
      if (userId && (!customerInfo.name || !customerInfo.email || !customerInfo.phone)) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('firstName, lastName, email, phone')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setDebugInfo(prev => ({ ...prev, profileError }));
        } else if (profile) {
          console.log("Got profile:", profile);
          
          if (!customerInfo.name && (profile.firstName || profile.lastName)) {
            customerInfo.name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
          }
          if (!customerInfo.email && profile.email) {
            customerInfo.email = profile.email;
          }
          if (!customerInfo.phone && profile.phone) {
            customerInfo.phone = profile.phone;
          }
          
          console.log("Enhanced customer info with profile data:", customerInfo);
          setDebugInfo(prev => ({ ...prev, customerSourceInfo: 'Enhanced with profile data' }));
        }
      }
      
      setCustomerName(customerInfo.name || '');
      setCustomerEmail(customerInfo.email || '');
      setCustomerPhone(customerInfo.phone || '');
      
      console.log("Final customer info set to state:", {
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || ''
      });
      
      setDebugInfo(prev => ({
        ...prev,
        finalCustomerInfo: {
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          phone: customerInfo.phone || ''
        }
      }));
      
      if (!customerInfo.name && !customerInfo.email && !customerInfo.phone) {
        console.log("No customer information could be found for this order");
        setDebugInfo(prev => ({ ...prev, customerInfoStatus: 'Not found' }));
        
        toast({
          title: "Warning",
          description: "No customer information found for this order",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("Error in fetchOrderDetails:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive"
      });
      setDebugInfo(prev => ({ ...prev, fetchOrderDetailsError: error }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    fetchOrderDetails(item.order_id);
  };
  
  const updateOrderCustomerInfo = async () => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "No order selected",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: checkOrder, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking order:", checkError);
        throw checkError;
      }
      
      if (!checkOrder) {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id || "00000000-0000-0000-0000-000000000000";
        
        console.log("Using user ID for new order:", userId);
        setDebugInfo(prev => ({ ...prev, userIdForNewOrder: userId }));
        
        const { data: newOrder, error: createError } = await supabase
          .from('orders')
          .insert({
            id: orderId,
            user_id: userId,
            user_name: customerName,
            user_email: customerEmail,
            user_phone: customerPhone,
            status: 'pending',
            total_amount: 0
          })
          .select('id')
          .maybeSingle();
          
        if (createError) {
          console.error("Error creating order:", createError);
          throw createError;
        }
        
        toast({
          title: "Success",
          description: "Order created with customer information"
        });
        
        setDebugInfo(prev => ({ ...prev, createOrderResult: newOrder }));
        return;
      }
      
      console.log("Updating order with customer info:", {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      });
      
      const { data, error } = await supabase
        .from('orders')
        .update({
          user_name: customerName,
          user_email: customerEmail,
          user_phone: customerPhone
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Order customer information updated successfully"
      });
      
      setDebugInfo(prev => ({ ...prev, updateResult: data }));
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order customer information",
        variant: "destructive"
      });
      setDebugInfo(prev => ({ ...prev, updateError: error }));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      fetchOrderItems();
    }
  }, [open]);
  
  return (
    <>
      <Button 
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => setOpen(true)}
      >
        <Bug className="w-4 h-4" />
        Debug Orders
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Installation Orders Debugger</DialogTitle>
            <DialogDescription>
              View and edit order customer information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 border p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Recent Orders</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={fetchOrderItems}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-mechanica-500 rounded-full border-t-transparent" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {orderItems.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No orders found</p>
                ) : (
                  orderItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`text-xs border p-2 rounded cursor-pointer ${selectedItem?.id === item.id ? 'bg-mechanica-50 border-mechanica-300' : ''}`}
                      onClick={() => handleSelectItem(item)}
                    >
                      <div>ID: <span className="font-mono">{item.id.substring(0, 8)}...</span></div>
                      <div>Order: <span className="font-mono">{item.order_id.substring(0, 8)}...</span></div>
                      <div>Part ID: {item.part_id}</div>
                      <div>Status: {item.installation_status || 'None'}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="border p-4 rounded-md">
                <h3 className="text-sm font-semibold mb-4">Order Customer Information</h3>
                
                {orderId ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="orderId">Order ID</Label>
                      <Input id="orderId" value={orderId} readOnly className="bg-gray-50" />
                    </div>
                    
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input 
                        id="customerName" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customerEmail">Customer Email</Label>
                      <Input 
                        id="customerEmail" 
                        value={customerEmail} 
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Enter customer email" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customerPhone">Customer Phone</Label>
                      <Input 
                        id="customerPhone" 
                        value={customerPhone} 
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Enter customer phone" 
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={updateOrderCustomerInfo}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Update Customer Information
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Select an order to edit customer information</p>
                )}
              </div>
              
              <div className="mt-4 border p-4 rounded-md">
                <details>
                  <summary className="text-sm font-semibold cursor-pointer">Debug Information</summary>
                  <div className="mt-2">
                    <Alert variant="default" className="bg-yellow-50 border-yellow-200 mb-2">
                      <AlertDescription className="text-xs">
                        This section shows the current state of customer information and data source.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-xs bg-gray-50 p-2 rounded">
                        <div className="font-medium mb-1">Current Values:</div>
                        <div>Name: {customerName || '(empty)'}</div>
                        <div>Email: {customerEmail || '(empty)'}</div>
                        <div>Phone: {customerPhone || '(empty)'}</div>
                      </div>
                      
                      <div className="text-xs bg-gray-50 p-2 rounded">
                        <div className="font-medium mb-1">Data Source:</div>
                        <div>{debugInfo.customerSourceInfo || 'Not set'}</div>
                      </div>
                    </div>
                    
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[200px]">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallationOrdersDebugger;
