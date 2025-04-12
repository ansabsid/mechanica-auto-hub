
import React from "react";
import { Button } from "@/components/ui/button";
import { debugCheckAllInstallationRequests } from "@/api/orderApi";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Bug } from "lucide-react";
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
              <strong>Authentication:</strong> {debugResults.isAuthenticated ? 'Yes' : 'No'}
              {debugResults.userId && <div>User ID: {debugResults.userId}</div>}
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

