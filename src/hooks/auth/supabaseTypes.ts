
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
    id: number;  // Ensure this is explicitly typed as a number
  };
  create_profile_for_user: (args: { 
    user_id: string; 
    user_email: string; 
    user_role: string;
  }) => void;
  is_garage_staff: (args: { garage_id: string }) => boolean;
  generate_confirmation_code: () => string;
  debug_rls_access: (args: { garage_id_param: string }) => {
    has_access: boolean;
    user_id: string;
    user_garage_id: string;
    request_garage_id: string;
    is_staff: boolean;
    error_message: string;
  };
  debug_installation_request_access: (args: { garage_id_param: string }) => {
    has_access: boolean;
    user_id: string;
    user_garage_id: string;
    request_garage_id: string;
    is_staff: boolean;
    error_message: string;
  }[];
  get_customer_info_for_installation: (args: { order_id_param: string }) => {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_source_info: string;
  }[];
  get_installation_requests_for_garage: (args: { garage_id_param: string }) => any[];
  has_installation_request_access: (args: { request_garage_id: string }) => boolean;
};

// Enhance the SupabaseClient type with our custom RPC function signatures
export type EnhancedSupabaseClient = SupabaseClient<Database> & {
  rpc<T extends keyof RPCFunctions>(
    fn: T,
    args: Parameters<RPCFunctions[T]>[0],
    options?: { count?: 'exact' | 'planned' | 'estimated' }
  ): Promise<{
    data: ReturnType<RPCFunctions[T]> | null;  // Make sure it can be null
    error: null | {
      message: string;
    };
  }>;
};
