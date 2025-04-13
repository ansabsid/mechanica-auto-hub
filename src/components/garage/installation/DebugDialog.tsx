import React from 'react';
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
import { AlertCircle, AlertTriangle, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

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
                    <span className="block mt-1 italic">Check the "Order Failures" tab for details.</span>
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
                      <p className="mt-1 text-sm">These failures are causing "Unknown Customer" entries in your installation requests.</p>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 border text-xs">Order ID</th>
                          <th className="px-3 py-2 border text-xs">Error Message</th>
                          <th className="px-3 py-2 border text-xs">Time</th>
                          <th className="px-3 py-2 border text-xs">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debug.orderLookupFailures.map((failure: any, index: number) => (
                          <tr key={index} className="bg-red-50">
                            <td className="px-3 py-2 border text-xs font-mono">{failure.orderId}</td>
                            <td className="px-3 py-2 border text-xs">{failure.message || failure.error}</td>
                            <td className="px-3 py-2 border text-xs">{new Date(failure.timestamp).toLocaleString()}</td>
                            <td className="px-3 py-2 border text-xs">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => {
                                  navigator.clipboard.writeText(failure.orderId);
                                  toast({
                                    title: "Order ID Copied",
                                    description: "The Order ID has been copied to your clipboard"
                                  });
                                }}
                              >
                                Copy ID
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200">
                    <h5 className="font-medium text-amber-800 mb-2">Possible Solutions:</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-amber-800">
                      <li>Check if the order items reference valid order IDs in the database</li>
                      <li>Verify that your user account has permission to access these orders</li>
                      <li>Examine if RLS policies are preventing access to the orders table</li>
                      <li>Confirm there are no data consistency issues between order_items and orders tables</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm">No order lookup failures recorded.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="auth">
            <div className="space-y-2">
              <h4 className="font-medium">Auth Session</h4>
              <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-auto max-h-40">
                {JSON.stringify(debug.authSession, null, 2)}
              </pre>
              
              {debug.sessionError && (
                <>
                  <h4 className="font-medium text-red-500">Auth Error</h4>
                  <pre className="bg-red-50 p-2 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(debug.sessionError, null, 2)}
                  </pre>
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="raw">
            <div className="space-y-2">
              <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 mt-4">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
