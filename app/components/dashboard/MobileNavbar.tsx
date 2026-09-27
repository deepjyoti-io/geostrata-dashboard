"use client";

import {
  Layers,
  Menu,
  X,
} from "lucide-react";

interface MobileNavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (
    open: boolean
  ) => void;
}

export default function MobileNavbar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: MobileNavbarProps) {

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-[#0d0f17] border-b border-white/5 z-20">

      <div className="flex items-center gap-2.5">

        <div className="bg-[#00e676]/10 p-1.5 rounded-lg border border-[#00e676]/20">
          <Layers className="text-[#00e676] w-5 h-5" />
        </div>

        <div>

          <span className="font-bold text-sm text-white tracking-wider block">
            GeoStrata
          </span>

          <span className="text-[9px] text-slate-500 font-mono block">
            Subsurface Telemetry
          </span>

        </div>

      </div>

      <button
        onClick={() =>
          setIsMobileMenuOpen(
            !isMobileMenuOpen
          )
        }
        className="p-2 text-slate-300 hover:text-white bg-[#161926] rounded-lg border border-white/10 focus:outline-none"
      >

        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}

      </button>

    </div>
  );
}