
import { useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthContext from "./AuthContext";
import { fetchUserRole, createUserProfile } from "./authUtils";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"customer" | "garage" | "admin" | null>(null);
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
      if (email === "demo@garage.com" && password === "garage123") {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!error && data.user) {
            const role = await fetchUserRole(data.user.id);
            
            if (!role) {
              throw new Error("User profile not found");
            }
            
            setUserRole(role);
            
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
          await createUserProfile(signUpData.user.id, email, 'garage');
          
          try {
            const { data: adminAuth } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (adminAuth.user) {
              setUser(adminAuth.user);
              setUserRole('garage');
              
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

      // Regular login process - simplified for faster processing
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
    setIsLoading(true);
    try {
      console.log("Signing out: Starting signOut process...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error.message);
        throw error;
      }
      
      console.log("Signing out: Successfully signed out from Supabase");
      
      // Clear user state immediately
      setUser(null);
      setUserRole(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Navigation will happen in components using the context
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
