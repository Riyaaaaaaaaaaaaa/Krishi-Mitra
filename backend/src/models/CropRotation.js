const mongoose = require('mongoose');

/**
 * Crop Rotation Schema
 * Tracks historical crop rotation data for soil fertility analysis
 */
const cropRotationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fieldId: {
    type: String,
    required: true,
    trim: true
  },
  fieldName: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  rotationHistory: [{
    cropName: {
      type: String,
      required: true,
      trim: true
    },
    cropFamily: {
      type: String,
      enum: ['Legume', 'Cereal', 'Oilseed', 'Vegetable', 'Fruit', 'Fiber', 'Other'],
      required: true
    },
    season: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Perennial'],
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    plantedDate: {
      type: Date,
      required: true
    },
    harvestDate: {
      type: Date
    },
    yield: {
      type: Number,
      min: 0
    },
    yieldUnit: {
      type: String,
      default: 't/ha',
      enum: ['t/ha', 'kg/ha', 'quintal/ha', 'tons', 'kg']
    },
    soilHealthBefore: {
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      pH: Number,
      organicMatter: Number
    },
    soilHealthAfter: {
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      pH: Number,
      organicMatter: Number
    },
    fertilizersUsed: [{
      type: String,
      amount: Number,
      unit: String
    }],
    notes: String
  }],
  currentSoilHealth: {
    nitrogen: {
      type: Number,
      default: 40
    },
    phosphorus: {
      type: Number,
      default: 30
    },
    potassium: {
      type: Number,
      default: 30
    },
    pH: {
      type: Number,
      default: 6.5
    },
    organicMatter: {
      type: Number,
      default: 2.0
    },
    lastTested: {
      type: Date,
      default: Date.now
    }
  },
  rotationPattern: {
    type: String,
    default: 'Unknown'
  },
  soilFertilityTrend: {
    type: String,
    enum: ['Improving', 'Stable', 'Declining', 'Unknown'],
    default: 'Unknown'
  },
  recommendations: [{
    type: String
  }],
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
cropRotationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate rotation pattern based on history
cropRotationSchema.methods.calculateRotationPattern = function() {
  if (this.rotationHistory.length < 2) {
    this.rotationPattern = 'Insufficient Data';
    return;
  }

  const families = this.rotationHistory.map(crop => crop.cropFamily);
  const uniqueFamilies = [...new Set(families)];

  if (uniqueFamilies.length === 1) {
    this.rotationPattern = 'Monoculture (Not Recommended)';
  } else if (families.includes('Legume') && families.includes('Cereal')) {
    this.rotationPattern = 'Legume-Cereal Rotation (Good)';
  } else if (uniqueFamilies.length >= 3) {
    this.rotationPattern = 'Multi-crop Rotation (Excellent)';
  } else {
    this.rotationPattern = 'Two-crop Rotation (Fair)';
  }
};

// Calculate soil fertility trend
cropRotationSchema.methods.calculateSoilFertilityTrend = function() {
  if (this.rotationHistory.length < 2) {
    this.soilFertilityTrend = 'Unknown';
    return;
  }

  const recentCrops = this.rotationHistory.slice(-3);
  const nitrogenChanges = recentCrops
    .filter(crop => crop.soilHealthBefore && crop.soilHealthAfter)
    .map(crop => crop.soilHealthAfter.nitrogen - crop.soilHealthBefore.nitrogen);

  if (nitrogenChanges.length === 0) {
    this.soilFertilityTrend = 'Unknown';
    return;
  }

  const avgChange = nitrogenChanges.reduce((a, b) => a + b, 0) / nitrogenChanges.length;

  if (avgChange > 5) {
    this.soilFertilityTrend = 'Improving';
  } else if (avgChange > -5) {
    this.soilFertilityTrend = 'Stable';
  } else {
    this.soilFertilityTrend = 'Declining';
  }
};

// Generate crop rotation recommendations
cropRotationSchema.methods.generateRecommendations = function() {
  const recommendations = [];

  // Check rotation pattern
  if (this.rotationPattern.includes('Monoculture')) {
    recommendations.push('⚠️ Avoid continuous cultivation of the same crop family. Rotate with legumes or other families.');
  }

  // Check legume inclusion
  const hasLegume = this.rotationHistory.some(crop => crop.cropFamily === 'Legume');
  if (!hasLegume && this.rotationHistory.length >= 2) {
    recommendations.push('🌱 Include legume crops (chickpea, lentil, beans) to naturally restore soil nitrogen.');
  }

  // Check soil fertility trend
  if (this.soilFertilityTrend === 'Declining') {
    recommendations.push('⚠️ Soil fertility is declining. Consider green manure, organic compost, or cover crops.');
  }

  // Check nitrogen levels
  if (this.currentSoilHealth.nitrogen < 30) {
    recommendations.push('💧 Soil nitrogen is low. Plant nitrogen-fixing crops or apply organic fertilizers.');
  }

  // Check pH levels
  if (this.currentSoilHealth.pH < 6.0) {
    recommendations.push('🧪 Soil is acidic (pH < 6.0). Consider lime application to raise pH.');
  } else if (this.currentSoilHealth.pH > 8.0) {
    recommendations.push('🧪 Soil is alkaline (pH > 8.0). Consider gypsum or sulfur application.');
  }

  // Check organic matter
  if (this.currentSoilHealth.organicMatter < 1.5) {
    recommendations.push('🍂 Low organic matter. Add compost, farmyard manure, or crop residues.');
  }

  // General recommendations
  if (this.rotationHistory.length >= 3) {
    const lastThreeFamilies = this.rotationHistory.slice(-3).map(c => c.cropFamily);
    if (new Set(lastThreeFamilies).size < 2) {
      recommendations.push('🔄 Diversify crop families in rotation for better soil health.');
    }
  }

  this.recommendations = recommendations;
  return recommendations;
};

module.exports = mongoose.model('CropRotation', cropRotationSchema);
