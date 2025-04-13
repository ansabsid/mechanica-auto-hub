
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldAlert, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface RlsDebugHelperProps {
  garageId: string;
}

export const RlsDebugHelper: React.FC<RlsDebugHelperProps> = ({ garageId }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const runRlsTest = async () => {
    setLoading(true);
    setErrorDetails(null);
    
    try {
      // Test direct RLS function first to diagnose any issues
      const { data: rlsDebugData, error: rlsDebugError } = await supabase
        .rpc('debug_installation_request_access', { garage_id_param: garageId });
        
      if (rlsDebugError) {
        console.error("RLS debug function error:", rlsDebugError);
        setErrorDetails(rlsDebugError.message);
        
        toast({
          variant: "destructive",
          title: "RLS Test Failed",
          description: `Error in RLS function: ${rlsDebugError.message}`
        });
        
        // Still continue with other tests
      }
      
      // Test direct access to order_items
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('id, order_id, garage_id')
        .eq('garage_id', garageId)
        .limit(1);
      
      // Get current user and their profile
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('garage_id, role')
        .eq('id', user?.id || '')
        .maybeSingle();
        
      // Check if the user's garage_id matches the requested garage_id
      const hasAccess = profileData?.garage_id === garageId;
      const requestMatches = profileData?.garage_id === garageId;
      
      // Additional tests to check various RLS configurations
      const { data: directTestData, error: directTestError } = await supabase
        .from('garages')
        .select('id, name')
        .eq('id', garageId)
        .single();
        
      // Test if is_garage_staff function works properly
      const { data: isStaffData, error: isStaffError } = await supabase
        .rpc('is_garage_staff', { garage_id: garageId });
      
      if (isStaffError) {
        console.error("Staff function error:", isStaffError);
        setErrorDetails(prev => prev ? `${prev}\n\nStaff function error: ${isStaffError.message}` : 
          `Staff function error: ${isStaffError.message}`);
      }
      
      // Build a comprehensive diagnostic result
      const diagnosisResult = {
        has_access: hasAccess,
        user_id: user?.id,
        user_garage_id: profileData?.garage_id,
        user_role: profileData?.role,
        request_matches: requestMatches,
        is_staff_function: {
          result: isStaffData,
          error: isStaffError ? isStaffError.message : null
        },
        garage_data: {
          exists: !!directTestData,
          error: directTestError ? directTestError.message : null
        }
      };
      
      // If we have the RLS debug data, include it
      const fullResults = {
        orderItemsAccess: {
          success: !orderItemsError,
          count: orderItemsData?.length || 0,
          error: orderItemsError
        },
        rlsDebug: rlsDebugData ? rlsDebugData[0] : diagnosisResult,
        rlsDebugFunctionError: rlsDebugError ? rlsDebugError.message : null,
        user: {
          id: user?.id,
          email: user?.email
        },
        profile: profileData
      };
      
      setResults(fullResults);
      
      if (!orderItemsError && (orderItemsData?.length || 0) > 0) {
        toast({
          title: "RLS Test Passed",
          description: "You have access to installation requests for this garage."
        });
      } else if (orderItemsError) {
        toast({
          variant: "destructive",
          title: "RLS Test Failed",
          description: `Database error: ${orderItemsError.message}`
        });
      } else {
        toast({
          variant: "destructive",
          title: "RLS Test Failed",
          description: "You don't have access to installation requests for this garage."
        });
      }
    } catch (error: any) {
      console.error("RLS debug error:", error);
      setErrorDetails(error.message);
      toast({
        variant: "destructive",
        title: "RLS Debug Error",
        description: "An error occurred while testing RLS policies."
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mt-4 p-3 border border-yellow-200 rounded-md bg-yellow-50">
      <div className="flex items-center mb-2">
        <ShieldAlert className="h-4 w-4 mr-2 text-yellow-600" />
        <h3 className="text-sm font-medium text-yellow-800">RLS Policy Tester</h3>
      </div>
      
      <p className="text-xs mb-3 text-yellow-700">
        Test if your user account has proper access to installation requests through Row Level Security.
      </p>
      
      {errorDetails && (
        <Alert variant="destructive" className="mb-3 py-2 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <AlertDescription>
            <div className="font-semibold">Error Details:</div>
            <pre className="whitespace-pre-wrap text-xs mt-1">{errorDetails}</pre>
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        size="sm"
        variant="outline"
        className="w-full text-xs bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        onClick={runRlsTest}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Testing RLS Policies...
          </>
        ) : (
          <>Test RLS Access</>
        )}
      </Button>
      
      {results && (
        <div className="mt-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-white">
              <strong>User:</strong> {results.user.email || 'Unknown'}
              <br />
              <strong>User ID:</strong> {results.user.id?.substring(0, 8) || 'Unknown'}...
              <br />
              <strong>Garage ID:</strong> {results.profile?.garage_id?.substring(0, 8) || 'Not set'}...
              <br />
              <strong>Role:</strong> {results.profile?.role || 'Unknown'}
            </div>
            <div className="p-2 rounded bg-white">
              <strong>Access Status:</strong> 
              {results.orderItemsAccess.success ? (
                <span className="text-green-600">Pass</span>
              ) : (
                <span className="text-red-600">Fail</span>
              )}
              <br />
              <strong>Items Found:</strong> {results.orderItemsAccess.count}
              <br />
              <strong>Target Garage:</strong> {garageId.substring(0, 8)}...
              <br />
              <strong>Staff Check:</strong> {results.rlsDebug?.hasGarageAccess === true || 
                results.rlsDebug?.is_staff_function?.result === true ? 
                <span className="text-green-600">Yes</span> : 
                <span className="text-red-600">No</span>
              }
            </div>
          </div>
          
          {results.rlsDebug && (
            <Alert variant="default" className="mt-2 py-2 px-3 bg-blue-50 border-blue-200">
              <AlertDescription className="text-xs">
                <strong>RLS Diagnosis:</strong> 
                {results.rlsDebug.has_access ? (
                  <span className="text-green-600"> You have access</span>
                ) : (
                  <span className="text-red-600"> Access denied</span>
                )}
                <br />
                <strong>User-Garage Match:</strong> 
                {results.rlsDebug.request_matches ? (
                  <span className="text-green-600"> Yes</span>
                ) : (
                  <span className="text-red-600"> No</span>
                )}
                {results.rlsDebug.rlsError && (
                  <>
                    <br />
                    <strong>RLS Error:</strong> 
                    <span className="text-red-600"> {results.rlsDebug.rlsError}</span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {results.rlsDebugFunctionError && (
            <Alert variant="destructive" className="mt-2 py-2 px-3">
              <AlertDescription className="text-xs">
                <strong>RLS Function Error:</strong> {results.rlsDebugFunctionError}
              </AlertDescription>
            </Alert>
          )}
          
          {results.orderItemsAccess.error && (
            <Alert variant="destructive" className="mt-2 py-2 px-3">
              <AlertDescription className="text-xs">
                <strong>Database Error:</strong> {results.orderItemsAccess.error.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};
