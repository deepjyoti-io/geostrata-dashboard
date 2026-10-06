"use client";

import {
  Layers,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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
    <div className="flex items-center justify-between border-b bg-card p-4 md:hidden">
      <div className="flex items-center gap-2.5">
        <Layers className="size-5" />

        <div>
          <span className="block text-sm font-semibold">
            GeoStrata
          </span>

          <span className="text-muted-foreground block text-xs">
            Subsurface Telemetry
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle menu"
        onClick={() =>
          setIsMobileMenuOpen(!isMobileMenuOpen)
        }
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </Button>
    </div>
  );
}
