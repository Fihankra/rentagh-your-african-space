import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { adminListUsers, adminSetUserRole, adminStats } from "@/lib/admin.functions";
import { claimFirstAdmin } from "@/lib/properties.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
  head: () => ({
    meta: [{ title: "Users | RentaGh Admin" }],
  }),
});

function AdminUsers() {
  const qc = useQueryClient();
  const { data: users } = useQuery({ queryKey: ["admin-users"], queryFn: () => adminListUsers() });
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => adminStats() });

  const setRole = useMutation({
    mutationFn: adminSetUserRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const claimMutation = useMutation({
    mutationFn: claimFirstAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-stats"] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">Users</h1>
      {users && (
        <section className="mt-6 overflow-hidden rounded-[20px] border hairline bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Roles</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t hairline">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.fullName || "Not set"}</td>
                    <td className="px-4 py-3">{u.roles.length ? u.roles.join(", ") : "user"}</td>
                    <td className="px-4 py-3">
                      {u.roles.includes("admin") ? (
                        <button
                          onClick={() =>
                            setRole.mutate({ data: { userId: u.id, role: "admin", active: false } })
                          }
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800"
                        >
                          Remove admin
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setRole.mutate({ data: { userId: u.id, role: "admin", active: true } })
                          }
                          className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                        >
                          Make admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stats?.admins === 0 && (
            <div className="flex items-start gap-3 border-t hairline p-4 text-sm text-amber-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p>No admins exist yet. You can claim the first admin role.</p>
                <button
                  onClick={() => claimMutation.mutate({})}
                  disabled={claimMutation.isPending}
                  className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {claimMutation.isPending ? "Claiming…" : "Claim first admin"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
