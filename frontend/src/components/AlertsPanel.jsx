import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, XCircle, X, CheckCircle2, ChevronRight } from 'lucide-react';

const THRESHOLDS = {
  'Voltage L1':   { path: r => r.voltage?.L1,          min: 207,  max: 235,  unit: 'V',  severity: 'warning'  },
  'Voltage L2':   { path: r => r.voltage?.L2,          min: 207,  max: 235,  unit: 'V',  severity: 'warning'  },
  'Voltage L3':   { path: r => r.voltage?.L3,          min: 207,  max: 235,  unit: 'V',  severity: 'warning'  },
  'Current L1':   { path: r => r.current?.L1,          max: 30,               unit: 'A',  severity: 'critical' },
  'Power Factor': { path: r => r.powerFactor,          min: 0.85,             unit: 'PF', severity: 'warning'  },
  'Frequency':    { path: r => r.frequency,            min: 49.5, max: 50.5, unit: 'Hz', severity: 'warning'  },
  'Total Power':  { path: r => r.activePower?.total,   max: 15,               unit: 'kW', severity: 'critical' },
};

let idCtr = 0;

const SEV = {
  critical: { bar: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-600',    icon: XCircle       },
  warning:  { bar: 'bg-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-600', icon: AlertTriangle  },
};

export default function AlertsPanel({ reading }) {
  const [alerts, setAlerts] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!reading) return;
    const fired = [];
    Object.entries(THRESHOLDS).forEach(([name, { path, min, max, unit, severity }]) => {
      const val = path(reading);
      if (val == null) return;
      let msg = '';
      if (min !== undefined && val < min) msg = `${name} low: ${val.toFixed(2)} ${unit} (min ${min})`;
      else if (max !== undefined && val > max) msg = `${name} high: ${val.toFixed(2)} ${unit} (max ${max})`;
      if (msg) fired.push({ id: ++idCtr, name, msg, severity, time: new Date() });
    });

    setAlerts(prev => {
      // remove resolved
      const resolved = prev.filter(a => {
        const t = THRESHOLDS[a.name];
        if (!t) return false;
        const val = t.path(reading);
        if (val == null) return true;
        return (t.min !== undefined && val < t.min) || (t.max !== undefined && val > t.max);
      });
      // merge new
      const merged = [...fired, ...resolved.filter(r => !fired.find(f => f.name === r.name))];
      return merged.slice(0, 20);
    });
  }, [reading]);

  const dismiss = id => setAlerts(p => p.filter(a => a.id !== id));
  const visible = showAll ? alerts : alerts.slice(0, 2);

  return (
    <div className="card-sems p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-amber-500" />
        <span className="font-display font-700 text-stone-900 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
          System Alerts
        </span>
        {alerts.length > 0 && (
          <span className="ml-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
            {alerts.length}
          </span>
        )}
      </div>

      {/* Alerts list */}
      <div className="flex-1 space-y-2 min-h-0">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-stone-700">All systems normal</p>
            <p className="text-xs text-stone-400 mt-0.5">No active alerts</p>
          </div>
        ) : (
          visible.map(({ id, severity, msg, time, name }) => {
            const cfg = SEV[severity] || SEV.warning;
            const Icon = cfg.icon;
            return (
              <div key={id} className={`relative flex gap-3 p-3 rounded-xl border ${cfg.bg} overflow-hidden group animate-fade-in`}
                style={{ borderLeft: `3px solid`, borderColor: severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${cfg.text} leading-snug`}>{msg}</p>
                  <p className="text-[10px] text-stone-400 font-mono mt-1" style={{ fontFamily: 'Fira Code, monospace' }}>
                    {time.toLocaleTimeString()}
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${cfg.badge} uppercase tracking-wide`}>
                    {severity}
                  </span>
                </div>
                <button onClick={() => dismiss(id)}
                  className="text-stone-300 hover:text-stone-500 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* View All button (like reference image) */}
      {alerts.length > 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all font-medium"
        >
          {showAll ? 'Show Less' : `View All Alerts (${alerts.length})`}
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-90' : ''}`} />
        </button>
      )}
    </div>
  );
}
