#  SEMS — Smart Energy Management System

A professional industrial IoT dashboard for real-time energy monitoring via Industrial Gateway.

---

##  Architecture

```
Industrial Gateway ──MQTT──► Node.js Backend ──Socket.io──► React Dashboard
                              │
                              ▼
                           MongoDB
```

---

## 📁 Project Structure

```
sems/
├── backend/
│   ├── server.js              # Main entry — Express + MQTT + Socket.io
│   ├── .env                   # Environment variables
│   ├── models/
│   │   ├── EnergyReading.js   # Mongoose schema for sensor data
│   │   └── User.js            # User model with bcrypt
│   ├── routes/
│   │   ├── auth.js            # Login / Signup / Me endpoints
│   │   └── energy.js          # Latest / History / Stats endpoints
│   └── middleware/
│       └── auth.js            # JWT verification middleware
│
└── frontend/
    ├── src/
    │   ├── App.jsx             # Router with protected routes
    │   ├── context/
    │   │   └── AuthContext.jsx # JWT auth state + axios instance
    │   ├── hooks/
    │   │   └── useEnergySocket.js  # Socket.io real-time hook
    │   ├── components/
    │   │   ├── Navbar.jsx          # Conditional nav (guest/user)
    │   │   ├── MetricCard.jsx      # Metric display card
    │   │   ├── PowerChart.jsx      # Recharts live line chart
    │   │   ├── MachineStatus.jsx   # Active/Idle indicator
    │   │   ├── ConnectionBadge.jsx # Socket connection status
    │   │   └── ProtectedRoute.jsx  # Auth guard
    │   └── pages/
    │       ├── HomePage.jsx        # Landing page
    │       ├── LoginPage.jsx       # JWT login with validation
    │       ├── SignupPage.jsx      # Registration with password rules
    │       ├── DashboardPage.jsx   # Main monitoring dashboard
    │       └── AboutPage.jsx       # Architecture & tech info
    └── vite.config.js          # Proxy to backend
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- (Optional) A real Industrial gateway with MQTT enabled

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sems
JWT_SECRET=change_this_to_a_random_secret_key
MQTT_BROKER=mqtt://broker.hivemq.com   # or your private broker
MQTT_TOPIC=industrial/energy/Industrial_UNIT_01
```

### 3. Start Backend

```bash
cd backend
npm run dev
```

You'll see:
```
✅ MongoDB Connected
✅ MQTT Connected to mqtt://broker.hivemq.com
📡 Subscribed to topic: industrial/energy/Industrial_UNIT_01
🔧 Simulation mode active — publishing mock Industrial data every 3s
🚀 SEMS Server running on http://localhost:5000
```

> **Note:** The backend auto-simulates AG-702 data in development mode.
> Real machine data takes over automatically when your gateway publishes.

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

Visit: **http://localhost:3000**

---

## 📡 MQTT Payload Format 

The backend accepts these JSON formats from your gateway:

```json
{
  "device_id": "AG702_UNIT_01",
  "voltage": { "L1": 220.3, "L2": 219.8, "L3": 221.1 },
  "current": { "L1": 15.2, "L2": 14.8, "L3": 15.6 },
  "active_power": { "total": 9.823, "L1": 3.27, "L2": 3.28, "L3": 3.28 },
  "power_factor": 0.923,
  "frequency": 50.02,
  "energy": 1284.562,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

The backend also supports flat formats like `voltage_L1`, `kW`, `pf`, etc.

---

## 🌐 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |

### Energy (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/energy/latest` | Latest sensor reading |
| GET | `/api/energy/history?limit=50` | Historical readings |
| GET | `/api/energy/stats` | Today's aggregated stats |

---

## 🎨 Dashboard Features

- **6 Live Metric Cards**: Avg Voltage, Total kW, Frequency, Power Factor, Current L1, Total kWh
- **3-Phase Breakdown**: Per-phase voltage and current at a glance
- **Real-Time Chart**: Recharts line graph updating on every MQTT message
- **Machine Status**: Green (Active) / Amber (Idle) based on current draw threshold
- **Connection Badge**: Shows Socket.io connection status + last update time
- **Per-Phase Power Bars**: Visual breakdown of L1/L2/L3 power distribution

---

## 🔧 Connecting Your Real Industrial Unit

1. In Inudstrial unit configuration, set MQTT broker to your broker URL
2. Set publish topic to `industrial/energy/Industrial_UNIT_01`
3. Set JSON payload format matching the structure above
4. Update `MQTT_BROKER` in `backend/.env` to match
5. The simulation will stop as real data takes over

---

## 🛡️ Security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days
- All energy endpoints require valid JWT
- CORS restricted to frontend origin
