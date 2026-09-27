"use client";

import {
  ArrowUpRight,
  LayoutDashboard,
  Layers,
  ShieldCheck,
} from "lucide-react";

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

  return (
    <>

      {isMobileMenuOpen && (
        <div
          onClick={() =>
            setIsMobileMenuOpen(false)
          }
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 bottom-0 z-40
          w-64 bg-[#0d0f17] border-r border-white/5
          flex flex-col justify-between p-4
          transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >

        <div>

          <div className="hidden md:flex items-center gap-3 px-2 py-3 mb-6 border-b border-white/5">

            <div className="bg-[#00e676]/10 p-2 rounded-lg border border-[#00e676]/20">
              <Layers className="text-[#00e676] w-5 h-5" />
            </div>

            <div>

              <span className="font-bold text-base text-white tracking-wider block">
                GeoStrata
              </span>

              <span className="text-[10px] text-slate-500 font-mono block">
                Subsurface Telemetry
              </span>

            </div>

          </div>

          <nav className="space-y-1 mt-4 md:mt-0">

            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#161926] text-white font-medium text-sm border-l-2 border-[#00e676]"
            >
              <LayoutDashboard className="w-4 h-4 text-[#00e676]" />
              Dashboard
            </a>

          </nav>

          <div className="mt-8">

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
              Active Nodes
            </p>

            <div className="space-y-2">

              <button
                onClick={() => {
                  setSelectedNode("sim800l");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#161926] text-slate-300 hover:text-white font-medium text-sm transition border border-transparent hover:border-white/5"
              >

                <div className="flex items-center gap-3">

                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                  SIM800L Node

                </div>

                <ArrowUpRight className="w-4 h-4 text-slate-500" />

              </button>

            </div>

          </div>

        </div>

        <div className="bg-[#12141f] p-3 rounded-xl border border-white/5 flex items-center justify-between mt-6 md:mt-0">

          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300">
              ST01
            </div>

            <div>

              <p className="text-xs font-semibold text-white">
                Station #01 Node
              </p>

              <p className="text-[10px] text-slate-400">
                ESP32-WROOM-32
              </p>

            </div>

          </div>

          <ShieldCheck className="w-4 h-4 text-emerald-400" />

        </div>

      </aside>

    </>
  );
}