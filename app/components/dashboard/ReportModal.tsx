"use client";

import {
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import type {
  ReportFormat,
} from "./types";

interface ReportModalProps {
  isReportOpen: boolean;

  setIsReportOpen: (
    open: boolean
  ) => void;

  reportFrom: string;

  setReportFrom: (
    value: string
  ) => void;

  reportTo: string;

  setReportTo: (
    value: string
  ) => void;

  reportFormat: ReportFormat;

  setReportFormat: (
    format: ReportFormat
  ) => void;

  isExporting: boolean;

  handleGenerateReport: () =>
    | void
    | Promise<void>;
}

export default function ReportModal({
  isReportOpen,
  setIsReportOpen,
  reportFrom,
  setReportFrom,
  reportTo,
  setReportTo,
  reportFormat,
  setReportFormat,
  isExporting,
  handleGenerateReport,
}: ReportModalProps) {
  return (
    <Dialog
      open={isReportOpen}
      onOpenChange={setIsReportOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            Export Telemetry Report
          </DialogTitle>

          <DialogDescription>
            Choose a date range and format for the export.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="report-from">From Date</Label>

            <Input
              id="report-from"
              type="datetime-local"
              value={reportFrom}
              onChange={(e) =>
                setReportFrom(e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="report-to">To Date</Label>

            <Input
              id="report-to"
              type="datetime-local"
              value={reportTo}
              onChange={(e) =>
                setReportTo(e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Format</Label>

            <ToggleGroup
              variant="outline"
              className="w-full"
              value={[reportFormat]}
              onValueChange={(value) => {
                if (value.length > 0) {
                  setReportFormat(value[0] as ReportFormat);
                }
              }}
            >
              <ToggleGroupItem value="CSV" className="flex-1">
                CSV File
              </ToggleGroupItem>

              <ToggleGroupItem value="PDF" className="flex-1">
                PDF Printable
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleGenerateReport}
            disabled={isExporting}
          >
            {isExporting ? (
              <RefreshCw
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : (
              <Download data-icon="inline-start" />
            )}

            Download Data Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
