
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
        
        <div className="mb-2">
          <div className="font-medium text-xs mb-1">RLS Status:</div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            <div>Garage Access: {debugInfo.hasGarageAccess ? 'Granted' : 'Denied'}</div>
            <div>Policy Status: {debugInfo.rlsStatus || 'Unknown'}</div>
            {debugInfo.rlsError && (
              <div className="text-red-600">Error: {debugInfo.rlsError}</div>
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
