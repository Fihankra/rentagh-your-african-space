import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Youtube, Globe } from "lucide-react";
import { Logo } from "@/components/site/Logo";

const cols = [
  {
    heading: "Discover",
    links: [
      { to: "/browse/hostels", label: "Student hostels" },
      { to: "/browse/homes", label: "Houses for rent" },
      { to: "/browse/lands", label: "Building lands" },
      { to: "/browse/farmlands", label: "Farm lands" },
    ],
  },
  {
    heading: "Support",
    links: [
      { to: "/faqs", label: "FAQs" },
      { to: "/terms", label: "Terms & Conditions" },
      { to: "/contact", label: "Contact us" },
      { to: "/login", label: "Login" },
    ],
  },
  {
    heading: "Company",
    links: [
      { to: "/about", label: "About RentaGh" },
      { to: "/contact", label: "List a property" },
      { to: "/contact", label: "Partner with us" },
      { to: "/browse", label: "Browse all" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t hairline bg-[color:var(--charcoal)] text-[color:var(--cream)]">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              Every Space. One Platform. Student hostels, houses for rent, building lands and farm
              lands, verified across Ghana.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 flex max-w-sm overflow-hidden rounded-full border border-white/15 bg-white/5 backdrop-blur"
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/45 focus:outline-none"
              />
              <button className="bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--charcoal)]">
                Notify me
              </button>
            </form>
          </div>

          {cols.map((col) => (
            <div key={col.heading}>
              <div className="font-display text-sm uppercase tracking-[0.2em] text-[color:var(--accent)]">
                {col.heading}
              </div>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={`${col.heading}-${l.label}`}>
                    <Link
                      to={l.to}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            www.rentagh.com · Accra, Ghana
          </div>
          <div>© {new Date().getFullYear()} RentaGh. Every Space. One Platform.</div>
          <div className="flex items-center gap-4">
            <Instagram className="h-4 w-4" />
            <Twitter className="h-4 w-4" />
            <Facebook className="h-4 w-4" />
            <Youtube className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
