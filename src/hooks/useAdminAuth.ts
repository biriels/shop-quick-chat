import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (error) {
          console.error("[Auth] Error checking admin role");
          return false;
        }

        return !!data;
      } catch {
        return false;
      }
    };

    const handleAuthChange = async (currentUser: User | null) => {
      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setChecking(false);
        navigate("/auth");
        return;
      }

      setUser(currentUser);
      const hasAdminRole = await checkAdminAccess(currentUser.id);
      
      if (!hasAdminRole) {
        setIsAdmin(false);
        setChecking(false);
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setChecking(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Defer async operations to avoid deadlock
        setTimeout(() => {
          handleAuthChange(session?.user ?? null);
        }, 0);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return { user, isAdmin, checking, signOut };
};
