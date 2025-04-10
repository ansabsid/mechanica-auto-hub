
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, SupabaseClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  role: "customer" | "garage";
  created_at?: string;
  updated_at?: string;
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
    setIsLoading(true);
    try {
      // Special case for demo garage login
      if (email === "garage@example.com" && password === "garage123") {
        // Check if demo account exists
        const { data: userExists, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        // If demo account doesn't exist, create it
        if (checkError && checkError.code === 'PGRST116') {
          // First create the auth user
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: 'garage'
              }
            }
          });

          if (signUpError) {
            throw signUpError;
          }

          // Then create the profile
          if (signUpData.user) {
            // The database trigger should handle this, but let's be sure
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: signUpData.user.id,
                email: email,
                role: 'garage'
              });

            if (profileError) {
              console.error("Error creating demo profile:", profileError);
            }
          }
        }
      }

      // Proceed with normal login
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
          description: `Welcome back to Bookmyparts!`,
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
        // Create a record in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            role: role
          });
        
        if (profileError) {
          console.error("Error creating profile:", profileError);
          // We don't throw here because the auth user was created successfully
          // The database trigger should handle this automatically
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
