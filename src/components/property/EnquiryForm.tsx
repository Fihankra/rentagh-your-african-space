import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Send } from "lucide-react";
import { sendEnquiry } from "@/lib/enquiries.functions";

export function EnquiryForm({ propertyId, ownerName }: { propertyId: string; ownerName: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const mutation = useMutation({
    mutationFn: () =>
      sendEnquiry({
        data: {
          propertyId,
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message: form.message,
        },
      }),
  });

  if (mutation.isSuccess) {
    return (
      <div className="rounded-2xl bg-[color:var(--cream)] p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <div className="mt-3 font-display text-lg text-foreground">Message sent</div>
        <p className="mt-1 text-sm text-foreground/70">
          {ownerName} has your details and will get back to you directly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="mt-6 space-y-3"
    >
      <input
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Your name"
        className="block w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <input
        required
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Email address"
        className="block w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <input
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="Phone number (optional)"
        className="block w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <textarea
        required
        rows={4}
        minLength={10}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="Tell the owner what you need — move-in date, questions, viewing time…"
        className="block w-full resize-none rounded-2xl border hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <button
        disabled={mutation.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {mutation.isPending ? "Sending…" : "Send enquiry"}
      </button>
      {mutation.isError && (
        <p className="text-sm text-red-600">
          {(mutation.error as Error).message || "Could not send that message. Please try again."}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Your details are shared only with this listing's owner.
      </p>
    </form>
  );
}
