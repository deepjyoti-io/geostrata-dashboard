"use client";

import {
  Activity,
  MapPin,
  Wifi,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const getSignalInfo = (
  csq?: number
): { text: string; variant: BadgeVariant } => {
  if (
    csq === undefined ||
    csq === null ||
    csq === 0 ||
    csq === 99
  ) {
    return { text: "No Signal", variant: "destructive" };
  }

  const percent = Math.min(
    100,
    Math.round((csq / 31) * 100)
  );

  if (csq >= 20) {
    return { text: `${percent}% Strong`, variant: "default" };
  }

  if (csq >= 14) {
    return { text: `${percent}% Good`, variant: "secondary" };
  }

  if (csq >= 8) {
    return { text: `${percent}% Fair`, variant: "outline" };
  }

  return { text: `${percent}% Weak`, variant: "destructive" };
};

export default function NodeModal({
  selectedNode,
  latest,
  setSelectedNode,
}: NodeModalProps) {
  const signal = getSignalInfo(
    latest?.csq
  );

  return (
    <Dialog
      open={selectedNode === "sim800l"}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedNode(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="size-4" />
            SIM800L Node Details
          </DialogTitle>

          <DialogDescription>
            Cellular connection status for this node.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Wifi className="size-4 shrink-0" />

              <div>
                <p className="text-muted-foreground text-xs">
                  Network Strength
                </p>

                <p className="text-sm font-medium">
                  GPRS (airtelgprs.com)
                </p>
              </div>
            </div>

            <Badge variant={signal.variant}>
              {signal.text}
            </Badge>
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-3">
            <MapPin className="mt-0.5 size-4 shrink-0" />

            <div>
              <p className="text-muted-foreground mb-1 text-xs">
                Cellular Location (LBS Triangulation)
              </p>

              {latest?.lat &&
              latest?.lon &&
              (latest.lat !== 0 ||
                latest.lon !== 0) ? (
                <>
                  <p className="text-sm font-medium">
                    Cell Tower Fixed
                  </p>

                  <p className="text-muted-foreground mt-1 font-mono text-xs">
                    Lat: {latest.lat.toFixed(6)}°,
                    Lon: {latest.lon.toFixed(6)}°
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  Location Pending First Transmission...
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
