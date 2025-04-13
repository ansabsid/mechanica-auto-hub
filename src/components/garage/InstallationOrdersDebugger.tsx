
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bug, Save, RefreshCw } from "lucide-react";

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
      
      // Fetch the first order details if we have items
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
      // Fetch specific order - use maybeSingle instead of single to avoid errors when no results are found
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
        
      if (orderError) {
        console.error("Error fetching order:", orderError);
        setDebugInfo(prev => ({ ...prev, orderError }));
        throw orderError;
      }
      
      setDebugInfo(prev => ({ ...prev, orderData }));
      
      // Set customer details if available
      if (orderData) {
        setCustomerName(orderData.user_name || "");
        setCustomerEmail(orderData.user_email || "");
        setCustomerPhone(orderData.user_phone || "");
      } else {
        // Clear fields if no order data is found
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        
        // Add information to debug info that no order was found
        setDebugInfo(prev => ({ 
          ...prev, 
          orderDataStatus: `No order found with ID: ${orderId}. This might mean the order was deleted or doesn't exist.` 
        }));
        
        toast({
          title: "Warning",
          description: `No order found with ID: ${orderId}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive"
      });
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
      // First check if the order exists
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
        toast({
          title: "Error",
          description: "Order not found. It may have been deleted.",
          variant: "destructive"
        });
        setDebugInfo(prev => ({ ...prev, updateCheckResult: "Order not found" }));
        setIsLoading(false);
        return;
      }
      
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
