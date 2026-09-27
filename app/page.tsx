"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
} from "lucide-react";

import {
  createClient,
} from "@supabase/supabase-js";

import MobileNavbar from "./components/dashboard/MobileNavbar";
import Sidebar from "./components/dashboard/Sidebar";
import NodeModal from "./components/dashboard/NodeModal";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import BatteryCard from "./components/dashboard/BatteryCard";
import ThermalChart from "./components/dashboard/ThermalChart";
import SensorMatrix from "./components/dashboard/SensorMatrix";
import LocationMap from "./components/dashboard/LocationMap";
import ReportModal from "./components/dashboard/ReportModal";

import type {
  ChartRange,
  QuickChartRange,
  ReportFormat,
  TelemetryRecord,
} from "./components/dashboard/types";


const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);


export default function Dashboard() {

  // =====================================================
  // TELEMETRY STATE
  // =====================================================

  const [data, setData] =
    useState<TelemetryRecord[]>([]);

  const [filteredData, setFilteredData] =
    useState<TelemetryRecord[]>([]);

  const [latest, setLatest] =
    useState<TelemetryRecord | null>(null);

  const [loading, setLoading] =
    useState(true);


  // =====================================================
  // SLEEP CYCLE STATE
  // =====================================================

  const [lastSleepCycle, setLastSleepCycle] =
    useState<number>(15);

  const [avgSleepCycle, setAvgSleepCycle] =
    useState<number>(15);


  // =====================================================
  // NODE STATE
  // =====================================================

  const [selectedNode, setSelectedNode] =
    useState<string | null>(null);


  // =====================================================
  // CHART FILTER STATE
  // =====================================================

  const [chartRange, setChartRange] =
    useState<ChartRange>("1D");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");


  // =====================================================
  // REPORT STATE
  // =====================================================

  const [isReportOpen, setIsReportOpen] =
    useState(false);

  const [reportFrom, setReportFrom] =
    useState("");

  const [reportTo, setReportTo] =
    useState("");

  const [reportFormat, setReportFormat] =
    useState<ReportFormat>("CSV");

  const [isExporting, setIsExporting] =
    useState(false);


  // =====================================================
  // MOBILE MENU STATE
  // =====================================================

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);


  // =====================================================
  // CALCULATE SLEEP CYCLES
  // =====================================================

  const calculateSleepCycles = (
    chronologicalData: TelemetryRecord[]
  ) => {

    if (chronologicalData.length >= 2) {

      const lastIndex =
        chronologicalData.length - 1;


      const tLatest =
        new Date(
          chronologicalData[lastIndex].timestamp
        ).getTime();


      const tPrev =
        new Date(
          chronologicalData[lastIndex - 1].timestamp
        ).getTime();


      const diffMins =
        Math.round(
          Math.abs(
            tLatest - tPrev
          ) /
            (1000 * 60)
        );


      if (
        diffMins > 0 &&
        diffMins < 1440
      ) {
        setLastSleepCycle(
          diffMins
        );
      }


      let totalDiff = 0;

      let count = 0;


      for (
        let i = 1;
        i < chronologicalData.length;
        i++
      ) {

        const t1 =
          new Date(
            chronologicalData[i].timestamp
          ).getTime();


        const t0 =
          new Date(
            chronologicalData[i - 1].timestamp
          ).getTime();


        const gap =
          Math.abs(
            t1 - t0
          ) /
          (1000 * 60);


        if (
          gap > 0 &&
          gap < 1440
        ) {

          totalDiff += gap;

          count++;

        }

      }


      if (count > 0) {

        setAvgSleepCycle(
          Math.round(
            totalDiff / count
          )
        );

      }

    }

  };


  // =====================================================
  // QUICK CHART FILTER
  // =====================================================

  const applyQuickFilter = (
    range: QuickChartRange,
    sourceData = data
  ) => {

    setChartRange(range);


    if (
      sourceData.length === 0
    ) {
      return;
    }


    const now =
      new Date().getTime();

    let cutoff = 0;


    if (range === "1D") {

      cutoff =
        now -
        24 *
          60 *
          60 *
          1000;

    }

    else if (range === "1W") {

      cutoff =
        now -
        7 *
          24 *
          60 *
          60 *
          1000;

    }

    else if (range === "1M") {

      cutoff =
        now -
        30 *
          24 *
          60 *
          60 *
          1000;

    }

    else {

      setFilteredData(
        sourceData
      );

      return;

    }


    const filtered =
      sourceData.filter(
        (item) =>
          new Date(
            item.timestamp
          ).getTime() >= cutoff
      );


    setFilteredData(
      filtered.length > 0
        ? filtered
        : sourceData
    );

  };


  // =====================================================
  // FETCH TELEMETRY
  // =====================================================

  const fetchData = async () => {

    setLoading(true);


    const {
      data: telemetry,
    } = await supabase
      .from("telemetry")
      .select("*")
      .order(
        "timestamp",
        {
          ascending: false,
        }
      )
      .limit(500);


    if (
      telemetry &&
      telemetry.length > 0
    ) {

      const records =
        telemetry as TelemetryRecord[];


      setLatest(
        records[0]
      );


      const chronological =
        [
          ...records,
        ].reverse();


      setData(
        chronological
      );


      calculateSleepCycles(
        chronological
      );


      applyQuickFilter(
        "1D",
        chronological
      );

    }


    setLoading(false);

  };


  // =====================================================
  // CUSTOM DATE FILTER
  // =====================================================

  const applyCustomFilter = () => {

    if (
      !startDate ||
      !endDate
    ) {
      return;
    }


    setChartRange(
      "CUSTOM"
    );


    const start =
      new Date(
        startDate
      ).getTime();


    const end =
      new Date(
        endDate
      ).getTime();


    const filtered =
      data.filter(
        (item) => {

          const t =
            new Date(
              item.timestamp
            ).getTime();


          return (
            t >= start &&
            t <= end
          );

        }
      );


    setFilteredData(
      filtered
    );

  };


  // =====================================================
  // GENERATE REPORT
  // =====================================================

  const handleGenerateReport =
    async () => {

      setIsExporting(
        true
      );


      let query =
        supabase
          .from("telemetry")
          .select("*")
          .order(
            "timestamp",
            {
              ascending: true,
            }
          );


      if (reportFrom) {

        query =
          query.gte(
            "timestamp",
            new Date(
              reportFrom
            ).toISOString()
          );

      }


      if (reportTo) {

        query =
          query.lte(
            "timestamp",
            new Date(
              reportTo
            ).toISOString()
          );

      }


      const {
        data: reportRows,
      } = await query;


      const records =
        (
          reportRows ||
          data
        ) as TelemetryRecord[];


      // =================================================
      // CSV
      // =================================================

      if (
        reportFormat === "CSV"
      ) {

        const headers = [
          "Timestamp",
          "10cm (°C)",
          "30cm (°C)",
          "50cm (°C)",
          "Ambient (°C)",
          "Humidity (%)",
          "Battery (V)",
          "CSQ",
          "Lat",
          "Lon",
        ];


        const rows =
          records.map(
            (r) => [

              `"${new Date(
                r.timestamp
              ).toLocaleString()}"`,

              r.t10,

              r.t30,

              r.t50,

              r.ambient,

              r.humidity,

              r.battery,

              r.csq ?? 0,

              r.lat ?? 0,

              r.lon ?? 0,

            ]
          );


        const csvContent =
          "data:text/csv;charset=utf-8," +
          [
            headers.join(","),
            ...rows.map(
              (e) =>
                e.join(",")
            ),
          ].join("\n");


        const encodedUri =
          encodeURI(
            csvContent
          );


        const link =
          document.createElement(
            "a"
          );


        link.setAttribute(
          "href",
          encodedUri
        );


        link.setAttribute(
          "download",
          `GeoStrata_Telemetry_Report_${new Date()
            .toISOString()
            .slice(
              0,
              10
            )}.csv`
        );


        document.body.appendChild(
          link
        );


        link.click();


        document.body.removeChild(
          link
        );

      }


      // =================================================
      // PDF / PRINT
      // =================================================

      else {

        const printWindow =
          window.open(
            "",
            "_blank"
          );


        if (printWindow) {

          printWindow.document.write(`
            <html>

              <head>

                <title>
                  GeoStrata Telemetry Report
                </title>

                <style>

                  body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #111;
                  }

                  h1 {
                    color: #00c853;
                    margin-bottom: 4px;
                  }

                  p {
                    color: #666;
                    font-size: 14px;
                    margin-top: 0;
                  }

                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 12px;
                  }

                  th,
                  td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                  }

                  th {
                    background-color: #f4f4f4;
                  }

                </style>

              </head>

              <body>

                <h1>
                  GeoStrata Telemetry Summary Report
                </h1>

                <p>
                  Generated on:
                  ${new Date().toLocaleString()}
                  |
                  Station:
                  ESP32 + SIM800L #01
                </p>

                <table>

                  <thead>

                    <tr>

                      <th>
                        Timestamp
                      </th>

                      <th>
                        10cm (°C)
                      </th>

                      <th>
                        30cm (°C)
                      </th>

                      <th>
                        50cm (°C)
                      </th>

                      <th>
                        Ambient (°C)
                      </th>

                      <th>
                        Humidity (%)
                      </th>

                      <th>
                        Battery (V)
                      </th>

                      <th>
                        CSQ
                      </th>

                      <th>
                        Latitude
                      </th>

                      <th>
                        Longitude
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    ${records
                      .map(
                        (r) => `

                          <tr>

                            <td>
                              ${new Date(
                                r.timestamp
                              ).toLocaleString()}
                            </td>

                            <td>
                              ${r.t10?.toFixed(2)}
                            </td>

                            <td>
                              ${r.t30?.toFixed(2)}
                            </td>

                            <td>
                              ${r.t50?.toFixed(2)}
                            </td>

                            <td>
                              ${r.ambient?.toFixed(2)}
                            </td>

                            <td>
                              ${r.humidity?.toFixed(1)}
                            </td>

                            <td>
                              ${r.battery?.toFixed(2)}
                            </td>

                            <td>
                              ${r.csq ?? 0}/31
                            </td>

                            <td>
                              ${r.lat ?? 0}
                            </td>

                            <td>
                              ${r.lon ?? 0}
                            </td>

                          </tr>

                        `
                      )
                      .join("")}

                  </tbody>

                </table>

                <script>
                  window.print();
                </script>

              </body>

            </html>
          `);


          printWindow.document.close();

        }

      }


      setIsExporting(
        false
      );

      setIsReportOpen(
        false
      );

    };


  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {

    fetchData();

    const interval =
      setInterval(
        fetchData,
        60000
      );


    return () =>
      clearInterval(
        interval
      );

  }, []);


  // =====================================================
  // INITIAL LOADING
  // =====================================================

  if (
    loading &&
    !latest
  ) {

    return (

      <div className="min-h-screen bg-[#07080c] text-white flex items-center justify-center font-sans p-4">

        <div className="flex items-center gap-3 bg-[#11131c] px-6 py-4 rounded-xl border border-white/10 shadow-2xl">

          <Activity
            className="animate-spin text-[#00e676] w-5 h-5 shrink-0"
          />

          <span className="text-sm font-medium tracking-wide">
            Initializing GeoStrata Subsurface Node...
          </span>

        </div>

      </div>

    );

  }


  // =====================================================
  // DERIVED VALUES
  // =====================================================

  const currentBattery =
    latest?.battery || 0;


  const batteryPercent =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (currentBattery /
            4.2) *
            100
        )
      )
    );


  const mapLat =
    latest?.lat &&
    latest.lat !== 0
      ? latest.lat
      : 26.1445;


  const mapLon =
    latest?.lon &&
    latest.lon !== 0
      ? latest.lon
      : 91.7362;


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[#07080c] text-slate-200 font-sans md:overflow-hidden relative">


      {/* MOBILE NAVBAR */}

      <MobileNavbar
        isMobileMenuOpen={
          isMobileMenuOpen
        }
        setIsMobileMenuOpen={
          setIsMobileMenuOpen
        }
      />


      {/* SIDEBAR */}

      <Sidebar
        isMobileMenuOpen={
          isMobileMenuOpen
        }
        setSelectedNode={
          setSelectedNode
        }
        setIsMobileMenuOpen={
          setIsMobileMenuOpen
        }
      />


      {/* NODE MODAL */}

      <NodeModal
        selectedNode={
          selectedNode
        }
        latest={
          latest
        }
        setSelectedNode={
          setSelectedNode
        }
      />


      {/* MAIN CONTENT */}

      <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">


        {/* HEADER */}

        <DashboardHeader
          fetchData={
            fetchData
          }
          setIsReportOpen={
            setIsReportOpen
          }
        />


        {/* TOP ROW */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">


          {/* BATTERY */}

          <BatteryCard
            currentBattery={
              currentBattery
            }
            batteryPercent={
              batteryPercent
            }
            lastSleepCycle={
              lastSleepCycle
            }
            avgSleepCycle={
              avgSleepCycle
            }
          />


          {/* THERMAL CHART */}

          <ThermalChart
            filteredData={
              filteredData
            }
            chartRange={
              chartRange
            }
            applyQuickFilter={
              applyQuickFilter
            }
            startDate={
              startDate
            }
            endDate={
              endDate
            }
            setStartDate={
              setStartDate
            }
            setEndDate={
              setEndDate
            }
            applyCustomFilter={
              applyCustomFilter
            }
          />

        </div>


        {/* BOTTOM ROW */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">


          {/* SENSOR MATRIX */}

          <SensorMatrix
            latest={
              latest
            }
          />


          {/* LOCATION */}

          <LocationMap
            mapLat={
              mapLat
            }
            mapLon={
              mapLon
            }
          />

        </div>


      </main>


      {/* REPORT MODAL */}

      <ReportModal
        isReportOpen={
          isReportOpen
        }
        setIsReportOpen={
          setIsReportOpen
        }
        reportFrom={
          reportFrom
        }
        setReportFrom={
          setReportFrom
        }
        reportTo={
          reportTo
        }
        setReportTo={
          setReportTo
        }
        reportFormat={
          reportFormat
        }
        setReportFormat={
          setReportFormat
        }
        isExporting={
          isExporting
        }
        handleGenerateReport={
          handleGenerateReport
        }
      />

    </div>

  );
}