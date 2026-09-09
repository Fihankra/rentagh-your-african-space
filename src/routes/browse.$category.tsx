import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BrowseGrid } from "@/components/browse/BrowseGrid";
import { categories, type CategorySlug } from "@/lib/categories";

const categoryDescriptions: Record<CategorySlug, string> = {
  hostels: "Verified student hostels near KNUST, Legon, UCC and other Ghanaian campuses — single, twin and shared rooms with clear yearly fees.",
  homes: "Houses for rent across Accra, Kumasi, Tema and Takoradi — verified landlords and agents, with monthly rent shown upfront.",
  lands: "Building lands for rent and for sale in Ghana — surveyed, litigation-free plots with indentures and site plans.",
  farmlands: "Farm lands for rent and for sale in Ghana — arable acreage, cocoa farms and irrigated plots with road access.",
};

export const Route = createFileRoute("/browse/$category")({
  component: CategoryPage,
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.category);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData, params }) => {
    const label = loaderData?.cat.label ?? "Properties";
    const blurb = categoryDescriptions[params.category as CategorySlug] ??
      `Browse verified ${label.toLowerCase()} across Ghana on RentaGh.`;
    return {
      meta: [
        { title: `${label} in Ghana — RentaGh` },
        { name: "description", content: blurb },
        { property: "og:title", content: `${label} in Ghana — RentaGh` },
        { property: "og:description", content: blurb },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/browse/${params.category}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/browse/${params.category}` }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="font-display text-3xl">Category not found</h1>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="font-display text-2xl">{error.message}</h1>
    </div>
  ),
});

function CategoryPage() {
  const { category } = Route.useParams();
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pb-16">
        <BrowseGrid initialCategory={category as CategorySlug} />
      </main>
      <SiteFooter />
    </>
  );
}