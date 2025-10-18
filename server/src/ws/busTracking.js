import { WebSocketServer } from 'ws';

export function createBusTrackingServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/bus' });

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => (ws.isAlive = true));

    ws.send(JSON.stringify({ type: 'welcome', message: 'connected' }));

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(String(msg));
        // Expected messages from clients: subscribe/unsubscribe to a route or bus
        if (data.type === 'subscribe') {
          ws.subscriptions = ws.subscriptions || new Set();
          ws.subscriptions.add(JSON.stringify({ routeId: data.routeId, busNumber: data.busNumber }));
          ws.send(JSON.stringify({ type: 'subscribed', routeId: data.routeId, busNumber: data.busNumber }));
        }
        if (data.type === 'unsubscribe') {
          ws.subscriptions?.delete(JSON.stringify({ routeId: data.routeId, busNumber: data.busNumber }));
          ws.send(JSON.stringify({ type: 'unsubscribed', routeId: data.routeId, busNumber: data.busNumber }));
        }
      } catch {}
    });
  });

  // Heartbeat
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  // Simple in-memory broadcaster for demo (simulate bus updates)
  function broadcast(update) {
    const payload = JSON.stringify({ type: 'update', ...update });
    wss.clients.forEach((ws) => {
      if (ws.readyState === 1) {
        if (!ws.subscriptions || ws.subscriptions.size === 0) return ws.send(payload);
        const key = JSON.stringify({ routeId: update.routeId, busNumber: update.busNumber });
        if (ws.subscriptions.has(key)) ws.send(payload);
      }
    });
  }

  // Demo ticker emitting sample bus updates
  setInterval(() => {
    const now = Date.now();
    // Route 201 demo: move slightly west each tick
    const lat = -25.7479 + Math.sin(now / 60000) * 0.01;
    const lon = 28.2293 + Math.cos(now / 60000) * 0.01;
    const heading = ((now / 1000) % 360);
    broadcast({
      routeId: 'route_201_demo',
      busNumber: '201',
      latitude: lat,
      longitude: lon,
      heading,
      speed: 30 + (Math.sin(now / 5000) * 5),
      status: ['approaching', 'arrived', 'departed'][Math.floor((now / 10000) % 3)],
      etaSeconds: 300,
      updatedAt: new Date().toISOString(),
      stops: [
        { id: 's1', name: 'Hatfield Station', latitude: -25.7479, longitude: 28.2293 },
        { id: 's2', name: 'Menlyn Mall', latitude: -25.785, longitude: 28.275 },
        { id: 's3', name: 'Centurion Mall', latitude: -25.8601, longitude: 28.1894 },
      ],
      path: [
        { latitude: -25.7479, longitude: 28.2293 },
        { latitude: -25.765, longitude: 28.245 },
        { latitude: -25.785, longitude: 28.275 },
        { latitude: -25.8000, longitude: 28.2850 },
        { latitude: -25.8601, longitude: 28.1894 },
      ],
    });
  }, 3000);

  return wss;
}
