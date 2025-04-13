
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  // Function to copy debug data to clipboard
  const handleCopyDebug = () => {
    navigator.clipboard.writeText(JSON.stringify(debug, null, 2))
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Debug information has been copied to clipboard"
        });
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Could not copy debug information to clipboard"
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Debug Information</DialogTitle>
          <DialogDescription>
            Technical details to troubleshoot installation requests
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium mb-2">Authentication Status</h3>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify({
                isAuthenticated: !!user,
                userId: user?.id,
                userEmail: user?.email,
                authSession: debug.authSession
              }, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium mb-2">Data Fetch Details</h3>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify({
                garageId: debug.garageId,
                fetchStarted: debug.fetchStarted,
                itemsCount: debug.itemsCount || 0,
                ordersCount: debug.ordersCount || 0,
                profilesCount: debug.profilesCount || 0,
                partsCount: debug.partsCount || 0,
                requestsCount: debug.requestsCount || 0,
                errorCounts: debug.errorCounts || 0
              }, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium mb-2">Direct RLS Policy Test</h3>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(debug.directTest, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium mb-2">Customer Information</h3>
            <div className="space-y-2">
              {debug.mappedRequests && debug.mappedRequests.map((req: any, index: number) => (
                <div key={index} className="border-b pb-2">
                  <p><strong>Order ID:</strong> {req.orderId.substring(0, 8)}...</p>
                  <p><strong>Name:</strong> {req.customerName}</p>
                  <p><strong>Email:</strong> {req.customerEmail}</p>
                  <p><strong>Phone:</strong> {req.customerPhone}</p>
                  <p><strong>Status:</strong> {req.status}</p>
                </div>
              ))}
              {!debug.mappedRequests?.length && (
                <p className="text-sm text-gray-500">No customer data available</p>
              )}
            </div>
          </div>
          
          <details className="border rounded-md p-4">
            <summary className="font-medium cursor-pointer">Full Debug Data</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-60">
              {JSON.stringify(debug, null, 2)}
            </pre>
          </details>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCopyDebug}>
            Copy Debug Info
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
