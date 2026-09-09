import { Home, MapPin, Sprout, GraduationCap } from "lucide-react";

export type CategorySlug = "hostels" | "homes" | "lands" | "farmlands";

export const categories: { slug: CategorySlug; label: string; tagline: string; icon: typeof Home }[] = [
  { slug: "hostels", label: "Student Hostels", tagline: "Near campus", icon: GraduationCap },
  { slug: "homes", label: "Houses for Rent", tagline: "Rent a home", icon: Home },
  { slug: "lands", label: "Building Lands", tagline: "Rent or buy", icon: MapPin },
  { slug: "farmlands", label: "Farm Lands", tagline: "Rent or buy", icon: Sprout },
];

export function categoryLabel(slug: CategorySlug) {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
}
