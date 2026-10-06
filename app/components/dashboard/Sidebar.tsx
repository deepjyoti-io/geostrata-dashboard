"use client";

import {
  ArrowUpRight,
  LayoutDashboard,
  Layers,
  ShieldCheck,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SidebarProps {
  isMobileMenuOpen: boolean;

  setSelectedNode: (
    node: string | null
  ) => void;

  setIsMobileMenuOpen: (
    open: boolean
  ) => void;
}

export default function Sidebar({
  isMobileMenuOpen,
  setSelectedNode,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const content = (
    <div className="flex h-full flex-col justify-between gap-6 p-4">
      <div className="flex flex-col gap-6">
        <div className="hidden items-center gap-3 md:flex">
          <Layers className="size-5" />

          <div>
            <span className="block font-semibold">
              GeoStrata
            </span>

            <span className="text-muted-foreground block text-xs">
              Subsurface Telemetry
            </span>
          </div>
        </div>

        <Separator className="hidden md:block" />

        <nav className="flex flex-col gap-1">
          <Button
            variant="secondary"
            className="justify-start"
            render={<a href="#" />}
            nativeButton={false}
          >
            <LayoutDashboard data-icon="inline-start" />
            Dashboard
          </Button>
        </nav>

        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Active Nodes
          </p>

          <Button
            variant="ghost"
            className="justify-between"
            onClick={() => {
              setSelectedNode("sim800l");
              setIsMobileMenuOpen(false);
            }}
          >
            SIM800L Node
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>ST01</AvatarFallback>
          </Avatar>

          <div>
            <p className="text-sm font-medium">
              Station #01 Node
            </p>

            <p className="text-muted-foreground text-xs">
              ESP32-WROOM-32
            </p>
          </div>
        </div>

        <ShieldCheck className="size-4" />
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        {content}
      </aside>

      <Sheet
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      >
        <SheetContent
          side="left"
          showCloseButton={false}
          className="md:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>GeoStrata navigation menu</SheetDescription>
          </SheetHeader>

          {content}
        </SheetContent>
      </Sheet>
    </>
  );
}
