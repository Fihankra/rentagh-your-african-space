import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BrowseGrid } from "@/components/browse/BrowseGrid";

export const Route = createFileRoute("/browse")({
  component: BrowsePage,
  head: () => ({
    meta: [
      { title: "Browse properties — RentaGh" },
      { name: "description", content: "Browse verified student hostels, houses for rent, building lands and farm lands across Ghana on RentaGh." },
      { property: "og:title", content: "Browse properties — RentaGh" },
      { property: "og:description", content: "Verified listings across Ghana." },
      { property: "og:url", content: "/browse" },
    ],
    links: [{ rel: "canonical", href: "/browse" }],
  }),
});

function BrowsePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pb-16">
        <BrowseGrid />
      </main>
      <SiteFooter />
    </>
  );
}