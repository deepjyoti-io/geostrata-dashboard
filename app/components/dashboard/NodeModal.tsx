"use client";

import {
  Activity,
  MapPin,
  Wifi,
  X,
} from "lucide-react";

import type {
  TelemetryRecord,
} from "./types";

interface NodeModalProps {
  selectedNode: string | null;

  latest: TelemetryRecord | null;

  setSelectedNode: (
    node: string | null
  ) => void;
}

const getSignalInfo = (
  csq?: number
) => {

  if (
    csq === undefined ||
    csq === null ||
    csq === 0 ||
    csq === 99
  ) {
    return {
      text: "No Signal",
      color:
        "text-red-400 bg-red-500/10 border-red-500/20",
    };
  }

  const percent = Math.min(
    100,
    Math.round((csq / 31) * 100)
  );

  if (csq >= 20) {
    return {
      text: `${percent}% Strong`,
      color:
        "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };
  }

  if (csq >= 14) {
    return {
      text: `${percent}% Good`,
      color:
        "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };
  }

  if (csq >= 8) {
    return {
      text: `${percent}% Fair`,
      color:
        "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    };
  }

  return {
    text: `${percent}% Weak`,
    color:
      "text-red-400 bg-red-500/10 border-red-500/20",
  };
};

export default function NodeModal({
  selectedNode,
  latest,
  setSelectedNode,
}: NodeModalProps) {

  if (selectedNode !== "sim800l") {
    return null;
  }

  const signal = getSignalInfo(
    latest?.csq
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="bg-[#12141f] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative">

        <div className="flex justify-between items-center mb-6">

          <h3 className="text-lg font-bold text-white flex items-center gap-2">

            <Activity className="w-5 h-5 text-[#00e676]" />

            SIM800L Node Details

          </h3>

          <button
            onClick={() =>
              setSelectedNode(null)
            }
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        <div className="space-y-4">

          <div className="bg-[#07080c] p-4 rounded-xl border border-white/5 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Wifi className="w-5 h-5 text-indigo-400 shrink-0" />

              <div>

                <p className="text-xs text-slate-500">
                  Network Strength
                </p>

                <p className="text-xs sm:text-sm font-medium text-slate-200">
                  GPRS (airtelgprs.com)
                </p>

              </div>

            </div>

            <span
              className={`text-xs border px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 ${signal.color}`}
            >

              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />

              {signal.text}

            </span>

          </div>

          <div className="bg-[#07080c] p-4 rounded-xl border border-white/5 flex items-start gap-3">

            <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />

            <div>

              <p className="text-xs text-slate-500 mb-1">
                Cellular Location (LBS Triangulation)
              </p>

              {latest?.lat &&
              latest?.lon &&
              (latest.lat !== 0 ||
                latest.lon !== 0) ? (
                <>
                  <p className="text-sm text-slate-200 font-medium">
                    Cell Tower Fixed
                  </p>

                  <p className="text-[11px] text-[#00e676] font-mono mt-1">
                    Lat: {latest.lat.toFixed(6)}°,
                    Lon: {latest.lon.toFixed(6)}°
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Location Pending First Transmission...
                </p>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}