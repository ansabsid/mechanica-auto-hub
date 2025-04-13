
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bug, Save, RefreshCw, AlertTriangle } from "lucide-react";
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
  const [showWarningAlert, setShowWarningAlert] = useState(false);
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
          installation_status,
          scheduled_date,
          scheduled_time
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
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setShowWarningAlert(false);
    
    try {
      console.log(`Fetching order details for ID: ${orderId}`);
      
      // Try to get order data from orders table
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
      
      let hasCustomerData = false;
      
      // If we found an order with customer data, use it
      if (orderData && (orderData.user_name || orderData.user_email || orderData.user_phone)) {
        setCustomerName(orderData.user_name || '');
        setCustomerEmail(orderData.user_email || '');
        setCustomerPhone(orderData.user_phone || '');
        hasCustomerData = !!(orderData.user_name && orderData.user_email && orderData.user_phone);
        console.log("Found customer data in orders table:", {
          name: orderData.user_name,
          email: orderData.user_email,
          phone: orderData.user_phone
        });
        setDebugInfo(prev => ({ ...prev, customerSourceInfo: 'Found in orders table' }));
      } 
      // If no order exists or it has no customer data, we need to create one
      else {
        console.log("No valid customer data in orders table. Order data:", orderData);
        setShowWarningAlert(true);
        setDebugInfo(prev => ({ ...prev, customerSourceInfo: 'Not found in orders table' }));
      }
      
      // Get the actual order item details for reference
      const { data: orderItem, error: orderItemError } = await supabase
        .from('order_items')
        .select(`
          id,
          part_id,
          installation_status,
          scheduled_date,
          scheduled_time,
          price,
          installation_fee
        `)
        .eq('order_id', orderId)
        .eq('garage_id', 'c64a9350-d34a-4903-b34c-16c0e4699a44')
        .maybeSingle();
        
      if (orderItemError) {
        console.error("Error fetching order item details:", orderItemError);
      } else {
        console.log("Order item details:", orderItem);
        setDebugInfo(prev => ({ ...prev, orderItemDetails: orderItem }));
        setSelectedItem(orderItem);
      }
      
      setDebugInfo(prev => ({
        ...prev,
        finalCustomerInfo: {
          name: customerName || '',
          email: customerEmail || '',
          phone: customerPhone || '',
          hasCompleteData: hasCustomerData
        }
      }));
      
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
    
    if (!customerName || !customerEmail || !customerPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all customer fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Check if the order already exists
      const { data: checkOrder, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking order:", checkError);
        throw checkError;
      }
      
      // Get the current user's session for the user_id
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || "00000000-0000-0000-0000-000000000000";
      
      console.log("Current user ID for order operations:", userId);
      
      if (!checkOrder) {
        // Create new order with customer info if it doesn't exist
        console.log("Creating new order with customer info:", {
          id: orderId,
          user_id: userId,
          user_name: customerName,
          user_email: customerEmail,
          user_phone: customerPhone
        });
        
        // Get total amount from the order item
        let totalAmount = 0;
        if (selectedItem) {
          const price = Number(selectedItem.price) || 0;
          const installationFee = Number(selectedItem.installation_fee) || 0;
          totalAmount = price + installationFee;
          console.log("Calculated total amount:", totalAmount, "from price:", price, "and fee:", installationFee);
        }
        
        const { data: newOrder, error: createError } = await supabase
          .from('orders')
          .insert({
            id: orderId,
            user_id: userId,
            user_name: customerName,
            user_email: customerEmail,
            user_phone: customerPhone,
            status: 'pending',
            total_amount: totalAmount || 0
          })
          .select()
          .maybeSingle();
          
        if (createError) {
          console.error("Error creating order:", createError);
          throw createError;
        }
        
        console.log("Order created successfully:", newOrder);
        setDebugInfo(prev => ({ ...prev, createOrderResult: newOrder }));
        
        toast({
          title: "Success",
          description: "Order created with customer information"
        });
        
        // The order was created, so we're done
        await fetchOrderDetails(orderId);
        return;
      }
      
      // Update the existing order with the new customer information
      console.log("Updating existing order with customer info:", {
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
        .eq('id', orderId)
        .select();
        
      if (error) throw error;
      
      console.log("Order updated successfully:", data);
      setDebugInfo(prev => ({ ...prev, updateResult: data }));
      
      toast({
        title: "Success",
        description: "Order customer information updated successfully"
      });
      
      // Refresh order details to see the updated info
      await fetchOrderDetails(orderId);
      
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
                      {item.scheduled_date && (
                        <div>
                          Scheduled: {new Date(item.scheduled_date).toLocaleDateString()} {item.scheduled_time}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="border p-4 rounded-md">
                <h3 className="text-sm font-semibold mb-4">Order Customer Information</h3>
                
                {showWarningAlert && (
                  <Alert variant="warning" className="bg-yellow-50 border-yellow-300 mb-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-700" />
                    <AlertDescription className="text-sm text-yellow-700">
                      No customer information found for this order. Please enter the details below and save.
                    </AlertDescription>
                  </Alert>
                )}
                
                {orderId ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="orderId">Order ID</Label>
                      <Input id="orderId" value={orderId} readOnly className="bg-gray-50 font-mono text-xs" />
                    </div>
                    
                    <div>
                      <Label htmlFor="customerName">Customer Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="customerName" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name" 
                        className={!customerName ? "border-red-300 bg-red-50" : ""}
                      />
                      {!customerName && (
                        <p className="text-xs text-red-500 mt-1">Customer name is required</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="customerEmail">Customer Email <span className="text-red-500">*</span></Label>
                      <Input 
                        id="customerEmail" 
                        value={customerEmail} 
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Enter customer email" 
                        className={!customerEmail ? "border-red-300 bg-red-50" : ""}
                        type="email"
                      />
                      {!customerEmail && (
                        <p className="text-xs text-red-500 mt-1">Customer email is required</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="customerPhone">Customer Phone <span className="text-red-500">*</span></Label>
                      <Input 
                        id="customerPhone" 
                        value={customerPhone} 
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Enter customer phone" 
                        className={!customerPhone ? "border-red-300 bg-red-50" : ""}
                      />
                      {!customerPhone && (
                        <p className="text-xs text-red-500 mt-1">Customer phone is required</p>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full bg-mechanica-500 hover:bg-mechanica-600" 
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
                        <div className="font-medium mt-1">Status:</div>
                        <div>{!customerName && !customerEmail && !customerPhone ? 'Missing Data' : 'Data Available'}</div>
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
