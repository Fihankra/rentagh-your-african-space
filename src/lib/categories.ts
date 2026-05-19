import { Home, Building2, KeyRound, MapPin, Sprout, Briefcase, GraduationCap, BedDouble, Palmtree } from "lucide-react";

export type CategorySlug =
  | "homes"
  | "apartments"
  | "houses-for-sale"
  | "lands"
  | "farmlands"
  | "commercial"
  | "hostels"
  | "hotels"
  | "vacation";

export const categories: { slug: CategorySlug; label: string; tagline: string; icon: typeof Home }[] = [
  { slug: "homes", label: "Homes", tagline: "Rent a home", icon: Home },
  { slug: "apartments", label: "Apartments", tagline: "Modern living", icon: Building2 },
  { slug: "houses-for-sale", label: "Houses for Sale", tagline: "Buy your home", icon: KeyRound },
  { slug: "lands", label: "Lands", tagline: "Own land", icon: MapPin },
  { slug: "farmlands", label: "Farmlands", tagline: "Hire or buy", icon: Sprout },
  { slug: "commercial", label: "Commercial", tagline: "Offices & shops", icon: Briefcase },
  { slug: "hostels", label: "Student Hostels", tagline: "Campus stays", icon: GraduationCap },
  { slug: "hotels", label: "Hotels & Stays", tagline: "Short trips", icon: BedDouble },
  { slug: "vacation", label: "Vacation", tagline: "Holiday escapes", icon: Palmtree },
];

export function categoryLabel(slug: CategorySlug) {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
}