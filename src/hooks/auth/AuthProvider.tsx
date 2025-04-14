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
  const [session, setSession] = useState<Session | null>(null);
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
        setSession(currentSession);
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
      
      if (session?.user) {
        setTimeout(async () => {
          const role = await fetchUserRole(session.user.id);
          if (role) {
            setUserRole(role);
            console.log("Auth state change: User role set to:", role);
          } else {
            console.log("Auth state change: No role found for user");
          }
          
          checkUserProfile(session.user.id);
        }, 100);
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, role: "customer" | "garage") => {
    setIsLoading(true);
    try {
      console.log(`[AUTH DEBUG] Attempting to sign in with email: ${email}, role: ${role}`);
      
      if (isDemoAccount(email)) {
        console.log("[AUTH DEBUG] Using demo account login flow");
        const demoResult = await handleDemoAccount(email);
        
        if (demoResult?.user) {
          setUser(demoResult.user as User);
          if (demoResult.role === "customer" || demoResult.role === "garage") {
            setUserRole(demoResult.role);
          } else {
            console.error("[AUTH DEBUG] Invalid role received from demo account:", demoResult.role);
            setUserRole("customer"); // Default to customer if invalid role
          }
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

      console.log("[AUTH DEBUG] Calling supabase.auth.signInWithPassword");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AUTH DEBUG] Login error:", error.message);
        if (error.message.includes("Invalid login credentials") || 
            error.message.includes("Email not confirmed")) {
          throw new Error("Account not found. Please sign up first or check your credentials.");
        }
        throw error;
      }

      console.log("[AUTH DEBUG] Login successful, user data:", data.user ? {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata
      } : "No user data");

      if (data.user) {
        toast({
          title: "Processing login",
          description: "Authenticating your account...",
        });
      }
    } catch (error: any) {
      console.error("[AUTH DEBUG] Login error:", error);
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
      console.log("[AUTH DEBUG] Starting signup process with metadata:", JSON.stringify(metadata));
      console.log("[AUTH DEBUG] User role:", role);

      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email,
        password: password + '_checkonly',
      });

      if (existingUser?.user) {
        console.error("[AUTH DEBUG] User already exists:", existingUser.user.email);
        throw new Error("An account with this email already exists. Please log in instead.");
      }

      console.log("[AUTH DEBUG] User doesn't exist, proceeding with signup");

      const userMetadata = {
        role: role,
        firstName: metadata.firstName || null,
        lastName: metadata.lastName || null,
        fullPhone: metadata.fullPhone || (metadata.countryCode && metadata.phoneNumber ? `${metadata.countryCode}${metadata.phoneNumber}` : null),
        ...metadata
      };

      console.log("[AUTH DEBUG] Prepared user metadata for signup:", JSON.stringify(userMetadata));
      console.log("[AUTH DEBUG] Role being set in metadata:", role);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata
        }
      });

      if (error) {
        console.error("[AUTH DEBUG] Signup error from Supabase:", error);
        throw error;
      }

      if (data.user) {
        console.log("[AUTH DEBUG] User created successfully with ID:", data.user.id);
        console.log("[AUTH DEBUG] User metadata:", data.user.user_metadata);
        console.log("[AUTH DEBUG] Role from metadata:", data.user.user_metadata.role);
        console.log("[AUTH DEBUG] Now creating profile for user with role:", role);
        
        await createUserProfile(data.user.id, email, role, userMetadata);
        
        setTimeout(async () => {
          console.log("[AUTH DEBUG] Verifying profile creation for user:", data.user!.id);
          const profile = await checkUserProfile(data.user!.id);
          console.log("[AUTH DEBUG] Profile check after creation:", profile ? JSON.stringify(profile) : "No profile found");
          
          if (profile) {
            console.log("[AUTH DEBUG] Profile created successfully with role:", profile.role);
            console.log("[AUTH DEBUG] Profile firstName:", profile.firstName);
            console.log("[AUTH DEBUG] Profile lastName:", profile.lastName);
            console.log("[AUTH DEBUG] Profile phone:", profile.phone);
            
            if (role === "garage" && profile.hasOwnProperty('garage_name')) {
              console.log("[AUTH DEBUG] Garage specific data:");
              console.log("[AUTH DEBUG] Garage name:", (profile as any).garage_name || "Not set");
              console.log("[AUTH DEBUG] Garage location:", (profile as any).garage_location || "Not set");
              console.log("[AUTH DEBUG] Garage registration:", (profile as any).garage_registration_number || "Not set");
            }
          }
        }, 1000);
        
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
      console.error("[AUTH DEBUG] Signup error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
      });
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
