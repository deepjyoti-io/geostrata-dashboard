"use client";

import {
  Download,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";

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

  if (!isReportOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="bg-[#12141f] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative">

        <div className="flex justify-between items-center mb-5">

          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">

            <FileText className="w-5 h-5 text-indigo-400" />

            Export Telemetry Report

          </h3>

          <button
            onClick={() =>
              setIsReportOpen(false)
            }
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        <div className="space-y-4 text-xs">

          <div>

            <label className="text-slate-400 block mb-1">
              From Date
            </label>

            <input
              type="datetime-local"
              value={reportFrom}
              onChange={(e) =>
                setReportFrom(
                  e.target.value
                )
              }
              className="w-full bg-[#07080c] border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />

          </div>

          <div>

            <label className="text-slate-400 block mb-1">
              To Date
            </label>

            <input
              type="datetime-local"
              value={reportTo}
              onChange={(e) =>
                setReportTo(
                  e.target.value
                )
              }
              className="w-full bg-[#07080c] border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />

          </div>

          <div>

            <label className="text-slate-400 block mb-1">
              Format
            </label>

            <div className="grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() =>
                  setReportFormat("CSV")
                }
                className={`p-2.5 rounded-lg border font-medium flex items-center justify-center gap-2 transition ${
                  reportFormat === "CSV"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                    : "bg-[#07080c] border-white/5 text-slate-400"
                }`}
              >
                CSV File
              </button>

              <button
                type="button"
                onClick={() =>
                  setReportFormat("PDF")
                }
                className={`p-2.5 rounded-lg border font-medium flex items-center justify-center gap-2 transition ${
                  reportFormat === "PDF"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                    : "bg-[#07080c] border-white/5 text-slate-400"
                }`}
              >
                PDF Printable
              </button>

            </div>

          </div>

          <div className="pt-2">

            <button
              onClick={handleGenerateReport}
              disabled={isExporting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium p-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition"
            >

              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}

              Download Data Report

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}