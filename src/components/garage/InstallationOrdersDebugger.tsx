
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bug } from "lucide-react";
import { OrderList } from './debugger/OrderList';
import { CustomerForm } from './debugger/CustomerForm';
import { DebugInfo } from './debugger/DebugInfo';
import { useOrdersDebugger } from './debugger/useOrdersDebugger';

export const InstallationOrdersDebugger = () => {
  const {
    open,
    setOpen,
    orderItems,
    selectedItem,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    isLoading,
    orderId,
    debugInfo,
    showWarningAlert,
    fetchOrderItems,
    handleSelectItem,
    updateOrderCustomerInfo
  } = useOrdersDebugger();

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
            <div className="md:col-span-1">
              <OrderList 
                orderItems={orderItems}
                selectedItem={selectedItem}
                onSelectItem={handleSelectItem}
                onRefresh={fetchOrderItems}
                isLoading={isLoading}
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="border p-4 rounded-md">
                <h3 className="text-sm font-semibold mb-4">Order Customer Information</h3>
                
                <CustomerForm 
                  orderId={orderId}
                  customerName={customerName}
                  customerEmail={customerEmail}
                  customerPhone={customerPhone}
                  showWarningAlert={showWarningAlert}
                  isLoading={isLoading}
                  onCustomerNameChange={setCustomerName}
                  onCustomerEmailChange={setCustomerEmail}
                  onCustomerPhoneChange={setCustomerPhone}
                  onUpdateCustomerInfo={updateOrderCustomerInfo}
                />
              </div>
              
              <div className="mt-4 border p-4 rounded-md">
                <DebugInfo 
                  debugInfo={debugInfo}
                  customerName={customerName}
                  customerEmail={customerEmail}
                  customerPhone={customerPhone}
                />
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
