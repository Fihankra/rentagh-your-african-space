import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions — RentaGh" },
      { name: "description", content: "The terms that govern listing, renting and buying property through RentaGh in Ghana." },
      { property: "og:title", content: "Terms & Conditions — RentaGh" },
      { property: "og:description", content: "The terms that govern listing, renting and buying property through RentaGh." },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
});

const sections = [
  {
    t: "1. Using RentaGh",
    d: "RentaGh is a marketplace connecting landlords, agents, developers and hostel managers with renters and buyers across Ghana. You must be at least 18 years old to create a listing or make an enquiry.",
  },
  {
    t: "2. Listings and accuracy",
    d: "Hosts are responsible for the accuracy of every listing: price, location, photographs, availability and documentation. RentaGh reviews listings before they go live and may remove any listing that appears misleading.",
  },
  {
    t: "3. Payments and escrow",
    d: "Payments made through RentaGh are held in escrow and released to the host after the agreed check-in or handover milestone. Fees are shown before you confirm a payment.",
  },
  {
    t: "4. Cancellations and refunds",
    d: "Each listing states its own cancellation window. Where a host cancels or a property materially differs from the listing, the amount held in escrow is refunded to the guest or tenant.",
  },
  {
    t: "5. Prohibited conduct",
    d: "No fraudulent listings, no off-platform payment requests, no discrimination, and no scraping or reselling of RentaGh content.",
  },
  {
    t: "6. Liability",
    d: "RentaGh facilitates introductions and payments; the tenancy, sale or stay agreement is between you and the host. We are not liable for losses arising from an agreement we are not a party to.",
  },
  {
    t: "7. Changes to these terms",
    d: "We may update these terms as the platform grows. Material changes will be announced on this page and, where you hold an account, by email.",
  },
];

function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-x pt-32 pb-20">
        <h1 className="font-display text-4xl font-semibold text-foreground text-balance md:text-5xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Last updated September 2026. These terms are a plain-language summary of how RentaGh works.
        </p>

        <div className="mt-12 grid gap-5 lg:max-w-3xl">
          {sections.map((s) => (
            <section key={s.t} className="rounded-3xl border hairline bg-card p-7">
              <h2 className="font-display text-xl text-foreground">{s.t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
