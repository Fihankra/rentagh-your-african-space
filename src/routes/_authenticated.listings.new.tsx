import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { categories } from "@/lib/categories";
import { createProperty } from "@/lib/properties.functions";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";

const regions = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Volta",
  "Bono",
  "Upper East",
  "Upper West",
  "Western North",
  "Oti",
  "Ahafo",
  "Bono East",
  "North East",
  "Savannah",
];

export const Route = createFileRoute("/_authenticated/listings/new")({
  component: NewListingPage,
  head: () => ({
    meta: [
      { title: "Add Listing — RentaGh" },
      { name: "description", content: "List a hostel, house, land or farm land on RentaGh." },
      { property: "og:title", content: "Add Listing — RentaGh" },
      { property: "og:description", content: "List a hostel, house, land or farm land on RentaGh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/listings/new" }],
  }),
});

function NewListingPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<string>("homes");
  const [images, setImages] = useState<{ url: string; file: File }[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    listing_type: "rent",
    price: "",
    price_period: "month",
    region: "Greater Accra",
    city: "",
    neighborhood: "",
    beds: "",
    baths: "",
    area_sqm: "",
    lat: "",
    lng: "",
    status: "draft",
    featured: false,
  });

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const bucket = "property-images";
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return;
    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${userId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data: urlData, error: signError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60 * 24 * 3650);
      if (signError || !urlData) {
        setError(signError?.message ?? "Could not prepare the photo link.");
        continue;
      }
      setImages((prev) => [...prev, { url: urlData.signedUrl, file }]);
    }

  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const isLand = category === "lands" || category === "farmlands";

    try {
      const id = await createProperty({
        data: {
          title: form.title,
          description: form.description,
          category: category as any,
          listing_type: form.listing_type as any,
          price: Number(form.price),
          price_period: (isLand ? "total" : form.price_period) as any,
          region: form.region,
          city: form.city,
          neighborhood: form.neighborhood,
          beds: isLand ? undefined : Number(form.beds) || undefined,
          baths: isLand ? undefined : Number(form.baths) || undefined,
          area_sqm: Number(form.area_sqm) || undefined,
          lat: form.lat ? Number(form.lat) : undefined,
          lng: form.lng ? Number(form.lng) : undefined,
          status: form.status as any,
          featured: form.featured,
          amenities,
          cover_url: images[0]?.url,
          images: images.map((img, i) => ({ url: img.url, sort_order: i })),
          landmarks: [],
        },
      });
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      setError(err.message ?? "Failed to create listing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container-x pt-28 pb-20 md:pt-32">
        <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">Add a listing</h1>
        <p className="mt-1 text-muted-foreground">Describe your property and upload clear photos.</p>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-6">
            <Card>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setCategory(cat.slug)}
                    className={cn(
                      "rounded-2xl border hairline px-3 py-4 text-left text-sm font-medium transition-all",
                      category === cat.slug ? "border-primary bg-primary/5 text-primary" : "bg-card hover:bg-muted"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="Modern 3-bedroom house"
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  />
                </Field>
                <Field label="Listing type">
                  <select
                    value={form.listing_type}
                    onChange={(e) => setForm({ ...form, listing_type: e.target.value })}
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  >
                    <option value="rent">For rent</option>
                    <option value="sale">For sale</option>
                  </select>
                </Field>
              </div>
            </Card>

            <Card>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={5}
                  placeholder="Describe the property, neighbourhood and nearby amenities."
                  className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                />
              </Field>
            </Card>

            <Card>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Price (GHS)">
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min={0}
                    placeholder="0"
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  />
                </Field>
                <Field label="Price period">
                  <select
                    value={category === "lands" || category === "farmlands" ? "total" : form.price_period}
                    disabled={category === "lands" || category === "farmlands"}
                    onChange={(e) => setForm({ ...form, price_period: e.target.value })}
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)] disabled:opacity-60"
                  >
                    <option value="month">Per month</option>
                    <option value="year">Per year</option>
                    <option value="total">Total</option>
                  </select>
                </Field>
                <Field label="Area sqm">
                  <input
                    type="number"
                    value={form.area_sqm}
                    onChange={(e) => setForm({ ...form, area_sqm: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Region">
                  <select
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  >
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="City / Town">
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    placeholder="Accra"
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  />
                </Field>
                <Field label="Neighbourhood">
                  <input
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                    placeholder="East Legon"
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  />
                </Field>
                {category !== "lands" && category !== "farmlands" && (
                  <>
                    <Field label="Bedrooms">
                      <input
                        type="number"
                        value={form.beds}
                        onChange={(e) => setForm({ ...form, beds: e.target.value })}
                        className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                      />
                    </Field>
                    <Field label="Bathrooms">
                      <input
                        type="number"
                        value={form.baths}
                        onChange={(e) => setForm({ ...form, baths: e.target.value })}
                        className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                      />
                    </Field>
                  </>
                )}
                <Field label="Latitude">
                  <input
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                    placeholder="5.6037"
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  />
                </Field>
                <Field label="Longitude">
                  <input
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    placeholder="-0.1870"
                    className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  />
                </Field>
              </div>
            </Card>

            {category !== "lands" && category !== "farmlands" && (
              <Card>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Amenities</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Air conditioning",
                    "Fan",
                    "Water heater",
                    "Wi-Fi",
                    "Parking",
                    "Fenced",
                    "Security",
                    "Swimming pool",
                    "Garden",
                    "Pets allowed",
                    "Shared kitchen",
                    "Study desk",
                  ].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={cn(
                        "rounded-full border hairline px-3 py-1.5 text-xs font-medium transition-colors",
                        amenities.includes(a) ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </section>

          <aside className="space-y-6">
            <Card>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Photos</label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed hairline bg-background py-10 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                <Upload className="mb-2 h-6 w-6" />
                Click to upload images
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {isAdmin && (
              <Card>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Visibility</label>
                <div className="mt-3 space-y-3">
                  <label className="flex items-center justify-between rounded-2xl border hairline bg-background px-4 py-3 text-sm">
                    <span>Publish immediately</span>
                    <input
                      type="checkbox"
                      checked={form.status === "published"}
                      onChange={(e) => setForm({ ...form, status: e.target.checked ? "published" : "draft" })}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border hairline bg-background px-4 py-3 text-sm">
                    <span>Feature listing</span>
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                </div>
              </Card>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Create listing"}
            </button>
          </aside>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[24px] border hairline bg-card p-6 shadow-[var(--shadow-card)]">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
