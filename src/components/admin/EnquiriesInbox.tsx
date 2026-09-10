import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, MessageSquare, Send, Trash2 } from "lucide-react";
import { listMyEnquiries, updateEnquiryStatus, replyToEnquiry } from "@/lib/enquiries.functions";
import { adminDeleteEnquiry } from "@/lib/moderation.functions";

type Enquiry = Awaited<ReturnType<typeof listMyEnquiries>>[number];

const inboxFilters = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
] as const;

function EnquiryThread({ e }: { e: Enquiry }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(e.status === "new");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["my-enquiries"] });
  }

  const mark = useMutation({
    mutationFn: (status: "new" | "read" | "replied") =>
      updateEnquiryStatus({ data: { id: e.id, status } }),
    onSuccess: invalidate,
  });

  const reply = useMutation({
    mutationFn: () => replyToEnquiry({ data: { id: e.id, body } }),
    onSuccess: () => {
      setBody("");
      setError("");
      invalidate();
    },
    onError: (err: any) => setError(err?.message ?? "Could not send your reply."),
  });

  const remove = useMutation({
    mutationFn: () => adminDeleteEnquiry({ data: { id: e.id } }),
    onSuccess: invalidate,
  });

  return (
    <li className="rounded-[24px] border hairline bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-medium text-foreground">{e.name}</div>
          <div className="text-xs text-muted-foreground">
            {e.propertyTitle} · {new Date(e.createdAt).toLocaleDateString()}
            {e.replies.length > 0 &&
              ` · ${e.replies.length} ${e.replies.length === 1 ? "reply" : "replies"}`}
          </div>
        </div>
        <span
          className={
            e.status === "new"
              ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              : "rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/70"
          }
        >
          {e.status === "new" ? "New" : e.status === "read" ? "Read" : "Replied"}
        </span>
      </div>

      <p className="mt-3 text-sm text-foreground/80">{e.message}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <a
          href={`mailto:${e.email}`}
          className="inline-flex items-center gap-1.5 font-medium text-primary"
        >
          <Mail className="h-4 w-4" /> {e.email}
        </a>
        {e.phone && (
          <a
            href={`tel:${e.phone}`}
            className="inline-flex items-center gap-1.5 font-medium text-foreground/80"
          >
            <Phone className="h-4 w-4" /> {e.phone}
          </a>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border hairline bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground"
        >
          <MessageSquare className="h-3.5 w-3.5" /> {open ? "Hide thread" : "Open thread"}
        </button>
        {e.status === "new" && (
          <button
            onClick={() => mark.mutate("read")}
            className="rounded-full border hairline bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground"
          >
            Mark as read
          </button>
        )}
        {e.status === "replied" && (
          <button
            onClick={() => mark.mutate("read")}
            className="rounded-full border hairline bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground"
          >
            Mark unanswered
          </button>
        )}
        <button
          onClick={() => {
            if (confirm("Delete this enquiry permanently?")) remove.mutate();
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

      {open && (
        <div className="mt-5 border-t hairline pt-4">
          {e.replies.length > 0 && (
            <ul className="space-y-3">
              {e.replies.map((r) => (
                <li key={r.id} className="rounded-2xl bg-muted px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    You · {new Date(r.createdAt).toLocaleString()}
                  </div>
                  <p className="mt-1.5 text-sm text-foreground/85">{r.body}</p>
                </li>
              ))}
            </ul>
          )}

          <textarea
            value={body}
            onChange={(ev) => setBody(ev.target.value)}
            rows={3}
            placeholder={`Reply to ${e.name}…`}
            className="mt-3 w-full resize-none rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => reply.mutate()}
              disabled={reply.isPending || body.trim().length < 2}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> {reply.isPending ? "Sending…" : "Send reply"}
            </button>
            <button
              onClick={() =>
                setBody(
                  `Hello ${e.name}, thank you for your interest in ${e.propertyTitle}. The property is available — I can arrange a viewing at a time that suits you. Please confirm and share your preferred day.`,
                )
              }
              className="rounded-2xl border hairline bg-background px-5 py-3 text-sm font-semibold text-foreground"
            >
              Use confirmation template
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Your reply is saved on this thread. Use the email or phone link above to send it
            directly to the enquirer.
          </p>
        </div>
      )}
    </li>
  );
}

export function EnquiriesInbox() {
  const [filter, setFilter] = useState<(typeof inboxFilters)[number]["value"]>("all");
  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ["my-enquiries"],
    queryFn: () => listMyEnquiries(),
  });

  const visible = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
          Messages
        </h1>
        <div className="flex flex-wrap gap-2">
          {inboxFilters.map((f) => {
            const count =
              f.value === "all"
                ? enquiries.length
                : enquiries.filter((e) => e.status === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={
                  filter === f.value
                    ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                    : "rounded-full bg-muted px-3.5 py-1.5 text-xs font-semibold text-foreground/70 hover:bg-muted/70"
                }
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-[24px] border hairline bg-card p-10 text-center text-muted-foreground">
          Loading…
        </div>
      ) : !visible.length ? (
        <div className="mt-6 rounded-[24px] border hairline bg-card p-10 text-center text-muted-foreground">
          {enquiries.length
            ? "Nothing in this folder."
            : "No one has messaged you yet. Enquiries from property pages arrive here."}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((e) => (
            <EnquiryThread key={e.id} e={e} />
          ))}
        </ul>
      )}
    </section>
  );
}
