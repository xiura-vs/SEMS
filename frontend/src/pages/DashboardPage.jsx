import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEnergySocket } from '../hooks/useEnergySocket';
import PowerChart from '../components/PowerChart';
import SystemHealth from '../components/SystemHealth';
import AlertsPanel from '../components/AlertsPanel';
import ConnectionBadge from '../components/ConnectionBadge';
import {
  Zap, Waves, Activity, Gauge, BatteryCharging, Cpu,
  Clock, Server, ChevronRight, RefreshCw, TrendingUp,
  BarChart2, Settings2, Eye,
} from 'lucide-react';

/* ── Clickable Metric Card (matches reference style) ─────── */
function MetricCard({ icon: Icon, label, value, unit, color, bgColor, route, stagger }) {
  const navigate = useNavigate();
  const staggerClass = ['','stagger-1','stagger-2','stagger-3','stagger-4','stagger-5','stagger-6'][stagger]||'';

  return (
    <div
      onClick={() => navigate(route)}
      className={`card-sems p-5 cursor-pointer animate-slide-up ${staggerClass}
        hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] group transition-all duration-150 relative overflow-hidden`}
    >
      {/* subtle tinted bg corner */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${bgColor} opacity-30 rounded-bl-full`} />
      <div className="flex items-start justify-between mb-3 relative">
        <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center border border-white shadow-sm`}>
          <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
        </span>
      </div>
      <p className="text-xs text-stone-500 font-medium mb-1">{label}</p>
      <p className={`font-mono text-2xl font-700 ${color} leading-tight`} style={{ fontFamily: 'Fira Code, monospace' }}>
        {value ?? '—'}
        <span className="text-sm font-normal text-stone-400 ml-1">{unit}</span>
      </p>
      <p className="text-[10px] text-stone-300 mt-2 group-hover:text-amber-400 transition-colors">View graph →</p>
    </div>
  );
}

/* ── Phase Mini Card ──────────────────────────────────────── */
function PhaseCard({ phase, reading }) {
  const colors = { L1: { accent: 'text-amber-600', dot: 'bg-amber-400' }, L2: { accent: 'text-blue-600', dot: 'bg-blue-400' }, L3: { accent: 'text-emerald-600', dot: 'bg-emerald-400' } };
  const c = colors[phase];
  const r = reading;
  return (
    <div className="card-sems p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="section-label">Phase {phase}</span>
        <span className={`w-2 h-2 rounded-full ${r ? c.dot + ' animate-pulse' : 'bg-stone-200'}`} />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-xs text-stone-400">Voltage</span>
          <span className={`font-mono text-sm font-600 ${c.accent}`} style={{ fontFamily: 'Fira Code, monospace' }}>{r ? (r.voltage?.[phase]||0).toFixed(1) : '—'} V</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-stone-400">Current</span>
          <span className="font-mono text-sm font-600 text-blue-600" style={{ fontFamily: 'Fira Code, monospace' }}>{r ? (r.current?.[phase]||0).toFixed(2) : '—'} A</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-stone-400">Power</span>
          <span className="font-mono text-sm font-600 text-emerald-600" style={{ fontFamily: 'Fira Code, monospace' }}>{r ? (r.activePower?.[phase]||0).toFixed(3) : '—'} kW</span>
        </div>
      </div>
    </div>
  );
}

/* ── Machine Status card (reference style) ────────────────── */
function MachineStatusCard({ reading, connected }) {
  const current = reading?.current?.L1 || 0;
  const isActive = current > 1;
  return (
    <div className="card-sems p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-amber-500" />
        <span className="font-display font-700 text-stone-900 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Our Monitoring Systems</span>
        <span className="ml-auto">
          <ConnectionBadge connected={connected} lastUpdate={null} />
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Voltage Avg', val: reading ? (((reading.voltage?.L1||0)+(reading.voltage?.L2||0)+(reading.voltage?.L3||0))/3).toFixed(1) : '—', unit: 'V', color: 'text-amber-600' },
          { label: 'Current L1', val: reading ? (reading.current?.L1||0).toFixed(2) : '—', unit: 'A', color: 'text-blue-600' },
          { label: 'Active Power', val: reading ? (reading.activePower?.total||0).toFixed(3) : '—', unit: 'kW', color: 'text-emerald-600' },
          { label: 'Power Factor', val: reading ? (reading.powerFactor||0).toFixed(3) : '—', unit: 'PF', color: 'text-violet-600' },
        ].map(({ label, val, unit, color }) => (
          <div key={label} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">{label}</p>
            <p className={`font-mono font-700 text-lg ${color}`} style={{ fontFamily: 'Fira Code, monospace' }}>
              {val}<span className="text-xs font-normal text-stone-400 ml-1">{unit}</span>
            </p>
          </div>
        ))}
      </div>
      {/* Active/Idle banner */}
      <div className={`flex items-center gap-2.5 mt-3 px-3 py-2.5 rounded-xl text-sm font-semibold
        ${!connected ? 'bg-stone-50 text-stone-400 border border-stone-100'
        : isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${!connected ? 'bg-stone-300' : isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
        {!connected ? 'No Signal' : isActive ? 'Machine Active' : 'Machine Idle'}
        <span className="ml-auto font-mono text-xs font-normal" style={{ fontFamily: 'Fira Code, monospace' }}>
          {current.toFixed(2)} A draw
        </span>
      </div>
    </div>
  );
}

/* ── Per-Phase Power (reference "Smart Disclosure" style) ─── */
function PowerDistCard({ reading }) {
  const r = reading;
  const phases = [
    { key: 'L1', color: 'bg-amber-400',  label: 'Phase L1' },
    { key: 'L2', color: 'bg-blue-400',   label: 'Phase L2' },
    { key: 'L3', color: 'bg-emerald-400',label: 'Phase L3' },
  ];
  const total = r?.activePower?.total || 1;
  const lastScan = r ? 'Just now' : '—';

  return (
    <div className="card-sems p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-amber-500" />
        <span className="font-display font-700 text-stone-900 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Power Distribution</span>
      </div>
      <div className="space-y-4">
        {phases.map(({ key, color, label }) => {
          const pw = r?.activePower?.[key] || 0;
          const pct = Math.min(100, (pw / total) * 100);
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-stone-500 font-medium">{label}</span>
                <span className="font-mono text-xs text-stone-700" style={{ fontFamily: 'Fira Code, monospace' }}>{pw.toFixed(3)} kW</span>
              </div>
              <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">{pct.toFixed(1)}% of total</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between text-xs text-stone-400">
        <span>Total: <span className="font-mono font-600 text-stone-700">{(r?.activePower?.total||0).toFixed(3)} kW</span></span>
        <span>Updated: <span className="font-mono">{lastScan}</span></span>
      </div>
    </div>
  );
}

/* ── Main Optimizers card (reference "Main Optimizers") ────── */
function OptimizerCard({ reading, chartData }) {
  const peakPower = chartData.length ? Math.max(...chartData.map(d=>d.power||0)).toFixed(3) : '—';
  const avgPF = chartData.filter(d=>d.pf).length
    ? (chartData.filter(d=>d.pf).reduce((s,d)=>s+(d.pf||0),0)/chartData.filter(d=>d.pf).length).toFixed(3)
    : '—';
  const battery = reading ? Math.min(100, Math.round((reading.energy % 100))) : 0;

  return (
    <div className="card-sems p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-4 h-4 text-amber-500" />
        <span className="font-display font-700 text-stone-900 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Session Stats</span>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Peak Power</p>
          <p className="font-mono text-xl font-700 text-amber-600" style={{ fontFamily: 'Fira Code, monospace' }}>
            {peakPower}<span className="text-sm font-normal text-stone-400 ml-1">kW</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Avg Power Factor</p>
          <p className="font-mono text-xl font-700 text-violet-600" style={{ fontFamily: 'Fira Code, monospace' }}>
            {avgPF}<span className="text-sm font-normal text-stone-400 ml-1">PF</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-1">Energy Level</p>
          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${battery}%` }} />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">{battery}% meter reading</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700 font-semibold mt-1">
          <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
          Live · {chartData.length} readings captured
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Page ─────────────────────────────────────── */
export default function DashboardPage() {
  const { user, API } = useAuth();
  const { latestReading, chartData, connected, lastUpdate } = useEnergySocket();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    API.get('/energy/history?limit=50')
      .then(({ data }) => {
        const points = data.readings.map(r => ({
          time: new Date(r.timestamp).toLocaleTimeString(),
          power: +(r.activePower?.total||0).toFixed(3),
          current: +(r.current?.L1||0).toFixed(2),
          pf: +(r.powerFactor||0).toFixed(3),
        }));
        setHistory(points);
      })
      .catch(console.error);
  }, []);

  const r = latestReading;
  const allChartData = history.length > 0 && chartData.length === 0 ? history : chartData;

  const avgVoltage = r
    ? (((r.voltage?.L1||0)+(r.voltage?.L2||0)+(r.voltage?.L3||0))/3).toFixed(1)
    : null;

  const topMetrics = [
    { icon: Waves,          label: 'Avg Voltage',  value: r ? avgVoltage : null,                              unit: 'V',   color: 'text-amber-600',   bgColor: 'bg-amber-50',   route: '/metric/voltage'   },
    { icon: Cpu,            label: 'Current L1',   value: r ? (r.current?.L1||0).toFixed(2) : null,           unit: 'A',   color: 'text-blue-600',    bgColor: 'bg-blue-50',    route: '/metric/current'   },
    { icon: Zap,            label: 'Active Power', value: r ? (r.activePower?.total||0).toFixed(3) : null,    unit: 'kW',  color: 'text-emerald-600', bgColor: 'bg-emerald-50', route: '/metric/power'     },
    { icon: Gauge,          label: 'Power Factor', value: r ? (r.powerFactor||0).toFixed(3) : null,           unit: 'PF',  color: 'text-violet-600',  bgColor: 'bg-violet-50',  route: '/metric/pf'        },
    { icon: Activity,       label: 'Frequency',    value: r ? (r.frequency||0).toFixed(2) : null,             unit: 'Hz',  color: 'text-rose-600',    bgColor: 'bg-rose-50',    route: '/metric/frequency' },
    { icon: BatteryCharging,label: 'Total Energy', value: r ? (r.energy||0).toFixed(2) : null,               unit: 'kWh', color: 'text-cyan-600',    bgColor: 'bg-cyan-50',    route: '/metric/energy'    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl font-800 text-stone-900 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Smart Energy Dashboard
            </h1>
            <p className="text-stone-400 text-sm mt-0.5">
              Monitoring live energy data — Welcome back, <span className="text-stone-600 font-semibold">{user?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <ConnectionBadge connected={connected} lastUpdate={lastUpdate} />
            <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3" />
              <span className="font-mono" style={{ fontFamily: 'Fira Code, monospace' }}>
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Row 1: 6 Top Metric Cards (reference style top row) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {topMetrics.map((m, i) => (
            <MetricCard key={m.label} {...m} stagger={i+1} />
          ))}
        </div>

        {/* ── Row 2: Monitoring Systems (2/3) + System Alerts (1/3) ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MachineStatusCard reading={r} connected={connected} />
          </div>
          <div>
            <AlertsPanel reading={r} />
          </div>
        </div>

        {/* ── Row 3: Main Chart (2/3) + Phase Cards (1/3) ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PowerChart data={allChartData} />
          </div>
          <div className="space-y-3">
            {['L1','L2','L3'].map(phase => (
              <PhaseCard key={phase} phase={phase} reading={r} />
            ))}
          </div>
        </div>

        {/* ── Row 4: Session Stats + Power Distribution + System Health ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <OptimizerCard reading={r} chartData={allChartData} />
          <PowerDistCard reading={r} />
          <SystemHealth reading={r} connected={connected} />
        </div>

        {/* ── Row 5: Summary bar ── */}
        <div className="card-sems px-5 py-4 animate-slide-up">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2 mr-auto">
              <Server className="w-4 h-4 text-amber-500" />
              <span className="section-label">System Summary</span>
            </div>
            {[
              { label: 'Total kWh', val: r ? (r.energy||0).toFixed(2) : '—', unit: 'kWh' },
              { label: 'Peak Power', val: allChartData.length ? Math.max(...allChartData.map(d=>d.power||0)).toFixed(2) : '—', unit: 'kW' },
              { label: 'Frequency', val: r ? (r.frequency||0).toFixed(2) : '—', unit: 'Hz' },
              { label: 'Data Points', val: allChartData.length, unit: 'pts' },
              { label: 'Protocol', val: 'MQTT v5', unit: '' },
            ].map(({ label, val, unit }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] text-stone-400 uppercase tracking-wide">{label}</p>
                <p className="font-mono font-700 text-stone-800 text-sm" style={{ fontFamily: 'Fira Code, monospace' }}>
                  {val} <span className="text-stone-400 font-normal text-xs">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
