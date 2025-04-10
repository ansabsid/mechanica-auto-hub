
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Initialize Supabase client with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Only create the client if we have the required values
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error("Supabase URL and anon key are required. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: "customer" | "garage" | null;
  signIn: (email: string, password: string, role: "customer" | "garage") => Promise<void>;
  signUp: (email: string, password: string, role: "customer" | "garage", metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"customer" | "garage" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Skip initialization if Supabase client is not available
    if (!supabase) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Supabase URL and key are not configured. Please check your environment variables.",
      });
      return;
    }

    // Check active session and get user
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
          
        if (profileData && !profileError) {
          setUserRole(profileData.role as "customer" | "garage");
        }
      }
      
      setIsLoading(false);
    };
    
    getSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
            
          if (data && !error) {
            setUserRole(data.role as "customer" | "garage");
          }
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string, role: "customer" | "garage") => {
    if (!supabase) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Supabase is not properly configured. Please check your environment variables.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if user exists and has the correct role
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profileError || !profile) {
          throw new Error("User profile not found");
        }
        
        if (profile.role !== role) {
          await supabase.auth.signOut();
          throw new Error(`Invalid account type. Please use the ${role} login.`);
        }
        
        setUserRole(profile.role as "customer" | "garage");
        
        // Redirect based on role
        navigate(role === "customer" ? "/customer-dashboard" : "/garage-dashboard");
        
        toast({
          title: "Login successful",
          description: `Welcome back to Mechanica!`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login",
      });
      console.error("Error signing in:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: "customer" | "garage", metadata = {}) => {
    if (!supabase) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Supabase is not properly configured. Please check your environment variables.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Create user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            ...metadata
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create a profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              email: data.user.email,
              role,
              ...metadata
            }
          ]);

        if (profileError) {
          throw profileError;
        }

        toast({
          title: "Account created",
          description: "Please check your email to confirm your account",
        });
        
        setUserRole(role);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
      });
      console.error("Error signing up:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Supabase is not properly configured. Please check your environment variables.",
      });
      return;
    }
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      navigate("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
      });
      console.error("Error signing out:", error.message);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    userRole,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
