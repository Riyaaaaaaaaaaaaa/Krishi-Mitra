const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  plantedDate: {
    type: Date,
    required: true
  },
  harvestDate: {
    type: Date
  },
  expectedYield: {
    type: Number,
    min: 0
  },
  actualYield: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['planted', 'growing', 'harvesting', 'harvested'],
    default: 'planted'
  },
  health: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
cropSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Crop', cropSchema);
