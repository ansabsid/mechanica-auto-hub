
import { User } from "@supabase/supabase-js";

interface UserMetadata {
  firstName?: string;
  lastName?: string;
  fullPhone?: string;
  countryCode?: string;
  phoneNumber?: string;
  garageName?: string;
  garageLocation?: string;
  garageRegistrationNumber?: string;
  [key: string]: any;
}

interface SignUpResult {
  success: boolean;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: "customer" | "garage" | null;
  signIn: (email: string, password: string, role: "customer" | "garage") => Promise<void>;
  signUp: (email: string, password: string, role: "customer" | "garage", metadata?: UserMetadata) => Promise<SignUpResult | undefined>;
  signOut: () => Promise<void>;
}
