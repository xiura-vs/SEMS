import { CheckCircle2, AlertTriangle, XCircle, Cpu, Database, Wifi, Zap } from 'lucide-react';

const THRESHOLDS = {
  voltage: { min: 207, max: 235, nominal: 220 },
  powerFactor: { min: 0.85, max: 1.0 },
  frequency: { min: 49.5, max: 50.5 },
  current: { max: 32 },
};

function getStatus(value, { min, max }) {
  if (value === null || value === undefined) return 'unknown';
  if ((min !== undefined && value < min) || (max !== undefined && value > max)) return 'critical';
  const minWarn = min !== undefined ? min + (max - min) * 0.05 : undefined;
  const maxWarn = max !== undefined ? max - (max - min) * 0.05 : undefined;
  if ((minWarn !== undefined && value < minWarn) || (maxWarn !== undefined && value > maxWarn)) return 'warning';
  return 'good';
}

const statusConfig = {
  good:     { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50',  border: 'border-green-100', label: 'Normal'   },
  warning:  { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50',  border: 'border-amber-100', label: 'Warning'  },
  critical: { icon: XCircle,       color: 'text-red-500',   bg: 'bg-red-50',    border: 'border-red-100',   label: 'Critical' },
  unknown:  { icon: AlertTriangle, color: 'text-stone-400', bg: 'bg-stone-50',  border: 'border-stone-100', label: 'No Data'  },
};

export default function SystemHealth({ reading, connected }) {
  const r = reading;

  const checks = [
    {
      icon: Wifi,
      name: 'MQTT Connection',
      status: connected ? 'good' : 'critical',
      value: connected ? 'Connected' : 'Disconnected',
    },
    {
      icon: Zap,
      name: 'Voltage L1',
      status: r ? getStatus(r.voltage?.L1 || 0, THRESHOLDS.voltage) : 'unknown',
      value: r ? `${(r.voltage?.L1 || 0).toFixed(1)} V` : '—',
    },
    {
      icon: Cpu,
      name: 'Power Factor',
      status: r ? getStatus(r.powerFactor || 0, THRESHOLDS.powerFactor) : 'unknown',
      value: r ? (r.powerFactor || 0).toFixed(3) : '—',
    },
    {
      icon: Database,
      name: 'Frequency',
      status: r ? getStatus(r.frequency || 0, THRESHOLDS.frequency) : 'unknown',
      value: r ? `${(r.frequency || 0).toFixed(2)} Hz` : '—',
    },
  ];

  const overallStatuses = checks.map(c => c.status);
  const overall = overallStatuses.includes('critical') ? 'critical'
    : overallStatuses.includes('warning') ? 'warning'
    : overallStatuses.every(s => s === 'good') ? 'good' : 'unknown';

  const OverallConfig = statusConfig[overall];
  const OverallIcon = OverallConfig.icon;

  return (
    <div className="card-industrial p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-700 text-stone-900 text-base flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-500" />
          System Health
        </h3>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${OverallConfig.bg} ${OverallConfig.border} ${OverallConfig.color}`}>
          <OverallIcon className="w-3 h-3" />
          {OverallConfig.label}
        </div>
      </div>

      <div className="space-y-2.5">
        {checks.map(({ icon: Icon, name, status, value }) => {
          const cfg = statusConfig[status];
          const StatusIcon = cfg.icon;
          return (
            <div key={name} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${cfg.color}`} strokeWidth={2} />
                <span className="text-sm font-medium text-stone-700">{name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-stone-600">{value}</span>
                <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Health bar */}
      <div className="mt-4 pt-4 border-t border-stone-100">
        <div className="flex justify-between text-xs text-stone-400 mb-1.5">
          <span>System Score</span>
          <span className="font-mono">
            {Math.round((checks.filter(c => c.status === 'good').length / checks.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              overall === 'good' ? 'bg-green-500' : overall === 'warning' ? 'bg-amber-400' : 'bg-red-500'
            }`}
            style={{ width: `${(checks.filter(c => c.status === 'good').length / checks.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
