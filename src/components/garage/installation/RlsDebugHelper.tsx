
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { RPCFunctions } from "@/hooks/auth/supabaseTypes";

interface RlsDebugHelperProps {
  garageId: string;
}

export const RlsDebugHelper: React.FC<RlsDebugHelperProps> = ({ garageId }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const runRlsTest = async () => {
    setLoading(true);
    try {
      // Test direct access to order_items
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('id, order_id, garage_id')
        .eq('garage_id', garageId)
        .limit(1);
      
      // Run diagnostic function to check RLS access
      const { data: rlsDebugData, error: rlsDebugError } = await supabase
        .rpc('debug_rls_access', { garage_id_param: garageId });
      
      // Get current user and their profile
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('garage_id')
        .eq('id', user?.id || '')
        .single();
      
      setResults({
        orderItemsAccess: {
          success: !orderItemsError,
          count: orderItemsData?.length || 0,
          error: orderItemsError
        },
        rlsDebug: rlsDebugData?.[0] || null,
        rlsDebugError,
        user: {
          id: user?.id,
          email: user?.email
        },
        profile: profileData
      });
      
      if (!orderItemsError && (orderItemsData?.length || 0) > 0) {
        toast({
          title: "RLS Test Passed",
          description: "You have access to installation requests for this garage."
        });
      } else {
        toast({
          variant: "destructive",
          title: "RLS Test Failed",
          description: "You don't have access to installation requests for this garage."
        });
      }
    } catch (error) {
      console.error("RLS debug error:", error);
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
              </AlertDescription>
            </Alert>
          )}
          
          {results.orderItemsAccess.error && (
            <Alert variant="destructive" className="mt-2 py-2 px-3">
              <AlertDescription className="text-xs">
                <strong>Error:</strong> {results.orderItemsAccess.error.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};
