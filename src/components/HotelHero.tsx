import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

interface HotelHeroProps {
  userName?: string;
  room?: string;
  roleLabel?: string;
  tagline?: string;
  compact?: boolean;
  boravakDo?: string;
}

function formatBoravak(iso: string): string {
  return new Date(iso).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HotelHero({
  userName,
  room,
  roleLabel,
  tagline,
  compact,
  boravakDo,
}: HotelHeroProps) {
  const minH = compact ? "min-h-[140px] sm:min-h-[160px]" : "min-h-[240px] sm:min-h-[300px]";

  return (
    <section className="ht-panel overflow-hidden">
      <div className={`relative ${minH}`}>
        <Image
          src="/images/hotel-hero.svg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ht-navy-dark via-ht-navy-dark/80 to-ht-navy-dark/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ht-navy-dark/95 via-ht-navy-dark/40 to-transparent" />

        <div className={`relative flex h-full ${minH} flex-col justify-end px-6 py-5 sm:px-10 sm:py-9`}>
          <p className="ht-label mb-2 text-ht-gold-light">Vojni hotel · Beograd</p>
          <h1 className={`ht-display max-w-xl leading-tight text-white ${compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl md:text-[2.75rem]"}`}>
            {APP_NAME}
          </h1>
          {!compact && (
            <p className="mt-2 max-w-lg text-base font-light leading-relaxed text-white/90 sm:text-lg">
              {tagline || "Službeni digitalni servis za stanare i upravu hotela"}
            </p>
          )}

          {userName && (
            <div className="mt-4 inline-flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-widest text-ht-gold-light/80">
                  {roleLabel || "Prijavljeni korisnik"}
                </p>
                <p className="mt-0.5 text-lg font-medium text-white">{userName}</p>
              </div>
              {room && (
                <div className="border-l border-white/15 pl-5">
                  <p className="text-[0.65rem] uppercase tracking-widest text-ht-gold-light/80">
                    Smeštaj
                  </p>
                  <p className="mt-0.5 text-lg font-medium text-white">Soba {room}</p>
                </div>
              )}
              {boravakDo && (
                <div className="border-l border-white/15 pl-5">
                  <p className="text-[0.65rem] uppercase tracking-widest text-ht-gold-light/80">
                    Boravak do
                  </p>
                  <p className="mt-0.5 text-lg font-medium text-white">{formatBoravak(boravakDo)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
