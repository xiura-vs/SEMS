import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, Activity, BarChart3, Shield, Wifi, ChevronRight,
  Cpu, TrendingUp, Bell, Globe2, Database, Lock,
} from 'lucide-react';

const features = [
  { icon: Wifi, title: 'Real-Time MQTT', desc: 'Subscribes to industrial gateway topics and ingests live sensor readings as they arrive — zero delay, zero polling.' },
  { icon: Activity, title: 'Instant Push Updates', desc: 'Socket.io WebSocket broadcasts every new reading to all connected dashboards simultaneously.' },
  { icon: BarChart3, title: '6-Parameter Monitoring', desc: 'Track Voltage, Current, Active Power, Power Factor, Frequency, and Energy — across all three phases.' },
  { icon: Shield, title: 'Secure by Default', desc: 'JWT-based authentication guards every dashboard route and API endpoint with role-based access control.' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Threshold-based alerts fire automatically when parameters drift out of safe operating ranges.' },
  { icon: Database, title: 'Historical Analytics', desc: 'MongoDB stores every reading with timestamps — query trends, export data, spot inefficiencies over time.' },
];

const metrics = [
  { label: 'Voltage', value: '220.3', unit: 'V', color: 'text-amber-600' },
  { label: 'Current', value: '15.24', unit: 'A', color: 'text-blue-600' },
  { label: 'Power', value: '9.823', unit: 'kW', color: 'text-green-600' },
  { label: 'Power Factor', value: '0.923', unit: 'PF', color: 'text-violet-600' },
  { label: 'Frequency', value: '50.02', unit: 'Hz', color: 'text-rose-600' },
  { label: 'Energy', value: '1284.5', unit: 'kWh', color: 'text-cyan-600' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-yellow-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.07] pointer-events-none">
          <div className="absolute top-16 right-16 w-[500px] h-[500px] bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-52 w-72 h-72 bg-yellow-300 rounded-full blur-2xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#92400e 1px,transparent 1px),linear-gradient(90deg,#92400e 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-amber-200">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Industrial IoT Energy Platform
              </div>
              <h1 className="font-display text-5xl lg:text-6xl font-900 text-stone-900 leading-[1.05] mb-6 tracking-tight">
                Smart Energy<br />
                <span className="text-amber-500">Management</span><br />
                System
              </h1>
              <p className="text-stone-500 text-lg leading-relaxed mb-10 font-body max-w-lg">
                Industrial-grade energy monitoring for your machines. Connect any MQTT-enabled
                energy meter, visualize six live parameters, and get instant alerts —
                all from a single unified dashboard.
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                {user ? (
                  <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-base py-3 px-7">
                    <BarChart3 className="w-5 h-5" />
                    Open Dashboard
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn-primary flex items-center gap-2 text-base py-3 px-7">
                      Get Started Free
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link to="/login" className="btn-secondary text-base py-3 px-7">Sign In</Link>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-8 pt-8 border-t border-amber-100">
                {[['6', 'Live Metrics'], ['3-Phase', 'Monitoring'], ['< 1s', 'Latency'], ['24/7', 'Uptime']].map(([val, label]) => (
                  <div key={label}>
                    <p className="font-display text-2xl font-700 text-stone-900 leading-none">{val}</p>
                    <p className="text-xs text-stone-400 font-medium mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard preview card */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-amber-100 shadow-2xl shadow-amber-100/50 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest mb-0.5">Unit 01 · Live</p>
                    <p className="font-display font-700 text-stone-900 text-lg">Energy Dashboard</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {metrics.map(({ label, value, unit, color }) => (
                    <div key={label} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                      <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-1">{label}</p>
                      <p className={`font-mono text-base font-600 ${color}`}>{value}</p>
                      <p className="text-[10px] text-stone-400 font-mono">{unit}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-2">Power Consumption (kW)</p>
                  <div className="flex items-end gap-0.5 h-14">
                    {[40,55,48,70,62,75,68,80,72,85,78,90,82,88,95,87,93,98,91,96].map((h, i) => (
                      <div key={i} className="flex-1 bg-amber-400 rounded-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-700 font-semibold">Machine Active</span>
                  <span className="ml-auto text-xs text-stone-400 font-mono">15.24 A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-stone-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-700 text-white mb-3">How SEMS Works</h2>
            <p className="text-stone-400 max-w-md mx-auto">Three-step flow from physical meter to live dashboard</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {[
              { step: '01', icon: Cpu, title: 'Connect Hardware', desc: 'Any MQTT-capable energy meter publishes live readings to your configured broker topic in JSON format.' },
              { step: '02', icon: Globe2, title: 'Backend Ingests', desc: 'Node.js subscribes to the MQTT topic, parses JSON payloads, and persists to MongoDB in real-time.' },
              { step: '03', icon: Zap, title: 'Dashboard Updates', desc: 'Socket.io broadcasts each reading instantly. Charts and cards refresh without a page reload.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative bg-stone-800 border border-stone-700 rounded-2xl p-6">
                <span className="absolute top-4 right-5 font-mono text-5xl font-700 text-stone-700 leading-none select-none">{step}</span>
                <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-400" strokeWidth={2} />
                </div>
                <h3 className="font-display font-700 text-white text-xl mb-2">{title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-stone-800 border border-stone-700 rounded-2xl p-6">
            <p className="text-stone-500 text-xs font-mono mb-3 uppercase tracking-widest">Example MQTT Payload (JSON)</p>
            <div className="font-mono text-xs text-green-400 grid sm:grid-cols-2 gap-x-8 gap-y-1">
              <p><span className="text-stone-500">"voltage": </span>{"{ L1: 220.3, L2: 219.8, L3: 221.1 }"}</p>
              <p><span className="text-stone-500">"power_factor": </span>0.923</p>
              <p><span className="text-stone-500">"current": </span>{"{ L1: 15.2, L2: 14.8, L3: 15.6 }"}</p>
              <p><span className="text-stone-500">"frequency": </span>50.02</p>
              <p><span className="text-stone-500">"active_power": </span>{"{ total: 9.823 }"}</p>
              <p><span className="text-stone-500">"energy": </span>1284.562</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-700 text-stone-900 mb-3">Built for Industrial Operations</h2>
            <p className="text-stone-500 max-w-md mx-auto">Professional-grade monitoring tools for engineers and energy managers.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="card-industrial p-6 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-600" strokeWidth={2} />
                </div>
                <h3 className="font-display font-700 text-stone-900 text-xl mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="bg-gradient-to-r from-amber-500 to-amber-600 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-display text-4xl font-700 text-white mb-4">Ready to monitor your machines?</h2>
            <p className="text-amber-100 mb-8 text-lg">Create your account and connect your energy meter in minutes.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-amber-600 font-semibold py-3.5 px-9 rounded-xl hover:bg-amber-50 transition-colors text-base shadow-lg">
              <Zap className="w-5 h-5" />
              Get Started — It's Free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
