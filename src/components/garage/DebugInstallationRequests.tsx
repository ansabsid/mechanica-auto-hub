
import React from "react";
import { Button } from "@/components/ui/button";
import { debugCheckAllInstallationRequests } from "@/api/orderApi";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Bug, Info, ShieldAlert, User, Wrench } from "lucide-react";
import { toast } from "sonner";

export const DebugInstallationRequests = () => {
  const [loading, setLoading] = React.useState(false);
  const [debugResults, setDebugResults] = React.useState<any>(null);
  const garageMastersId = "c64a9350-d34a-4903-b34c-16c0e4699a44"; // Hardcoded for demo

  const runFullDiagnostics = async () => {
    setLoading(true);
    toast.info("Running diagnostics...");
    
    try {
      console.log("🔍 [DEBUG] Starting full installation requests diagnostics");
      const results: any = {};
      
      // Check if current user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("🔍 [DEBUG] Current session:", sessionData?.session ? "Authenticated" : "Not authenticated");
      results.isAuthenticated = !!sessionData?.session;
      
      if (sessionData?.session) {
        console.log("🔍 [DEBUG] Current user:", sessionData.session.user.id);
        console.log("🔍 [DEBUG] User metadata:", sessionData.session.user.user_metadata);
        results.userId = sessionData.session.user.id;
        results.userMetadata = sessionData.session.user.user_metadata;
        
        // Check if user has a profile and if they are associated with a garage
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (profileError) {
          console.error("🔍 [DEBUG] Error checking user profile:", profileError);
          results.profileError = profileError;
        } else {
          console.log("🔍 [DEBUG] User profile:", profileData);
          results.profile = profileData;
          
          if (profileData?.garage_id) {
            console.log(`🔍 [DEBUG] User is associated with garage: ${profileData.garage_id}`);
            results.userGarageId = profileData.garage_id;
            
            // Check if garage exists
            const { data: garageData, error: garageError } = await supabase
              .from('garages')
              .select('*')
              .eq('id', profileData.garage_id)
              .single();
              
            if (garageError) {
              console.error("🔍 [DEBUG] Error checking garage:", garageError);
              results.garageError = garageError;
            } else {
              console.log("🔍 [DEBUG] Garage data:", garageData);
              results.garage = garageData;
            }
          } else {
            console.log("🔍 [DEBUG] User is not associated with any garage");
            
            // Check if Garage Masters exists
            const { data: garageMastersData, error: garageMastersError } = await supabase
              .from('garages')
              .select('*')
              .eq('id', garageMastersId)
              .single();
              
            if (garageMastersError) {
              console.error(`🔍 [DEBUG] Error checking Garage Masters (${garageMastersId}):`, garageMastersError);
              results.garageMastersError = garageMastersError;
            } else {
              console.log("🔍 [DEBUG] Garage Masters data:", garageMastersData);
              results.garageMasters = garageMastersData;
              
              // Suggest fixing the profile
              console.log("🔍 [DEBUG] Suggesting to associate the user with Garage Masters");
              results.suggestFixProfile = true;
            }
          }
        }
        
        // Check RLS policies for order_items using a manual approach instead of RPC
        console.log("🔍 [DEBUG] Checking if RLS policies exist for order_items");
        
        // Instead of using RPC, let's check if we can access the data as a way to test if policies exist
        const { data: policiesTestData, error: policiesTestError } = await supabase
          .from('order_items')
          .select('count(*)', { count: 'exact', head: true });
          
        if (policiesTestError) {
          console.error("🔍 [DEBUG] Error checking policies access:", policiesTestError);
          results.policiesError = policiesTestError;
          
          // Provide more information about potential RLS issues
          console.log("🔍 [DEBUG] Using alternative method to check policies");
          results.manualPolicyCheck = {
            message: "Could not access order_items table. This may indicate RLS policy issues.",
            suggestion: "Please check the Supabase dashboard to verify RLS policies for order_items."
          };
        } else {
          console.log("🔍 [DEBUG] Successfully accessed order_items with current user");
          results.policies = {
            message: "User has access to order_items table through RLS policies",
            success: true
          };
        }
      }
      
      // Run the comprehensive debug function
      await debugCheckAllInstallationRequests();
      
      // Check specifically for Garage Masters ID installations
      console.log(`🔍 [DEBUG] Checking installation requests for garage: ${garageMastersId}`);
      console.log(`🔍 [DEBUG] Running query: .eq('garage_id', '${garageMastersId}')`);
      
      // IMPORTANT: Fixed the query with proper string quotes for UUID
      const { data: specificItems, error: specificError } = await supabase
        .from('order_items')
        .select('*')
        .eq('garage_id', garageMastersId)
        .limit(10);
        
      if (specificError) {
        console.error("🔍 [DEBUG] Error checking for specific garage:", specificError);
        results.specificItemsError = specificError;
      } else {
        console.log("🔍 [DEBUG] All order items for this garage:", specificItems);
        results.specificItems = specificItems;
      }
      
      // Check ALL order_items in the database
      const { data: allItems, error: allItemsError } = await supabase
        .from('order_items')
        .select('*')
        .limit(10);
        
      if (allItemsError) {
        console.error("🔍 [DEBUG] Error checking all order_items:", allItemsError);
        results.allItemsError = allItemsError;
      } else {
        console.log("🔍 [DEBUG] Checking ALL order_items in the database (limit 10):");
        console.log("🔍 [DEBUG] Sample items from order_items table:", allItems);
        results.allItems = allItems;
        
        // Additional debug: Check all items with any garage_id
        const itemsWithGarage = allItems?.filter(item => item.garage_id) || [];
        console.log(`🔍 [DEBUG] Items with ANY garage_id: ${itemsWithGarage.length}`, itemsWithGarage);
        results.itemsWithGarage = itemsWithGarage;
      }
      
      // Check for order_items with installation_status
      console.log("🔍 [DEBUG] Checking for order_items with installation_status set");
      
      const { data: installationItems, error: installationError } = await supabase
        .from('order_items')
        .select('*')
        .not('installation_status', 'is', null)
        .limit(20);
        
      if (installationError) {
        console.error("🔍 [DEBUG] Error checking items with installation_status:", installationError);
        results.installationItemsError = installationError;
      } else {
        console.log(`🔍 [DEBUG] Fetched order items with installation: ${JSON.stringify(installationItems)}`);
        results.installationItems = installationItems;
        
        if (installationItems && installationItems.length > 0) {
          console.log("🔍 [DEBUG] Found installation requests:", installationItems);
          toast.success(`Found ${installationItems.length} installation requests in the database`);
        } else {
          console.log(`🔍 [DEBUG] No installation requests found for garage: ${garageMastersId}`);
          toast.warning("No installation requests found in the database");
        }
      }
      
      // Extra debug: Check if any order_items have garage_id but null installation_status
      const { data: incompleteItems, error: incompleteError } = await supabase
        .from('order_items')
        .select('*')
        .not('garage_id', 'is', null)
        .is('installation_status', null)
        .limit(20);
        
      if (incompleteError) {
        console.error("🔍 [DEBUG] Error checking for incomplete installation items:", incompleteError);
        results.incompleteItemsError = incompleteError;
      } else {
        console.log("🔍 [DEBUG] Items with garage_id but no installation_status:", incompleteItems);
        results.incompleteItems = incompleteItems;
        
        if (incompleteItems && incompleteItems.length > 0) {
          console.log("🔍 [DEBUG] Found incomplete installation items! These need fixing:", incompleteItems);
          toast.error(`Found ${incompleteItems.length} incomplete installation requests. These may need fixing.`);
        }
      }
      
      setDebugResults(results);
      toast.success("Diagnostics completed, check console logs for details");
    } catch (error) {
      console.error("🔍 [DEBUG] Error in diagnostics:", error);
      toast.error("Error running diagnostics, check console");
    } finally {
      setLoading(false);
    }
  };

  const fixUserProfile = async () => {
    if (!debugResults?.userId) {
      toast.error("No authenticated user found");
      return;
    }
    
    try {
      toast.info("Attempting to associate user with Garage Masters...");
      
      const { error } = await supabase
        .from('profiles')
        .update({ garage_id: garageMastersId })
        .eq('id', debugResults.userId);
        
      if (error) {
        console.error("🔍 [DEBUG] Error updating user profile:", error);
        toast.error("Failed to update user profile");
      } else {
        console.log(`🔍 [DEBUG] Successfully associated user with garage: ${garageMastersId}`);
        toast.success("User associated with Garage Masters! Please refresh the page.");
      }
    } catch (error) {
      console.error("🔍 [DEBUG] Error in fixUserProfile:", error);
      toast.error("Error fixing user profile");
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={runFullDiagnostics}
        disabled={loading}
        className="fixed bottom-4 right-4 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 z-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Bug className="mr-2 h-4 w-4" />
            Debug Installation Requests
          </>
        )}
      </Button>
      
      {debugResults && (
        <div className="fixed bottom-16 right-4 z-50 bg-white p-4 rounded shadow-lg border border-yellow-200 w-96 max-h-96 overflow-auto">
          <h3 className="font-medium text-sm mb-2 flex items-center">
            <Bug className="mr-1 h-3 w-3" /> Debug Results
            <button 
              onClick={() => setDebugResults(null)} 
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </h3>
          <div className="text-xs">
            <div className="mb-2">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <strong>Authentication:</strong> {debugResults.isAuthenticated ? 'Yes' : 'No'}
              </div>
              {debugResults.userId && <div>User ID: {debugResults.userId}</div>}
              
              {debugResults.profile && (
                <div className="mt-1 p-1 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <Wrench className="h-3 w-3 mr-1" />
                    <strong>Garage Association:</strong> {debugResults.profile.garage_id ? 'Yes' : 'No'}
                  </div>
                  {debugResults.profile.garage_id && (
                    <div>Garage ID: {debugResults.profile.garage_id}</div>
                  )}
                </div>
              )}
              
              {debugResults.suggestFixProfile && !debugResults.profile?.garage_id && (
                <div className="mt-1 p-1 bg-red-50 text-red-700 rounded">
                  <div className="flex items-center">
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    <strong>Access Issue:</strong> User not associated with garage
                  </div>
                  <button
                    onClick={fixUserProfile}
                    className="mt-1 text-white bg-mechanica-500 hover:bg-mechanica-600 p-1 rounded text-xs w-full"
                  >
                    Fix: Associate with Garage Masters
                  </button>
                </div>
              )}
              
              {debugResults.policies && (
                <div className="mt-1 p-1 bg-blue-50 text-blue-700 rounded">
                  <div className="flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    <strong>RLS Policies:</strong> {debugResults.policies.success ? 'Access confirmed' : 'Access issue detected'}
                  </div>
                  <div>{debugResults.policies.message}</div>
                </div>
              )}
            </div>
            
            <div className="mb-2">
              <strong>Items for this garage:</strong> {debugResults.specificItems?.length || 0}
            </div>
            <div className="mb-2">
              <strong>All order items:</strong> {debugResults.allItems?.length || 0}
            </div>
            <div className="mb-2">
              <strong>Items with installation status:</strong> {debugResults.installationItems?.length || 0}
            </div>
            <div className="mb-2">
              <strong>Incomplete items:</strong> {debugResults.incompleteItems?.length || 0}
              {debugResults.incompleteItems?.length > 0 && (
                <div className="text-red-500">⚠️ Installation data may be incomplete</div>
              )}
            </div>
            <button
              onClick={() => console.log("Full debug results:", debugResults)}
              className="text-blue-500 underline"
            >
              Log full details to console
            </button>
          </div>
        </div>
      )}
    </>
  );
};
