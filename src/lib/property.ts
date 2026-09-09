import type { CategorySlug } from "./categories";

export type Landmark = { name: string; kind: string; km: number; mins: number };

export type Property = {
  id: string;
  title: string;
  category: CategorySlug;
  city: string;
  region: string;
  neighborhood: string;
  priceGHS: number;
  priceUnit: "night" | "month" | "total" | "year";
  beds?: number;
  baths?: number;
  area?: string;
  verified: boolean;
  featured?: boolean;
  rating: number;
  reviews: number;
  cover: string;
  gallery: string[];
  hostName: string;
  hostRole: string;
  description: string;
  amenities: string[];
  coords: { lat: number; lng: number };
  landmarks: Landmark[];
  status?: "draft" | "published" | "archived";
  listingType?: "rent" | "sale";
};

export function formatGHS(n: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(n);
}

export function priceLabel(p: Property) {
  const v = formatGHS(p.priceGHS);
  switch (p.priceUnit) {
    case "night": return `${v} / night`;
    case "month": return `${v} / month`;
    case "year": return `${v} / year`;
    default: return v;
  }
}
