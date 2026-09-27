"use client";

import {
  Download,
  RefreshCw,
} from "lucide-react";

interface DashboardHeaderProps {
  fetchData: () => void | Promise<void>;

  setIsReportOpen: (
    open: boolean
  ) => void;
}

export default function DashboardHeader({
  fetchData,
  setIsReportOpen,
}: DashboardHeaderProps) {

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">

      <div className="flex items-center gap-3">

        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Dashboard Overview
        </h1>

        <span className="text-[11px] sm:text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono">

          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

          Station Online

        </span>

      </div>

      <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">

        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-[#12141f] border border-white/10 hover:border-white/20 text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() =>
            setIsReportOpen(true)
          }
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-xs px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition"
        >

          <Download className="w-3.5 h-3.5" />

          Generate Report

        </button>

      </div>

    </div>
  );
}