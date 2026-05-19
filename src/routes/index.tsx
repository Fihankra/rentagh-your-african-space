import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { CategoryRail, MobileCategoryRail } from "@/components/landing/CategoryRail";
import { FeaturedRail } from "@/components/landing/FeaturedRail";
import { CategorySpotlight } from "@/components/landing/CategorySpotlight";
import { RegionGrid } from "@/components/landing/RegionGrid";
import { Testimonials } from "@/components/landing/Testimonials";
import { StatsBand } from "@/components/landing/StatsBand";
import { AppPromo } from "@/components/landing/AppPromo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "RentaGh — Every Space. One Platform." },
      { name: "description", content: "Africa's premium property platform. Rent, buy or list homes, hotels, hostels, lands and commercial spaces across Ghana." },
      { property: "og:title", content: "RentaGh — Every Space. One Platform." },
      { property: "og:description", content: "Africa's premium property platform built for Ghana." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Index() {
  return (
    <>
      <SiteHeader overlay />
      <main>
        <Hero />
        <CategoryRail />
        <MobileCategoryRail />
        <FeaturedRail />
        <CategorySpotlight
          category="vacation"
          eyebrow="Short escapes"
          title="Vacation stays along the coast"
          subtitle="Beachfront villas and palm-shaded retreats from Elmina to Ada."
        />
        <RegionGrid />
        <CategorySpotlight
          category="hostels"
          eyebrow="For students"
          title="Hostels near every campus"
          subtitle="Safe, verified accommodation walking distance from KNUST, UG, UCC and more."
        />
        <CategorySpotlight
          category="hotels"
          eyebrow="Hotels & stays"
          title="Premium nights, Ghanaian warmth"
          subtitle="Boutique hotels and serviced apartments in Ghana's most beautiful corners."
        />
        <CategorySpotlight
          category="farmlands"
          eyebrow="Working the land"
          title="Farmlands to hire & own"
          subtitle="Productive cocoa, palm and arable plots — fully documented and ready."
        />
        <StatsBand />
        <Testimonials />
        <AppPromo />
      </main>
      <SiteFooter />
    </>
  );
}
