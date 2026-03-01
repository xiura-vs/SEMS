import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-amber-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="text-stone-400 font-mono mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-stone-600 capitalize">{p.name}:</span>
          <span className="font-mono font-medium text-stone-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function PowerChart({ data }) {
  const avgPower = data.length
    ? (data.reduce((s, d) => s + d.power, 0) / data.length).toFixed(2)
    : 0;

  return (
    <div className="card-industrial p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <h3 className="font-display font-700 text-stone-900 text-base">Real-Time Power Consumption</h3>
          </div>
          <p className="text-xs text-stone-400">Live stream from AG-702 Unit 01 via MQTT</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-400">Avg Power</p>
          <p className="font-mono font-medium text-amber-600">{avgPower} kW</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-stone-400 text-sm">Waiting for live data...</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" strokeOpacity={0.6} />
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(val) => <span style={{ fontSize: 11, color: '#78716c', fontFamily: 'Plus Jakarta Sans' }}>{val}</span>}
            />
            {avgPower > 0 && (
              <ReferenceLine
                y={parseFloat(avgPower)}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            <Line
              type="monotone"
              dataKey="power"
              name="Power (kW)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="current"
              name="Current (A)"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 3"
              activeDot={{ r: 3, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
