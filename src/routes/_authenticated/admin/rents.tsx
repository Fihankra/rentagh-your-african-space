import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Key, Plus, Receipt } from "lucide-react";
import { adminListProperties } from "@/lib/properties.functions";
import { adminListOwnerOptions } from "@/lib/owners.functions";
import { adminListCustomerOptions } from "@/lib/customers.functions";
import {
  adminCreateRentAgreement,
  adminCreateRentPayment,
  adminListRentAgreements,
  adminListRentPayments,
  adminUpdateRentAgreementStatus,
  adminUpdateRentPaymentStatus,
} from "@/lib/deals.functions";

export const Route = createFileRoute("/_authenticated/admin/rents")({
  component: AdminRents,
  head: () => ({
    meta: [{ title: "Rent Agreements | RentaGh Admin" }],
  }),
});

const emptyAgreement = {
  propertyId: "",
  ownerId: "",
  tenantId: "",
  rentAmount: "",
  pricePeriod: "month" as "night" | "month" | "year" | "total",
  commissionRate: "",
  depositAmount: "",
  startDate: new Date().toISOString().slice(0, 10),
};

const emptyPayment = {
  rentAgreementId: "",
  periodStart: "",
  periodEnd: "",
  amountDue: "",
  commissionAmount: "",
};

function AdminRents() {
  const qc = useQueryClient();
  const [openAgreement, setOpenAgreement] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [agreementForm, setAgreementForm] = useState(emptyAgreement);
  const [paymentForm, setPaymentForm] = useState(emptyPayment);

  const { data: agreements, isLoading } = useQuery({
    queryKey: ["admin-rent-agreements"],
    queryFn: () => adminListRentAgreements(),
  });
  const { data: payments } = useQuery({
    queryKey: ["admin-rent-payments"],
    queryFn: () => adminListRentPayments({ data: {} }),
  });
  const { data: properties } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => adminListProperties(),
  });
  const { data: owners } = useQuery({
    queryKey: ["admin-owner-options"],
    queryFn: () => adminListOwnerOptions(),
  });
  const { data: tenants } = useQuery({
    queryKey: ["admin-customer-options", "tenant"],
    queryFn: () => adminListCustomerOptions({ data: { customerType: "tenant" } }),
  });

  const createAgreement = useMutation({
    mutationFn: adminCreateRentAgreement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rent-agreements"] });
      setAgreementForm(emptyAgreement);
      setOpenAgreement(false);
    },
  });

  const updateAgreementStatus = useMutation({
    mutationFn: adminUpdateRentAgreementStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rent-agreements"] }),
  });

  const createPayment = useMutation({
    mutationFn: adminCreateRentPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rent-payments"] });
      setPaymentForm(emptyPayment);
      setOpenPayment(false);
    },
  });

  const updatePaymentStatus = useMutation({
    mutationFn: adminUpdateRentPaymentStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rent-payments"] }),
  });

  const activeCount = (agreements ?? []).filter((a) => a.status === "active").length;
  const rentableProperties = (properties ?? []).filter((p) => p.listingType === "rent");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Rent Agreements
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            RentaGh signs the tenant directly and collects rent, paying the landlord minus
            commission each period.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenPayment((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border hairline bg-card px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            <Receipt className="h-4 w-4" />
            Record payment
          </button>
          <button
            onClick={() => setOpenAgreement((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            New agreement
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Active tenancies" value={activeCount} icon={Key} />
        <StatCard label="Total agreements" value={agreements?.length ?? 0} icon={Key} />
      </div>

      {openAgreement && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createAgreement.mutate({
              data: {
                propertyId: agreementForm.propertyId,
                ownerId: agreementForm.ownerId || undefined,
                tenantId: agreementForm.tenantId,
                rentAmount: Number(agreementForm.rentAmount),
                pricePeriod: agreementForm.pricePeriod,
                commissionRate: agreementForm.commissionRate
                  ? Number(agreementForm.commissionRate)
                  : undefined,
                depositAmount: agreementForm.depositAmount
                  ? Number(agreementForm.depositAmount)
                  : undefined,
                startDate: agreementForm.startDate,
              },
            });
          }}
          className="mt-6 grid gap-3 rounded-[20px] border hairline bg-card p-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Field label="Property" required>
            <select
              required
              value={agreementForm.propertyId}
              onChange={(e) => setAgreementForm({ ...agreementForm, propertyId: e.target.value })}
              className="input"
            >
              <option value="">Select a listing…</option>
              {rentableProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Landlord (owner)">
            <select
              value={agreementForm.ownerId}
              onChange={(e) => setAgreementForm({ ...agreementForm, ownerId: e.target.value })}
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
          <Field label="Tenant" required>
            <select
              required
              value={agreementForm.tenantId}
              onChange={(e) => setAgreementForm({ ...agreementForm, tenantId: e.target.value })}
              className="input"
            >
              <option value="">Select a tenant…</option>
              {(tenants ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rent amount (GHS)" required>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={agreementForm.rentAmount}
              onChange={(e) => setAgreementForm({ ...agreementForm, rentAmount: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Period" required>
            <select
              value={agreementForm.pricePeriod}
              onChange={(e) =>
                setAgreementForm({
                  ...agreementForm,
                  pricePeriod: e.target.value as typeof agreementForm.pricePeriod,
                })
              }
              className="input"
            >
              <option value="month">Per month</option>
              <option value="year">Per year</option>
              <option value="night">Per night</option>
              <option value="total">Total</option>
            </select>
          </Field>
          <Field label="Commission rate (%)">
            <input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={agreementForm.commissionRate}
              onChange={(e) =>
                setAgreementForm({ ...agreementForm, commissionRate: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="Deposit (GHS)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={agreementForm.depositAmount}
              onChange={(e) =>
                setAgreementForm({ ...agreementForm, depositAmount: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="Start date" required>
            <input
              required
              type="date"
              value={agreementForm.startDate}
              onChange={(e) => setAgreementForm({ ...agreementForm, startDate: e.target.value })}
              className="input"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={createAgreement.isPending}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {createAgreement.isPending ? "Saving…" : "Save agreement"}
            </button>
          </div>
        </form>
      )}

      {openPayment && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const amountDue = Number(paymentForm.amountDue);
            const commissionAmount = Number(paymentForm.commissionAmount) || 0;
            createPayment.mutate({
              data: {
                rentAgreementId: paymentForm.rentAgreementId,
                periodStart: paymentForm.periodStart,
                periodEnd: paymentForm.periodEnd,
                amountDue,
                commissionAmount,
                payoutAmount: Math.max(0, amountDue - commissionAmount),
              },
            });
          }}
          className="mt-6 grid gap-3 rounded-[20px] border hairline bg-card p-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field label="Agreement" required>
            <select
              required
              value={paymentForm.rentAgreementId}
              onChange={(e) => setPaymentForm({ ...paymentForm, rentAgreementId: e.target.value })}
              className="input"
            >
              <option value="">Select an agreement…</option>
              {(agreements ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.propertyTitle} ({a.tenantName})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Period start" required>
            <input
              required
              type="date"
              value={paymentForm.periodStart}
              onChange={(e) => setPaymentForm({ ...paymentForm, periodStart: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Period end" required>
            <input
              required
              type="date"
              value={paymentForm.periodEnd}
              onChange={(e) => setPaymentForm({ ...paymentForm, periodEnd: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Amount due (GHS)" required>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={paymentForm.amountDue}
              onChange={(e) => setPaymentForm({ ...paymentForm, amountDue: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Commission (GHS)" required>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={paymentForm.commissionAmount}
              onChange={(e) => setPaymentForm({ ...paymentForm, commissionAmount: e.target.value })}
              className="input"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={createPayment.isPending}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {createPayment.isPending ? "Saving…" : "Save payment"}
            </button>
          </div>
        </form>
      )}

      <section className="mt-6 overflow-hidden rounded-[20px] border hairline bg-card">
        <div className="border-b hairline px-4 py-3 text-sm font-semibold text-foreground">
          Agreements
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Property</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Tenant</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Landlord</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Rent</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(agreements ?? []).map((a) => (
                <tr key={a.id} className="border-t hairline">
                  <td className="px-4 py-3 font-medium text-foreground">{a.propertyTitle}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.tenantName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.ownerName ?? "N/A"}</td>
                  <td className="px-4 py-3 text-foreground">
                    GHS {a.rentAmount.toLocaleString()} / {a.pricePeriod}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    {a.status === "active" ? (
                      <button
                        onClick={() =>
                          updateAgreementStatus.mutate({ data: { id: a.id, status: "ended" } })
                        }
                        className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/70"
                      >
                        Mark ended
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          updateAgreementStatus.mutate({ data: { id: a.id, status: "active" } })
                        }
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && (agreements ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No rent agreements yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[20px] border hairline bg-card">
        <div className="border-b hairline px-4 py-3 text-sm font-semibold text-foreground">
          Recent payments
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Property / tenant</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Period</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Due</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Commission</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(payments ?? []).map((p) => (
                <tr key={p.id} className="border-t hairline">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{p.propertyTitle}</div>
                    <div className="text-xs text-muted-foreground">{p.tenantName}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.periodStart} – {p.periodEnd}
                  </td>
                  <td className="px-4 py-3 text-foreground">GHS {p.amountDue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-foreground">
                    GHS {p.commissionAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {p.status === "pending" && (
                        <button
                          onClick={() =>
                            updatePaymentStatus.mutate({
                              data: { id: p.id, status: "collected" },
                            })
                          }
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                        >
                          Mark collected
                        </button>
                      )}
                      {p.status === "collected" && (
                        <button
                          onClick={() =>
                            updatePaymentStatus.mutate({
                              data: { id: p.id, status: "paid_to_landlord" },
                            })
                          }
                          className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold"
                        >
                          Mark paid to landlord
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(payments ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No payments recorded yet.
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    ended: "bg-muted text-foreground/60",
    terminated: "bg-red-100 text-red-800",
    pending: "bg-muted text-foreground/60",
    collected: "bg-primary/10 text-primary",
    paid_to_landlord: "bg-gold/15 text-gold",
    overdue: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] ?? "bg-muted text-foreground/60"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Key;
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
