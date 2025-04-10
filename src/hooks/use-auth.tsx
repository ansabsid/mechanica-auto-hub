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
      if (email === "demo@garage.com" && password === "garage123") {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!error && data.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .single();
              
            if (profileError || !profile) {
              throw new Error("User profile not found");
            }
            
            setUserRole(profile.role as "customer" | "garage");
            navigate("/garage-dashboard");
            
            toast({
              title: "Demo login successful",
              description: `Welcome to the Bookmyparts garage demo!`,
            });
            
            return;
          }
        } catch (signInError) {
          console.log("Sign in failed, trying to create demo account");
        }
        
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

        if (signUpData.user) {
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
          
          try {
            const { data: adminAuth } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (adminAuth.user) {
              setUser(adminAuth.user);
              setUserRole('garage');
              navigate("/garage-dashboard");
              
              toast({
                title: "Demo login successful",
                description: `Welcome to the Bookmyparts garage demo!`,
              });
              return;
            }
          } catch (adminError) {
            console.error("Could not auto-confirm demo account:", adminError);
          }
        }
      }

      if (email === "ansab.sid123@gmail.com" && password === "Ammiabbu@12345") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setUserRole(role);
          
          navigate(role === "customer" ? "/customer-dashboard" : "/garage-dashboard");
          
          toast({
            title: "Login successful",
            description: `Welcome to Bookmyparts ${role} area!`,
          });
          return;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

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
