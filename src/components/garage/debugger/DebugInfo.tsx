import React, { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrphanedOrderItem } from "@/types/order.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DebugInfoProps {
  debugInfo: any;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({
  debugInfo,
  customerName,
  customerEmail,
  customerPhone
}) => {
  const [orphanedItems, setOrphanedItems] = useState<OrphanedOrderItem[]>([]);
  const [isCheckingOrphans, setIsCheckingOrphans] = useState(false);
  
  // Enhanced safeStringify to handle complex objects and errors
  const safeStringify = (value: any): string => {
    if (value === null || value === undefined) {
      return '(empty)';
    }
    
    // Handle error objects specifically
    if (value instanceof Error || (typeof value === 'object' && value.message)) {
      return `Error: ${value.message || 'Unknown error'}`;
    }
    
    if (typeof value === 'object') {
      try {
        // If it's a plain object, stringify its keys and values
        if (Object.keys(value).length > 0) {
          return Object.entries(value)
            .map(([k, v]) => `${k}: ${safeStringify(v)}`)
            .join(', ');
        }
        return '[Object]';
      } catch (err) {
        return '[Unstringifiable Object]';
      }
    }
    
    return String(value);
  };

  // Function to scan for orphaned order items
  const checkForOrphanedItems = async () => {
    setIsCheckingOrphans(true);
    try {
      // First, get all order items with installation_status
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, part_id, garage_id, installation_status, created_at')
        .not('installation_status', 'is', null)
        .limit(50);
        
      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        toast.error("Failed to fetch order items");
        setIsCheckingOrphans(false);
        return;
      }
      
      // For each order item, check if the order exists
      const orphaned: OrphanedOrderItem[] = [];
      
      for (const item of orderItems || []) {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('id')
          .eq('id', item.order_id)
          .maybeSingle();
          
        if (orderError) {
          console.error(`Error checking order ${item.order_id}:`, orderError);
        }
        
        if (!order) {
          orphaned.push({
            ...item,
            verified: false
          });
        }
      }
      
      setOrphanedItems(orphaned);
      
      if (orphaned.length > 0) {
        toast.warning(`Found ${orphaned.length} orphaned order items`);
      } else {
        toast.success("No orphaned order items found");
      }
    } catch (error) {
      console.error("Error checking for orphaned items:", error);
      toast.error("Failed to check for orphaned items");
    } finally {
      setIsCheckingOrphans(false);
    }
  };

  // Function to delete an orphaned item
  const deleteOrphanedItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId);
        
      if (error) {
        console.error("Error deleting orphaned item:", error);
        toast.error("Failed to delete orphaned item");
        return;
      }
      
      setOrphanedItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast.success("Orphaned item deleted successfully");
    } catch (error) {
      console.error("Error deleting orphaned item:", error);
      toast.error("Failed to delete orphaned item");
    }
  };

  // Function to verify an orphaned item
  const verifyOrphanedItem = async (itemId: string) => {
    setOrphanedItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, verified: true } : item
      )
    );
    toast.info("Item marked as verified");
  };

  return (
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
            <div className={customerName === 'Unknown Customer' ? 'text-red-500 font-bold' : 'text-green-600 font-medium'}>
              Name: {customerName || '(empty)'}
            </div>
            <div className={customerEmail === 'No Email' ? 'text-red-500' : 'text-green-600'}>
              Email: {customerEmail || '(empty)'}
            </div>
            <div className={customerPhone === 'No Phone' ? 'text-red-500' : 'text-green-600'}>
              Phone: {customerPhone || '(empty)'}
            </div>
            <div className="mt-1 text-xs italic">
              {customerName !== 'Unknown Customer' ? 
                '✓ Customer details available' : 
                '⚠️ Missing customer information'}
            </div>
          </div>
          
          <div className="text-xs bg-gray-50 p-2 rounded">
            <div className="font-medium mb-1">Data Source:</div>
            <div>{safeStringify(debugInfo.customerSourceInfo) || 'Not set'}</div>
            <div className="font-medium mt-1">Status:</div>
            <div>{!customerName || customerName === 'Unknown Customer' ? 'Missing Data' : 'Data Available'}</div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="font-medium text-xs mb-1">RLS Status:</div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            <div>Garage Access: {debugInfo.hasGarageAccess ? 'Granted' : 'Denied'}</div>
            <div>Policy Status: {safeStringify(debugInfo.rlsStatus) || 'Unknown'}</div>
            {debugInfo.rlsError && (
              <div className="text-red-600">Error: {safeStringify(debugInfo.rlsError)}</div>
            )}
          </div>
        </div>
        
        <div className="mb-2">
          <div className="font-medium text-xs mb-1">Order Data Diagnostics:</div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            {debugInfo.orderData ? (
              <>
                <div className="font-medium">Order Data:</div>
                <div className={!debugInfo.orderData.user_name ? 'text-red-500' : 'text-green-600'}>
                  Name: {safeStringify(debugInfo.orderData.user_name) || '(empty)'}
                </div>
                <div className={!debugInfo.orderData.user_email ? 'text-red-500' : 'text-green-600'}>
                  Email: {safeStringify(debugInfo.orderData.user_email) || '(empty)'}
                </div>
                <div className={!debugInfo.orderData.user_phone ? 'text-red-500' : 'text-green-600'}>
                  Phone: {safeStringify(debugInfo.orderData.user_phone) || '(empty)'}
                </div>
              </>
            ) : (
              <div className="text-orange-600">No order record found</div>
            )}
          </div>
        </div>
        
        <div className="mb-2">
          <div className="font-medium text-xs mb-1">Profile Data:</div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            {debugInfo.profileData ? (
              <>
                <div className="font-medium">Profile Information:</div>
                <div className={!debugInfo.profileData.firstName && !debugInfo.profileData.lastName ? 'text-red-500' : 'text-green-600'}>
                  Name: {[
                    safeStringify(debugInfo.profileData.firstName), 
                    safeStringify(debugInfo.profileData.lastName)
                  ].filter(val => val && val !== '(empty)').join(' ') || '(empty)'}
                </div>
                <div className={!debugInfo.profileData.email ? 'text-red-500' : 'text-green-600'}>
                  Email: {safeStringify(debugInfo.profileData.email) || '(empty)'}
                </div>
                <div className={!debugInfo.profileData.phone ? 'text-red-500' : 'text-green-600'}>
                  Phone: {safeStringify(debugInfo.profileData.phone) || '(empty)'}
                </div>
              </>
            ) : (
              <div className="text-orange-600">No profile data found</div>
            )}
          </div>
        </div>
        
        <div className="mb-2">
          <div className="font-medium text-xs mb-1">Direct Customer Data Fetch:</div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            {debugInfo.customerDataFromOrders ? (
              <>
                <div className="text-sm font-medium mb-1">Direct Fetch Results:</div>
                {Object.entries(debugInfo.customerDataFromOrders).map(([orderId, data]: [string, any]) => (
                  <div key={orderId} className="mb-2 p-1 border-b border-gray-200">
                    <div className="font-medium">Order ID: {orderId}</div>
                    <div className={!data?.user_name ? 'text-red-500' : 'text-green-600'}>
                      Name: {data?.user_name ? safeStringify(data.user_name) : '(empty)'}
                    </div>
                    <div className={!data?.user_email ? 'text-red-500' : 'text-green-600'}>
                      Email: {data?.user_email ? safeStringify(data.user_email) : '(empty)'}
                    </div>
                    <div className={!data?.user_phone ? 'text-red-500' : 'text-green-600'}>
                      Phone: {data?.user_phone ? safeStringify(data.user_phone) : '(empty)'}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-orange-600">No direct customer data fetched</div>
            )}
          </div>
        </div>
        
        {/* Orphaned Items Section */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div className="font-medium text-xs mb-1">Orphaned Items Check:</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkForOrphanedItems} 
              disabled={isCheckingOrphans}
              className="text-xs h-6 py-0 px-2"
            >
              {isCheckingOrphans ? 'Checking...' : 'Scan for Orphaned Items'}
            </Button>
          </div>
          
          <div className="text-xs bg-gray-50 p-2 rounded">
            {orphanedItems.length > 0 ? (
              <>
                <div className="text-red-500 font-medium mb-1">
                  Found {orphanedItems.length} orphaned items!
                </div>
                <div className="max-h-[150px] overflow-y-auto border border-gray-200 rounded p-1">
                  {orphanedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between mb-1 p-1 bg-white rounded shadow-sm">
                      <div>
                        <span className="font-medium">Item ID: </span>{item.id.substring(0, 8)}...
                        <Badge className="ml-1" variant={item.verified ? "outline" : "destructive"}>
                          {item.verified ? 'Verified' : 'Orphaned'}
                        </Badge>
                        <div className="text-gray-500">
                          Order ID: {item.order_id.substring(0, 8)}...
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => verifyOrphanedItem(item.id)} 
                          className="h-6 py-0 px-2"
                          disabled={item.verified}
                        >
                          Verify
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deleteOrphanedItem(item.id)} 
                          className="h-6 py-0 px-2"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Orphaned items refer to order items that reference non-existent orders, 
                  causing "Unknown Customer" errors.
                </div>
              </>
            ) : isCheckingOrphans ? (
              <div className="text-blue-500">Checking for orphaned items...</div>
            ) : (
              <div className="text-gray-500">
                Click "Scan for Orphaned Items" to check for order items that reference non-existent orders.
              </div>
            )}
          </div>
        </div>
        
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[200px]">
          {safeStringify(debugInfo)}
        </pre>
      </div>
    </details>
  );
};
