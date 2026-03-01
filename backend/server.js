require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const mqtt = require('mqtt');

const authRoutes = require('./routes/auth');
const energyRoutes = require('./routes/energy');
const EnergyReading = require('./models/EnergyReading');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/energy', energyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'SEMS Backend Running', timestamp: new Date().toISOString() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ─── MQTT Client ─────────────────────────────────────────────
const mqttClient = mqtt.connect(process.env.MQTT_BROKER, {
  clientId: `sems_backend_${Math.random().toString(16).slice(2)}`,
  clean: true,
  reconnectPeriod: 5000,
});

mqttClient.on('connect', () => {
  console.log(`✅ MQTT Connected to ${process.env.MQTT_BROKER}`);
  mqttClient.subscribe(process.env.MQTT_TOPIC, { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ MQTT Subscribe Error:', err);
    } else {
      console.log(`📡 Subscribed to topic: ${process.env.MQTT_TOPIC}`);
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    console.log('📨 MQTT Message received:', payload);

    // Normalize incoming data - support multiple payload formats
    const reading = new EnergyReading({
      deviceId: payload.device_id || 'AG702_UNIT_01',
      voltage: {
        L1: payload.voltage?.L1 || payload.voltage_L1 || payload.voltage || 0,
        L2: payload.voltage?.L2 || payload.voltage_L2 || 0,
        L3: payload.voltage?.L3 || payload.voltage_L3 || 0,
      },
      current: {
        L1: payload.current?.L1 || payload.current_L1 || payload.current || 0,
        L2: payload.current?.L2 || payload.current_L2 || 0,
        L3: payload.current?.L3 || payload.current_L3 || 0,
      },
      activePower: {
        total: payload.active_power?.total || payload.kW || payload.power || 0,
        L1: payload.active_power?.L1 || 0,
        L2: payload.active_power?.L2 || 0,
        L3: payload.active_power?.L3 || 0,
      },
      powerFactor: payload.power_factor || payload.pf || payload.PF || 0,
      frequency: payload.frequency || payload.freq || 50,
      energy: payload.energy || payload.kWh || 0,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    });

    await reading.save();

    // Broadcast to all connected Socket.io clients
    io.emit('energy_update', {
      ...reading.toObject(),
      _id: reading._id,
    });

    console.log('💾 Reading saved & broadcasted');
  } catch (err) {
    console.error('❌ Error processing MQTT message:', err.message);
  }
});

mqttClient.on('error', (err) => {
  console.error('❌ MQTT Error:', err.message);
});

mqttClient.on('reconnect', () => {
  console.log('🔄 MQTT Reconnecting...');
});

// ─── Socket.io Connection Handler ────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send last reading on connect
  EnergyReading.findOne().sort({ timestamp: -1 }).then(lastReading => {
    if (lastReading) {
      socket.emit('energy_update', lastReading.toObject());
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Simulate MQTT Data in Dev Mode ──────────────────────────
// This simulates an AG-702 gateway when no real hardware is present
if (process.env.NODE_ENV !== 'production') {
  let kWhAccumulator = 120.5;
  setInterval(() => {
    const variation = () => (Math.random() - 0.5) * 10;
    const baseVoltage = 220 + variation();
    const baseCurrent = 15 + (Math.random() * 8);
    const basePower = (baseVoltage * baseCurrent * 1.732 * 0.92) / 1000;
    kWhAccumulator += basePower / 60;

    const simulatedPayload = {
      device_id: 'AG702_UNIT_01',
      voltage: {
        L1: +(baseVoltage + variation()).toFixed(1),
        L2: +(baseVoltage + variation()).toFixed(1),
        L3: +(baseVoltage + variation()).toFixed(1),
      },
      current: {
        L1: +(baseCurrent + variation()).toFixed(2),
        L2: +(baseCurrent - 1 + variation()).toFixed(2),
        L3: +(baseCurrent + 1 + variation()).toFixed(2),
      },
      active_power: {
        total: +basePower.toFixed(3),
        L1: +(basePower / 3).toFixed(3),
        L2: +(basePower / 3).toFixed(3),
        L3: +(basePower / 3).toFixed(3),
      },
      power_factor: +(0.88 + Math.random() * 0.1).toFixed(3),
      frequency: +(49.9 + Math.random() * 0.2).toFixed(2),
      energy: +kWhAccumulator.toFixed(3),
      timestamp: new Date().toISOString(),
    };

    // Publish to MQTT topic (self-loop simulation)
    mqttClient.publish(
      process.env.MQTT_TOPIC,
      JSON.stringify(simulatedPayload),
      { qos: 1 }
    );
  }, 3000); // Every 3 seconds

  console.log('🔧 Simulation mode active — publishing mock AG-702 data every 3s');
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 SEMS Server running on http://localhost:${PORT}`);
});
