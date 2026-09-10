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
      { title: "RentaGh: Every Space. One Platform." },
      {
        name: "description",
        content:
          "Ghana's property platform for student hostels, houses for rent, building lands and farm lands. Verified listings, escrow-protected payments.",
      },
      { property: "og:title", content: "RentaGh: Every Space. One Platform." },
      {
        property: "og:description",
        content: "Africa's premium property platform built for Ghana.",
      },
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
          category="hostels"
          title="Hostels near every campus"
          subtitle="Safe, verified student accommodation walking distance from KNUST, UG, UCC and more."
        />
        <RegionGrid />
        <CategorySpotlight
          category="homes"
          title="Houses for rent across Ghana"
          subtitle="From Cantonments villas to quiet family homes in Kumasi and Takoradi."
        />
        <CategorySpotlight
          category="lands"
          title="Building lands to rent & own"
          subtitle="Surveyed, documented plots with clear indentures and real road access."
        />
        <CategorySpotlight
          category="farmlands"
          title="Farm lands to hire & own"
          subtitle="Productive cocoa, palm and arable land, fully documented and ready."
        />

        <StatsBand />
        <Testimonials />
        <AppPromo />
      </main>
      <SiteFooter />
    </>
  );
}
