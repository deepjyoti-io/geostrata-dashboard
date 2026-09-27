"use client";

import {
  BatteryCharging,
  Clock,
  Zap,
  Sun,
} from "lucide-react";

import BatterySpokeGauge from "./BatterySpokeGauge";

interface BatteryCardProps {
  currentBattery: number;
  solarVoltage?: number;
  batteryPercent: number;
  lastSleepCycle: number;
  avgSleepCycle: number;
}

export default function BatteryCard({
  currentBattery,
  solarVoltage = 0,
  batteryPercent,
  lastSleepCycle,
  avgSleepCycle,
}: BatteryCardProps) {
  return (
    <div className="lg:col-span-4 bg-[#0d0f17] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wide flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-[#00e676]" />
            Power System Health
          </h2>

          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            18650 CELL
          </span>
        </div>

        <div className="grid grid-cols-4 text-center py-2 border-b border-white/5 text-xs gap-1">
          {/* Battery Voltage */}
          <div>
            <span className="text-slate-500 block text-[9px] sm:text-[10px] truncate">
              BATTERY
            </span>
            <span className="font-bold text-white flex items-center justify-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs">
              <Zap className="w-3 h-3 text-yellow-400 shrink-0" />
              {currentBattery.toFixed(2)} V
            </span>
          </div>

          {/* Solar Panel Output */}
          <div>
            <span className="text-slate-500 block text-[9px] sm:text-[10px] truncate">
              SOLAR
            </span>
            <span className="font-bold text-amber-400 flex items-center justify-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs">
              <Sun className="w-3 h-3 text-amber-400 shrink-0" />
              {solarVoltage.toFixed(2)} V
            </span>
          </div>

          {/* Last Data Transmission */}
          <div>
            <span className="text-slate-500 block text-[9px] sm:text-[10px] truncate">
              LAST PING
            </span>
            <span className="font-bold text-white flex items-center justify-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs">
              <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
              {lastSleepCycle} M
            </span>
          </div>

          {/* Avg Cycle */}
          <div>
            <span className="text-slate-500 block text-[9px] sm:text-[10px] truncate">
              AVG CYCLE
            </span>
            <span className="font-bold text-[#00e676] text-[11px] sm:text-xs">
              {avgSleepCycle} M
            </span>
          </div>
        </div>
      </div>

      <BatterySpokeGauge
        batteryVolts={currentBattery}
        batteryPercent={batteryPercent}
      />

      <div className="pt-2 border-t border-white/5 text-[10px] sm:text-[11px] text-slate-400 flex justify-between items-center">
        <span>
          Source: Solar + Li-Ion
        </span>

        <span className="text-emerald-400 font-mono">
          Deep Sleep Active
        </span>
      </div>
    </div>
  );
}