import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trash2, Upload, X } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { categories } from "@/lib/categories";
import { getMyProperty, updateMyProperty, deleteMyProperty } from "@/lib/properties.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

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

const amenityOptions = [
  "Wi-Fi",
  "Air conditioning",
  "24/7 Security",
  "Standby generator",
  "Water storage",
  "Borehole",
  "Parking",
  "Fitted kitchen",
  "Study desk",
  "Shared kitchen",
  "Laundry area",
  "Gated community",
  "Boys quarters",
  "Road access",
];

export const Route = createFileRoute("/_authenticated/listings/$id/edit")({
  component: EditListingPage,
  head: () => ({
    meta: [
      { title: "Edit listing | RentaGh" },
      {
        name: "description",
        content: "Update the details, price and photos of your RentaGh listing.",
      },
      { property: "og:title", content: "Edit listing | RentaGh" },
      {
        property: "og:description",
        content: "Update the details, price and photos of your RentaGh listing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function EditListingPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [category, setCategory] = useState("homes");
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
    status: "draft",
  });

  const { data: property, isLoading } = useQuery({
    queryKey: ["my-property", id],
    queryFn: () => getMyProperty({ data: { id } }),
  });

  useEffect(() => {
    if (!property) return;
    setCategory(property.category);
    setAmenities(property.amenities ?? []);
    setImages(property.gallery ?? []);
    setForm({
      title: property.title,
      description: property.description,
      listing_type: property.listingType ?? "rent",
      price: String(property.priceGHS ?? ""),
      price_period: property.priceUnit ?? "month",
      region: property.region,
      city: property.city,
      neighborhood: property.neighborhood ?? "",
      beds: property.beds ? String(property.beds) : "",
      baths: property.baths ? String(property.baths) : "",
      area_sqm: "",
      status: property.status ?? "draft",
    });
  }, [property]);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return;
    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${userId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data: urlData, error: signError } = await supabase.storage
        .from("property-images")
        .createSignedUrl(path, 60 * 60 * 24 * 3650);
      if (signError || !urlData) {
        setError(signError?.message ?? "Could not prepare the photo link.");
        continue;
      }
      setImages((prev) => [...prev, urlData.signedUrl]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const isLand = category === "lands" || category === "farmlands";
    try {
      await updateMyProperty({
        data: {
          id,
          title: form.title,
          description: form.description,
          category: category as any,
          listing_type: form.listing_type as any,
          price: Number(form.price),
          price_period: (isLand && form.listing_type === "sale"
            ? "total"
            : form.price_period) as any,
          region: form.region,
          city: form.city,
          neighborhood: form.neighborhood,
          beds: isLand ? undefined : Number(form.beds) || undefined,
          baths: isLand ? undefined : Number(form.baths) || undefined,
          area_sqm: Number(form.area_sqm) || undefined,
          status: form.status as any,
          amenities,
          cover_url: images[0],
          images: images.map((url, i) => ({ url, sort_order: i })),
        },
      });
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this listing for good? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteMyProperty({ data: { id } });
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Could not delete this listing.");
      setDeleting(false);
    }
  }

  const isLand = category === "lands" || category === "farmlands";

  if (!isAdmin) {
    return (
      <>
        <SiteHeader />
        <main className="container-x pt-28 pb-20 md:pt-32">
          <div className="mx-auto max-w-lg rounded-[28px] border hairline bg-card p-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Only the administrator can edit listings
            </h1>
            <p className="mt-3 text-muted-foreground">
              Browse the site or get in touch if something needs updating.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/browse"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Browse spaces
              </Link>
              <Link
                to="/dashboard"
                className="rounded-full border hairline bg-background px-5 py-2.5 text-sm font-semibold text-foreground"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="container-x pt-28 pb-20 md:pt-32">
        <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
          Edit listing
        </h1>
        <p className="mt-1 text-muted-foreground">
          Update the details, price and photos of your property.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 rounded-[24px] border hairline bg-card p-10 text-center text-muted-foreground">
            Loading…
          </div>
        ) : !property ? (
          <div className="mt-8 rounded-[24px] border hairline bg-card p-10 text-center">
            <p className="text-muted-foreground">We could not find that listing.</p>
            <Link to="/dashboard" className="mt-4 inline-block text-primary">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="space-y-6 lg:col-span-2">
              <Card>
                <Label>Category</Label>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setCategory(cat.slug)}
                      className={cn(
                        "rounded-2xl border hairline px-3 py-4 text-left text-sm font-medium transition-all",
                        category === cat.slug
                          ? "border-primary bg-primary/5 text-primary"
                          : "bg-card hover:bg-muted",
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
                    <Input
                      value={form.title}
                      onChange={(v) => setForm({ ...form, title: v })}
                      required
                    />
                  </Field>
                  <Field label="Listing type">
                    <Select
                      value={form.listing_type}
                      onChange={(v) => setForm({ ...form, listing_type: v })}
                      options={[
                        ["rent", "For rent"],
                        ["sale", "For sale"],
                      ]}
                    />
                  </Field>
                  <Field label="Price (GHS)">
                    <Input
                      value={form.price}
                      onChange={(v) => setForm({ ...form, price: v.replace(/[^0-9.]/g, "") })}
                      required
                    />
                  </Field>
                  <Field label="Price period">
                    <Select
                      value={form.price_period}
                      onChange={(v) => setForm({ ...form, price_period: v })}
                      options={[
                        ["month", "Per month"],
                        ["year", "Per year"],
                        ["night", "Per night"],
                        ["total", "Total price"],
                      ]}
                    />
                  </Field>
                  <Field label="Region">
                    <Select
                      value={form.region}
                      onChange={(v) => setForm({ ...form, region: v })}
                      options={regions.map((r) => [r, r])}
                    />
                  </Field>
                  <Field label="City / town">
                    <Input
                      value={form.city}
                      onChange={(v) => setForm({ ...form, city: v })}
                      required
                    />
                  </Field>
                  <Field label="Neighbourhood">
                    <Input
                      value={form.neighborhood}
                      onChange={(v) => setForm({ ...form, neighborhood: v })}
                    />
                  </Field>
                  <Field label="Area (m²)">
                    <Input
                      value={form.area_sqm}
                      onChange={(v) => setForm({ ...form, area_sqm: v.replace(/[^0-9.]/g, "") })}
                    />
                  </Field>
                  {!isLand && (
                    <>
                      <Field label="Bedrooms">
                        <Input
                          value={form.beds}
                          onChange={(v) => setForm({ ...form, beds: v.replace(/[^0-9]/g, "") })}
                        />
                      </Field>
                      <Field label="Bathrooms">
                        <Input
                          value={form.baths}
                          onChange={(v) => setForm({ ...form, baths: v.replace(/[^0-9]/g, "") })}
                        />
                      </Field>
                    </>
                  )}
                </div>
                <Field label="Description" className="mt-4">
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={5}
                    required
                    className="w-full resize-none rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
              </Card>

              <Card>
                <Label>What this place offers</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {amenityOptions.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() =>
                        setAmenities((prev) =>
                          prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
                        )
                      }
                      className={cn(
                        "rounded-full border hairline px-3.5 py-2 text-xs font-medium",
                        amenities.includes(a)
                          ? "border-primary bg-primary/10 text-primary"
                          : "bg-background text-foreground/75",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </Card>
            </section>

            <aside className="space-y-6">
              <Card>
                <Label>Photos</Label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((url, i) => (
                    <div key={url} className="relative overflow-hidden rounded-xl bg-muted">
                      <img
                        src={url}
                        alt=""
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                        className="absolute right-1 top-1 rounded-full bg-background/90 p-1"
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border hairline bg-background py-3 text-sm font-medium"
                >
                  <Upload className="h-4 w-4" /> Add photos
                </button>
              </Card>

              <Card>
                <Field label="Visibility">
                  <Select
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={[
                      ["draft", "Draft (hidden)"],
                      ["published", "Published"],
                      ["archived", "Archived"],
                    ]}
                  />
                </Field>
                <p className="mt-2 text-xs text-muted-foreground">
                  Only an administrator can publish a listing for the first time.
                </p>
                <button
                  disabled={saving}
                  className="mt-4 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border hairline bg-background py-3.5 text-sm font-semibold text-red-600 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" /> {deleting ? "Deleting…" : "Delete listing"}
                </button>
              </Card>
            </aside>
          </form>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[24px] border hairline bg-card p-6">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Input({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
