import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import {
  LayoutGrid,
  Building2,
  Key,
  Banknote,
  MessageSquare,
  Star,
  Users,
  Settings,
  UserCircle,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;
    if (error || !user) throw redirect({ to: "/login" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/dashboard" });
    return {};
  },
  component: AdminLayout,
});

const navItems: { to: string; label: string; icon: typeof LayoutGrid; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/admin/listings", label: "Listings", icon: Building2 },
  { to: "/admin/rents", label: "Rents", icon: Key },
  { to: "/admin/sales", label: "Sales", icon: Banknote },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
  { to: "/admin/profile", label: "Profile", icon: UserCircle },
] as const;

function AdminLayout() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-3 py-4">
          <Link to="/admin" className="flex items-center gap-2 px-2">
            <img src={logo} alt="RentaGh" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-semibold text-sidebar-foreground">
              RentaGh Admin
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-2 px-3 py-4">
          {user?.email && (
            <p className="truncate px-2 text-xs text-sidebar-foreground/60">{user.email}</p>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <ArrowLeft />
                  <span>Back to site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => signOut()}>
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex min-h-svh w-full flex-col bg-background">
        <header className="flex h-14 items-center gap-3 border-b hairline px-4 md:hidden">
          <SidebarTrigger />
          <span className="font-display text-base font-semibold text-foreground">
            RentaGh Admin
          </span>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
