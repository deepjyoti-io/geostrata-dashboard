"use client";

import {
  BatteryCharging,
  Clock,
  Zap,
  Sun,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import BatterySpokeGauge from "./BatterySpokeGauge";

interface BatteryCardProps {
  currentBattery: number;
  solarVoltage?: number;
  batteryPercent: number;
  lastSleepCycle: number;
}

export default function BatteryCard({
  currentBattery,
  solarVoltage = 0,
  batteryPercent,
  lastSleepCycle,
}: BatteryCardProps) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BatteryCharging />
          Power System Health
        </CardTitle>

        <CardDescription>
          <Badge variant="outline">18650 CELL</Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-muted-foreground text-xs">BATTERY</p>
            <p className="flex items-center justify-center gap-1 font-medium">
              <Zap className="size-3" />
              {currentBattery.toFixed(2)} V
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs">SOLAR</p>
            <p className="flex items-center justify-center gap-1 font-medium">
              <Sun className="size-3" />
              {solarVoltage.toFixed(2)} V
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs">LAST PING</p>
            <p className="flex items-center justify-center gap-1 font-medium">
              <Clock className="size-3" />
              {lastSleepCycle} M
            </p>
          </div>
        </div>

        <Separator />

        <BatterySpokeGauge
          batteryVolts={currentBattery}
          batteryPercent={batteryPercent}
        />
      </CardContent>

      <CardFooter className="justify-between text-muted-foreground text-xs">
        <span>Source: Solar + Li-Ion</span>
        <Badge variant="secondary">Deep Sleep Active</Badge>
      </CardFooter>
    </Card>
  );
}
