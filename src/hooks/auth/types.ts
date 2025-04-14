
import { User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: "customer" | "garage" | null;
  signIn: (email: string, password: string, role: "customer" | "garage") => Promise<void>;
  signUp: (email: string, password: string, role: "customer" | "garage", metadata?: any) => Promise<any>;
  signOut: () => Promise<void>;
}
