import { Zap, Database, Wifi, Code2, Globe, Server } from 'lucide-react';

const stack = [
  { icon: Globe, name: 'React.js', role: 'Frontend UI', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Code2, name: 'Node.js + Express', role: 'REST API Backend', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Database, name: 'MongoDB', role: 'Time-series Storage', color: 'text-green-500', bg: 'bg-emerald-50' },
  { icon: Wifi, name: 'MQTT v5', role: 'IoT Protocol', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Zap, name: 'Socket.io', role: 'Real-time Push', color: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: Server, name: 'AG-702 Gateway', role: 'Hardware Integration', color: 'text-stone-600', bg: 'bg-stone-50' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl shadow-lg mb-6">
            <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl font-800 text-stone-900 mb-4">About SEMS</h1>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Smart Energy Management System is an industrial IoT platform that bridges your
            AG-702 energy gateway with a professional real-time monitoring dashboard.
          </p>
        </div>

        {/* Architecture diagram */}
        <div className="card-industrial p-8 mb-10 animate-slide-up">
          <h2 className="font-display font-700 text-stone-900 text-xl mb-6">System Architecture</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            {[
              { label: 'AG-702 Gateway', sub: 'Hardware sensor', color: 'bg-stone-800 text-white' },
              { label: '→ MQTT →', sub: 'Port 1883', color: 'bg-transparent text-amber-500 font-mono' },
              { label: 'Node.js Backend', sub: 'Subscribes & saves', color: 'bg-amber-500 text-white' },
              { label: '→ Socket.io →', sub: 'WebSocket', color: 'bg-transparent text-blue-500 font-mono' },
              { label: 'React Dashboard', sub: 'Live charts & cards', color: 'bg-blue-600 text-white' },
            ].map(({ label, sub, color }, i) => (
              <div key={i} className={`px-4 py-3 rounded-xl text-sm font-semibold ${color} ${color.includes('transparent') ? '' : 'shadow-sm'} ${color.includes('transparent') ? 'text-lg' : ''}`}>
                <p>{label}</p>
                {sub && !color.includes('transparent') && <p className="text-xs opacity-70 font-normal mt-0.5">{sub}</p>}
              </div>
            ))}
          </div>

          <div className="mt-8 font-mono text-xs bg-stone-900 rounded-xl p-5 text-green-400">
            <p className="text-stone-500 mb-2"># MQTT Payload from AG-702</p>
            <p>{`{`}</p>
            <p className="pl-4 text-amber-300">"device_id": "AG702_UNIT_01",</p>
            <p className="pl-4">"voltage": {`{ "L1": 220.3, "L2": 219.8, "L3": 221.1 }`},</p>
            <p className="pl-4">"current": {`{ "L1": 15.2, "L2": 14.8, "L3": 15.6 }`},</p>
            <p className="pl-4">"active_power": {`{ "total": 9.823, "L1": 3.27, ... }`},</p>
            <p className="pl-4">"power_factor": 0.923,</p>
            <p className="pl-4">"frequency": 50.02,</p>
            <p className="pl-4">"energy": 1284.562,</p>
            <p className="pl-4 text-stone-500">"timestamp": "2025-01-15T10:30:00Z"</p>
            <p>{`}`}</p>
          </div>
        </div>

        {/* Tech stack */}
        <h2 className="font-display font-700 text-stone-900 text-xl mb-6 animate-fade-in">Technology Stack</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {stack.map(({ icon: Icon, name, role, color, bg }, i) => (
            <div key={name} className={`card-industrial p-5 flex items-center gap-4 animate-slide-up stagger-${i + 1}`}>
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm">{name}</p>
                <p className="text-xs text-stone-400">{role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features list */}
        <div className="card-industrial p-8 animate-slide-up stagger-3">
          <h2 className="font-display font-700 text-stone-900 text-xl mb-5">Key Features</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Real-time MQTT data ingestion from AG-702',
              'MongoDB storage with indexed time-series queries',
              'Socket.io WebSocket push (no polling)',
              'JWT authentication with 7-day tokens',
              'Three-phase voltage & current monitoring',
              'Machine Active/Idle status detection',
              'Live Recharts power consumption graph',
              'Historical data on dashboard load',
              'Mobile-responsive Tailwind CSS layout',
              'Development simulation mode (no hardware needed)',
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-stone-600">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">✦</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
