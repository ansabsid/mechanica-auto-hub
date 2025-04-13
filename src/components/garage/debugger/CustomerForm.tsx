
import React from 'react';
import { Save } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CustomerFormProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  showWarningAlert: boolean;
  isLoading: boolean;
  onCustomerNameChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onUpdateCustomerInfo: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  showWarningAlert,
  isLoading,
  onCustomerNameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onUpdateCustomerInfo
}) => {
  if (!orderId) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">Select an order to edit customer information</p>
    );
  }

  return (
    <div className="space-y-4">
      {showWarningAlert && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-300 mb-3">
          <AlertTriangle className="h-4 w-4 text-yellow-700" />
          <AlertDescription className="text-sm text-yellow-700">
            No customer information found for this order. Please enter the details below and save.
          </AlertDescription>
        </Alert>
      )}
      
      <div>
        <Label htmlFor="orderId">Order ID</Label>
        <Input id="orderId" value={orderId} readOnly className="bg-gray-50 font-mono text-xs" />
      </div>
      
      <div>
        <Label htmlFor="customerName">Customer Name <span className="text-red-500">*</span></Label>
        <Input 
          id="customerName" 
          value={customerName} 
          onChange={(e) => onCustomerNameChange(e.target.value)}
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
          onChange={(e) => onCustomerEmailChange(e.target.value)}
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
          onChange={(e) => onCustomerPhoneChange(e.target.value)}
          placeholder="Enter customer phone" 
          className={!customerPhone ? "border-red-300 bg-red-50" : ""}
        />
        {!customerPhone && (
          <p className="text-xs text-red-500 mt-1">Customer phone is required</p>
        )}
      </div>
      
      <Button 
        className="w-full bg-mechanica-500 hover:bg-mechanica-600" 
        onClick={onUpdateCustomerInfo}
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
  );
};
