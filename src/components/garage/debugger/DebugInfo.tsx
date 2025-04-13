
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  // Helper function to safely convert any value to a string
  const safeStringify = (value: any): string => {
    if (value === null || value === undefined) {
      return '(empty)';
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (err) {
        return '[Object]';
      }
    }
    return String(value);
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
        
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[200px]">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </details>
  );
};
