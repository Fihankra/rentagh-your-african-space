import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const faqs = [
  {
    q: "How do I know a listing is real?",
    a: "Every host and property is reviewed by a RentaGh team member before it appears. Verified listings carry a badge and include documented ownership or management details.",
  },
  {
    q: "How do payments work?",
    a: "You can pay with MTN MoMo, Telecel Cash, AirtelTigo Money, card or bank transfer. Money is held in escrow and only released to the host once you have checked in or taken handover.",
  },
  {
    q: "Do you charge renters a fee?",
    a: "Browsing and enquiring is free. A small service fee is shown clearly before you confirm any payment.",
  },
  {
    q: "Can students book a hostel bed for a semester?",
    a: "Yes. Hostel listings show per-bed and per-semester pricing, room type, and distance to campus.",
  },
  {
    q: "I own land or a farm — can I list it?",
    a: "Yes. RentaGh supports lands and farmlands for both sale and hire, including site plans and indenture documentation.",
  },
  {
    q: "How do I list my property?",
    a: "Send us your details from the contact page and our onboarding team will schedule photography and verification.",
  },
];

export const Route = createFileRoute("/faqs")({
  component: FaqsPage,
  head: () => ({
    meta: [
      { title: "FAQs — RentaGh" },
      { name: "description", content: "Answers about verification, escrow payments, hostel bookings and listing your property on RentaGh." },
      { property: "og:title", content: "FAQs — RentaGh" },
      { property: "og:description", content: "Answers about verification, escrow payments and listing on RentaGh." },
    ],
    links: [{ rel: "canonical", href: "/faqs" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

function FaqsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-x pt-32 pb-20">
        <h1 className="font-display text-4xl font-semibold text-foreground text-balance md:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Everything renters, buyers and hosts ask us most often.
        </p>

        <div className="mt-12 grid gap-5 lg:max-w-3xl">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-3xl border hairline bg-card p-7">
              <summary className="cursor-pointer list-none font-display text-lg text-foreground">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12">
          <Link to="/contact" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Still need help? Contact us
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
