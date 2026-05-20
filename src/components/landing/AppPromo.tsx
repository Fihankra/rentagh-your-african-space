import { Apple, Smartphone, ShieldCheck, Zap, Wallet } from "lucide-react";
import hostel from "@/assets/cat-apartment.jpg";

export function AppPromo() {
  return (
    <section className="mt-24">
      <div className="container-x">
        <div className="overflow-hidden rounded-[36px] bg-[color:var(--charcoal)] text-white">
          <div className="grid md:grid-cols-2">
            <div className="p-10 md:p-14">
              <h2 className="mt-4 font-display text-4xl font-semibold text-balance md:text-5xl">
                RentaGh in your pocket. <span className="italic text-[color:var(--accent)]">Always.</span>
              </h2>
              <p className="mt-4 max-w-md text-white/70">
                Save searches, book stays, pay with Mobile Money, and chat with verified hosts — anywhere in Ghana, anytime.
              </p>
              <ul className="mt-8 grid gap-3 text-sm text-white/80">
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-[color:var(--accent)]" /> Verified hosts & properties</li>
                <li className="flex items-center gap-3"><Wallet className="h-4 w-4 text-[color:var(--accent)]" /> MTN, Telecel & AirtelTigo MoMo</li>
                <li className="flex items-center gap-3"><Zap className="h-4 w-4 text-[color:var(--accent)]" /> Instant booking & offline gallery</li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm backdrop-blur">
                  <Apple className="h-5 w-5" />
                  <span><span className="block text-[10px] uppercase tracking-widest text-white/55">Download on</span>App Store</span>
                </button>
                <button className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm backdrop-blur">
                  <Smartphone className="h-5 w-5" />
                  <span><span className="block text-[10px] uppercase tracking-widest text-white/55">Get it on</span>Google Play</span>
                </button>
              </div>
            </div>
            <div className="relative min-h-[320px]">
              <img src={hostel} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[color:var(--charcoal)]/70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}