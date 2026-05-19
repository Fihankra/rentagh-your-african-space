export function StatsBand() {
  const stats = [
    { n: "12,400+", label: "Verified listings" },
    { n: "92", label: "Cities & towns" },
    { n: "48k", label: "Trusted users" },
    { n: "4.9", label: "Average rating" },
  ];
  return (
    <section className="mt-24">
      <div className="container-x">
        <div className="overflow-hidden rounded-[36px] bg-primary text-primary-foreground">
          <div className="grid grid-cols-2 divide-y divide-white/10 md:grid-cols-4 md:divide-x md:divide-y-0">
            {stats.map((s) => (
              <div key={s.label} className="px-6 py-10 text-center">
                <div className="font-display text-4xl font-semibold md:text-5xl">{s.n}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-white/65">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}