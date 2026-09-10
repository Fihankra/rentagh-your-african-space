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
      // getSession() reads the already-verified local session (no network
      // round trip); avoids the extra latency of getUser()'s server check on
      // every page load. Server-side actions still re-verify independently.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      const authUser = session?.user;
      if (authUser) {
        const [{ data: profile }, { data: roles }] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", authUser.id)
            .single(),
          supabase.from("user_roles").select("role").eq("user_id", authUser.id),
        ]);
        if (!mounted) return;
        setUser({
          id: authUser.id,
          email: authUser.email,
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
