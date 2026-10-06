"use client";

import {
  Download,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            Dashboard Overview
          </h1>

          <Badge variant="outline">Station Online</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Refresh"
            onClick={fetchData}
          >
            <RefreshCw />
          </Button>

          <Button onClick={() => setIsReportOpen(true)}>
            <Download data-icon="inline-start" />
            Generate Report
          </Button>
        </div>
      </div>

      <Separator />
    </div>
  );
}
