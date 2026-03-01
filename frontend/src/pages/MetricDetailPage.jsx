import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEnergySocket } from '../hooks/useEnergySocket';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend,
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Clock, Activity } from 'lucide-react';

const METRIC_CONFIG = {
  voltage: {
    label: 'Voltage',
    unit: 'V',
    color: '#f59e0b',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconColor: 'text-amber-600',
    dataKey: (r) => ({
      L1: +(r.voltage?.L1 || 0).toFixed(1),
      L2: +(r.voltage?.L2 || 0).toFixed(1),
      L3: +(r.voltage?.L3 || 0).toFixed(1),
      avg: +(((r.voltage?.L1 || 0) + (r.voltage?.L2 || 0) + (r.voltage?.L3 || 0)) / 3).toFixed(1),
    }),
    lines: [
      { key: 'L1', color: '#f59e0b', name: 'L1 (V)' },
      { key: 'L2', color: '#3b82f6', name: 'L2 (V)' },
      { key: 'L3', color: '#10b981', name: 'L3 (V)' },
    ],
    nominal: 220,
    desc: 'Three-phase RMS voltage from the energy meter.',
  },
  current: {
    label: 'Current',
    unit: 'A',
    color: '#3b82f6',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconColor: 'text-blue-600',
    dataKey: (r) => ({
      L1: +(r.current?.L1 || 0).toFixed(2),
      L2: +(r.current?.L2 || 0).toFixed(2),
      L3: +(r.current?.L3 || 0).toFixed(2),
    }),
    lines: [
      { key: 'L1', color: '#3b82f6', name: 'L1 (A)' },
      { key: 'L2', color: '#8b5cf6', name: 'L2 (A)' },
      { key: 'L3', color: '#ec4899', name: 'L3 (A)' },
    ],
    desc: 'Three-phase RMS current draw from connected loads.',
  },
  power: {
    label: 'Active Power',
    unit: 'kW',
    color: '#10b981',
    bg: 'bg-green-50',
    border: 'border-green-100',
    iconColor: 'text-green-600',
    dataKey: (r) => ({
      Total: +(r.activePower?.total || 0).toFixed(3),
      L1: +(r.activePower?.L1 || 0).toFixed(3),
      L2: +(r.activePower?.L2 || 0).toFixed(3),
      L3: +(r.activePower?.L3 || 0).toFixed(3),
    }),
    lines: [
      { key: 'Total', color: '#10b981', name: 'Total (kW)', strokeWidth: 2.5 },
      { key: 'L1', color: '#f59e0b', name: 'L1 (kW)', strokeDasharray: '5 3' },
      { key: 'L2', color: '#3b82f6', name: 'L2 (kW)', strokeDasharray: '5 3' },
      { key: 'L3', color: '#ec4899', name: 'L3 (kW)', strokeDasharray: '5 3' },
    ],
    desc: 'Total and per-phase active power consumption in kilowatts.',
  },
  pf: {
    label: 'Power Factor',
    unit: 'PF',
    color: '#8b5cf6',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    iconColor: 'text-violet-600',
    dataKey: (r) => ({ PF: +(r.powerFactor || 0).toFixed(4) }),
    lines: [{ key: 'PF', color: '#8b5cf6', name: 'Power Factor' }],
    nominal: 0.9,
    desc: 'Ratio of real power to apparent power. Ideal range: 0.90–1.00.',
  },
  frequency: {
    label: 'Frequency',
    unit: 'Hz',
    color: '#ef4444',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconColor: 'text-rose-600',
    dataKey: (r) => ({ Hz: +(r.frequency || 0).toFixed(3) }),
    lines: [{ key: 'Hz', color: '#ef4444', name: 'Frequency (Hz)' }],
    nominal: 50,
    desc: 'Grid supply frequency. Nominal: 50 Hz (or 60 Hz in some regions).',
  },
  energy: {
    label: 'Energy',
    unit: 'kWh',
    color: '#06b6d4',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    iconColor: 'text-cyan-600',
    dataKey: (r) => ({ kWh: +(r.energy || 0).toFixed(3) }),
    lines: [{ key: 'kWh', color: '#06b6d4', name: 'Energy (kWh)', fill: '#06b6d420' }],
    desc: 'Cumulative energy consumption in kilowatt-hours.',
    useArea: true,
  },
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="text-stone-400 font-mono mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-stone-600">{p.name}:</span>
          <span className="font-mono font-semibold text-stone-900">{p.value} {unit}</span>
        </div>
      ))}
    </div>
  );
};

export default function MetricDetailPage() {
  const { metric } = useParams();
  const navigate = useNavigate();
  const { API } = useAuth();
  const { latestReading, connected } = useEnergySocket();

  const [chartData, setChartData] = useState([]);
  const config = METRIC_CONFIG[metric];

  useEffect(() => {
    if (!config) return;
    API.get('/energy/history?limit=80')
      .then(({ data }) => {
        const points = data.readings.map(r => ({
          time: new Date(r.timestamp).toLocaleTimeString(),
          ...config.dataKey(r),
        }));
        setChartData(points);
      })
      .catch(console.error);
  }, [metric]);

  // Append live readings
  useEffect(() => {
    if (!latestReading || !config) return;
    const point = {
      time: new Date(latestReading.timestamp).toLocaleTimeString(),
      ...config.dataKey(latestReading),
    };
    setChartData(prev => {
      const next = [...prev, point];
      return next.length > 100 ? next.slice(next.length - 100) : next;
    });
  }, [latestReading]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">Unknown metric: {metric}</p>
          <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Stats from chart data
  const allValues = config.lines.flatMap(l => chartData.map(d => d[l.key] || 0)).filter(v => v > 0);
  const minVal = allValues.length ? Math.min(...allValues).toFixed(3) : '—';
  const maxVal = allValues.length ? Math.max(...allValues).toFixed(3) : '—';
  const avgVal = allValues.length ? (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(3) : '—';
  const latest = latestReading ? config.dataKey(latestReading) : {};
  const latestMain = latest[config.lines[0].key] || 0;

  // Trend icon
  const last2 = chartData.slice(-2);
  let TrendIcon = Minus;
  let trendColor = 'text-stone-400';
  if (last2.length === 2) {
    const diff = (last2[1][config.lines[0].key] || 0) - (last2[0][config.lines[0].key] || 0);
    if (diff > 0.01) { TrendIcon = TrendingUp; trendColor = 'text-green-500'; }
    else if (diff < -0.01) { TrendIcon = TrendingDown; trendColor = 'text-red-500'; }
  }

  const ChartComponent = config.useArea ? AreaChart : LineChart;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 bg-white border border-stone-200 rounded-xl flex items-center justify-center hover:border-amber-300 hover:bg-amber-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-stone-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-700 text-stone-900">{config.label} Analysis</h1>
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono ${config.bg} ${config.border} border ${config.iconColor}`}>
                {config.unit}
              </div>
            </div>
            <p className="text-stone-400 text-sm mt-0.5">{config.desc}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {connected ? (
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-semibold">
                <Activity className="w-3 h-3" />
                Live
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full">
                Offline
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-slide-up">
          {[
            { label: 'Current', val: latestMain.toFixed(3), icon: null, extra: <TrendIcon className={`w-4 h-4 ${trendColor}`} /> },
            { label: 'Minimum', val: minVal },
            { label: 'Maximum', val: maxVal },
            { label: 'Average', val: avgVal },
          ].map(({ label, val, extra }) => (
            <div key={label} className="card-industrial p-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-2 font-medium">{label}</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-600 text-stone-900">{val}</span>
                {extra}
              </div>
              <p className="text-xs text-stone-400 font-mono mt-0.5">{config.unit}</p>
            </div>
          ))}
        </div>

        {/* Main chart */}
        <div className="card-industrial p-6 mb-6 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-700 text-stone-900 text-lg">{config.label} Over Time</h2>
              <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                Last {chartData.length} readings · updates live
              </p>
            </div>
            {config.nominal && (
              <div className="text-right">
                <p className="text-xs text-stone-400">Nominal</p>
                <p className="font-mono text-sm font-semibold text-stone-700">{config.nominal} {config.unit}</p>
              </div>
            )}
          </div>

          {chartData.length === 0 ? (
            <div className="h-72 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-stone-400 text-sm">Loading historical data...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ChartComponent data={chartData} margin={{ top: 5, right: 10, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" strokeOpacity={0.5} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fontFamily: 'Fira Code', fill: '#a8a29e' }}
                  tickLine={false}
                  axisLine={{ stroke: '#fde68a' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: 'Fira Code', fill: '#a8a29e' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip unit={config.unit} />} />
                <Legend formatter={(val) => <span style={{ fontSize: 11, color: '#78716c', fontFamily: 'Plus Jakarta Sans' }}>{val}</span>} />
                {config.nominal && (
                  <ReferenceLine y={config.nominal} stroke={config.color} strokeDasharray="6 3" strokeWidth={1.5} opacity={0.5}
                    label={{ value: `Nominal ${config.nominal}`, position: 'insideTopRight', fontSize: 10, fill: config.color }} />
                )}
                {config.lines.map(l =>
                  config.useArea ? (
                    <Area key={l.key} type="monotone" dataKey={l.key} name={l.name}
                      stroke={l.color} strokeWidth={2} fill={l.color + '25'}
                      dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
                  ) : (
                    <Line key={l.key} type="monotone" dataKey={l.key} name={l.name}
                      stroke={l.color} strokeWidth={l.strokeWidth || 2}
                      strokeDasharray={l.strokeDasharray}
                      dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: l.color }} />
                  )
                )}
              </ChartComponent>
            </ResponsiveContainer>
          )}
        </div>

        {/* Per-phase table if multi-line */}
        {latestReading && config.lines.length > 1 && (
          <div className="card-industrial p-6 animate-slide-up stagger-3">
            <h2 className="font-display font-700 text-stone-900 text-lg mb-4">Current Readings</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {config.lines.map(l => (
                <div key={l.key} className="rounded-xl p-4 border text-center" style={{ borderColor: l.color + '40', background: l.color + '08' }}>
                  <p className="text-xs text-stone-400 mb-1 uppercase tracking-wide">{l.name.replace(` (${config.unit})`, '')}</p>
                  <p className="font-mono text-xl font-600" style={{ color: l.color }}>
                    {(config.dataKey(latestReading)[l.key] || 0)}
                  </p>
                  <p className="text-xs text-stone-400 font-mono">{config.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation to other metrics */}
        <div className="mt-6 animate-slide-up stagger-4">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-3 font-medium">Other Metrics</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(METRIC_CONFIG).filter(([key]) => key !== metric).map(([key, cfg]) => (
              <Link
                key={key}
                to={`/metric/${key}`}
                className="text-sm px-4 py-2 rounded-xl border border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50 text-stone-600 hover:text-amber-700 transition-all font-medium"
              >
                {cfg.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
