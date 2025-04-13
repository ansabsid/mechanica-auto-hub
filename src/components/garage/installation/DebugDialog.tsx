import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  AlertTriangle, 
  FileWarning, 
  Search, 
  CheckCircle, 
  Check,
  Trash2,
  AlertOctagon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { OrphanedOrderItem } from "@/types/order.types";

interface DebugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debug: any;
  user: any;
}

export const DebugDialog: React.FC<DebugDialogProps> = ({
  open,
  onOpenChange,
  debug,
  user
}) => {
  const [orderIdToCheck, setOrderIdToCheck] = useState("");
  const [orderCheckResult, setOrderCheckResult] = useState<any>(null);
  const [isCheckingOrder, setIsCheckingOrder] = useState(false);
  const [orphanedItems, setOrphanedItems] = useState<OrphanedOrderItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const checkOrderExists = async (orderId: string) => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "Please enter an order ID to check",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOrder(true);
    try {
      console.log(`Manually checking order ID: ${orderId}`);
      
      // Check orders table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      
      // Check order_items table
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      setOrderCheckResult({
        orderExists: !!orderData,
        orderData,
        orderError: orderError?.message,
        orderItemsExist: orderItemsData && orderItemsData.length > 0,
        orderItemsData,
        orderItemsError: orderItemsError?.message,
        timestamp: new Date().toISOString()
      });

      if (orderData) {
        toast({
          title: "Order Found",
          description: `Order ID ${orderId} exists in the database`,
        });
      } else {
        toast({
          title: "Order Not Found",
          description: `Order ID ${orderId} was not found in the orders table`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error checking order:", error);
      setOrderCheckResult({
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Error",
        description: `Failed to check order: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsCheckingOrder(false);
    }
  };

  const scanForOrphanedItems = async () => {
    setIsScanning(true);
    try {
      // Get all order items with installation status
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .not('installation_status', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (itemsError) {
        throw itemsError;
      }

      console.log(`Found ${orderItems?.length || 0} order items with installation status`);
      
      if (!orderItems || orderItems.length === 0) {
        toast({
          title: "No Order Items",
          description: "No order items with installation status found",
        });
        setIsScanning(false);
        return;
      }

      // Check if each order exists
      const orderIds = [...new Set(orderItems.map(item => item.order_id))];
      const orderChecks = await Promise.all(
        orderIds.map(async (orderId) => {
          const { data, error } = await supabase
            .from('orders')
            .select('id')
            .eq('id', orderId)
            .maybeSingle();
          
          return { orderId, exists: !!data };
        })
      );

      // Create map of order existence
      const orderExistsMap = orderChecks.reduce((acc, check) => {
        acc[check.orderId] = check.exists;
        return acc;
      }, {} as Record<string, boolean>);

      // Filter items with non-existent orders
      const orphaned = orderItems.map(item => ({
        id: item.id,
        order_id: item.order_id,
        part_id: item.part_id,
        garage_id: item.garage_id,
        installation_status: item.installation_status,
        created_at: item.created_at,
        verified: orderExistsMap[item.order_id]
      }));

      setOrphanedItems(orphaned);
      
      const orphanCount = orphaned.filter(item => !item.verified).length;
      if (orphanCount > 0) {
        toast({
          title: "Orphaned Items Found",
          description: `Found ${orphanCount} order items referencing non-existent orders`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "No Orphaned Items",
          description: "All order items reference valid orders",
        });
      }
    } catch (error: any) {
      console.error("Error scanning for orphaned items:", error);
      toast({
        title: "Error",
        description: `Failed to scan for orphaned items: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const deleteOrphanedItem = async (itemId: string) => {
    if (!itemId) return;
    
    setIsDeleting(true);
    setItemToDelete(itemId);
    
    try {
      // Delete the orphaned order item
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Update the local state
      setOrphanedItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Item Deleted",
        description: "Orphaned order item has been removed",
      });
    } catch (error: any) {
      console.error("Error deleting orphaned item:", error);
      toast({
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Debug Information</DialogTitle>
          <DialogDescription>
            Technical details for troubleshooting installation requests
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="installation-requests">Installation Requests</TabsTrigger>
            <TabsTrigger value="order-failures">
              Order Failures
              {debug.orderLookupFailures?.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {debug.orderLookupFailures.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="manual-check">Manual Order Check</TabsTrigger>
            <TabsTrigger value="orphaned-items">
              Orphaned Items
              {orphanedItems.filter(item => !item.verified).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {orphanedItems.filter(item => !item.verified).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Request Summary</h4>
                  <div className="text-sm">
                    <p>Garage ID: <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">{debug.garageId}</code></p>
                    <p>Requests Found: {debug.requestsCount || 0}</p>
                    <p>Last Fetch: {debug.lastFetchTime ? new Date(debug.lastFetchTime).toLocaleString() : 'Never'}</p>
                    <p>Order Items: {debug.itemsCount || 0}</p>
                    <p>Order IDs: {debug.orderIds?.length || 0}</p>
                    <p>Orders Found: {debug.ordersCount || 0}</p>
                    <p className="text-red-500 font-medium mt-2">Failed Order Lookups: {debug.orderLookupFailures?.length || 0}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <div className="text-sm">
                    <p>User ID: {user?.id || 'Not authenticated'}</p>
                    <p>Email: {user?.email || 'Not available'}</p>
                    <p>Session: {debug.authSession?.session ? 'Active' : 'None'}</p>
                  </div>
                </div>
              </div>
              
              {(debug.orderLookupFailures?.length > 0) && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    <span className="font-bold">Warning:</span> {debug.orderLookupFailures.length} orders failed to load.
                    <span className="block mt-1 italic">Check the "Order Failures" tab for details or use the "Manual Order Check" tab for direct verification.</span>
                  </AlertDescription>
                </Alert>
              )}
              
              {(!debug.ordersData || debug.ordersData.length === 0) && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    No orders were found. This may indicate a data access issue or empty results.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-2" 
                onClick={scanForOrphanedItems}
                disabled={isScanning}
              >
                {isScanning ? (
                  <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent mr-2" />
                ) : (
                  <AlertOctagon className="h-4 w-4 mr-2" />
                )}
                Scan for Orphaned Order Items
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="installation-requests">
            <div className="space-y-4">
              <h4 className="font-medium">Mapped Installation Requests</h4>
              {debug.mappedRequests && debug.mappedRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 border text-xs">Order Item ID</th>
                        <th className="px-2 py-1 border text-xs">Order ID</th>
                        <th className="px-2 py-1 border text-xs">Customer</th>
                        <th className="px-2 py-1 border text-xs">Phone</th>
                        <th className="px-2 py-1 border text-xs">Status</th>
                        <th className="px-2 py-1 border text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debug.mappedRequests.map((request: any) => (
                        <tr key={request.id} className={request.customerName === 'Unknown Customer' ? 'bg-red-50' : ''}>
                          <td className="px-2 py-1 border text-xs">{request.orderItemId.slice(0, 8)}...</td>
                          <td className="px-2 py-1 border text-xs">{request.orderId.slice(0, 8)}...
                            {debug.orderLookupFailures?.some(f => f.orderId === request.orderId) && (
                              <span className="ml-1 text-red-500" title="Order lookup failed">⚠️</span>
                            )}
                          </td>
                          <td className="px-2 py-1 border text-xs">{request.customerName}</td>
                          <td className="px-2 py-1 border text-xs">{request.customerPhone}</td>
                          <td className="px-2 py-1 border text-xs">{request.status}</td>
                          <td className="px-2 py-1 border text-xs">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => {
                                setOrderIdToCheck(request.orderId);
                                checkOrderExists(request.orderId);
                                const tabTrigger = document.querySelector('[data-value="manual-check"]');
                                if (tabTrigger instanceof HTMLElement) {
                                  tabTrigger.click();
                                }
                              }}
                            >
                              Verify
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm">No installation requests mapped.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="order-failures">
            <div className="space-y-4">
              <h4 className="font-medium">Order Lookup Failures</h4>
              {debug.orderLookupFailures && debug.orderLookupFailures.length > 0 ? (
                <div className="space-y-4">
                  <Alert variant="destructive" className="mb-3">
                    <FileWarning className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      <strong>{debug.orderLookupFailures.length} order lookup failures detected</strong>
                      <span className="block text-xs mt-1">
                        These orders cannot be found or accessed, which may result in missing customer information.
                      </span>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-1 border text-xs">Order ID</th>
                          <th className="px-2 py-1 border text-xs">Error</th>
                          <th className="px-2 py-1 border text-xs">Time</th>
                          <th className="px-2 py-1 border text-xs">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debug.orderLookupFailures.map((failure: any, index: number) => (
                          <tr key={index} className="bg-red-50">
                            <td className="px-2 py-1 border text-xs">{failure.orderId.slice(0, 8)}...</td>
                            <td className="px-2 py-1 border text-xs">
                              {failure.error || failure.message || 'Order not found'}
                            </td>
                            <td className="px-2 py-1 border text-xs">
                              {failure.timestamp ? new Date(failure.timestamp).toLocaleString() : 'Unknown'}
                            </td>
                            <td className="px-2 py-1 border text-xs">
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 text-xs"
                                  onClick={() => {
                                    setOrderIdToCheck(failure.orderId);
                                    checkOrderExists(failure.orderId);
                                    const tabTrigger = document.querySelector('[data-value="manual-check"]');
                                    if (tabTrigger instanceof HTMLElement) {
                                      tabTrigger.click();
                                    }
                                  }}
                                >
                                  Verify
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-center py-4">No order lookup failures recorded</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manual-check">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="Enter order ID to check" 
                  value={orderIdToCheck}
                  onChange={(e) => setOrderIdToCheck(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => checkOrderExists(orderIdToCheck)}
                  disabled={isCheckingOrder || !orderIdToCheck}
                >
                  {isCheckingOrder ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Check
                </Button>
              </div>
              
              {orderCheckResult && (
                <div className="border rounded-md p-4 space-y-4 bg-gray-50">
                  <div>
                    <div className="text-sm font-medium mb-1">Order ID</div>
                    <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">{orderIdToCheck}</code>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Order Record</div>
                    
                    {orderCheckResult.error ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>
                          Error checking order: {orderCheckResult.error}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        {orderCheckResult.orderExists ? (
                          <div className="mt-2">
                            <Alert variant="default" className="bg-green-50 border-green-200">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <AlertDescription className="text-green-800">
                                Order found in database
                              </AlertDescription>
                            </Alert>
                            <div className="mt-2 p-3 bg-white rounded border">
                              <pre className="text-xs overflow-auto max-h-[150px]">
                                {JSON.stringify(orderCheckResult.orderData, null, 2)}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <AlertDescription>
                              Order not found in the database
                              {orderCheckResult.orderError && (
                                <span className="block text-xs mt-1">{String(orderCheckResult.orderError)}</span>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Order Items</div>
                    
                    {orderCheckResult.orderItemsError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>
                          Error checking order items: {String(orderCheckResult.orderItemsError)}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        {orderCheckResult.orderItemsExist ? (
                          <div className="mt-2">
                            <Alert variant="default" className="bg-green-50 border-green-200">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <AlertDescription className="text-green-800">
                                Found {orderCheckResult.orderItemsData.length} order items with this order ID
                              </AlertDescription>
                            </Alert>
                            <div className="mt-2 p-3 bg-white rounded border">
                              <div className="overflow-x-auto max-h-[150px]">
                                <table className="min-w-full border border-gray-200 text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-2 py-1 border">Item ID</th>
                                      <th className="px-2 py-1 border">Part ID</th>
                                      <th className="px-2 py-1 border">Garage ID</th>
                                      <th className="px-2 py-1 border">Installation Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {orderCheckResult.orderItemsData.map((item: any) => (
                                      <tr key={item.id}>
                                        <td className="px-2 py-1 border font-mono">{item.id.slice(0, 8)}...</td>
                                        <td className="px-2 py-1 border">{item.part_id}</td>
                                        <td className="px-2 py-1 border font-mono">{item.garage_id ? `${item.garage_id.slice(0, 8)}...` : 'None'}</td>
                                        <td className="px-2 py-1 border">{item.installation_status || 'None'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <AlertDescription>
                              No order items found with this order ID
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="font-medium text-sm mb-2">Diagnostic Results</div>
                    <div className="space-y-2">
                      {!orderCheckResult.error && (
                        <>
                          {orderCheckResult.orderExists ? (
                            orderCheckResult.orderItemsExist ? (
                              <Alert variant="default" className="bg-green-50 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <AlertDescription className="text-green-800">
                                  Both order and order items exist in the database. If you're seeing "Unknown Customer",
                                  check if customer information is properly set in the order record above.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                                <AlertDescription className="text-yellow-800">
                                  Order exists but has no associated items. This is unusual.
                                </AlertDescription>
                              </Alert>
                            )
                          ) : (
                            orderCheckResult.orderItemsExist ? (
                              <Alert variant="destructive">
                                <AlertOctagon className="h-4 w-4 mr-2" />
                                <AlertDescription>
                                  <strong>Warning: Orphaned Order Items Detected</strong> - Order items exist but reference a non-existent order. 
                                  This is the cause of "Unknown Customer" errors.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Alert variant="default" className="bg-gray-100 border-gray-300">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                <AlertDescription className="text-gray-800">
                                  No order or order items found with this ID.
                                </AlertDescription>
                              </Alert>
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="orphaned-items">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Orphaned Order Items</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={scanForOrphanedItems}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Scan for Orphaned Items
                </Button>
              </div>
              
              {isScanning ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-8 w-8 border-2 border-mechanica-500 rounded-full border-t-transparent" />
                </div>
              ) : orphanedItems.length > 0 ? (
                <div className="space-y-4">
                  <Alert variant={orphanedItems.some(item => !item.verified) ? "destructive" : "default"} className="mb-3">
                    <AlertDescription>
                      <strong>
                        {orphanedItems.filter(item => !item.verified).length} of {orphanedItems.length} items 
                        reference non-existent orders
                      </strong>
                      <span className="block text-xs mt-1">
                        Orphaned items cause "Unknown Customer" errors and should be removed or fixed.
                      </span>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-1 border text-xs">Item ID</th>
                          <th className="px-2 py-1 border text-xs">Order ID</th>
                          <th className="px-2 py-1 border text-xs">Part ID</th>
                          <th className="px-2 py-1 border text-xs">Status</th>
                          <th className="px-2 py-1 border text-xs">Order Exists</th>
                          <th className="px-2 py-1 border text-xs">Created At</th>
                          <th className="px-2 py-1 border text-xs">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orphanedItems.map((item) => (
                          <tr key={item.id} className={!item.verified ? 'bg-red-50' : ''}>
                            <td className="px-2 py-1 border text-xs font-mono">{item.id.slice(0, 8)}...</td>
                            <td className="px-2 py-1 border text-xs font-mono">{item.order_id.slice(0, 8)}...</td>
                            <td className="px-2 py-1 border text-xs">{item.part_id}</td>
                            <td className="px-2 py-1 border text-xs">{item.installation_status || 'None'}</td>
                            <td className="px-2 py-1 border text-xs text-center">
                              {item.verified ? (
                                <CheckCircle className="h-4 w-4 text-green-500 inline-block" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500 inline-block" />
                              )}
                            </td>
                            <td className="px-2 py-1 border text-xs">
                              {new Date(item.created_at).toLocaleString()}
                            </td>
                            <td className="px-2 py-1 border text-xs">
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 text-xs"
                                  onClick={() => {
                                    setOrderIdToCheck(item.order_id);
                                    checkOrderExists(item.order_id);
                                    const tabTrigger = document.querySelector('[data-value="manual-check"]');
                                    if (tabTrigger instanceof HTMLElement) {
                                      tabTrigger.click();
                                    }
                                  }}
                                >
                                  Verify
                                </Button>
                                {!item.verified && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="h-6 text-xs"
                                    onClick={() => deleteOrphanedItem(item.id)}
                                    disabled={isDeleting && itemToDelete === item.id}
                                  >
                                    {isDeleting && itemToDelete === item.id ? (
                                      <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-center py-4">No orphaned items found. Click "Scan" to check for items.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="auth">
            <div className="space-y-4">
              <h4 className="font-medium">Authentication Details</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm">
                  <p><span className="font-medium">User ID:</span> {user?.id || 'Not authenticated'}</p>
                  <p><span className="font-medium">Email:</span> {user?.email || 'Not available'}</p>
                  <p><span className="font-medium">Session Status:</span> {debug.authSession?.session ? 'Active' : 'None'}</p>
                </div>
              </div>
              
              <h4 className="font-medium mt-4">Garage Access</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm">
                  <p><span className="font-medium">Garage ID:</span> {debug.garageId || 'Not set'}</p>
                  <p><span className="font-medium">Has Garage Access:</span> {debug.hasGarageAccess ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">RLS Status:</span> {debug.rlsStatus || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="raw">
            <div className="space-y-4">
              <h4 className="font-medium">Raw Debug Data</h4>
              <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
