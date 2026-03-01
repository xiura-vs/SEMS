import { Activity, AlertCircle } from 'lucide-react';

const IDLE_THRESHOLD = 1; // Amps — machine considered idle below this

export default function MachineStatus({ reading, connected }) {
  const current = reading?.current?.L1 || 0;
  const isActive = current > IDLE_THRESHOLD;
  const isConnected = connected && !!reading;

  return (
    <div className="card-industrial p-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`relative w-3 h-3 rounded-full ${isConnected ? (isActive ? 'bg-green-500' : 'bg-amber-400') : 'bg-stone-300'}`}>
          {isConnected && (
            <span className={`absolute inset-0 rounded-full animate-ping ${isActive ? 'bg-green-400' : 'bg-amber-300'} opacity-75`} />
          )}
        </div>
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Machine Status</p>
          <p className={`font-display font-700 text-sm mt-0.5 ${isConnected ? (isActive ? 'text-green-600' : 'text-amber-600') : 'text-stone-400'}`}>
            {!isConnected ? 'No Signal' : isActive ? 'Active' : 'Idle'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isActive ? (
          <Activity className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-400" />
        )}
        <div className="text-right">
          <p className="text-xs text-stone-400">Current Draw</p>
          <p className="font-mono text-sm font-medium text-stone-700">{current.toFixed(2)} A</p>
        </div>
      </div>
    </div>
  );
}
