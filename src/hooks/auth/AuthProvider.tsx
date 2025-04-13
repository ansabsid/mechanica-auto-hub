import React, { useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthContext from "./AuthContext";
import { fetchUserRole, createUserProfile, isDemoAccount, handleDemoAccount } from "./authUtils";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"customer" | "garage" | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authChangeHandled, setAuthChangeHandled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log("Auth: Getting initial session");
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error.message);
          setIsLoading(false);
          return;
        }
        
        const currentUser = data.session?.user ?? null;
        console.log("Auth: Initial session user:", currentUser?.email || "No user");
        setUser(currentUser);
        
        if (currentUser) {
          // Fetch user role - use timeout to avoid supabase listener deadlocks
          setTimeout(async () => {
            const role = await fetchUserRole(currentUser.id);
            if (role) {
              setUserRole(role);
              console.log("Auth: User role set to:", role);
            }
          }, 0);
        } else {
          // Clear auth state if no user is found
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Session retrieval error:", err);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        // Set user to null first to ensure clean state transitions
        if (event === 'SIGNED_OUT') {
          console.log("Setting user to null due to SIGNED_OUT event");
          setUser(null);
          setUserRole(null);
          setAuthChangeHandled(false);
          
          toast({
            title: "Logged out",
            description: "You have been successfully logged out",
          });
          
          return;
        }
        
        // Handle other auth events
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            // Use timeout to avoid supabase listener deadlocks
            setTimeout(async () => {
              const role = await fetchUserRole(currentUser.id);
              
              if (role) {
                console.log("Setting user role in auth state change:", role);
                setUserRole(role);
                
                // Only show toast when SIGNED_IN event occurs and hasn't been handled yet
                if (event === 'SIGNED_IN' && !authChangeHandled) {
                  setAuthChangeHandled(true);
                  
                  toast({
                    title: "Login successful",
                    description: `Welcome to Bookmyparts!`,
                  });
                }
              }
            }, 0);
          } catch (err) {
            console.error("Error in auth state change handler:", err);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, authChangeHandled]);

  const signIn = async (email: string, password: string, role: "customer" | "garage") => {
    setIsLoading(true);
    try {
      console.log(`Attempting to sign in with email: ${email}, role: ${role}`);
      
      // Special demo login handling
      if (isDemoAccount(email)) {
        console.log("Using demo account login flow");
        const demoResult = await handleDemoAccount(email);
        
        if (demoResult) {
          setUser(demoResult.user);
          setUserRole(demoResult.role);
          setAuthChangeHandled(true);
          
          const isGarageMasters = email === "garage-masters@bookmyparts.com";
          
          toast({
            title: isGarageMasters ? "Garage Masters login successful" : "Demo login successful",
            description: isGarageMasters 
              ? `Welcome to the Garage Masters dashboard!` 
              : `Welcome to the Bookmyparts garage demo!`,
          });
          
          setIsLoading(false);
          return;
        } else {
          throw new Error("Unable to log in with demo account");
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
        // Successful login - role checking will happen in the auth listener
        toast({
          title: "Processing login",
          description: "Authenticating your account...",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login",
      });
      setIsLoading(false);
      throw error; // Re-throw so form handler can catch it
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
        await createUserProfile(data.user.id, email, role);
        
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
      console.log("Signing out: Starting signOut process...");
      
      // Set loading state to true while signing out
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error.message);
        toast({
          variant: "destructive",
          title: "Logout failed",
          description: error.message || "An error occurred during logout",
        });
        throw error;
      }
      
      console.log("Signing out: Successfully signed out from Supabase");
      
      // Clear user state immediately to ensure UI updates
      setUser(null);
      setUserRole(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
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
