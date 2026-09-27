"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Calendar } from "lucide-react";

import type {
  QuickChartRange,
  TelemetryRecord,
} from "./types";

interface ThermalChartProps {
  filteredData: TelemetryRecord[];

  chartRange:
    | QuickChartRange
    | "CUSTOM";

  applyQuickFilter: (
    range: QuickChartRange
  ) => void;

  startDate: string;
  endDate: string;

  setStartDate: (
    value: string
  ) => void;

  setEndDate: (
    value: string
  ) => void;

  applyCustomFilter: () => void;
}

export default function ThermalChart({
  filteredData,
  chartRange,
  applyQuickFilter,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  applyCustomFilter,
}: ThermalChartProps) {

  return (
    <div className="lg:col-span-8 bg-[#0d0f17] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

        <div>

          <h2 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">

            <span className="w-2 h-2 rounded-full bg-[#00e676]" />

            Thermal Propagation Trend

          </h2>

          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Real-time subsurface temperature gradients across depths
          </p>

        </div>

        <div className="flex items-center gap-1 bg-[#12141f] p-1 rounded-lg border border-white/5 text-xs self-start sm:self-auto">

          {(
            ["1D", "1W", "1M", "ALL"] as const
          ).map((r) => (

            <button
              key={r}
              onClick={() =>
                applyQuickFilter(r)
              }
              className={`px-2.5 py-1 sm:px-3 rounded-md font-medium transition text-xs ${
                chartRange === r
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>

          ))}

        </div>

      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 mb-4 bg-[#12141f]/60 p-2.5 rounded-xl border border-white/5 text-xs">

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">

          <Calendar className="w-3.5 h-3.5 text-indigo-400" />

          Custom Range:

        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className="bg-[#07080c] border border-white/10 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          />

          <span className="text-slate-600 hidden sm:inline">
            to
          </span>

          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            className="bg-[#07080c] border border-white/10 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          />

          <button
            onClick={applyCustomFilter}
            className="bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 px-3 py-1 rounded hover:bg-indigo-600 hover:text-white transition w-full sm:w-auto mt-1 sm:mt-0"
          >
            Apply
          </button>

        </div>

      </div>

      <div className="h-56 sm:h-64 w-full">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart
            data={filteredData}
          >

            <defs>

              <linearGradient
                id="t10Color"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#eab308"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="#eab308"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="t30Color"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#06b6d4"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="#06b6d4"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="t50Color"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#6366f1"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="#6366f1"
                  stopOpacity={0}
                />
              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e2333"
              vertical={false}
            />

            <XAxis
              dataKey="timestamp"
              stroke="#475569"
              tickFormatter={(tick) =>
                tick
                  ? new Date(
                      String(tick)
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : ""
              }
              fontSize={10}
            />

            <YAxis
              stroke="#475569"
              fontSize={10}
              domain={[
                "auto",
                "auto",
              ]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#12141f",
                borderColor: "#1e2333",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(label) =>
                label
                  ? new Date(
                      String(label)
                    ).toLocaleString()
                  : ""
              }
            />

            <Area
              type="monotone"
              dataKey="t10"
              name="10cm Depth"
              stroke="#eab308"
              fillOpacity={1}
              fill="url(#t10Color)"
              strokeWidth={2}
            />

            <Area
              type="monotone"
              dataKey="t30"
              name="30cm Depth"
              stroke="#06b6d4"
              fillOpacity={1}
              fill="url(#t30Color)"
              strokeWidth={2}
            />

            <Area
              type="monotone"
              dataKey="t50"
              name="50cm Depth"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#t50Color)"
              strokeWidth={2}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}