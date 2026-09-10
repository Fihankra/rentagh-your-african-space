import { Link } from "@tanstack/react-router";
import accra from "@/assets/region-accra.jpg";
import kumasi from "@/assets/region-kumasi.jpg";
import capecoast from "@/assets/region-capecoast.jpg";
import takoradi from "@/assets/region-takoradi.jpg";
import { SectionHeading } from "./SectionHeading";

const regions = [
  {
    name: "Accra",
    region: "Greater Accra",
    count: 482,
    img: accra,
    span: "sm:row-span-2 sm:col-span-2 md:row-span-2 md:col-span-2",
  },
  { name: "Kumasi", region: "Ashanti", count: 318, img: kumasi, span: "" },
  { name: "Cape Coast", region: "Central", count: 164, img: capecoast, span: "" },
  {
    name: "Takoradi",
    region: "Western",
    count: 121,
    img: takoradi,
    span: "sm:col-span-2 md:col-span-2",
  },
];

export function RegionGrid() {
  return (
    <section className="mt-24">
      <SectionHeading
        title="Featured regions"
        subtitle="From Accra's coast to the hills of the Ashanti. Every region, one platform."
      />
      <div className="container-x mt-10 grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {regions.map((r) => (
          <Link
            key={r.name}
            to="/browse"
            className={`group relative overflow-hidden rounded-3xl ${r.span}`}
          >
            <img
              src={r.img}
              alt={r.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="flex items-end justify-between">
                <h3 className="font-display text-2xl font-semibold md:text-3xl">{r.name}</h3>
                <div className="text-sm text-white/80">{r.count} listings</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
