import type { CategorySlug } from "./categories";
import villa from "@/assets/hero-villa.jpg";
import home from "@/assets/cat-home.jpg";
import apt from "@/assets/cat-apartment.jpg";
import hotel from "@/assets/cat-hotel.jpg";
import hostel from "@/assets/cat-hostel.jpg";
import land from "@/assets/cat-land.jpg";
import farm from "@/assets/cat-farmland.jpg";
import commercial from "@/assets/cat-commercial.jpg";
import vacation from "@/assets/cat-vacation.jpg";

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
};

const cycle = [villa, apt, home, hotel, hostel, land, farm, commercial, vacation];
const galleryFor = (cover: string, n = 5) => {
  const others = cycle.filter((i) => i !== cover);
  return [cover, ...others.slice(0, n - 1)];
};

const landmarksAccra: Landmark[] = [
  { name: "Ridge Hospital", kind: "Hospital", km: 1.4, mins: 6 },
  { name: "Achimota School", kind: "School", km: 3.1, mins: 12 },
  { name: "Accra Mall", kind: "Mall", km: 4.8, mins: 15 },
  { name: "Shell Fuel Station", kind: "Fuel", km: 0.6, mins: 3 },
  { name: "Stanbic Bank", kind: "Bank", km: 1.1, mins: 5 },
  { name: "Tetteh Quarshie Interchange", kind: "Transport", km: 2.4, mins: 8 },
  { name: "Holy Trinity Cathedral", kind: "Church", km: 1.8, mins: 7 },
];
const landmarksKumasi: Landmark[] = [
  { name: "KNUST Main Gate", kind: "University", km: 2.2, mins: 9 },
  { name: "Komfo Anokye Hospital", kind: "Hospital", km: 3.5, mins: 14 },
  { name: "Kejetia Market", kind: "Market", km: 4.1, mins: 16 },
  { name: "Central Mosque", kind: "Mosque", km: 1.6, mins: 7 },
  { name: "Total Fuel Station", kind: "Fuel", km: 0.8, mins: 4 },
  { name: "Ecobank Adum", kind: "Bank", km: 2.0, mins: 8 },
];
const landmarksCoast: Landmark[] = [
  { name: "Cape Coast Castle", kind: "Landmark", km: 1.2, mins: 5 },
  { name: "University of Cape Coast", kind: "University", km: 6.5, mins: 18 },
  { name: "Oasis Beach", kind: "Beach", km: 0.4, mins: 2 },
  { name: "Police Headquarters", kind: "Police", km: 2.1, mins: 8 },
  { name: "Cape Coast Hospital", kind: "Hospital", km: 2.9, mins: 10 },
];

export const properties: Property[] = [
  {
    id: "ridge-emerald-villa",
    title: "Emerald Ridge Villa with Infinity Pool",
    category: "homes",
    city: "Accra",
    region: "Greater Accra",
    neighborhood: "Cantonments",
    priceGHS: 28000,
    priceUnit: "month",
    beds: 5, baths: 6, area: "620 m²",
    verified: true, featured: true, rating: 4.96, reviews: 142,
    cover: villa, gallery: galleryFor(villa, 6),
    hostName: "Adwoa Mensah", hostRole: "Verified Landlord",
    description: "A serene hillside villa overlooking the Accra skyline. Floor-to-ceiling glass, infinity pool, full-staff quarters, and a chef's kitchen finished in Ghanaian hardwood.",
    amenities: ["Infinity pool", "Backup generator", "24/7 security", "Solar water", "Gardener", "Smart locks"],
    coords: { lat: 5.5694, lng: -0.1769 },
    landmarks: landmarksAccra,
  },
  {
    id: "east-legon-skyline",
    title: "Skyline Penthouse, East Legon",
    category: "apartments",
    city: "Accra", region: "Greater Accra", neighborhood: "East Legon",
    priceGHS: 14500, priceUnit: "month",
    beds: 3, baths: 3, area: "210 m²",
    verified: true, featured: true, rating: 4.88, reviews: 86,
    cover: apt, gallery: galleryFor(apt),
    hostName: "Kwame Asare", hostRole: "Agent · Heritage Realty",
    description: "Top-floor penthouse with wrap-around balcony, mid-century African furnishings and panoramic views of East Legon's palm canopy.",
    amenities: ["Lift", "Backup power", "Gym", "Pool", "Concierge", "Parking"],
    coords: { lat: 5.6304, lng: -0.1597 },
    landmarks: landmarksAccra,
  },
  {
    id: "tema-family-home",
    title: "4-Bedroom Family Home, Tema Comm. 25",
    category: "houses-for-sale",
    city: "Tema", region: "Greater Accra", neighborhood: "Community 25",
    priceGHS: 1850000, priceUnit: "total",
    beds: 4, baths: 4, area: "380 m²",
    verified: true, rating: 4.7, reviews: 24,
    cover: home, gallery: galleryFor(home),
    hostName: "Ama Owusu", hostRole: "Property Developer",
    description: "Newly built family home with terracotta tile roof, walled compound, mango trees and a paved driveway big enough for two SUVs.",
    amenities: ["Walled compound", "Gatehouse", "Borehole", "Solar geysers"],
    coords: { lat: 5.6839, lng: -0.0166 },
    landmarks: landmarksAccra,
  },
  {
    id: "elmina-coast-villa",
    title: "Atlantic Hammock Villa",
    category: "vacation",
    city: "Elmina", region: "Central", neighborhood: "Brenu Beach",
    priceGHS: 2400, priceUnit: "night",
    beds: 3, baths: 3, verified: true, featured: true, rating: 4.99, reviews: 211,
    cover: vacation, gallery: galleryFor(vacation),
    hostName: "Yaa Boateng", hostRole: "Superhost",
    description: "Toes-in-the-sand beach villa with private thatched pavilion and an open kitchen. Walking distance to fishing boats at dawn.",
    amenities: ["Beachfront", "Outdoor kitchen", "Hammock pavilion", "Snorkel kit"],
    coords: { lat: 5.0833, lng: -1.35 },
    landmarks: landmarksCoast,
  },
  {
    id: "labadi-beach-hotel",
    title: "Lantern Pool — Boutique Stay",
    category: "hotels",
    city: "Accra", region: "Greater Accra", neighborhood: "Labadi",
    priceGHS: 1850, priceUnit: "night",
    beds: 1, baths: 1, verified: true, featured: true, rating: 4.84, reviews: 327,
    cover: hotel, gallery: galleryFor(hotel),
    hostName: "Lantern Hospitality", hostRole: "Hotel Operator",
    description: "Lanterns flicker along the pool deck at dusk. Sea-view suites, chef-led West African tasting menu, and a quiet stretch of Labadi shore.",
    amenities: ["Pool", "Spa", "Restaurant", "Beach access", "Airport shuttle"],
    coords: { lat: 5.5598, lng: -0.1469 },
    landmarks: landmarksAccra,
  },
  {
    id: "knust-hostel-suite",
    title: "KNUST Garden Hostel — Twin Suite",
    category: "hostels",
    city: "Kumasi", region: "Ashanti", neighborhood: "Ayeduase",
    priceGHS: 7200, priceUnit: "year",
    beds: 2, baths: 1, verified: true, rating: 4.62, reviews: 58,
    cover: hostel, gallery: galleryFor(hostel),
    hostName: "Garden Halls", hostRole: "Hostel Manager",
    description: "Clean twin-share with study desk, fast Wi-Fi, kitchenette and 24-hour security. Five minutes from the KNUST main gate.",
    amenities: ["Wi-Fi", "24/7 security", "Study lounge", "Laundry", "Backup power"],
    coords: { lat: 6.6745, lng: -1.5716 },
    landmarks: landmarksKumasi,
  },
  {
    id: "aburi-hill-land",
    title: "1.2 Acre Hilltop Plot, Aburi",
    category: "lands",
    city: "Aburi", region: "Eastern", neighborhood: "Aburi Hills",
    priceGHS: 420000, priceUnit: "total",
    area: "4,856 m²", verified: true, rating: 4.5, reviews: 11,
    cover: land, gallery: galleryFor(land),
    hostName: "Kojo Annan", hostRole: "Land Agent",
    description: "Surveyed and registered hilltop plot with cool mountain air and views toward the Accra plains. Suitable for a private estate or boutique retreat.",
    amenities: ["Surveyed", "Title documents", "Road access"],
    coords: { lat: 5.85, lng: -0.1741 },
    landmarks: [
      { name: "Aburi Botanical Gardens", kind: "Landmark", km: 1.0, mins: 4 },
      { name: "Peduase Police Post", kind: "Police", km: 3.2, mins: 9 },
      { name: "Aburi Girls' SHS", kind: "School", km: 1.6, mins: 6 },
      { name: "Total Fuel Station", kind: "Fuel", km: 2.1, mins: 7 },
    ],
  },
  {
    id: "ejisu-cocoa-farm",
    title: "18-Acre Cocoa Farmland, Ejisu",
    category: "farmlands",
    city: "Ejisu", region: "Ashanti", neighborhood: "Ejisu",
    priceGHS: 980000, priceUnit: "total",
    area: "72,843 m²", verified: true, featured: true, rating: 4.8, reviews: 9,
    cover: farm, gallery: galleryFor(farm),
    hostName: "Nana Yaw", hostRole: "Farm Owner",
    description: "Producing cocoa farm with mature trees, red dirt access roads and a small farmhouse. Suitable for purchase or seasonal hire.",
    amenities: ["Mature trees", "Farmhouse", "Borehole", "Storage shed"],
    coords: { lat: 6.7402, lng: -1.4533 },
    landmarks: landmarksKumasi,
  },
  {
    id: "airport-city-office",
    title: "Grade-A Office Floor, Airport City",
    category: "commercial",
    city: "Accra", region: "Greater Accra", neighborhood: "Airport City",
    priceGHS: 32000, priceUnit: "month",
    area: "540 m²", verified: true, featured: true, rating: 4.9, reviews: 18,
    cover: commercial, gallery: galleryFor(commercial),
    hostName: "Heritage Realty", hostRole: "Commercial Agent",
    description: "Full floor in a Grade-A glass tower with floor-to-ceiling views over Airport City. Fitted with raised flooring, meeting suites and dual-source power.",
    amenities: ["24/7 power", "Fibre internet", "Reception", "Secure parking", "Conference suites"],
    coords: { lat: 5.6058, lng: -0.1731 },
    landmarks: landmarksAccra,
  },
  {
    id: "osu-studio-apartment",
    title: "Osu Linen Studio with Balcony",
    category: "apartments",
    city: "Accra", region: "Greater Accra", neighborhood: "Osu",
    priceGHS: 4800, priceUnit: "month",
    beds: 1, baths: 1, area: "62 m²",
    verified: true, rating: 4.7, reviews: 41,
    cover: apt, gallery: galleryFor(apt),
    hostName: "Selorm Adjei", hostRole: "Verified Landlord",
    description: "Bright studio above Oxford Street with crisp linen palette, a tiny balcony for morning coffee, and walk-everywhere convenience.",
    amenities: ["Wi-Fi", "Backup power", "Balcony", "Workspace"],
    coords: { lat: 5.5557, lng: -0.1827 },
    landmarks: landmarksAccra,
  },
  {
    id: "trasacco-mansion",
    title: "Trasacco Mansion with Cabana",
    category: "houses-for-sale",
    city: "Accra", region: "Greater Accra", neighborhood: "Trasacco Valley",
    priceGHS: 6200000, priceUnit: "total",
    beds: 6, baths: 7, area: "780 m²",
    verified: true, featured: true, rating: 4.95, reviews: 12,
    cover: villa, gallery: galleryFor(villa),
    hostName: "Heritage Realty", hostRole: "Agent",
    description: "Estate mansion on a corner plot with private cabana, lap pool and a dedicated cinema room.",
    amenities: ["Cinema room", "Lap pool", "Wine cellar", "Staff quarters"],
    coords: { lat: 5.6471, lng: -0.0959 },
    landmarks: landmarksAccra,
  },
  {
    id: "cape-coast-castle-stay",
    title: "Castle View Boutique Hotel",
    category: "hotels",
    city: "Cape Coast", region: "Central", neighborhood: "Victoria Park",
    priceGHS: 980, priceUnit: "night",
    beds: 1, baths: 1, verified: true, rating: 4.71, reviews: 188,
    cover: hotel, gallery: galleryFor(hotel),
    hostName: "Castle View", hostRole: "Hotel Operator",
    description: "Sea-facing rooms a short walk from Cape Coast Castle. Sunrise breakfast on the terrace.",
    amenities: ["Restaurant", "Sea view", "Tour desk", "Wi-Fi"],
    coords: { lat: 5.1054, lng: -1.2466 },
    landmarks: landmarksCoast,
  },
];

export const regions = [
  { name: "Greater Accra", count: 482, image: "/regions/accra" },
  { name: "Ashanti", count: 318, image: "/regions/kumasi" },
  { name: "Central", count: 164, image: "/regions/capecoast" },
  { name: "Western", count: 121, image: "/regions/takoradi" },
];

export function getProperty(id: string) {
  return properties.find((p) => p.id === id);
}

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