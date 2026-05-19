import { Link } from "@tanstack/react-router";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import hero from "@/assets/hero-villa.jpg";

export function Hero() {
  return (
    <section className="relative isolate min-h-[92vh] w-full overflow-hidden bg-[color:var(--charcoal)] text-white">
      <img
        src={hero}
        alt="Luxury villa at golden hour in Accra"
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/85" />
      <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-black/55 to-transparent" />

      <div className="container-x relative flex min-h-[92vh] flex-col justify-end pb-12 pt-32 md:pb-20 md:pt-40">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.22em] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
            Every Space. One Platform.
          </div>
          <h1 className="font-display text-balance text-5xl font-semibold leading-[1.02] md:text-7xl">
            Find your next address <span className="italic text-[color:var(--accent)]">in Ghana</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
            Rent, buy or list homes, lands, hotels, hostels and commercial spaces — verified, beautifully presented, and unmistakably African.
          </p>
        </div>

        {/* search bar */}
        <div className="mt-10 w-full">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-white/95 p-2 text-foreground shadow-[var(--shadow-elegant)] backdrop-blur md:grid-cols-[1.3fr_1fr_1fr_0.9fr_auto]"
          >
            <Field icon={MapPin} label="Where" placeholder="Accra, Kumasi, Cape Coast…" />
            <Field icon={Search} label="What" placeholder="Apartments, hotels, lands…" />
            <Field icon={Calendar} label="When" placeholder="Any dates" />
            <Field icon={Users} label="Guests" placeholder="Add guests" />
            <Link
              to="/browse"
              className="m-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
          </form>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 text-sm text-white/70">
          <Stat n="12,400+" label="Verified listings" />
          <span className="h-4 w-px bg-white/20" />
          <Stat n="92" label="Towns & cities" />
          <span className="h-4 w-px bg-white/20" />
          <Stat n="48,000" label="Trusted users" />
        </div>
      </div>
    </section>
  );
}

function Field({
  icon: Icon, label, placeholder,
}: { icon: typeof MapPin; label: string; placeholder: string }) {
  return (
    <label className="group flex items-center gap-3 rounded-2xl px-5 py-3 transition-colors hover:bg-muted">
      <Icon className="h-4 w-4 text-primary" />
      <div className="flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <input
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </label>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-white">{n}</div>
      <div className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</div>
    </div>
  );
}