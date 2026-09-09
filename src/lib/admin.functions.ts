// @ts-nocheck
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!isAdmin) throw new Error("Forbidden");
}

export const getCurrentUserRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => r.role);
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (authError) throw new Error(authError.message);

    const userIds = (authUsers.users ?? []).map((u) => u.id);

    const { data: roles, error: rolesError } = await context.supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
    if (rolesError) throw new Error(rolesError.message);

    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
      roleMap.get(r.user_id)!.push(r.role);
    }

    type ProfileRow = { user_id: string; full_name?: string; phone?: string; avatar_url?: string };
    const { data: profiles, error: profilesError } = await context.supabase
      .from("profiles")
      .select("user_id, full_name, phone, avatar_url")
      .in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
    if (profilesError) throw new Error(profilesError.message);

    const profileMap = new Map<string, ProfileRow>((profiles ?? []).map((p: any) => [p.user_id, p]));

    return (authUsers.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      createdAt: u.created_at,
      fullName: profileMap.get(u.id)?.full_name ?? "",
      phone: profileMap.get(u.id)?.phone ?? "",
      avatarUrl: profileMap.get(u.id)?.avatar_url ?? "",
      roles: roleMap.get(u.id) ?? [],
    }));
  });

const setRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "user"]),
  active: z.boolean(),
});

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => setRoleSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);

    if (data.active) {
      const { error } = await context.supabase
        .from("user_roles")
        .insert({ user_id: data.userId, role: data.role })
        .single();
      if (error && error.code !== "23505") throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }

    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);

    const { count: propertiesCount } = await context.supabase
      .from("properties")
      .select("*", { count: "exact", head: true });
    const { count: usersCount } = await context.supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    const { count: adminsCount } = await context.supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    const { data: byCategory, error } = await context.supabase.rpc("count_properties_by_category");
    if (error) throw new Error(error.message);

    return {
      properties: propertiesCount ?? 0,
      users: usersCount ?? 0,
      admins: adminsCount ?? 0,
      byCategory: byCategory ?? [],
    };
  });
