
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
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error.message);
          setIsLoading(false);
          return;
        }
        
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
          } else if (profileError) {
            console.error("Error fetching user profile:", profileError.message);
          }
        }
      } catch (err) {
        console.error("Session retrieval error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', currentUser.id)
              .single();
              
            if (data && !error) {
              setUserRole(data.role as "customer" | "garage");
              
              // Navigate based on role when login is detected
              if (event === 'SIGNED_IN') {
                navigate(data.role === "customer" ? "/customer-dashboard" : "/garage-dashboard");
                
                toast({
                  title: "Login successful",
                  description: `Welcome to Bookmyparts!`,
                });
              }
            } else if (error) {
              console.error("Error fetching user profile after auth change:", error.message);
            }
          } catch (err) {
            console.error("Error in auth state change handler:", err);
          }
        } else {
          setUserRole(null);
          
          // If user signed out, navigate to login
          if (event === 'SIGNED_OUT') {
            console.log("User signed out, navigating to login");
            navigate("/login");
            
            toast({
              title: "Logged out",
              description: "You have been successfully logged out",
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  const signIn = async (email: string, password: string, role: "customer" | "garage") => {
    setIsLoading(true);
    try {
      console.log(`Attempting to sign in with email: ${email}, role: ${role}`);
      
      // Special demo login handling
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

      // Regular login process
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) {
            console.error("Profile error:", profileError);
            throw new Error("User profile not found");
          }
          
          // If profile exists but role doesn't match, sign out
          if (profile && profile.role !== role) {
            await supabase.auth.signOut();
            throw new Error(`Invalid account type. Please use the ${role} login.`);
          }
          
          setUserRole(profile?.role as "customer" | "garage");
          
          navigate(role === "customer" ? "/customer-dashboard" : "/garage-dashboard");
          
          toast({
            title: "Login successful",
            description: `Welcome back to Bookmyparts!`,
          });
        } catch (profileFetchError: any) {
          console.error("Error fetching profile after login:", profileFetchError);
          throw profileFetchError;
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login",
      });
      throw error; // Re-throw so form handler can catch it
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
    setIsLoading(true);
    try {
      console.log("Signing out: Starting signOut process...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error.message);
        throw error;
      }
      
      console.log("Signing out: Successfully signed out from Supabase");
      setUser(null);
      setUserRole(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // The navigation will happen in the auth state change listener
      // This is to ensure the auth state is updated first
      console.log("Signing out: Auth state should update and trigger navigation");
    } catch (error: any) {
      console.error("Error in signOut function:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
      });
    } finally {
      setIsLoading(false);
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
