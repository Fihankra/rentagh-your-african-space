import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Contact, Plus, Trash2 } from "lucide-react";
import {
  adminCreateCustomer,
  adminDeleteCustomer,
  adminListCustomers,
} from "@/lib/customers.functions";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: AdminCustomers,
  head: () => ({
    meta: [{ title: "Tenants & Buyers | RentaGh Admin" }],
  }),
});

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  idNumber: "",
  customerType: "tenant" as "tenant" | "buyer",
  notes: "",
};

function AdminCustomers() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<"all" | "tenant" | "buyer">("all");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => adminListCustomers(),
  });

  const create = useMutation({
    mutationFn: adminCreateCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      setForm(emptyForm);
      setOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: adminDeleteCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-customers"] }),
  });

  const list = (customers ?? []).filter((c) => filter === "all" || c.customerType === filter);
  const tenantCount = (customers ?? []).filter((c) => c.customerType === "tenant").length;
  const buyerCount = (customers ?? []).filter((c) => c.customerType === "buyer").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Tenants &amp; Buyers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The people RentaGh signs rent agreements or sale deals with. They never meet the
            landlord or the original owner.
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add customer
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Tenants" value={tenantCount} icon={Contact} />
        <StatCard label="Buyers" value={buyerCount} icon={Contact} />
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
          <Field label="Type" required>
            <select
              value={form.customerType}
              onChange={(e) =>
                setForm({ ...form, customerType: e.target.value as "tenant" | "buyer" })
              }
              className="input"
            >
              <option value="tenant">Tenant</option>
              <option value="buyer">Buyer</option>
            </select>
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
              {create.isPending ? "Saving…" : "Save customer"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 flex gap-2">
        {(["all", "tenant", "buyer"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground/70 hover:bg-muted/70"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="mt-4 overflow-hidden rounded-[20px] border hairline bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Contact</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">ID number</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t hairline">
                  <td className="px-4 py-3 font-medium text-foreground">{c.fullName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        c.customerType === "tenant"
                          ? "bg-primary/10 text-primary"
                          : "bg-gold/15 text-gold"
                      }`}
                    >
                      {c.customerType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[c.phone, c.email].filter(Boolean).join(" · ") || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.idNumber || "N/A"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => remove.mutate({ data: { id: c.id } })}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No {filter === "all" ? "customers" : `${filter}s`} yet.
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
  icon: typeof Contact;
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
