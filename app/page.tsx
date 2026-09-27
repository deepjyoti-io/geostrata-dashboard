"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Activity, Wifi, Download, 
  Calendar, Layers, BatteryCharging, ArrowUpRight, ShieldCheck,
  FileText, X, CheckCircle2, RefreshCw
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
  csq?: number; // SIM800L Signal Quality (0 - 31)
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

export default function Dashboard() {
  const [data, setData] = useState<TelemetryRecord[]>([]);
  const [filteredData, setFilteredData] = useState<TelemetryRecord[]>([]);
  const [latest, setLatest] = useState<TelemetryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Chart Filtering States
  const [chartRange, setChartRange] = useState<'1D' | '1W' | '1M' | 'ALL' | 'CUSTOM'>('1D');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Report Modal States
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [reportFormat, setReportFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [isExporting, setIsExporting] = useState(false);

  // Initial Fetch
  const fetchData = async () => {
    setLoading(true);
    const { data: telemetry, error } = await supabase
      .from('telemetry')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);

    if (telemetry && telemetry.length > 0) {
      const records = telemetry as TelemetryRecord[];
      setLatest(records[0]);
      const chronological = [...records].reverse();
      setData(chronological);
      applyQuickFilter('1D', chronological);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Quick Date Filtering for Chart
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

  // Custom Date Filter for Chart
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

  // Report Generator Handler
  const handleGenerateReport = async () => {
    setIsExporting(true);
    let query = supabase.from('telemetry').select('*').order('timestamp', { ascending: true });

    if (reportFrom) query = query.gte('timestamp', new Date(reportFrom).toISOString());
    if (reportTo) query = query.lte('timestamp', new Date(reportTo).toISOString());

    const { data: reportRows } = await query;
    const records = (reportRows || data) as TelemetryRecord[];

    if (reportFormat === 'CSV') {
      const headers = ['Timestamp', '10cm Depth (°C)', '30cm Depth (°C)', '50cm Depth (°C)', 'Ambient (°C)', 'Humidity (%)', 'Battery (V)', 'Signal CSQ'];
      const rows = records.map(r => [
        `"${new Date(r.timestamp).toLocaleString()}"`,
        r.t10, r.t30, r.t50, r.ambient, r.humidity, r.battery, r.csq ?? 0
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
      // PDF Printable View
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
                    <th>Timestamp</th><th>10cm (°C)</th><th>30cm (°C)</th><th>50cm (°C)</th><th>Ambient (°C)</th><th>Humidity (%)</th><th>Battery (V)</th><th>CSQ Signal</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.map(r => `
                    <tr>
                      <td>${new Date(r.timestamp).toLocaleString()}</td>
                      <td>${r.t10?.toFixed(2)}</td><td>${r.t30?.toFixed(2)}</td><td>${r.t50?.toFixed(2)}</td>
                      <td>${r.ambient?.toFixed(2)}</td><td>${r.humidity?.toFixed(1)}</td><td>${r.battery?.toFixed(2)}</td>
                      <td>${r.csq ?? 0}/31</td>
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

  return (
    <div className="flex h-screen bg-[#07080c] text-slate-200 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0d0f17] border-r border-white/5 flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* App Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-white/5">
            <div className="bg-[#00e676]/10 p-2 rounded-lg border border-[#00e676]/20">
              <Layers className="text-[#00e676] w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-wider block">GeoStrata</span>
              <span className="text-[10px] text-slate-500 font-mono block">Subsurface Telemetry</span>
            </div>
          </div>

          {/* Cleaned Nav Items */}
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#161926] text-white font-medium text-sm border-l-2 border-[#00e676]">
              <LayoutDashboard className="w-4 h-4 text-[#00e676]" /> Dashboard
            </a>
            
            {/* Dynamic SIM800L Signal Quality Badge */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 text-sm">
              <Wifi className={`w-4 h-4 ${latest?.csq && latest.csq >= 8 ? 'text-emerald-400' : 'text-yellow-400'}`} /> 
              <span>SIM800L Signal</span> 
              
              {(() => {
                const signal = getSignalInfo(latest?.csq);
                return (
                  <span className={`ml-auto text-[10px] border px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${signal.color}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    {signal.text}
                  </span>
                );
              })()}
            </div>
          </nav>
        </div>

        {/* User / Station Footer */}
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
        
        {/* Top Action Bar */}
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

        {/* TOP GRID: System Health (Gauge) + Main Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Widget 1: Subsurface System Health */}
          <div className="lg:col-span-4 bg-[#0d0f17] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-slate-300 tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00e676]" /> Subsurface Thermal Health
              </h2>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Sensors Active</span>
            </div>

            {/* Circular Gauge Representation */}
            <div className="relative flex flex-col items-center justify-center my-4">
              <div className="w-44 h-44 rounded-full border-8 border-slate-800 border-t-[#00e676] border-r-[#00e676] border-b-indigo-500 flex flex-col items-center justify-center shadow-inner relative">
                <span className="text-3xl font-extrabold text-white tracking-tight">{latest?.t10?.toFixed(1) || '--'}°C</span>
                <span className="text-[11px] text-slate-400 mt-1">Mean Soil Temp (10cm)</span>
              </div>
            </div>

            {/* Sub-Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-white/5">
              <div className="bg-[#12141f] p-2.5 rounded-xl">
                <p className="text-[10px] text-amber-400 font-medium uppercase">10cm</p>
                <p className="text-sm font-bold text-white mt-0.5">{latest?.t10?.toFixed(1)}°</p>
              </div>
              <div className="bg-[#12141f] p-2.5 rounded-xl">
                <p className="text-[10px] text-cyan-400 font-medium uppercase">30cm</p>
                <p className="text-sm font-bold text-white mt-0.5">{latest?.t30?.toFixed(1)}°</p>
              </div>
              <div className="bg-[#12141f] p-2.5 rounded-xl">
                <div className="text-[10px] text-indigo-400 font-medium uppercase">50cm</div>
                <p className="text-sm font-bold text-white mt-0.5">{latest?.t50?.toFixed(1)}°</p>
              </div>
            </div>
          </div>

          {/* Widget 2: Main Thermal Trend Chart */}
          <div className="lg:col-span-8 bg-[#0d0f17] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            
            {/* Chart Header + Date Selector Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e676]"></span> Thermal Propagation Trend
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time subsurface temperature gradients across depths</p>
              </div>

              {/* Quick Filters */}
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

            {/* Custom Range Selector Toolbar */}
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

            {/* Area Chart Container */}
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
                    tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis stroke="#475569" domain={['auto', 'auto']} style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0f17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelFormatter={(label) => new Date(String(label)).toLocaleString()}
                  />
                  <Area type="monotone" name="10cm Depth (Shallow)" dataKey="t10" stroke="#eab308" fillOpacity={1} fill="url(#t10Color)" strokeWidth={2.5} />
                  <Area type="monotone" name="30cm Depth (Mid)" dataKey="t30" stroke="#06b6d4" fillOpacity={1} fill="url(#t30Color)" strokeWidth={2.5} />
                  <Area type="monotone" name="50cm Depth (Deep)" dataKey="t50" stroke="#6366f1" fillOpacity={1} fill="url(#t50Color)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* BOTTOM GRID: Sensor Matrix Table + Battery & Power System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Widget 3: Connected Systems / Sensor Breakdown Table */}
          <div className="lg:col-span-7 bg-[#0d0f17] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-white">Subsurface Sensor Array Status</h2>
              <span className="text-xs text-slate-400 font-mono">4 Probe Channels</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Sensor Probe</th>
                    <th className="pb-3 font-medium">Depth/Target</th>
                    <th className="pb-3 font-medium">Latest Value</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-3 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span> DS18B20 Probe #1
                    </td>
                    <td className="py-3 text-slate-400">10cm Subsurface</td>
                    <td className="py-3 font-bold text-yellow-400">{latest?.t10?.toFixed(2)}°C</td>
                    <td className="py-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Optimal</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span> DS18B20 Probe #2
                    </td>
                    <td className="py-3 text-slate-400">30cm Subsurface</td>
                    <td className="py-3 font-bold text-cyan-400">{latest?.t30?.toFixed(2)}°C</td>
                    <td className="py-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Optimal</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span> DS18B20 Probe #3
                    </td>
                    <td className="py-3 text-slate-400">50cm Subsurface</td>
                    <td className="py-3 font-bold text-indigo-400">{latest?.t50?.toFixed(2)}°C</td>
                    <td className="py-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Optimal</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> DHT22 Module
                    </td>
                    <td className="py-3 text-slate-400">Ambient Temp & RH</td>
                    <td className="py-3 font-bold text-emerald-400">{latest?.ambient?.toFixed(2)}°C / {latest?.humidity?.toFixed(1)}%</td>
                    <td className="py-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Optimal</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Widget 4: Battery & Power Management Widget */}
          <div className="lg:col-span-5 bg-[#0d0f17] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-purple-400" /> Power Management
                </h2>
                <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">18650 Li-Ion</span>
              </div>

              <div className="flex items-baseline justify-between mt-4">
                <span className="text-3xl font-extrabold text-white">{currentBattery.toFixed(2)} V</span>
                <span className="text-sm font-semibold text-purple-400">{batteryPercent}% Capacity</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500" 
                  style={{ width: `${batteryPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#12141f] p-3 rounded-xl border border-white/5 flex items-center justify-between mt-4">
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-white">SIM800L Cellular Telemetry</p>
                  <p className="text-[10px] text-slate-400">HTTP POST / 15-Min Interval</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
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

            {/* From Date Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">From Date & Time</label>
              <input 
                type="datetime-local" 
                value={reportFrom}
                onChange={e => setReportFrom(e.target.value)}
                className="w-full bg-[#12141f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* To Date Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">To Date & Time</label>
              <input 
                type="datetime-local" 
                value={reportTo}
                onChange={e => setReportTo(e.target.value)}
                className="w-full bg-[#12141f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Export Format Selection */}
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

            {/* Actions */}
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