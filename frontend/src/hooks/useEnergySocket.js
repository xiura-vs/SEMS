import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const MAX_HISTORY = 60; // Keep 60 data points for chart

export function useEnergySocket() {
  const [latestReading, setLatestReading] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  const formatTime = (ts) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
  };

  useEffect(() => {
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket.io connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('🔌 Socket.io disconnected');
    });

    socket.on('energy_update', (data) => {
      setLatestReading(data);
      setLastUpdate(new Date());

      setChartData(prev => {
        const point = {
          time: formatTime(data.timestamp),
          power: +(data.activePower?.total || 0).toFixed(3),
          voltage: +(data.voltage?.L1 || 0).toFixed(1),
          current: +(data.current?.L1 || 0).toFixed(2),
          pf: +(data.powerFactor || 0).toFixed(3),
        };
        const next = [...prev, point];
        return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
      });
    });

    return () => { socket.disconnect(); };
  }, []);

  return { latestReading, chartData, connected, lastUpdate };
}
