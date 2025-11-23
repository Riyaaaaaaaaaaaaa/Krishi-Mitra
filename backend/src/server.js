const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const recommendRoutes = require('./routes/recommend');
const marketPricesRoutes = require('./routes/marketPrices');
const cropsRoutes = require('./routes/crops');
const cropRotationRoutes = require('./routes/cropRotation');
const soilDataRoutes = require('./routes/soilData');
const conversationalAIRoutes = require('./routes/conversationalAI');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', recommendRoutes);
app.use('/api', marketPricesRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/crop-rotation', cropRotationRoutes);
app.use('/api/soil-data', soilDataRoutes);
app.use('/api/ai', conversationalAIRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishimitra';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
