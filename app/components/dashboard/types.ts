export interface TelemetryRecord {
  id?: number;
  timestamp: string;
  t10: number;
  t30: number;
  t50: number;
  ambient: number;
  humidity: number;
  battery: number;
  v_solar?: number; // <-- New field added
  csq?: number;
  lat?: number;
  lon?: number;
}

export type ChartRange =
  | "1D"
  | "1W"
  | "1M"
  | "ALL"
  | "CUSTOM";

export type QuickChartRange =
  | "1D"
  | "1W"
  | "1M"
  | "ALL";

export type ReportFormat = "CSV" | "PDF";