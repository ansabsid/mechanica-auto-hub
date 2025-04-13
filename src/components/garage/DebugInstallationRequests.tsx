
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { debugCheckAllInstallationRequests } from "@/api/orderApi";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Bug, Info, ShieldAlert, User, Wrench, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const DebugInstallationRequests = () => {
  const [loading, setLoading] = React.useState(false);
  const [debugResults, setDebugResults] = React.useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [errorDetails, setErrorDetails] = React.useState<any[]>([]);
  const garageMastersId = "c64a9350-d34a-4903-b34c-16c0e4699a44"; // Hardcoded for demo

  const runFullDiagnostics = async () => {
    setLoading(true);
    setErrorDetails([]);
    toast.info("Running diagnostics...");
    
    try {
      console.log("🔍 [DEBUG] Starting full installation requests diagnostics");
      const results: any = {};
      const errors: any[] = [];
      
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
          errors.push({
            type: "profile",
            message: "Failed to fetch user profile",
            details: profileError
          });
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
              errors.push({
                type: "garage",
                message: "Failed to fetch garage data",
                details: garageError
              });
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
              errors.push({
                type: "garageMasters",
                message: "Failed to fetch Garage Masters data",
                details: garageMastersError
              });
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
          errors.push({
            type: "policies",
            message: "RLS policy issues detected",
            details: policiesTestError
          });
          
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
      } else {
        errors.push({
          type: "auth",
          message: "User is not authenticated",
          details: "A valid session is required to access installation requests"
        });
      }
      
      // Run the comprehensive debug function
      try {
        await debugCheckAllInstallationRequests();
      } catch (debugError) {
        console.error("🔍 [DEBUG] Error in debugCheckAllInstallationRequests:", debugError);
        errors.push({
          type: "debugFunction",
          message: "Error in installation requests diagnostic function",
          details: debugError
        });
      }
      
      // Check specifically for Garage Masters ID installations
      console.log(`🔍 [DEBUG] Checking installation requests for garage: ${garageMastersId}`);
      console.log(`🔍 [DEBUG] Running query: .eq('garage_id', '${garageMastersId}')`);
      
      const { data: specificItems, error: specificError } = await supabase
        .from('order_items')
        .select('*')
        .eq('garage_id', garageMastersId)
        .limit(10);
        
      if (specificError) {
        console.error("🔍 [DEBUG] Error checking for specific garage:", specificError);
        results.specificItemsError = specificError;
        errors.push({
          type: "specificItems",
          message: "Failed to fetch items for garage",
          details: specificError
        });
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
        errors.push({
          type: "allItems",
          message: "Failed to fetch all order items",
          details: allItemsError
        });
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
        errors.push({
          type: "installationItems",
          message: "Failed to fetch items with installation status",
          details: installationError
        });
      } else {
        console.log(`🔍 [DEBUG] Fetched order items with installation: ${JSON.stringify(installationItems)}`);
        results.installationItems = installationItems;
        
        if (installationItems && installationItems.length > 0) {
          console.log("🔍 [DEBUG] Found installation requests:", installationItems);
          toast.success(`Found ${installationItems.length} installation requests in the database`);
        } else {
          console.log(`🔍 [DEBUG] No installation requests found for garage: ${garageMastersId}`);
          toast.warning("No installation requests found in the database");
          errors.push({
            type: "noInstallations",
            message: "No installation requests found",
            details: "Check if any orders with installation have been created"
          });
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
        errors.push({
          type: "incompleteItems",
          message: "Failed to check for incomplete installation items",
          details: incompleteError
        });
      } else {
        console.log("🔍 [DEBUG] Items with garage_id but no installation_status:", incompleteItems);
        results.incompleteItems = incompleteItems;
        
        if (incompleteItems && incompleteItems.length > 0) {
          console.log("🔍 [DEBUG] Found incomplete installation items! These need fixing:", incompleteItems);
          toast.error(`Found ${incompleteItems.length} incomplete installation requests. These may need fixing.`);
          errors.push({
            type: "incompleteInstallations",
            message: `${incompleteItems.length} installations have missing data`,
            details: "Items have garage_id but no installation_status"
          });
        }
      }
      
      // Check for orders with customer info
      console.log("🔍 [DEBUG] Checking for orders with customer information");
      const { data: ordersWithCustomer, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_name, user_email, user_phone')
        .not('user_name', 'is', null)
        .limit(10);
        
      if (ordersError) {
        console.error("🔍 [DEBUG] Error checking orders with customer info:", ordersError);
        errors.push({
          type: "customerInfo",
          message: "Failed to check orders with customer info",
          details: ordersError
        });
      } else {
        console.log("🔍 [DEBUG] Orders with customer info:", ordersWithCustomer);
        results.ordersWithCustomer = ordersWithCustomer;
      }
      
      setDebugResults(results);
      setErrorDetails(errors);
      
      if (errors.length > 0) {
        toast.error(`Found ${errors.length} issues that need attention`);
        setIsDialogOpen(true);
      } else {
        toast.success("Diagnostics completed with no issues detected");
      }
    } catch (error) {
      console.error("🔍 [DEBUG] Error in diagnostics:", error);
      toast.error("Error running diagnostics, check console");
      setErrorDetails([{
        type: "general",
        message: "Unexpected error during diagnostics",
        details: error
      }]);
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

  const fixIncompleteItems = async () => {
    if (!debugResults?.incompleteItems || debugResults.incompleteItems.length === 0) {
      toast.error("No incomplete items to fix");
      return;
    }
    
    try {
      toast.info("Attempting to fix incomplete installation items...");
      let fixedCount = 0;
      
      for (const item of debugResults.incompleteItems) {
        const { error } = await supabase
          .from('order_items')
          .update({ installation_status: 'new' })
          .eq('id', item.id);
          
        if (error) {
          console.error(`🔍 [DEBUG] Error fixing item ${item.id}:`, error);
        } else {
          console.log(`🔍 [DEBUG] Successfully fixed item ${item.id}`);
          fixedCount++;
        }
      }
      
      if (fixedCount > 0) {
        toast.success(`Fixed ${fixedCount} installation items`);
        runFullDiagnostics();
      } else {
        toast.error("Failed to fix any installation items");
      }
    } catch (error) {
      console.error("🔍 [DEBUG] Error in fixIncompleteItems:", error);
      toast.error("Error fixing incomplete items");
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
                <div className="flex flex-col">
                  <div className="text-red-500">⚠️ Installation data may be incomplete</div>
                  <button
                    onClick={fixIncompleteItems}
                    className="mt-1 text-white bg-mechanica-500 hover:bg-mechanica-600 p-1 rounded text-xs"
                  >
                    Fix Incomplete Items
                  </button>
                </div>
              )}
            </div>
            <div className="mb-2">
              <strong>Orders with customer info:</strong> {debugResults.ordersWithCustomer?.length || 0}
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Installation System Diagnostic Results
            </DialogTitle>
            <DialogDescription>
              The following issues were detected with the installation request system:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {errorDetails.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertDescription className="space-y-2">
                  <div className="font-semibold">{error.message}</div>
                  <div className="text-sm opacity-90">{typeof error.details === 'string' ? error.details : JSON.stringify(error.details)}</div>
                </AlertDescription>
              </Alert>
            ))}
            
            {errorDetails.some(e => e.type === "incompleteInstallations") && (
              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <h4 className="font-medium text-sm mb-1">Fixing Incomplete Installations</h4>
                <p className="text-sm mb-2">Some installations have missing data. This can be fixed automatically.</p>
                <Button 
                  onClick={fixIncompleteItems}
                  className="w-full mt-2"
                  variant="outline"
                >
                  Fix Incomplete Installation Items
                </Button>
              </div>
            )}
            
            {errorDetails.some(e => e.type === "auth" || e.type === "profile") && (
              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <h4 className="font-medium text-sm mb-1">Authentication & Profile Issues</h4>
                <p className="text-sm">Make sure you're logged in with a garage account and properly associated with Garage Masters.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

