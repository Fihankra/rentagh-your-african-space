import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import hero from "@/assets/region-accra.jpg";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About RentaGh — Every Space. One Platform." },
      { name: "description", content: "RentaGh is Ghana's premium all-in-one property platform — built for landlords, renters, agents and developers across the continent." },
      { property: "og:title", content: "About RentaGh" },
      { property: "og:description", content: "Ghana's premium all-in-one property platform." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-x pt-32 pb-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">About us</div>
            <h1 className="mt-3 font-display text-5xl font-semibold text-foreground text-balance md:text-6xl">
              Built in Ghana. <span className="italic text-[color:var(--accent)]">For Africa.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
              RentaGh is a premium property marketplace combining the best of Airbnb, Booking.com, Property24 and Zillow — adapted for Ghanaian architecture, African landscapes and the way real estate actually moves on the continent. From a verified Cantonments villa to a registered cocoa farm in Ejisu, every space lives on one platform.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3">
              {[
                { n: "9", label: "Property categories" },
                { n: "92", label: "Cities & towns" },
                { n: "12,400+", label: "Verified listings" },
                { n: "48k", label: "Trusted users" },
                { n: "4.9", label: "Average rating" },
                { n: "100%", label: "Hosts verified" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border hairline bg-card px-5 py-5">
                  <div className="font-display text-3xl font-semibold text-foreground">{s.n}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/browse" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Browse listings</Link>
              <Link to="/contact" className="rounded-full border hairline bg-card px-6 py-3 text-sm font-semibold text-foreground">List your property</Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[36px]">
            <img src={hero} alt="Aerial view of Accra" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-7 text-white">
              <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">Headquartered in</div>
              <div className="font-display text-2xl">Accra, Ghana</div>
            </div>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">What we believe</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { t: "Verified always", d: "Every host and listing is reviewed by a real RentaGh team member before going live." },
              { t: "Pay your way", d: "MTN MoMo, Telecel Cash, AirtelTigo Money, cards and bank transfers — with escrow protection." },
              { t: "Premium, always", d: "Cinematic photography, calm typography and African-inspired craft on every screen." },
            ].map((x) => (
              <div key={x.t} className="rounded-3xl border hairline bg-card p-7">
                <div className="font-display text-xl text-foreground">{x.t}</div>
                <p className="mt-3 text-sm text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}