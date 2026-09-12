import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wallet, Key, Banknote } from "lucide-react";
import { adminCommissionsSummary } from "@/lib/deals.functions";

export const Route = createFileRoute("/_authenticated/admin/commissions")({
  component: AdminCommissions,
  head: () => ({
    meta: [{ title: "Commissions | RentaGh Admin" }],
  }),
});

function AdminCommissions() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-commissions"],
    queryFn: () => adminCommissionsSummary(),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
        Commissions
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        What RentaGh actually earns: rent commission collected each period, plus profit from resold
        properties.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Rent commission" value={data?.rentCommissionTotal ?? 0} icon={Key} />
        <StatCard label="Sale profit" value={data?.saleProfitTotal ?? 0} icon={Banknote} />
        <StatCard label="Total revenue" value={data?.total ?? 0} icon={Wallet} highlight />
      </div>

      <section className="mt-6 overflow-hidden rounded-[20px] border hairline bg-card">
        <div className="border-b hairline px-4 py-3 text-sm font-semibold text-foreground">
          Revenue ledger
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Source</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Property</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Party</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Amount (GHS)</th>
              </tr>
            </thead>
            <tbody>
              {(data?.entries ?? []).map((e) => (
                <tr key={`${e.type}-${e.id}`} className="border-t hairline">
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        e.type === "rent" ? "bg-primary/10 text-primary" : "bg-gold/15 text-gold"
                      }`}
                    >
                      {e.type === "rent" ? "Rent commission" : "Sale profit"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{e.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.subLabel ?? "N/A"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.date ?? "N/A"}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {e.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {!isLoading && (data?.entries ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No revenue recorded yet. Collect a rent payment or close a sale to see it here.
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
  highlight,
}: {
  label: string;
  value: number;
  icon: typeof Wallet;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-[20px] border hairline p-5 ${
        highlight ? "bg-primary text-primary-foreground" : "bg-card"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          highlight ? "bg-white/15" : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display text-2xl font-semibold">GHS {value.toLocaleString()}</div>
        <div className={`text-xs ${highlight ? "text-white/70" : "text-muted-foreground"}`}>
          {label}
        </div>
      </div>
    </div>
  );
}
