import React, { useState } from 'react';
import { supabase, checkGarageAccess } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldAlert, AlertTriangle, UserPlus, DatabaseIcon } from "lucide-react";
import { toast } from "sonner";

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
      // Test direct RLS access first
      console.log(`Testing direct RLS access for garage ID: ${garageId}`);
      const { data: directAccessData, error: directAccessError } = await supabase
        .from('order_items')
        .select('count(*)', { count: 'exact', head: true })
        .eq('garage_id', garageId);
        
      if (directAccessError) {
        console.error("Direct RLS access error:", directAccessError);
        setErrorDetails(directAccessError.message);
        
        toast({
          variant: "destructive",
          title: "Direct RLS Access Failed",
          description: `Error: ${directAccessError.message}`
        });
      }
      
      // Test the comprehensive check function
      console.log(`Testing check_garage_and_installation_requests for garage ID: ${garageId}`);
      const accessCheck = await checkGarageAccess(garageId);
        
      if (!accessCheck.hasAccess) {
        console.error("Check function error:", accessCheck.error);
        setErrorDetails(prev => prev ? `${prev}\n\nCheck error: ${accessCheck.error}` : 
          `Check error: ${accessCheck.error}`);
        
        toast({
          variant: "destructive",
          title: "Access Check Failed",
          description: `Error: ${accessCheck.error || "Access denied"}`
        });
      }
      
      // Get current user and their profile
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('garage_id, role')
        .eq('id', user?.id || '')
        .maybeSingle();
        
      // Prepare the comprehensive results
      const fullResults = {
        user: {
          id: user?.id,
          email: user?.email
        },
        profile: profileData,
        directAccess: {
          success: !directAccessError,
          error: directAccessError ? directAccessError.message : null
        },
        check: {
          hasAccess: accessCheck.hasAccess,
          garageName: accessCheck.garageName,
          requestsCount: accessCheck.requestsCount,
          error: accessCheck.error
        },
        hasAccess: accessCheck.hasAccess
      };
      
      setResults(fullResults);
      
      // Determine if user has access and provide appropriate toast
      if (fullResults.hasAccess) {
        toast({
          title: "RLS Test Passed",
          description: "You have access to installation requests for this garage."
        });
      } else if (directAccessError || accessCheck.error) {
        toast({
          variant: "destructive",
          title: "RLS Test Failed with Errors",
          description: "Please check the error details below."
        });
      } else {
        toast({
          variant: "destructive",
          title: "RLS Test Failed",
          description: "You don't have access to this garage's installation requests."
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
  
  const fixUserGarageAccess = async () => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Not Authenticated",
          description: "You need to be logged in to fix garage access."
        });
        return;
      }
      
      // Update the user's profile to link them with this garage
      console.log(`Linking user ${user.id} to garage ${garageId}`);
      const { data, error } = await supabase
        .from('profiles')
        .update({ garage_id: garageId })
        .eq('id', user.id);
        
      if (error) {
        console.error("Error fixing garage access:", error);
        toast({
          variant: "destructive",
          title: "Fix Failed",
          description: `Error: ${error.message}`
        });
        return;
      }
      
      toast({
        title: "Access Fixed",
        description: "Your user profile has been linked to this garage."
      });
      
      // Re-run the RLS test to verify the fix worked
      await runRlsTest();
      
    } catch (error: any) {
      console.error("Error fixing access:", error);
      toast({
        variant: "destructive",
        title: "Fix Error",
        description: `Error: ${error.message}`
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
      
      <div className="flex gap-2">
        <Button 
          size="sm"
          variant="outline"
          className="flex-1 text-xs bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          onClick={runRlsTest}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>Test RLS Access</>
          )}
        </Button>
        
        <Button 
          size="sm"
          variant="outline"
          className="flex-1 text-xs bg-white border-green-300 text-green-700 hover:bg-green-100"
          onClick={fixUserGarageAccess}
          disabled={loading}
        >
          <UserPlus className="h-3 w-3 mr-2" />
          Fix Access
        </Button>
      </div>
      
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
              {results.hasAccess ? (
                <span className="text-green-600">Pass</span>
              ) : (
                <span className="text-red-600">Fail</span>
              )}
              <br />
              <strong>Direct Access:</strong>
              {results.directAccess.success ? (
                <span className="text-green-600">Pass</span>
              ) : (
                <span className="text-red-600">Fail</span>
              )}
              <br />
              <strong>Target Garage:</strong> {garageId.substring(0, 8)}...
            </div>
          </div>
          
          {results.check && (
            <Alert variant="default" className="mt-2 py-2 px-3 bg-blue-50 border-blue-200">
              <AlertDescription className="text-xs">
                <strong>Garage Exists:</strong> 
                {results.check.garageName ? (
                  <span className="text-green-600"> Yes - {results.check.garageName}</span>
                ) : (
                  <span className="text-red-600"> No</span>
                )}
                <br />
                <strong>Installation Count:</strong> {results.check.requestsCount || 0}
                <br />
                <strong>User Has Access:</strong> 
                {results.check.hasAccess ? (
                  <span className="text-green-600"> Yes</span>
                ) : (
                  <span className="text-red-600"> No</span>
                )}
                {results.check.error && (
                  <>
                    <br />
                    <strong>Error:</strong> <span className="text-red-600">{results.check.error}</span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};
