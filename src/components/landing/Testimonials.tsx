import { Star } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const t = [
  { name: "Akosua D.", role: "Renter · Accra", body: "Found a verified apartment in East Legon in two days. The host was on RentaGh's verified list — the move was seamless.", rating: 5 },
  { name: "Ibrahim K.", role: "KNUST student", body: "I booked my hostel from Tamale before even arriving in Kumasi. Photos matched, security was real, Wi-Fi was fast.", rating: 5 },
  { name: "Yaa O.", role: "Property developer", body: "The premium listing tools and verification flow finally made my Trasacco units look the way they deserve.", rating: 5 },
];

export function Testimonials() {
  return (
    <section className="mt-24">
      <SectionHeading title="Loved across the country" subtitle="Real Ghanaians, real moves, real keys." />
      <div className="container-x mt-10 grid gap-6 md:grid-cols-3">
        {t.map((x) => (
          <div key={x.name} className="rounded-3xl border hairline bg-card p-7">
            <div className="flex gap-0.5 text-[color:var(--accent)]">
              {Array.from({ length: x.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-5 font-display text-xl leading-snug text-foreground">"{x.body}"</p>
            <div className="mt-6 text-sm">
              <div className="font-semibold text-foreground">{x.name}</div>
              <div className="text-muted-foreground">{x.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}