"use client";

import {
  Droplets,
  Thermometer,
} from "lucide-react";

import type {
  TelemetryRecord,
} from "./types";

interface SensorMatrixProps {
  latest: TelemetryRecord | null;
}

export default function SensorMatrix({
  latest,
}: SensorMatrixProps) {

  return (
    <div className="lg:col-span-7 bg-[#0d0f17] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">

          <Thermometer className="w-4 h-4 text-cyan-400" />

          Sensor Matrix Breakdown

        </h2>

        <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
          DS18B20 + Ambient
        </span>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-auto">

        <div className="md:col-span-7 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 pr-0 md:pr-4">

          <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase font-mono mb-2">
            DS18B20 SUBSURFACE PROBES
          </p>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs">

              <thead>

                <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider text-[10px]">

                  <th className="pb-2 font-medium">
                    SENSOR
                  </th>

                  <th className="pb-2 font-medium">
                    DEPTH
                  </th>

                  <th className="pb-2 font-medium">
                    READING
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-white/5">

                <tr>

                  <td className="py-2.5 font-medium text-white flex items-center gap-1.5">

                    <span className="w-2 h-2 rounded-full bg-amber-400" />

                    #1

                  </td>

                  <td className="py-2.5 text-slate-400">
                    10cm Depth
                  </td>

                  <td className="py-2.5 font-bold text-amber-400">
                    {latest?.t10?.toFixed(2) || "--"} °C
                  </td>

                </tr>

                <tr>

                  <td className="py-2.5 font-medium text-white flex items-center gap-1.5">

                    <span className="w-2 h-2 rounded-full bg-cyan-400" />

                    #2

                  </td>

                  <td className="py-2.5 text-slate-400">
                    30cm Depth
                  </td>

                  <td className="py-2.5 font-bold text-cyan-400">
                    {latest?.t30?.toFixed(2) || "--"} °C
                  </td>

                </tr>

                <tr>

                  <td className="py-2.5 font-medium text-white flex items-center gap-1.5">

                    <span className="w-2 h-2 rounded-full bg-indigo-400" />

                    #3

                  </td>

                  <td className="py-2.5 text-slate-400">
                    50cm Depth
                  </td>

                  <td className="py-2.5 font-bold text-indigo-400">
                    {latest?.t50?.toFixed(2) || "--"} °C
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

        <div className="md:col-span-5 flex flex-col justify-center space-y-3 pl-0 md:pl-2">

          <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase font-mono">
            AMBIENT CLIMATE (DHT22)
          </p>

          <div className="bg-[#12141f] p-3 rounded-xl border border-white/5 flex items-center justify-between">

            <div className="flex items-center gap-2.5">

              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">

                <Thermometer className="w-4 h-4" />

              </div>

              <div>

                <span className="text-[10px] text-slate-400 block">
                  Ambient Temp
                </span>

                <span className="text-xs sm:text-sm font-bold text-white">
                  {latest?.ambient?.toFixed(2) || "--"} °C
                </span>

              </div>

            </div>

          </div>

          <div className="bg-[#12141f] p-3 rounded-xl border border-white/5 flex items-center justify-between">

            <div className="flex items-center gap-2.5">

              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">

                <Droplets className="w-4 h-4" />

              </div>

              <div>

                <span className="text-[10px] text-slate-400 block">
                  Relative Humidity
                </span>

                <span className="text-xs sm:text-sm font-bold text-white">
                  {latest?.humidity?.toFixed(1) || "--"} %
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}