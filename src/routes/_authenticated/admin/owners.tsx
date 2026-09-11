import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UserSquare2 } from "lucide-react";
import { adminCreateOwner, adminDeleteOwner, adminListOwners } from "@/lib/owners.functions";

export const Route = createFileRoute("/_authenticated/admin/owners")({
  component: AdminOwners,
  head: () => ({
    meta: [{ title: "Property Owners | RentaGh Admin" }],
  }),
});

const emptyForm = { fullName: "", phone: "", email: "", idNumber: "", address: "", notes: "" };

function AdminOwners() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: owners, isLoading } = useQuery({
    queryKey: ["admin-owners"],
    queryFn: () => adminListOwners(),
  });

  const create = useMutation({
    mutationFn: adminCreateOwner,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-owners"] });
      setForm(emptyForm);
      setOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: adminDeleteOwner,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-owners"] }),
  });

  const totalProperties = (owners ?? []).reduce((sum, o) => sum + o.propertyCount, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Property Owners
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Landlords and sellers RentaGh sources properties from. They never deal with tenants or
            buyers directly — RentaGh is the go-between.
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add owner
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Total owners" value={owners?.length ?? 0} icon={UserSquare2} />
        <StatCard label="Properties under management" value={totalProperties} icon={UserSquare2} />
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({ data: form });
          }}
          className="mt-6 grid gap-3 rounded-[20px] border hairline bg-card p-5 sm:grid-cols-2"
        >
          <Field label="Full name" required>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="ID number">
            <input
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Address" full>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Notes" full>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="input resize-none"
            />
          </Field>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {create.isPending ? "Saving…" : "Save owner"}
            </button>
          </div>
        </form>
      )}

      <section className="mt-6 overflow-hidden rounded-[20px] border hairline bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Contact</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">ID number</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Properties</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(owners ?? []).map((o) => (
                <tr key={o.id} className="border-t hairline">
                  <td className="px-4 py-3 font-medium text-foreground">{o.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[o.phone, o.email].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.idNumber || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {o.propertyCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => remove.mutate({ data: { id: o.id } })}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && (owners ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No property owners yet. Add the first landlord or seller.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof UserSquare2;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] border hairline bg-card p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display text-2xl font-semibold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={full ? "sm:col-span-2" : undefined}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {required && " *"}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
