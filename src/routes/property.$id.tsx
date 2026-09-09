import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Gallery } from "@/components/property/Gallery";
import { MapPlaceholder } from "@/components/property/MapPlaceholder";
import { Reviews } from "@/components/property/Reviews";
import { EnquiryForm } from "@/components/property/EnquiryForm";
import { getPropertyById } from "@/lib/properties.functions";
import { categoryLabel } from "@/lib/categories";
import { priceLabel, type Property } from "@/lib/property";
import { BadgeCheck, MapPin, Star, BedDouble, Bath, Ruler, Wifi, ShieldCheck, ArrowRight, Hospital, GraduationCap, ShoppingBag, Fuel, Landmark as LandmarkIcon, Building2 } from "lucide-react";

export const Route = createFileRoute("/property/$id")({
  component: PropertyPage,
  loader: async ({ params }) => {
    const p = await getPropertyById({ data: { id: params.id } });
    if (!p) throw notFound();
    return { p };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.p;
    if (!p) return { meta: [{ title: "Property — RentaGh" }] };
    return {
      meta: [
        { title: `${p.title} — RentaGh` },
        { name: "description", content: p.description.slice(0, 160) },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.description.slice(0, 160) },
        { property: "og:image", content: p.cover },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/property/${params.id}` },
      ],
      links: [{ rel: "canonical", href: `/property/${params.id}` }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-3xl">Listing not found</h1>
        <Link to="/browse" className="mt-4 inline-block text-primary">Back to browse</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="font-display text-2xl">{error.message}</h1>
    </div>
  ),
});

const iconForLandmark: Record<string, typeof Hospital> = {
  Hospital, University: GraduationCap, School: GraduationCap, Market: ShoppingBag, Mall: ShoppingBag,
  Fuel, Bank: Building2, Church: LandmarkIcon, Mosque: LandmarkIcon, Police: ShieldCheck,
  Transport: ArrowRight, Beach: LandmarkIcon, Landmark: LandmarkIcon,
};

function PropertyPage() {
  const { p } = Route.useLoaderData() as { p: Property };

  return (
    <>
      <SiteHeader />
      <main className="container-x pt-28 md:pt-32">
        {/* breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/browse" className="hover:text-primary">Browse</Link>
          <span>·</span>
          <Link to="/browse/$category" params={{ category: p.category }} className="hover:text-primary">{categoryLabel(p.category)}</Link>
          <span>·</span>
          <span className="text-foreground/70">{p.neighborhood}</span>
        </div>

        {/* title row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold text-foreground md:text-5xl">{p.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {p.reviews > 0 ? (
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-[color:var(--accent)] text-[color:var(--accent)]" /> {p.rating} · {p.reviews} {p.reviews === 1 ? "review" : "reviews"}</span>
              ) : (
                <span>New listing</span>
              )}
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.neighborhood}, {p.city}</span>
              {p.verified && <span className="flex items-center gap-1 text-primary"><BadgeCheck className="h-4 w-4" /> Verified by RentaGh</span>}
            </div>
          </div>
        </div>

        {/* gallery */}
        <div className="mt-8">
          <Gallery images={p.gallery} alt={p.title} />
        </div>

        {/* body */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex items-center justify-between border-b hairline pb-6">
              <div>
                <div className="font-display text-2xl text-foreground">Hosted by {p.hostName}</div>
                <div className="text-sm text-muted-foreground">{p.hostRole}</div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-display text-xl text-primary">
                {p.hostName.charAt(0)}
              </div>
            </div>

            {/* quick specs */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {p.beds !== undefined && <Spec icon={BedDouble} label="Bedrooms" value={p.beds} />}
              {p.baths !== undefined && <Spec icon={Bath} label="Bathrooms" value={p.baths} />}
              {p.area && <Spec icon={Ruler} label="Area" value={p.area} />}
              <Spec icon={ShieldCheck} label="Status" value="Available" />
            </div>

            <div className="mt-10 border-t hairline pt-8">
              <h2 className="font-display text-2xl text-foreground">About this space</h2>
              <p className="mt-4 text-base leading-relaxed text-foreground/80">{p.description}</p>
            </div>

            <div className="mt-10 border-t hairline pt-8">
              <h2 className="font-display text-2xl text-foreground">What this place offers</h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {p.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 rounded-2xl border hairline bg-card px-4 py-3 text-sm text-foreground/85">
                    <Wifi className="h-4 w-4 text-primary" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* map */}
            <div className="mt-12 border-t hairline pt-8">
              <h2 className="font-display text-2xl text-foreground">Location</h2>
              <p className="mt-2 text-muted-foreground">{p.neighborhood}, {p.city} · {p.region}</p>
              <div className="mt-6">
                <MapPlaceholder lat={p.coords.lat} lng={p.coords.lng} label={p.neighborhood} />
              </div>

              <h3 className="mt-10 font-display text-xl text-foreground">Nearby landmarks</h3>
              <ul className="mt-4 divide-y hairline overflow-hidden rounded-3xl border hairline bg-card">
                {p.landmarks.map((l) => {
                  const Icon = iconForLandmark[l.kind] ?? LandmarkIcon;
                  return (
                    <li key={l.name} className="flex items-center gap-4 px-5 py-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--cream)] text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{l.name}</div>
                        <div className="text-xs text-muted-foreground">{l.kind}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold text-foreground">{l.km} km</div>
                        <div className="text-xs text-muted-foreground">~{l.mins} min</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Reviews propertyId={p.id} />
          </div>

          {/* inquiry sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border hairline bg-card p-7 shadow-[var(--shadow-card)]">
              <div className="flex items-baseline justify-between">
                <div className="font-display text-3xl font-semibold text-foreground">{priceLabel(p)}</div>
                <div className="flex items-center gap-1 text-sm text-foreground/70">
                  {p.reviews > 0 && (
                    <>
                      <Star className="h-4 w-4 fill-[color:var(--accent)] text-[color:var(--accent)]" /> {p.rating}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t hairline pt-4">
                <div className="font-display text-lg text-foreground">Contact {p.hostName}</div>
                <p className="text-xs text-muted-foreground">Send a secure enquiry — no phone number needed.</p>
              </div>
              <EnquiryForm propertyId={p.id} ownerName={p.hostName} />


              <div className="mt-6 rounded-2xl bg-[color:var(--cream)] p-4 text-xs text-foreground/70">
                You won't be charged yet. RentaGh holds payments in escrow until your stay or purchase is confirmed.
              </div>
            </div>

            <div className="mt-6 rounded-3xl border hairline bg-card p-6 text-sm">
              <div className="font-display text-lg text-foreground">Pay your way</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {["MTN MoMo", "Telecel Cash", "AirtelTigo Money", "Visa", "Mastercard", "Bank transfer"].map((m) => (
                  <span key={m} className="rounded-full bg-muted px-3 py-1.5 text-foreground/75">{m}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Spec({ icon: Icon, label, value }: { icon: typeof BedDouble; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border hairline bg-card px-4 py-4">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-3 font-display text-xl font-semibold text-foreground">{value}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}