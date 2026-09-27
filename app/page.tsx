"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Activity, Wifi, Download, 
  Calendar, Layers, BatteryCharging, ArrowUpRight, ShieldCheck,
  FileText, X, CheckCircle2, RefreshCw, MapPin
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

  // UI States
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

          {/* Interactive Nodes Section */}
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
                <MapPin className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Approximate Location</p>
                  <p className="text-sm text-slate-200 font-medium">Guwahati, Assam, India</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Lat: 26.1445° N, Lon: 91.7362° E</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-[#0d0f17] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-slate-300 tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00e676]" /> Subsurface Thermal Health
              </h2>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Sensors Active</span>
            </div>

            <div className="relative flex flex-col items-center justify-center my-4">
              <div className="w-44 h-44 rounded-full border-8 border-slate-800 border-t-[#00e676] border-r-[#00e676] border-b-indigo-500 flex flex-col items-center justify-center shadow-inner relative">
                <span className="text-3xl font-extrabold text-white tracking-tight">{latest?.t10?.toFixed(1) || '--'}°C</span>
                <span className="text-[11px] text-slate-400 mt-1">Mean Soil Temp (10cm)</span>
              </div>
            </div>

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
                    tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    fontSize={11}
                  />
                  <YAxis stroke="#475569" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12141f', borderColor: '#1e2333', color: '#fff', borderRadius: '8px' }}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Area type="monotone" dataKey="t10" name="10cm Depth" stroke="#eab308" fillOpacity={1} fill="url(#t10Color)" strokeWidth={2} />
                  <Area type="monotone" dataKey="t30" name="30cm Depth" stroke="#06b6d4" fillOpacity={1} fill="url(#t30Color)" strokeWidth={2} />
                  <Area type="monotone" dataKey="t50" name="50cm Depth" stroke="#6366f1" fillOpacity={1} fill="url(#t50Color)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}