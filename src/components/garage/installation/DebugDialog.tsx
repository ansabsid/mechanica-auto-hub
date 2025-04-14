
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [isChecking, setIsChecking] = useState(false);
  
  // Format JSON for display
  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return "Error formatting JSON";
    }
  };
  
  // Manual check function
  const checkOrderManually = async (orderId: string) => {
    if (!orderId) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, user_id, user_name, user_email, user_phone')
        .eq('id', orderId)
        .maybeSingle();
        
      if (error) {
        toast.error("Error checking order: " + error.message);
        return;
      }
      
      if (!data) {
        toast.warning("Order not found: " + orderId);
      } else {
        toast.success("Order found!");
      }
      
      console.log("Manual order check result:", data);
    } catch (error) {
      console.error("Error in manual order check:", error);
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Debug Information</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requests">Installation Requests</TabsTrigger>
              <TabsTrigger value="failures">Order Failures</TabsTrigger>
              <TabsTrigger value="check">Manual Order Check</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Alert>
                <AlertDescription>
                  Technical details for troubleshooting installation requests
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded p-2">
                    <div className="text-sm font-medium">Garage ID</div>
                    <div className="text-xs font-mono">{debug.garageId || "Not set"}</div>
                  </div>
                  
                  <div className="border rounded p-2">
                    <div className="text-sm font-medium">Last Fetch</div>
                    <div className="text-xs">{debug.lastFetchTime ? new Date(debug.lastFetchTime).toLocaleString() : "Never"}</div>
                  </div>
                </div>
                
                <div className="border rounded p-2">
                  <div className="text-sm font-medium">Garage Access Check</div>
                  {debug.garageAccessCheck ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <div className="text-xs font-medium">Access:</div>
                        <Badge variant={debug.garageAccessCheck.hasAccess ? "default" : "destructive"}>
                          {debug.garageAccessCheck.hasAccess ? "Granted" : "Denied"}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs font-medium">Garage Exists:</div>
                        <Badge variant={debug.garageAccessCheck.garageExists ? "default" : "destructive"}>
                          {debug.garageAccessCheck.garageExists ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs font-medium">Name:</div>
                        <div className="text-xs">{debug.garageAccessCheck.garageName || "Unknown"}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium">Request Count:</div>
                        <div className="text-xs">{debug.garageAccessCheck.requestsCount ?? "Unknown"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No access check performed</div>
                  )}
                </div>
                
                <div className="border rounded p-2">
                  <div className="text-sm font-medium">Request Counts</div>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div>
                      <div className="text-xs font-medium">Order Items:</div>
                      <div className="text-xs">{debug.itemsCount ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">Orders:</div>
                      <div className="text-xs">{debug.ordersCount ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">Requests:</div>
                      <div className="text-xs">{debug.requestsCount ?? 0}</div>
                    </div>
                  </div>
                </div>
                
                {debug.error && (
                  <div className="border border-red-200 bg-red-50 rounded p-2">
                    <div className="text-sm font-medium text-red-700">Error</div>
                    <div className="text-xs text-red-600 font-mono whitespace-pre-wrap">
                      {typeof debug.error === 'object' ? JSON.stringify(debug.error, null, 2) : debug.error}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="requests">
              <div className="border rounded p-3 space-y-2">
                <div className="text-sm font-medium">Processed Installation Requests</div>
                <div className="text-xs text-gray-500">
                  {debug.requestsCount ? `${debug.requestsCount} requests processed` : 'No requests processed'}
                </div>
                
                {debug.mappedRequests && debug.mappedRequests.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto border rounded p-2">
                    {debug.mappedRequests.map((req: any, index: number) => (
                      <div key={index} className="border-b last:border-0 pb-2 mb-2 last:mb-0 last:pb-0">
                        <div className="flex justify-between">
                          <div className="font-medium">{req.customerName}</div>
                          <Badge>{req.status}</Badge>
                        </div>
                        <div className="text-xs">{req.part}</div>
                        <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                          <div>Order: {req.orderId.substring(0, 8)}...</div>
                          <div>Item: {req.orderItemId.substring(0, 8)}...</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No requests data available</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="failures">
              <div className="border rounded p-3 space-y-2">
                <div className="text-sm font-medium">Order Lookup Failures</div>
                <div className="text-xs text-gray-500">
                  {debug.orderLookupFailures && debug.orderLookupFailures.length > 0 
                    ? `${debug.orderLookupFailures.length} failures detected` 
                    : 'No lookup failures detected'}
                </div>
                
                {debug.orderLookupFailures && debug.orderLookupFailures.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto border rounded p-2">
                    {debug.orderLookupFailures.map((failure: any, index: number) => (
                      <div key={index} className="border-b last:border-0 pb-2 mb-2 last:mb-0 last:pb-0">
                        <div className="font-medium text-red-600">
                          Order ID: {failure.orderId.substring(0, 8)}...
                        </div>
                        <div className="text-xs mt-1">Error: {failure.error || "Unknown error"}</div>
                        <div className="text-xs text-gray-500">
                          Time: {new Date(failure.timestamp).toLocaleString()}
                        </div>
                        {failure.message && (
                          <div className="text-xs">{failure.message}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No lookup failures detected</div>
                )}
                
                {debug.orderItemsError && (
                  <div className="border border-red-200 bg-red-50 rounded p-2 mt-4">
                    <div className="text-sm font-medium text-red-700">Query Error</div>
                    <div className="text-xs text-red-600 font-mono whitespace-pre-wrap">
                      {formatJson(debug.orderItemsError)}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="check">
              <div className="border rounded p-3 space-y-3">
                <div className="text-sm font-medium">Manual Order Check</div>
                <div className="text-xs text-gray-500">
                  Enter an order ID to check if it exists in the database
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="order-id"
                    className="flex-1 px-3 py-2 rounded border text-sm"
                    placeholder="Enter order ID"
                  />
                  <Button 
                    onClick={() => {
                      const orderId = (document.getElementById('order-id') as HTMLInputElement)?.value;
                      if (orderId) checkOrderManually(orderId);
                    }}
                    disabled={isChecking}
                  >
                    {isChecking ? "Checking..." : "Check"}
                  </Button>
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <div className="text-sm font-medium">Order IDs in last fetch</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {debug.orderIds && debug.orderIds.length > 0 ? (
                      debug.orderIds.map((id: string, index: number) => (
                        <Badge key={index} variant="outline" className="cursor-pointer" 
                          onClick={() => {
                            // Copy to input field
                            const input = document.getElementById('order-id') as HTMLInputElement;
                            if (input) input.value = id;
                          }}>
                          {id.substring(0, 8)}...
                        </Badge>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500">No order IDs available</div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="auth">
              <div className="border rounded p-3 space-y-2">
                <div className="text-sm font-medium">Authentication Details</div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded p-2">
                    <div className="text-sm font-medium">User Status</div>
                    <Badge variant={user ? "default" : "destructive"}>
                      {user ? "Authenticated" : "Not Authenticated"}
                    </Badge>
                    {user && (
                      <div className="mt-1 text-xs">
                        <div>ID: {user.id.substring(0, 8)}...</div>
                        <div>Email: {user.email}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded p-2">
                    <div className="text-sm font-medium">Garage Role</div>
                    {user?.user_metadata?.role === 'garage' ? (
                      <Badge>Garage User</Badge>
                    ) : (
                      <Badge variant="outline">Not a Garage User</Badge>
                    )}
                    {user?.user_metadata?.garageName && (
                      <div className="mt-1 text-xs">
                        Garage: {user.user_metadata.garageName}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border rounded p-2">
                  <div className="text-sm font-medium">Session State</div>
                  {debug.authSession?.session ? (
                    <Badge>Active Session</Badge>
                  ) : (
                    <Badge variant="destructive">No Active Session</Badge>
                  )}
                </div>
                
                {debug.sessionError && (
                  <div className="border border-red-200 bg-red-50 rounded p-2">
                    <div className="text-sm font-medium text-red-700">Session Error</div>
                    <div className="text-xs text-red-600 font-mono whitespace-pre-wrap">
                      {formatJson(debug.sessionError)}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
