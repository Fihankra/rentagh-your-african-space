import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const cover = images[0];
  const rest = images.slice(1, 5);

  return (
    <>
      <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-3xl md:grid-cols-4 md:grid-rows-2">
        <button
          onClick={() => { setIdx(0); setOpen(true); }}
          className="relative md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto overflow-hidden"
        >
          <img src={cover} alt={alt} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
        </button>
        {rest.map((src, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i + 1); setOpen(true); }}
            className="relative hidden md:block overflow-hidden"
          >
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
          </button>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-6 right-6 hidden items-center gap-2 rounded-full bg-background/95 px-4 py-2 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] md:flex"
        >
          <Maximize2 className="h-4 w-4" /> View all photos
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4">
          <button onClick={() => setOpen(false)} className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white">
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <img src={images[idx]} alt="" className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain" />
          <button
            onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
            {idx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}