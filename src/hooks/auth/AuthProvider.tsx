
import React, { useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthContext from "./AuthContext";
import { fetchUserRole, createUserProfile, isDemoAccount, handleDemoAccount } from "./authUtils";
import { AuthContextType } from "./types";
import { checkUserProfile } from "@/hooks/useProfileDebugger";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Added session state
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
        
        const currentSession = data.session;
        const currentUser = currentSession?.user ?? null;
        
        console.log("Auth: Initial session user:", currentUser?.email || "No user");
        setSession(currentSession); // Set the session
        setUser(currentUser);
        
        if (currentUser) {
          setTimeout(async () => {
            const role = await fetchUserRole(currentUser.id);
            if (role) {
              setUserRole(role);
              console.log("Auth: User role set to:", role);
            }
          }, 0);
        } else {
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
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Debug: Check profile data when user logs in
      if (session?.user) {
        checkUserProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, role: "customer" | "garage") => {
    setIsLoading(true);
    try {
      console.log(`Attempting to sign in with email: ${email}, role: ${role}`);
      
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials") || 
            error.message.includes("Email not confirmed")) {
          throw new Error("Account not found. Please sign up first or check your credentials.");
        }
        throw error;
      }

      if (data.user) {
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
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: "customer" | "garage", metadata: UserMetadata = {}) => {
    setIsLoading(true);
    try {
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email,
        password: password + '_checkonly',
      });

      if (existingUser?.user) {
        throw new Error("An account with this email already exists. Please log in instead.");
      }

      console.log("Creating new user with metadata:", metadata);

      const userMetadata = {
        role,
        firstName: metadata.firstName || null,
        lastName: metadata.lastName || null,
        fullPhone: metadata.fullPhone || (metadata.countryCode && metadata.phoneNumber ? `${metadata.countryCode}${metadata.phoneNumber}` : null),
        ...metadata
      };

      console.log("Prepared user metadata:", userMetadata);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata // This metadata will be available in raw_user_meta_data
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create the user profile explicitly since we can't rely solely on triggers
        console.log("User created, now creating profile");
        await createUserProfile(data.user.id, email, role, userMetadata);
        
        toast({
          variant: "default",
          title: "Account created successfully",
          description: "You can now log in with your credentials.",
        });
        
        setUserRole(role);
        return { success: true, message: "Account created successfully" };
      }
      
      return { success: false, message: "Failed to create account" };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
      });
      console.error("Error signing up:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out: Starting signOut process...");
      
      setUser(null);
      setUserRole(null);
      setAuthChangeHandled(false);
      
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
      
      setUser(null);
      setUserRole(null);
      setAuthChangeHandled(false);
      
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

  const value: AuthContextType = {
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

export default AuthProvider;
