export default function MetricCard({ icon: Icon, label, value, unit, color = 'amber', trend, stagger = 0 }) {
  const colorMap = {
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100', badge: 'bg-amber-100 text-amber-700' },
    blue:  { bg: 'bg-blue-50',  icon: 'text-blue-600',  border: 'border-blue-100',  badge: 'bg-blue-100 text-blue-700'  },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100', badge: 'bg-green-100 text-green-700' },
    rose:  { bg: 'bg-rose-50',  icon: 'text-rose-600',  border: 'border-rose-100',  badge: 'bg-rose-100 text-rose-700'  },
    violet:{ bg: 'bg-violet-50',icon: 'text-violet-600',border: 'border-violet-100',badge: 'bg-violet-100 text-violet-700'},
    cyan:  { bg: 'bg-cyan-50',  icon: 'text-cyan-600',  border: 'border-cyan-100',  badge: 'bg-cyan-100 text-cyan-700'  },
  };

  const c = colorMap[color] || colorMap.amber;
  const staggerClass = ['', 'stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6'][stagger] || '';

  return (
    <div className={`card-industrial p-5 animate-slide-up ${staggerClass} group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center border ${c.border}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${c.badge}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="metric-value text-stone-900">
            {value !== null && value !== undefined ? value : '—'}
          </span>
          {unit && <span className="text-xs text-stone-400 font-mono">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
