
import React from "react";
import { Button } from "@/components/ui/button";
import { debugCheckAllInstallationRequests } from "@/api/orderApi";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Bug } from "lucide-react";
import { toast } from "sonner";

export const DebugInstallationRequests = () => {
  const [loading, setLoading] = React.useState(false);
  const garageMastersId = "c64a9350-d34a-4903-b34c-16c0e4699a44"; // Hardcoded for demo

  const runFullDiagnostics = async () => {
    setLoading(true);
    toast.info("Running diagnostics...");
    
    try {
      console.log("🔍 [DEBUG] Starting full installation requests diagnostics");
      
      // Check if current user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("🔍 [DEBUG] Current session:", sessionData?.session ? "Authenticated" : "Not authenticated");
      
      if (sessionData?.session) {
        console.log("🔍 [DEBUG] Current user:", sessionData.session.user.id);
        console.log("🔍 [DEBUG] User metadata:", sessionData.session.user.user_metadata);
      }
      
      // Run the comprehensive debug function
      await debugCheckAllInstallationRequests();
      
      // Check specifically for Garage Masters ID installations
      console.log(`🔍 [DEBUG] Checking installation requests for garage: ${garageMastersId}`);
      
      // FIXED: Add more detailed logging for the garage-specific query
      console.log(`🔍 [DEBUG] Running query: .eq('garage_id', ${garageMastersId})`);
      
      const { data: specificItems, error: specificError } = await supabase
        .from('order_items')
        .select('*')
        .eq('garage_id', garageMastersId)
        .limit(10);
        
      if (specificError) {
        console.error("🔍 [DEBUG] Error checking for specific garage:", specificError);
      } else {
        console.log("🔍 [DEBUG] All order items for this garage:", specificItems);
      }
      
      // Check ALL order_items in the database
      const { data: allItems, error: allItemsError } = await supabase
        .from('order_items')
        .select('*')
        .limit(10);
        
      if (allItemsError) {
        console.error("🔍 [DEBUG] Error checking all order_items:", allItemsError);
      } else {
        console.log("🔍 [DEBUG] Checking ALL order_items in the database (limit 10):");
        console.log("🔍 [DEBUG] Sample items from order_items table:", allItems);
      }
      
      // Check for order_items with installation_status
      // FIXED: Add more detailed logging about the query being performed
      console.log("🔍 [DEBUG] Checking for order_items with installation_status set");
      
      const { data: installationItems, error: installationError } = await supabase
        .from('order_items')
        .select('*')
        .not('installation_status', 'is', null)
        .limit(20);
        
      if (installationError) {
        console.error("🔍 [DEBUG] Error checking items with installation_status:", installationError);
      } else {
        console.log(`🔍 [DEBUG] Fetched order items with installation: ${JSON.stringify(installationItems)}`);
        
        if (installationItems && installationItems.length > 0) {
          console.log("🔍 [DEBUG] Found installation requests:", installationItems);
          toast.success(`Found ${installationItems.length} installation requests in the database`);
        } else {
          console.log(`🔍 [DEBUG] No installation requests found for garage: ${garageMastersId}`);
          toast.warning("No installation requests found in the database");
        }
      }
      
      toast.success("Diagnostics completed, check console logs for details");
    } catch (error) {
      console.error("🔍 [DEBUG] Error in diagnostics:", error);
      toast.error("Error running diagnostics, check console");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};
