import { Wifi, WifiOff } from 'lucide-react';

export default function ConnectionBadge({ connected, lastUpdate }) {
  const timeAgo = lastUpdate
    ? Math.round((Date.now() - lastUpdate.getTime()) / 1000)
    : null;

  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border font-medium
      ${connected
        ? 'bg-green-50 border-green-200 text-green-700'
        : 'bg-stone-100 border-stone-200 text-stone-500'
      }`}>
      {connected ? (
        <Wifi className="w-3.5 h-3.5" />
      ) : (
        <WifiOff className="w-3.5 h-3.5" />
      )}
      <span>{connected ? 'Live' : 'Disconnected'}</span>
      {connected && timeAgo !== null && (
        <span className="text-green-500 font-mono">{timeAgo}s ago</span>
      )}
    </div>
  );
}
