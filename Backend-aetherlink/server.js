require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => res.send('AetherLink Explorer Backend - Off-grid connectivity powered 🚀'));

// Satellite data with orbital paths
let satellites = [
  { 
    id: "SAT-001", 
    lat: 40.7128, 
    lng: -74.0060, 
    baseRadius: 1200,
    currentRadius: 1200,
    status: "strong",
    speed: 0.8, // degrees per second (approx)
    angle: 0,
    orbitRadius: 30, // degrees of orbital path
    centerLat: 40,
    centerLng: -74,
    radiusPulse: 0,
    pulseDirection: 1
  },
  { 
    id: "SAT-002", 
    lat: -12.0464, 
    lng: -77.0428, 
    baseRadius: 1100,
    currentRadius: 1100,
    status: "strong",
    speed: 0.6,
    angle: 120,
    orbitRadius: 25,
    centerLat: -12,
    centerLng: -77,
    radiusPulse: 0,
    pulseDirection: 1
  },
  { 
    id: "SAT-003", 
    lat: 51.5074, 
    lng: -0.1278, 
    baseRadius: 1300,
    currentRadius: 1300,
    status: "medium",
    speed: 0.5,
    angle: 240,
    orbitRadius: 35,
    centerLat: 51,
    centerLng: 0,
    radiusPulse: 0,
    pulseDirection: 1
  },
  { 
    id: "SAT-004", 
    lat: 35.6762, 
    lng: 139.6503, 
    baseRadius: 1000,
    currentRadius: 1000,
    status: "strong",
    speed: 0.7,
    angle: 180,
    orbitRadius: 28,
    centerLat: 35,
    centerLng: 140,
    radiusPulse: 0,
    pulseDirection: 1
  },
  { 
    id: "SAT-005", 
    lat: -33.8688, 
    lng: 151.2093, 
    baseRadius: 950,
    currentRadius: 950,
    status: "weak",
    speed: 0.9,
    angle: 60,
    orbitRadius: 32,
    centerLat: -34,
    centerLng: 151,
    radiusPulse: 0,
    pulseDirection: 1
  },
  { 
    id: "SAT-006", 
    lat: 27.7172, 
    lng: 85.3240, 
    baseRadius: 1400,
    currentRadius: 1400,
    status: "medium",
    speed: 0.4,
    angle: 300,
    orbitRadius: 40,
    centerLat: 28,
    centerLng: 85,
    radiusPulse: 0,
    pulseDirection: 1
  }
];

// Update satellite positions and radii
function updateSatellites() {
  satellites = satellites.map(sat => {
    // Update orbital position
    let newAngle = sat.angle + sat.speed;
    if (newAngle > 360) newAngle -= 360;
    
    // Calculate new position using circular orbit
    const rad = newAngle * (Math.PI / 180);
    const newLat = sat.centerLat + (Math.sin(rad) * sat.orbitRadius);
    const newLng = sat.centerLng + (Math.cos(rad) * sat.orbitRadius);
    
    // Pulse the coverage radius (20% variation)
    let newRadiusPulse = sat.radiusPulse + (0.05 * sat.pulseDirection);
    let newPulseDirection = sat.pulseDirection;
    
    if (newRadiusPulse >= 1) {
      newRadiusPulse = 1;
      newPulseDirection = -1;
    } else if (newRadiusPulse <= -1) {
      newRadiusPulse = -1;
      newPulseDirection = 1;
    }
    
    // Radius varies between 80% and 120% of base
    const radiusVariation = 0.2 * Math.sin(newRadiusPulse * Math.PI);
    const currentRadius = sat.baseRadius * (1 + radiusVariation);
    
    // Update status based on radius
    let status = sat.status;
    if (currentRadius > sat.baseRadius * 1.1) {
      status = "strong";
    } else if (currentRadius < sat.baseRadius * 0.9) {
      status = "weak";
    } else {
      status = "medium";
    }
    
    return {
      ...sat,
      lat: Math.max(-85, Math.min(85, newLat)), // Keep within bounds
      lng: ((newLng % 360) + 360) % 360, // Wrap around -180 to 180
      angle: newAngle,
      currentRadius: Math.round(currentRadius),
      radiusPulse: newRadiusPulse,
      pulseDirection: newPulseDirection,
      status: status
    };
  });
  
  return satellites;
}

// Mock data with dynamic updates
function getMockCoverageData() {
  const updatedSatellites = updateSatellites();
  
  // Generate message based on satellite status
  const strongCount = updatedSatellites.filter(s => s.status === 'strong').length;
  const weakCount = updatedSatellites.filter(s => s.status === 'weak').length;
  
  let message = `🛰️ ${updatedSatellites.length} satellites in orbit • `;
  if (strongCount > 3) {
    message += `Excellent coverage conditions`;
  } else if (weakCount > 2) {
    message += `Some signal interference detected`;
  } else {
    message += `Stable connection across network`;
  }
  
  return {
    timestamp: new Date().toISOString(),
    satellites: updatedSatellites.map(s => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      coverageRadius: s.currentRadius,
      status: s.status,
      baseRadius: s.baseRadius
    })),
    message: message
  };
}

const activeIntervals = new Map();

io.on('connection', (socket) => {
  console.log('✅ Client connected to live satellite map:', socket.id);

  // Send initial data immediately
  socket.emit('coverageUpdate', getMockCoverageData());

  // Send updates every 2 seconds for smoother animation
  const interval = setInterval(() => {
    socket.emit('coverageUpdate', getMockCoverageData());
  }, 2000);

  activeIntervals.set(socket.id, interval);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    const interval = activeIntervals.get(socket.id);
    if (interval) {
      clearInterval(interval);
      activeIntervals.delete(socket.id);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Models synchronized with PostgreSQL');
  server.listen(PORT, () => {
    console.log(`🚀 AetherLink Explorer Backend running on http://localhost:${PORT}`);
    console.log(`🌐 Socket.io live map ready for real-time coverage updates`);
    console.log(`🛰️ Satellites are orbiting with dynamic radii!`);
  });
}).catch(err => {
  console.error('❌ Error syncing DB:', err);
  server.listen(PORT, () => {
    console.log(`⚠️ Server running without database connection on http://localhost:${PORT}`);
  });
});

module.exports = { app, io };