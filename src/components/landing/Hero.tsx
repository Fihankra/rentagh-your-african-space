import { Link } from "@tanstack/react-router";
import { Search, MapPin, Users } from "lucide-react";
import hero from "@/assets/hero-villa.jpg";

export function Hero() {
  return (
    <section className="relative isolate min-h-[88vh] w-full overflow-hidden bg-[color:var(--charcoal)] text-white md:min-h-[92vh]">
      <img
        src={hero}
        alt="Luxury villa at golden hour in Accra"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20 md:from-black/70 md:via-black/10 md:to-transparent" />

      <div className="container-x relative flex min-h-[88vh] flex-col justify-end pb-10 pt-28 md:min-h-[92vh] md:pb-20 md:pt-40">
        <div className="max-w-3xl">
          <h1 className="font-display text-balance text-[2.6rem] font-semibold leading-[1.05] md:text-7xl">
            Find your next address <span className="italic text-[color:var(--accent)]">in Ghana</span>.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-white/85 md:mt-5 md:text-lg">
            Student hostels, houses for rent, building and farm lands — verified and beautifully presented.
          </p>
        </div>

        {/* mobile compact search */}
        <div className="mt-7 md:hidden">
          <Link
            to="/browse"
            className="flex items-center gap-3 rounded-full bg-white/95 px-4 py-3 text-foreground shadow-[var(--shadow-elegant)] backdrop-blur"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span className="flex-1 text-sm text-muted-foreground">Where to in Ghana?</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Search className="h-4 w-4" />
            </span>
          </Link>
        </div>

        {/* desktop expanded search */}
        <div className="mt-10 hidden w-full md:block">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-[1.3fr_1fr_1fr_auto] gap-px overflow-hidden rounded-3xl bg-white/95 p-2 text-foreground shadow-[var(--shadow-elegant)] backdrop-blur"
          >
            <Field icon={MapPin} label="Where" placeholder="Accra, Kumasi, Cape Coast…" />
            <Field icon={Search} label="What" placeholder="Hostels, houses, lands…" />
            <Field icon={Users} label="Budget" placeholder="Any budget" />

            <Link
              to="/browse"
              className="m-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
          </form>
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
