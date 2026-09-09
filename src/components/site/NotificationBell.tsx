import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { getEnquiryNotifications } from "@/lib/enquiries.functions";
import { cn } from "@/lib/utils";

/** Bell with the number of enquiries the owner hasn't opened yet. */
export function NotificationBell({ solid }: { solid: boolean }) {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["enquiry-notifications"],
    queryFn: () => getEnquiryNotifications(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const unread = data?.unread ?? 0;

  return (
    <div className="relative">
      <button
        aria-label={unread ? `${unread} new enquiries` : "Notifications"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex items-center rounded-full p-2.5 transition-colors",
          solid ? "text-foreground/80 hover:bg-muted" : "text-white/90 hover:bg-white/10"
        )}
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-gold px-1 text-center text-[11px] font-bold leading-[18px] text-charcoal">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-[20px] border hairline bg-card shadow-[0_24px_60px_-30px_rgba(0,0,0,0.4)]">
          <div className="border-b hairline px-4 py-3 text-sm font-semibold text-foreground">
            {unread ? `${unread} new ${unread === 1 ? "enquiry" : "enquiries"}` : "No new enquiries"}
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {(data?.latest ?? []).map((n) => (
              <li key={n.id} className="border-b hairline px-4 py-3 last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{n.name}</span>
                  {n.status === "new" && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">New</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {n.propertyTitle} · {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
            {!(data?.latest ?? []).length && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Messages from your listings will appear here.
              </li>
            )}
          </ul>
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="block bg-muted px-4 py-3 text-center text-sm font-semibold text-primary"
          >
            Open inbox
          </Link>
        </div>
      )}
    </div>
  );
}
