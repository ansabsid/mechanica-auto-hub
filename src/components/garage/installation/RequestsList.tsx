
import React from 'react';
import { Calendar, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstallationRequest } from "@/hooks/useInstallationRequests";

interface RequestsListProps {
  installationRequests: InstallationRequest[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRequestClick: (request: InstallationRequest) => void;
  debug: any;
}

export const RequestsList: React.FC<RequestsListProps> = ({
  installationRequests,
  isLoading,
  isRefreshing,
  onRefresh,
  onRequestClick,
  debug
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mechanica-600"></div>
      </div>
    );
  }
  
  if (installationRequests.length === 0) {
    return (
      <div>
        <p className="text-center py-4 text-gray-500">No installation requests</p>
        <div className="border-t pt-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="w-full text-xs flex items-center justify-center"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mechanica-600 mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
        <details className="mt-4 text-xs text-gray-400">
          <summary>Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </details>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="text-xs flex items-center"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mechanica-600 mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      
      {installationRequests.map(request => (
        <div 
          key={request.id}
          className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
            request.status === 'new' ? 'border-mechanica-500 bg-mechanica-50' : ''
          }`}
          onClick={() => onRequestClick(request)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{request.customerName}</h3>
                {request.status === 'new' && (
                  <Badge className="ml-2 bg-mechanica-500">New</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{request.part}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Phone className="h-3 w-3 mr-1" /> 
                {request.customerPhone}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" /> 
                Order date: {new Date(request.orderDate).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">${request.price + request.installationFee}</p>
              <p className="text-xs text-gray-500">
                (Part: ${request.price}, Install: ${request.installationFee})
              </p>
            </div>
          </div>
          
          {request.status === 'scheduled' && request.appointmentDate && request.appointmentTime && (
            <div className="mt-2 text-xs bg-green-50 text-green-700 px-2 py-1 rounded flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> 
              Scheduled: {new Date(request.appointmentDate).toLocaleDateString()} at {request.appointmentTime}
            </div>
          )}
          
          {request.status === 'contacted' && (
            <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center">
              <Phone className="h-3 w-3 mr-1" /> 
              Customer contacted
            </div>
          )}
        </div>
      ))}
    </>
  );
};
