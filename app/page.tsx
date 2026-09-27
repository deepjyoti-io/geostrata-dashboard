"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Battery, Activity } from 'lucide-react';

interface TelemetryRecord {
  id?: number;
  timestamp: string;
  t10: number;
  t30: number;
  t50: number;
  ambient: number;
  humidity: number;
  battery: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  const [data, setData] = useState<TelemetryRecord[]>([]);
  const [latest, setLatest] = useState<TelemetryRecord | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: telemetry } = await supabase
        .from('telemetry')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);
      
      if (telemetry && telemetry.length > 0) {
        const records = telemetry as TelemetryRecord[];
        setLatest(records[0]);
        setData([...records].reverse());
      }
    }
    fetchData();
    
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (!latest) return (
    <div className="min-h-screen bg-[#0f111a] text-white flex items-center justify-center font-sans">
      <div className="flex items-center gap-3 bg-[#1a1d2d] p-6 rounded-xl border border-gray-800">
        <Activity className="animate-spin text-emerald-500" />
        <span>Loading Subsurface Telemetry...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f111a] p-8 text-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg"><Thermometer className="text-emerald-500" /></div>
          <div>
            <h1 className="text-xl font-bold">SubSurface Telemetry</h1>
            <p className="text-gray-400 text-sm">ESP32 + SIM800L Sensor Station #01</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-md text-sm font-semibold border border-emerald-500/30">Live Endpoint</button>
          <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-semibold transition">Generate Report</button>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* 10cm Card */}
        <div className="bg-[#1a1d2d] rounded-xl p-6 border-l-4 border-yellow-500 shadow-lg relative">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-gray-400 text-sm font-semibold tracking-wider">10CM DEPTH</h2>
            <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded">Shallow</span>
          </div>
          <div className="text-4xl font-bold text-yellow-500">{latest.t10.toFixed(2)}°C</div>
          <Activity className="absolute bottom-6 right-6 text-gray-700 opacity-50 w-8 h-8" />
        </div>

        {/* 30cm Card */}
        <div className="bg-[#1a1d2d] rounded-xl p-6 border-l-4 border-cyan-400 shadow-lg relative">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-gray-400 text-sm font-semibold tracking-wider">30CM DEPTH</h2>
            <span className="bg-cyan-400/20 text-cyan-400 text-xs px-2 py-1 rounded">Mid-Layer</span>
          </div>
          <div className="text-4xl font-bold text-cyan-400">{latest.t30.toFixed(2)}°C</div>
          <Activity className="absolute bottom-6 right-6 text-gray-700 opacity-50 w-8 h-8" />
        </div>

        {/* 50cm Card */}
        <div className="bg-[#1a1d2d] rounded-xl p-6 border-l-4 border-indigo-400 shadow-lg relative">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-gray-400 text-sm font-semibold tracking-wider">50CM DEPTH</h2>
            <span className="bg-indigo-400/20 text-indigo-400 text-xs px-2 py-1 rounded">Deep</span>
          </div>
          <div className="text-4xl font-bold text-indigo-400">{latest.t50.toFixed(2)}°C</div>
          <Activity className="absolute bottom-6 right-6 text-gray-700 opacity-50 w-8 h-8" />
        </div>

        {/* Ambient & Battery */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#1a1d2d] rounded-xl p-4 border-l-4 border-emerald-500 flex-1 flex flex-col justify-center">
            <h2 className="text-gray-400 text-xs font-semibold tracking-wider mb-1">AMBIENT (DHT22)</h2>
            <div className="text-2xl font-bold text-emerald-500">{latest.ambient.toFixed(2)}°C</div>
            <div className="text-gray-400 text-xs mt-1">{latest.humidity.toFixed(1)}% RH</div>
          </div>
          
          <div className="bg-[#1a1d2d] rounded-xl p-4 border-l-4 border-purple-500 flex-1 flex flex-col justify-center relative">
            <div className="flex justify-between mb-1">
               <h2 className="text-gray-400 text-xs font-semibold tracking-wider">BATTERY SYSTEM</h2>
               <Battery className="text-purple-500 w-4 h-4" />
            </div>
            <div className="flex justify-between items-end mb-2">
               <div className="text-2xl font-bold text-purple-400">{latest.battery.toFixed(2)}V</div>
               <div className="text-gray-400 text-xs">{Math.round((latest.battery / 4.2) * 100)}%</div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (latest.battery / 4.2) * 100))}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Chart */}
      <div className="bg-[#1a1d2d] rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="text-emerald-500 w-5 h-5"/> Subsurface Temperature Gradient Trend</h2>
            <p className="text-gray-400 text-sm">Real-time thermal propagation across soil depths</p>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3142" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#6b7280" tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
              <YAxis stroke="#6b7280" domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f111a', border: '1px solid #2d3142', borderRadius: '8px' }}
                labelFormatter={(label) => new Date(String(label)).toLocaleString()}
              />
              <Line type="monotone" name="10cm Depth (Shallow)" dataKey="t10" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: "#eab308" }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="30cm Depth (Mid)" dataKey="t30" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: "#22d3ee" }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="50cm Depth (Deep)" dataKey="t50" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: "#818cf8" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}