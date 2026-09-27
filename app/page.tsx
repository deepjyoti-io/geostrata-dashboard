"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Activity, Wifi, Download, 
  Calendar, Layers, BatteryCharging, ArrowUpRight, ShieldCheck,
  FileText, X, CheckCircle2, RefreshCw, MapPin, Zap, Thermometer, Droplets, Clock
} from 'lucide-react';

interface TelemetryRecord {
  id?: number;
  timestamp: string;
  t10: number;
  t30: number;
  t50: number;
  ambient: number;
  humidity: number;
  battery: number;
  csq?: number;
  lat?: number;
  lon?: number;
}

const getSignalInfo = (csq?: number) => {
  if (csq === undefined || csq === null || csq === 0 || csq === 99) {
    return { text: 'No Signal', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  }
  const percent = Math.min(100, Math.round((csq / 31) * 100));
  if (csq >= 20) return { text: `${percent}% Strong`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (csq >= 14) return { text: `${percent}% Good`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (csq >= 8)  return { text: `${percent}% Fair`, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
  return { text: `${percent}% Weak`, color: 'text-red-400 bg-red-500/10 border-red-500/20' };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Flawless Symmetrical Radial Arc Gauge Component ---
const BatterySpokeGauge = ({ batteryVolts, batteryPercent }: { batteryVolts: number; batteryPercent: number }) => {
  const totalSpokes = 28;
  const activeSpokes = Math.round((batteryPercent / 100) * totalSpokes);

  return (
    <div className="relative flex flex-col items-center justify-center my-auto py-2">
      <svg className="w-60 h-36 overflow-visible" viewBox="0 0 200 145">
        {Array.from({ length: totalSpokes }).map((_, i) => {
          // Perfectly symmetric 220-degree sweep from -200 deg (left) to +20 deg (right) centered at -90 deg (top)
          const angle = -200 + (i * 220) / (totalSpokes - 1);
          const radians = (angle * Math.PI) / 180;
          const isActive = i < activeSpokes;

          const cx = 100;
          const cy = 100;
          const rInner = 62;
          const rOuter = 82;

          const x1 = cx + rInner * Math.cos(radians);
          const y1 = cy + rInner * Math.sin(radians);
          const x2 = cx + rOuter * Math.cos(radians);
          const y2 = cy + rOuter * Math.sin(radians);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? "#00e676" : "#1e2333"}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Centered Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
        <span className="text-3xl font-black text-white tracking-tight">{batteryPercent}%</span>
        <span className="text-[11px] text-slate-400 font-mono mt-0.5">{batteryVolts.toFixed(2)}V Li-Ion Battery</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState<TelemetryRecord[]>([]);
  const [filteredData, setFilteredData] = useState<TelemetryRecord[]>([]);
  const [latest, setLatest] = useState<TelemetryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Sleep Cycle Intervals
  const [lastSleepCycle, setLastSleepCycle] = useState<number>(15);
  const [avgSleepCycle, setAvgSleepCycle] = useState<number>(15);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<'1D' | '1W' | '1M' | 'ALL' | 'CUSTOM'>('1D');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [reportFormat, setReportFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: telemetry } = await supabase
      .from('telemetry')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);

    if (telemetry && telemetry.length > 0) {
      const records = telemetry as TelemetryRecord[];
      setLatest(records[0]);
      const chronological = [...records].reverse();
      setData(chronological);
      
      calculateSleepCycles(chronological);
      applyQuickFilter('1D', chronological);
    }
    setLoading(false);
  };

  const calculateSleepCycles = (chronologicalData: TelemetryRecord[]) => {
    if (chronologicalData.length >= 2) {
      const lastIndex = chronologicalData.length - 1;
      const tLatest = new Date(chronologicalData[lastIndex].timestamp).getTime();
      const tPrev = new Date(chronologicalData[lastIndex - 1].timestamp).getTime();
      const diffMins = Math.round(Math.abs(tLatest - tPrev) / (1000 * 60));

      if (diffMins > 0 && diffMins < 1440) {
        setLastSleepCycle(diffMins);
      }

      let totalDiff = 0;
      let count = 0;
      for (let i = 1; i < chronologicalData.length; i++) {
        const t1 = new Date(chronologicalData[i].timestamp).getTime();
        const t0 = new Date(chronologicalData[i - 1].timestamp).getTime();
        const gap = Math.abs(t1 - t0) / (1000 * 60);
        if (gap > 0 && gap < 1440) {
          totalDiff += gap;
          count++;
        }
      }
      if (count > 0) {
        setAvgSleepCycle(Math.round(totalDiff / count));
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const applyQuickFilter = (range: '1D' | '1W' | '1M' | 'ALL', sourceData = data) => {
    setChartRange(range);
    if (sourceData.length === 0) return;

    const now = new Date().getTime();
    let cutoff = 0;

    if (range === '1D') cutoff = now - 24 * 60 * 60 * 1000;
    else if (range === '1W') cutoff = now - 7 * 24 * 60 * 60 * 1000;
    else if (range === '1M') cutoff = now - 30 * 24 * 60 * 60 * 1000;
    else {
      setFilteredData(sourceData);
      return;
    }

    const filtered = sourceData.filter(item => new Date(item.timestamp).getTime() >= cutoff);
    setFilteredData(filtered.length > 0 ? filtered : sourceData);
  };

  const applyCustomFilter = () => {
    if (!startDate || !endDate) return;
    setChartRange('CUSTOM');
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const filtered = data.filter(item => {
      const t = new Date(item.timestamp).getTime();
      return t >= start && t <= end;
    });
    setFilteredData(filtered);
  };

  const handleGenerateReport = async () => {
    setIsExporting(true);
    let query = supabase.from('telemetry').select('*').order('timestamp', { ascending: true });

    if (reportFrom) query = query.gte('timestamp', new Date(reportFrom).toISOString());
    if (reportTo) query = query.lte('timestamp', new Date(reportTo).toISOString());

    const { data: reportRows } = await query;
    const records = (reportRows || data) as TelemetryRecord[];

    if (reportFormat === 'CSV') {
      const headers = ['Timestamp', '10cm (°C)', '30cm (°C)', '50cm (°C)', 'Ambient (°C)', 'Humidity (%)', 'Battery (V)', 'CSQ', 'Lat', 'Lon'];
      const rows = records.map(r => [
        `"${new Date(r.timestamp).toLocaleString()}"`,
        r.t10, r.t30, r.t50, r.ambient, r.humidity, r.battery, r.csq ?? 0, r.lat ?? 0, r.lon ?? 0
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `GeoStrata_Telemetry_Report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>GeoStrata Telemetry Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
                h1 { color: #00c853; margin-bottom: 4px; }
                p { color: #666; font-size: 14px; margin-top: 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f4f4f4; }
              </style>
            </head>
            <body>
              <h1>GeoStrata Telemetry Summary Report</h1>
              <p>Generated on: ${new Date().toLocaleString()} | Station: ESP32 + SIM800L #01</p>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th><th>10cm (°C)</th><th>30cm (°C)</th><th>50cm (°C)</th><th>Ambient (°C)</th><th>Humidity (%)</th><th>Battery (V)</th><th>CSQ</th><th>Latitude</th><th>Longitude</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.map(r => `
                    <tr>
                      <td>${new Date(r.timestamp).toLocaleString()}</td>
                      <td>${r.t10?.toFixed(2)}</td><td>${r.t30?.toFixed(2)}</td><td>${r.t50?.toFixed(2)}</td>
                      <td>${r.ambient?.toFixed(2)}</td><td>${r.humidity?.toFixed(1)}</td><td>${r.battery?.toFixed(2)}</td>
                      <td>${r.csq ?? 0}/31</td><td>${r.lat ?? 0}</td><td>${r.lon ?? 0}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }

    setIsExporting(false);
    setIsReportOpen(false);
  };

  if (loading && !latest) {
    return (
      <div className="min-h-screen bg-[#07080c] text-white flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 bg-[#11131c] px-6 py-4 rounded-xl border border-white/10 shadow-2xl">
          <Activity className="animate-spin text-[#00e676] w-5 h-5" />
          <span className="text-sm font-medium tracking-wide">Initializing GeoStrata Subsurface Node...</span>
        </div>
      </div>
    );
  }

  const currentBattery = latest?.battery || 0;
  const batteryPercent = Math.min(100, Math.max(0, Math.round((currentBattery / 4.2) * 100)));
  const mapLat = latest?.lat && latest.lat !== 0 ? latest.lat : 26.1445;
  const mapLon = latest?.lon && latest.lon !== 0 ? latest.lon : 91.7362;

  return (
    <div className="flex h-screen bg-[#07080c] text-slate-200 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0d0f17] border-r border-white/5 flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-white/5">
            <div className="bg-[#00e676]/10 p-2 rounded-lg border border-[#00e676]/20">
              <Layers className="text-[#00e676] w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-wider block">GeoStrata</span>
              <span className="text-[10px] text-slate-500 font-mono block">Subsurface Telemetry</span>
            </div>
          </div>

          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#161926] text-white font-medium text-sm border-l-2 border-[#00e676]">
              <LayoutDashboard className="w-4 h-4 text-[#00e676]" /> Dashboard
            </a>
          </nav>

          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Active Nodes</p>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedNode('sim800l')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#161926] text-slate-300 hover:text-white font-medium text-sm transition border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  SIM800L Node
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#12141f] p-3 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300">
              ST01
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Station #01 Node</p>
              <p className="text-[10px] text-slate-400">ESP32-WROOM-32</p>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
      </aside>

      {/* NODE MODAL POPUP */}
      {selectedNode === 'sim800l' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00e676]" /> SIM800L Node Details
              </h3>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#07080c] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs text-slate-500">Network Strength</p>
                    <p className="text-sm font-medium text-slate-200">GPRS (airtelgprs.com)</p>
                  </div>
                </div>
                {(() => {
                  const signal = getSignalInfo(latest?.csq);
                  return (
                    <span className={`text-xs border px-3 py-1.5 rounded-lg font-mono flex items-center gap-2 ${signal.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                      {signal.text}
                    </span>
                  );
                })()}
              </div>
              
              <div className="bg-[#07080c] p-4 rounded-xl border border-white/5 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Cellular Location (LBS Triangulation)</p>
                  {latest?.lat && latest?.lon && (latest.lat !== 0 || latest.lon !== 0) ? (
                    <>
                      <p className="text-sm text-slate-200 font-medium">Cell Tower Fixed</p>
                      <p className="text-[11px] text-[#00e676] font-mono mt-1">
                        Lat: {latest.lat.toFixed(6)}°, Lon: {latest.lon.toFixed(6)}°
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Location Pending First Transmission...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Station Online
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 rounded-lg bg-[#12141f] border border-white/10 hover:border-white/20 text-slate-300 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsReportOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition"
            >
              <Download className="w-3.5 h-3.5" /> Generate Report
            </button>
          </div>
        </div>

        {/* TOP ROW: Battery Radial Gauge + Main Area Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Widget 1: Power System Health */}
          <div className="lg:col-span-4 bg-[#0d0f17] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-slate-300 tracking-wide flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-[#00e676]" /> Power System Health
                </h2>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">18650 CELL</span>
              </div>

              {/* Dynamic Sleep Cycle Sub-Header */}
              <div className="flex justify-around text-center py-2 border-b border-white/5 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">OUTPUT</span>
                  <span className="font-bold text-white flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400"/> {currentBattery.toFixed(2)} V</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LAST SLEEP</span>
                  <span className="font-bold text-white flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400"/> {lastSleepCycle} Mins</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">AVG CYCLE</span>
                  <span className="font-bold text-[#00e676]">{avgSleepCycle} Mins</span>
                </div>
              </div>
            </div>

            {/* Symmetrical Semicircle Gauge */}
            <BatterySpokeGauge batteryVolts={currentBattery} batteryPercent={batteryPercent} />

            <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex justify-between items-center">
              <span>Power Source: Solar + Li-Ion</span>
              <span className="text-emerald-400 font-mono">Deep Sleep Mode Active</span>
            </div>
          </div>

          {/* Widget 2: Thermal Propagation Trend Chart */}
          <div className="lg:col-span-8 bg-[#0d0f17] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e676]"></span> Thermal Propagation Trend
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time subsurface temperature gradients across depths</p>
              </div>

              <div className="flex items-center gap-1 bg-[#12141f] p-1 rounded-lg border border-white/5 text-xs">
                {(['1D', '1W', '1M', 'ALL'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => applyQuickFilter(r)}
                    className={`px-3 py-1 rounded-md font-medium transition ${chartRange === r ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4 bg-[#12141f]/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Filter Range:
              </div>
              <input 
                type="datetime-local" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="bg-[#07080c] border border-white/10 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-600">to</span>
              <input 
                type="datetime-local" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="bg-[#07080c] border border-white/10 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={applyCustomFilter} 
                className="bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 px-3 py-1 rounded hover:bg-indigo-600 hover:text-white transition"
              >
                Apply
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient id="t10Color" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="t30Color" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="t50Color" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2333" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#475569" 
                    tickFormatter={(tick) => tick ? new Date(String(tick)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    fontSize={11}
                  />
                  <YAxis stroke="#475569" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12141f', borderColor: '#1e2333', color: '#fff', borderRadius: '8px' }}
                    labelFormatter={(label) => label ? new Date(String(label)).toLocaleString() : ''}
                  />
                  <Area type="monotone" dataKey="t10" name="10cm Depth" stroke="#eab308" fillOpacity={1} fill="url(#t10Color)" strokeWidth={2} />
                  <Area type="monotone" dataKey="t30" name="30cm Depth" stroke="#06b6d4" fillOpacity={1} fill="url(#t30Color)" strokeWidth={2} />
                  <Area type="monotone" dataKey="t50" name="50cm Depth" stroke="#6366f1" fillOpacity={1} fill="url(#t50Color)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Split Sensor Matrix + Tactical Red Spot Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Widget 3: Sensor Matrix Breakdown */}
          <div className="lg:col-span-7 bg-[#0d0f17] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" /> Sensor Matrix Breakdown
              </h2>
              <span className="text-xs text-slate-400 font-mono">DS18B20 + Ambient</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-auto">
              {/* Left Side: DS18B20 Subsurface Probes Only */}
              <div className="md:col-span-7 border-r border-white/5 pr-4">
                <p className="text-[11px] text-slate-500 uppercase font-mono mb-2">DS18B20 SUBSURFACE PROBES</p>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider">
                      <th className="pb-2 font-medium">SENSOR MODULE</th>
                      <th className="pb-2 font-medium">DEPTH LEVEL</th>
                      <th className="pb-2 font-medium">LIVE READING</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-2.5 font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span> DS18B20 #1
                      </td>
                      <td className="py-2.5 text-slate-400">10cm Subsurface</td>
                      <td className="py-2.5 font-bold text-amber-400">{latest?.t10?.toFixed(2) || '--'} °C</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span> DS18B20 #2
                      </td>
                      <td className="py-2.5 text-slate-400">30cm Subsurface</td>
                      <td className="py-2.5 font-bold text-cyan-400">{latest?.t30?.toFixed(2) || '--'} °C</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span> DS18B20 #3
                      </td>
                      <td className="py-2.5 text-slate-400">50cm Subsurface</td>
                      <td className="py-2.5 font-bold text-indigo-400">{latest?.t50?.toFixed(2) || '--'} °C</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Side: Ambient Temperature & Humidity */}
              <div className="md:col-span-5 flex flex-col justify-center space-y-3 pl-2">
                <p className="text-[11px] text-slate-500 uppercase font-mono">AMBIENT CLIMATE (DHT22)</p>
                
                <div className="bg-[#12141f] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ambient Temp</span>
                      <span className="text-sm font-bold text-white">{latest?.ambient?.toFixed(2) || '--'} °C</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#12141f] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Relative Humidity</span>
                      <span className="text-sm font-bold text-white">{latest?.humidity?.toFixed(1) || '--'} %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 4: Dynamic Tactical Red Spot Location Map */}
          <div className="lg:col-span-5 bg-[#0d0f17] border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" /> Node Geo-Location
              </h2>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono">
                SIM800L Cell LBS
              </span>
            </div>

            {/* Tactical Dark Map Container */}
            <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 relative bg-[#07080c]">
              <iframe
                title="Node Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLon - 0.02}%2C${mapLat - 0.02}%2C${mapLon + 0.02}%2C${mapLat + 0.02}&layer=mapnik`}
                className="opacity-60 invert contrast-150 saturate-0 pointer-events-auto"
              ></iframe>

              {/* Centered Red Spot Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-rose-500/30 bg-rose-500/10 animate-ping absolute"></div>
                <div className="w-12 h-12 rounded-full border border-rose-500/50 bg-rose-500/20 absolute"></div>
                <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-[0_0_15px_rgba(244,63,94,0.9)] flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>

                {/* Tactical Location Label */}
                <div className="absolute bottom-3 left-3 bg-[#0d0f17]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-rose-500/30 shadow-2xl flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <div>
                    <p className="text-[11px] font-bold text-white">SIM800L Node Location</p>
                    <p className="text-[10px] text-rose-400 font-mono">Lat: {mapLat.toFixed(4)}°, Lon: {mapLon.toFixed(4)}°</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Triangulated via GSM Towers</span>
              <span className="text-indigo-400 font-mono">airtelgprs.com</span>
            </div>
          </div>

        </div>

      </main>

      {/* GENERATE REPORT MODAL */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0f17] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-5">
            
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Export Telemetry Report</h3>
              </div>
              <button onClick={() => setIsReportOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">From Date & Time</label>
              <input 
                type="datetime-local" 
                value={reportFrom}
                onChange={e => setReportFrom(e.target.value)}
                className="w-full bg-[#12141f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">To Date & Time</label>
              <input 
                type="datetime-local" 
                value={reportTo}
                onChange={e => setReportTo(e.target.value)}
                className="w-full bg-[#12141f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Select Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReportFormat('CSV')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${reportFormat === 'CSV' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-[#12141f] border-white/5 text-slate-400 hover:text-white'}`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${reportFormat === 'CSV' ? 'text-indigo-400' : 'opacity-0'}`} /> CSV Spreadsheet
                </button>
                <button
                  type="button"
                  onClick={() => setReportFormat('PDF')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${reportFormat === 'PDF' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-[#12141f] border-white/5 text-slate-400 hover:text-white'}`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${reportFormat === 'PDF' ? 'text-indigo-400' : 'opacity-0'}`} /> PDF Document
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsReportOpen(false)}
                className="flex-1 bg-[#12141f] hover:bg-white/5 text-slate-300 text-xs py-2.5 rounded-xl font-medium border border-white/5 transition"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleGenerateReport}
                disabled={isExporting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-xl font-medium transition shadow-lg flex items-center justify-center gap-2"
              >
                {isExporting ? 'Generating...' : 'Download Report'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}