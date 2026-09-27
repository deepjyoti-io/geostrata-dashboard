"use client";

import { MapPin } from "lucide-react";

interface LocationMapProps {
  mapLat: number;
  mapLon: number;
}

export default function LocationMap({
  mapLat,
  mapLon,
}: LocationMapProps) {

  return (
    <div className="lg:col-span-5 bg-[#0d0f17] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">

      <div className="flex justify-between items-center mb-3">

        <h2 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">

          <MapPin className="w-4 h-4 text-rose-400" />

          Node Geo-Location

        </h2>

        <span className="text-[9px] sm:text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono">
          SIM800L Cell LBS
        </span>

      </div>

      <div className="w-full h-40 sm:h-48 rounded-xl overflow-hidden border border-white/10 relative bg-[#07080c]">

        <iframe
          title="Node Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLon - 0.02}%2C${mapLat - 0.02}%2C${mapLon + 0.02}%2C${mapLat + 0.02}&layer=mapnik`}
          className="opacity-60 invert contrast-150 saturate-0 pointer-events-auto"
        />

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-rose-500/30 bg-rose-500/10 animate-ping absolute" />

          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-rose-500/50 bg-rose-500/20 absolute" />

          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-600 border-2 border-white shadow-[0_0_15px_rgba(244,63,94,0.9)] flex items-center justify-center z-10">

            <span className="w-1.5 h-1.5 rounded-full bg-white" />

          </div>

        </div>

      </div>

    </div>
  );
}