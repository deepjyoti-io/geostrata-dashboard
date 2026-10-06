"use client";

import {
  Droplets,
  Thermometer,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type {
  TelemetryRecord,
} from "./types";

interface SensorMatrixProps {
  latest: TelemetryRecord | null;
}

export default function SensorMatrix({
  latest,
}: SensorMatrixProps) {
  const probes = [
    { id: "#1", depth: "10cm Depth", value: latest?.t10 },
    { id: "#2", depth: "30cm Depth", value: latest?.t30 },
    { id: "#3", depth: "50cm Depth", value: latest?.t50 },
  ];

  return (
    <Card className="lg:col-span-7">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer />
          Sensor Matrix Breakdown
        </CardTitle>

        <CardDescription>
          <Badge variant="outline">DS18B20 + Ambient</Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-muted-foreground mb-2 text-xs uppercase">
            DS18B20 Subsurface Probes
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SENSOR</TableHead>
                <TableHead>DEPTH</TableHead>
                <TableHead>READING</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {probes.map((probe) => (
                <TableRow key={probe.id}>
                  <TableCell className="font-medium">
                    {probe.id}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {probe.depth}
                  </TableCell>

                  <TableCell className="font-medium">
                    {probe.value?.toFixed(2) || "--"} °C
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 md:col-span-5">
          <p className="text-muted-foreground text-xs uppercase">
            Ambient Climate (DHT22)
          </p>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Thermometer className="size-4" />

            <div>
              <span className="text-muted-foreground block text-xs">
                Ambient Temp
              </span>

              <span className="text-sm font-medium">
                {latest?.ambient?.toFixed(2) || "--"} °C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Droplets className="size-4" />

            <div>
              <span className="text-muted-foreground block text-xs">
                Relative Humidity
              </span>

              <span className="text-sm font-medium">
                {latest?.humidity?.toFixed(1) || "--"} %
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
