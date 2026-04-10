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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => res.send('AetherLink Explorer Backend - Off-grid connectivity powered 🚀'));

// 12 Satellites for global coverage
let satellites = [
  // North America
  { id: "SAT-001", lat: 40.7128, lng: -100.0060, baseRadius: 1400, currentRadius: 1400, status: "strong", speed: 0.6, angle: 0, orbitRadius: 25, centerLat: 40, centerLng: -100, radiusPulse: 0, pulseDirection: 1 },
  // South America
  { id: "SAT-002", lat: -15.0464, lng: -70.0428, baseRadius: 1300, currentRadius: 1300, status: "strong", speed: 0.5, angle: 45, orbitRadius: 22, centerLat: -15, centerLng: -70, radiusPulse: 0, pulseDirection: 1 },
  // Europe
  { id: "SAT-003", lat: 50.5074, lng: 10.1278, baseRadius: 1350, currentRadius: 1350, status: "medium", speed: 0.7, angle: 90, orbitRadius: 28, centerLat: 50, centerLng: 10, radiusPulse: 0, pulseDirection: 1 },
  // East Asia
  { id: "SAT-004", lat: 35.6762, lng: 120.6503, baseRadius: 1250, currentRadius: 1250, status: "strong", speed: 0.8, angle: 135, orbitRadius: 30, centerLat: 35, centerLng: 120, radiusPulse: 0, pulseDirection: 1 },
  // Australia
  { id: "SAT-005", lat: -25.8688, lng: 135.2093, baseRadius: 1200, currentRadius: 1200, status: "weak", speed: 0.4, angle: 180, orbitRadius: 20, centerLat: -25, centerLng: 135, radiusPulse: 0, pulseDirection: 1 },
  // Africa
  { id: "SAT-006", lat: 0.7172, lng: 20.3240, baseRadius: 1450, currentRadius: 1450, status: "strong", speed: 0.9, angle: 225, orbitRadius: 35, centerLat: 0, centerLng: 20, radiusPulse: 0, pulseDirection: 1 },
  // India
  { id: "SAT-007", lat: 20.5937, lng: 78.9629, baseRadius: 1300, currentRadius: 1300, status: "medium", speed: 0.55, angle: 270, orbitRadius: 24, centerLat: 20, centerLng: 78, radiusPulse: 0, pulseDirection: 1 },
  // Russia
  { id: "SAT-008", lat: 60.0, lng: 90.0, baseRadius: 1500, currentRadius: 1500, status: "strong", speed: 0.65, angle: 315, orbitRadius: 32, centerLat: 60, centerLng: 90, radiusPulse: 0, pulseDirection: 1 },
  // Pacific Ocean
  { id: "SAT-009", lat: 0.0, lng: -150.0, baseRadius: 1400, currentRadius: 1400, status: "medium", speed: 0.75, angle: 20, orbitRadius: 26, centerLat: 0, centerLng: -150, radiusPulse: 0, pulseDirection: 1 },
  // Atlantic Ocean
  { id: "SAT-010", lat: 20.0, lng: -40.0, baseRadius: 1350, currentRadius: 1350, status: "strong", speed: 0.85, angle: 110, orbitRadius: 29, centerLat: 20, centerLng: -40, radiusPulse: 0, pulseDirection: 1 },
  // Southeast Asia
  { id: "SAT-011", lat: 10.0, lng: 110.0, baseRadius: 1250, currentRadius: 1250, status: "medium", speed: 0.45, angle: 200, orbitRadius: 23, centerLat: 10, centerLng: 110, radiusPulse: 0, pulseDirection: 1 },
  // Middle East
  { id: "SAT-012", lat: 30.0, lng: 45.0, baseRadius: 1300, currentRadius: 1300, status: "strong", speed: 0.95, angle: 290, orbitRadius: 27, centerLat: 30, centerLng: 45, radiusPulse: 0, pulseDirection: 1 }
];

// Update satellite positions and radii with pulsating effect
function updateSatellites() {
  satellites = satellites.map(sat => {
    // Update orbital position
    let newAngle = sat.angle + sat.speed;
    if (newAngle > 360) newAngle -= 360;
    
    // Calculate new position using circular orbit
    const rad = newAngle * (Math.PI / 180);
    const newLat = sat.centerLat + (Math.sin(rad) * sat.orbitRadius);
    const newLng = sat.centerLng + (Math.cos(rad) * sat.orbitRadius);
    
    // Pulsating radius effect (30% variation for visible pulsing)
    let newRadiusPulse = sat.radiusPulse + (0.08 * sat.pulseDirection);
    let newPulseDirection = sat.pulseDirection;
    
    if (newRadiusPulse >= 1) {
      newRadiusPulse = 1;
      newPulseDirection = -1;
    } else if (newRadiusPulse <= -1) {
      newRadiusPulse = -1;
      newPulseDirection = 1;
    }
    
    // Radius varies between 70% and 130% of base for noticeable pulsing
    const radiusVariation = 0.3 * Math.sin(newRadiusPulse * Math.PI);
    const currentRadius = Math.round(sat.baseRadius * (1 + radiusVariation));
    
    // Update status based on radius
    let status = "medium";
    if (currentRadius > sat.baseRadius * 1.15) {
      status = "strong";
    } else if (currentRadius < sat.baseRadius * 0.85) {
      status = "weak";
    } else {
      status = "medium";
    }
    
    return {
      ...sat,
      lat: Math.max(-85, Math.min(85, newLat)),
      lng: ((newLng % 360) + 360) % 360,
      angle: newAngle,
      currentRadius: currentRadius,
      radiusPulse: newRadiusPulse,
      pulseDirection: newPulseDirection,
      status: status
    };
  });
  
  return satellites;
}

// Get live coverage data
function getMockCoverageData() {
  const updatedSatellites = updateSatellites();
  
  const strongCount = updatedSatellites.filter(s => s.status === 'strong').length;
  const weakCount = updatedSatellites.filter(s => s.status === 'weak').length;
  
  let message = `🛰️ ${updatedSatellites.length} satellites in orbit • `;
  if (strongCount > 6) {
    message += `Global coverage at peak performance`;
  } else if (weakCount > 3) {
    message += `Signal fluctuations detected in some regions`;
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

  socket.emit('coverageUpdate', getMockCoverageData());

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

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Models synchronized with PostgreSQL');
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AetherLink Explorer Backend running on port ${PORT}`);
    console.log(`🌐 Socket.io live map ready for real-time coverage updates`);
    console.log(`🛰️ 12 satellites orbiting with pulsating coverage radii!`);
  });
}).catch(err => {
  console.error('❌ Error syncing DB:', err);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`⚠️ Server running without database connection on port ${PORT}`);
  });
});

module.exports = { app, io };