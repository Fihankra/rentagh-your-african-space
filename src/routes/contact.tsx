import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Mail, Phone, MapPin, Check } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact RentaGh — List, partner or get support" },
      { name: "description", content: "Talk to the RentaGh team about listing your property, partnerships, press or support across Ghana." },
      { property: "og:title", content: "Contact RentaGh" },
      { property: "og:description", content: "Talk to the RentaGh team." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <SiteHeader />
      <main className="container-x pt-32 pb-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Get in touch</div>
            <h1 className="mt-3 font-display text-5xl font-semibold text-foreground md:text-6xl">
              Let's build your <span className="italic text-[color:var(--accent)]">next move</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/80">
              Whether you're a landlord with a portfolio, a developer with a new community, or a traveler planning a long stay — our team replies within one business day.
            </p>

            <ul className="mt-10 space-y-5">
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Mail className="h-5 w-5" /></span>
                <div>
                  <div className="font-display text-lg text-foreground">hello@rentagh.com</div>
                  <div className="text-sm text-muted-foreground">General inquiries · partnerships · press</div>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Phone className="h-5 w-5" /></span>
                <div>
                  <div className="font-display text-lg text-foreground">+233 30 000 0000</div>
                  <div className="text-sm text-muted-foreground">Mon – Sat · 8:00 – 20:00 GMT</div>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><MapPin className="h-5 w-5" /></span>
                <div>
                  <div className="font-display text-lg text-foreground">Airport City, Accra</div>
                  <div className="text-sm text-muted-foreground">By appointment only</div>
                </div>
              </li>
            </ul>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="rounded-[32px] border hairline bg-card p-8 shadow-[var(--shadow-card)]"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" placeholder="Ama" />
              <Field label="Last name" placeholder="Mensah" />
              <Field label="Email" placeholder="you@example.com" type="email" />
              <Field label="Phone" placeholder="+233…" />
            </div>
            <div className="mt-4">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">I'm interested in</label>
              <select className="mt-2 w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option>Listing my property</option>
                <option>Partnerships</option>
                <option>Press & media</option>
                <option>Support</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Message</label>
              <textarea rows={5} placeholder="Tell us a little more…" className="mt-2 w-full resize-none rounded-2xl border hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button
              type="submit"
              disabled={sent}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-90"
            >
              {sent ? (<><Check className="h-4 w-4" /> Message received — we'll reply within 24h</>) : "Send message"}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">By sending you agree to our terms & privacy policy.</p>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input {...rest} className="mt-2 w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}