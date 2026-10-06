"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Input } from "@/components/ui/input";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

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

const chartConfig = {
  t10: {
    label: "10cm Depth",
    color: "var(--chart-1)",
  },
  t30: {
    label: "30cm Depth",
    color: "var(--chart-2)",
  },
  t50: {
    label: "50cm Depth",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

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
    <Card className="lg:col-span-8">
      <CardHeader>
        <CardTitle className="col-span-2 sm:col-span-1">Thermal Propagation Trend</CardTitle>

        <CardDescription className="col-span-2 sm:col-span-1">
          Real-time subsurface temperature gradients across depths
        </CardDescription>

        <CardAction className="col-start-1 row-span-1 row-start-3 mt-2 justify-self-start sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:justify-self-end">
          <ToggleGroup
            variant="outline"
            value={chartRange === "CUSTOM" ? [] : [chartRange]}
            onValueChange={(value) => {
              if (value.length > 0) {
                applyQuickFilter(value[0] as QuickChartRange);
              }
            }}
          >
            {(["1D", "1W", "1M", "ALL"] as const).map((r) => (
              <ToggleGroupItem key={r} value={r}>
                {r}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-sm">
            <Calendar className="size-4" />
            Custom Range:
          </div>

          <Input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="sm:w-auto"
          />

          <span className="text-muted-foreground hidden sm:inline">
            to
          </span>

          <Input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="sm:w-auto"
          />

          <Button
            variant="secondary"
            onClick={applyCustomFilter}
          >
            Apply
          </Button>
        </div>

        <ChartContainer
          config={chartConfig}
          className="h-56 w-full sm:h-64"
        >
          <AreaChart data={filteredData}>
            <defs>
              {(["t10", "t30", "t50"] as const).map((key) => (
                <linearGradient
                  key={key}
                  id={`${key}Fill`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickFormatter={(tick) =>
                tick
                  ? new Date(String(tick)).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) =>
                    label
                      ? new Date(String(label)).toLocaleString()
                      : ""
                  }
                />
              }
            />

            <ChartLegend content={<ChartLegendContent />} />

            {(["t10", "t30", "t50"] as const).map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                fill={`url(#${key}Fill)`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
