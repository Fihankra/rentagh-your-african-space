import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, Plus } from "lucide-react";
import { adminListProperties } from "@/lib/properties.functions";
import { adminListOwnerOptions } from "@/lib/owners.functions";
import { adminListCustomerOptions } from "@/lib/customers.functions";
import {
  adminCreateSaleTransaction,
  adminListSaleTransactions,
  adminUpdateSaleTransaction,
} from "@/lib/deals.functions";

export const Route = createFileRoute("/_authenticated/admin/sales")({
  component: AdminSales,
  head: () => ({
    meta: [{ title: "Sale Transactions | RentaGh Admin" }],
  }),
});

const emptyAcquire = {
  propertyId: "",
  ownerId: "",
  acquisitionCost: "",
  acquisitionDate: new Date().toISOString().slice(0, 10),
};

function AdminSales() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyAcquire);
  const [sellRow, setSellRow] = useState<string | null>(null);
  const [sellForm, setSellForm] = useState({ buyerId: "", salePrice: "", saleDate: "" });

  const { data: sales, isLoading } = useQuery({
    queryKey: ["admin-sale-transactions"],
    queryFn: () => adminListSaleTransactions(),
  });
  const { data: properties } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => adminListProperties(),
  });
  const { data: owners } = useQuery({
    queryKey: ["admin-owner-options"],
    queryFn: () => adminListOwnerOptions(),
  });
  const { data: buyers } = useQuery({
    queryKey: ["admin-customer-options", "buyer"],
    queryFn: () => adminListCustomerOptions({ data: { customerType: "buyer" } }),
  });

  const acquire = useMutation({
    mutationFn: adminCreateSaleTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sale-transactions"] });
      setForm(emptyAcquire);
      setOpen(false);
    },
  });

  const update = useMutation({
    mutationFn: adminUpdateSaleTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sale-transactions"] });
      setSellRow(null);
    },
  });

  const saleForSale = (properties ?? []).filter((p) => p.listingType === "sale");
  const held = (sales ?? []).filter((s) => s.status !== "sold").length;
  const totalProfit = (sales ?? []).reduce((sum, s) => sum + (s.profit ?? 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Sale Transactions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            RentaGh buys the property outright, holds it as inventory, then resells it to a
            buyer at a profit.
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Record acquisition
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Held / listed" value={held} icon={Banknote} />
        <StatCard label="Total profit (GHS)" value={totalProfit} icon={Banknote} money />
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            acquire.mutate({
              data: {
                propertyId: form.propertyId,
                ownerId: form.ownerId || undefined,
                acquisitionCost: Number(form.acquisitionCost),
                acquisitionDate: form.acquisitionDate,
              },
            });
          }}
          className="mt-6 grid gap-3 rounded-[20px] border hairline bg-card p-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field label="Property" required>
            <select
              required
              value={form.propertyId}
              onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
              className="input"
            >
              <option value="">Select a listing…</option>
              {saleForSale.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Seller (owner)">
            <select
              value={form.ownerId}
              onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              className="input"
            >
              <option value="">None on file</option>
              {(owners ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.fullName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Acquisition cost (GHS)" required>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.acquisitionCost}
              onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Acquisition date" required>
            <input
              required
              type="date"
              value={form.acquisitionDate}
              onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
              className="input"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={acquire.isPending}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {acquire.isPending ? "Saving…" : "Save acquisition"}
            </button>
          </div>
        </form>
      )}

      <section className="mt-6 overflow-hidden rounded-[20px] border hairline bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Property</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Seller</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Acquired for</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Sold for</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Profit</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(sales ?? []).map((s) => (
                <tr key={s.id} className="border-t hairline">
                  <td className="px-4 py-3 font-medium text-foreground">{s.propertyTitle}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.ownerName ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">
                    GHS {s.acquisitionCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {s.salePrice != null ? `GHS ${s.salePrice.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {s.profit != null ? (
                      <span
                        className={
                          s.profit >= 0 ? "font-semibold text-primary" : "font-semibold text-red-700"
                        }
                      >
                        GHS {s.profit.toLocaleString()}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        s.status === "sold"
                          ? "bg-primary/10 text-primary"
                          : s.status === "listed"
                            ? "bg-gold/15 text-gold"
                            : "bg-muted text-foreground/60"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.status !== "sold" ? (
                      sellRow === s.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            update.mutate({
                              data: {
                                id: s.id,
                                status: "sold",
                                buyerId: sellForm.buyerId || undefined,
                                salePrice: Number(sellForm.salePrice),
                                saleDate: sellForm.saleDate,
                              },
                            });
                          }}
                          className="flex flex-wrap items-center gap-1.5"
                        >
                          <select
                            required
                            value={sellForm.buyerId}
                            onChange={(e) =>
                              setSellForm({ ...sellForm, buyerId: e.target.value })
                            }
                            className="input w-32 py-1.5 text-xs"
                          >
                            <option value="">Buyer…</option>
                            {(buyers ?? []).map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.fullName}
                              </option>
                            ))}
                          </select>
                          <input
                            required
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="Sale price"
                            value={sellForm.salePrice}
                            onChange={(e) =>
                              setSellForm({ ...sellForm, salePrice: e.target.value })
                            }
                            className="input w-24 py-1.5 text-xs"
                          />
                          <input
                            required
                            type="date"
                            value={sellForm.saleDate}
                            onChange={(e) =>
                              setSellForm({ ...sellForm, saleDate: e.target.value })
                            }
                            className="input w-32 py-1.5 text-xs"
                          />
                          <button
                            type="submit"
                            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                          >
                            Confirm
                          </button>
                        </form>
                      ) : (
                        <div className="flex gap-1.5">
                          {s.status === "held" && (
                            <button
                              onClick={() =>
                                update.mutate({ data: { id: s.id, status: "listed" } })
                              }
                              className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/70"
                            >
                              Mark listed
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSellForm({
                                buyerId: "",
                                salePrice: "",
                                saleDate: new Date().toISOString().slice(0, 10),
                              });
                              setSellRow(s.id);
                            }}
                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                          >
                            Mark sold
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">Deal closed</span>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && (sales ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No sale transactions yet.
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
  money,
}: {
  label: string;
  value: number;
  icon: typeof Banknote;
  money?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] border hairline bg-card p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display text-2xl font-semibold text-foreground">
          {money ? value.toLocaleString() : value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {required && " *"}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
