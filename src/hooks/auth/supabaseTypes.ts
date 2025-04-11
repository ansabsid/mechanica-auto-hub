
import { Database } from "@/integrations/supabase/types";
import { SupabaseClient } from "@supabase/supabase-js";

// Define the RPC function signatures for TypeScript type safety
export type RPCFunctions = {
  get_garages_for_part: (args: { part_id_param: number }) => {
    id: string;
    name: string;
    location: string;
    installation_fee: number;
  }[];
  get_garages_for_part_bulk: (args: { part_ids: number[] }) => {
    part_id: number;
    id: string;
    name: string;
    location: string;
    installation_fee: number;
  }[];
  insert_part: (args: { part_data: any }) => {
    id: number;  // Explicitly define id as a number
  };
  create_profile_for_user: (args: { 
    user_id: string; 
    user_email: string; 
    user_role: string;
  }) => void;
};

// Enhance the SupabaseClient type with our custom RPC function signatures
export type EnhancedSupabaseClient = SupabaseClient<Database> & {
  rpc<T extends keyof RPCFunctions>(
    fn: T,
    args: Parameters<RPCFunctions[T]>[0],
    options?: { count?: 'exact' | 'planned' | 'estimated' }
  ): Promise<{
    data: ReturnType<RPCFunctions[T]>;
    error: null | {
      message: string;
    };
  }>;
};
