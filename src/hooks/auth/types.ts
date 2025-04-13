
import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  role: "customer" | "garage";
  created_at?: string;
  updated_at?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  garage_id?: string;
}

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: "customer" | "garage" | null;
  signIn: (email: string, password: string, role: "customer" | "garage") => Promise<void>;
  signUp: (email: string, password: string, role: "customer" | "garage", metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
};
