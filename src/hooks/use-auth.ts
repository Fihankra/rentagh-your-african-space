import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", data.user.id)
          .single();
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email,
          fullName: profile?.full_name ?? undefined,
          avatarUrl: profile?.avatar_url ?? undefined,
        });
        setIsAdmin((roles ?? []).some((r: any) => r.role === "admin"));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    }

    refresh();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }

  return { user, isAdmin, loading, signOut };
}
