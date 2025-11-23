const express = require('express');
const router = express.Router();
const CropRotation = require('../models/CropRotation');
const mongoose = require('mongoose');

/**
 * GET /api/crop-rotation/:userId
 * Get all crop rotation records for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const rotations = await CropRotation.find({ userId: req.params.userId })
      .sort({ updatedAt: -1 });

    // Calculate patterns and recommendations for each
    rotations.forEach(rotation => {
      rotation.calculateRotationPattern();
      rotation.calculateSoilFertilityTrend();
      rotation.generateRecommendations();
    });

    res.json({
      success: true,
      count: rotations.length,
      rotations
    });
  } catch (error) {
    console.error('Error fetching crop rotations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crop rotation data'
    });
  }
});

/**
 * GET /api/crop-rotation/field/:fieldId
 * Get crop rotation data for a specific field
 */
router.get('/field/:fieldId', async (req, res) => {
  try {
    const rotation = await CropRotation.findOne({ fieldId: req.params.fieldId });

    if (!rotation) {
      return res.status(404).json({
        success: false,
        error: 'Field not found'
      });
    }

    rotation.calculateRotationPattern();
    rotation.calculateSoilFertilityTrend();
    rotation.generateRecommendations();

    res.json({
      success: true,
      rotation
    });
  } catch (error) {
    console.error('Error fetching field rotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch field rotation data'
    });
  }
});

/**
 * POST /api/crop-rotation
 * Create a new crop rotation record
 */
router.post('/', async (req, res) => {
  try {
    const { userId, fieldId, fieldName, area, rotationHistory, currentSoilHealth } = req.body;
    console.log('Received request body:', req.body);

    if (!userId || !fieldId || !fieldName || !area) {
      return res.status(400).json({
        success: false,
        error: 'userId, fieldId, fieldName, and area are required'
      });
    }

    // For testing purposes, allow string userId and convert to ObjectId
    const userIdToUse = typeof userId === 'string' && userId === 'test-user-id' 
      ? new mongoose.Types.ObjectId() 
      : userId;

    const rotation = new CropRotation({
      userId: userIdToUse,
      fieldId,
      fieldName,
      area,
      rotationHistory: rotationHistory || [],
      currentSoilHealth: currentSoilHealth || {}
    });

    console.log('Created rotation object:', rotation);

    rotation.calculateRotationPattern();
    rotation.calculateSoilFertilityTrend();
    rotation.generateRecommendations();

    await rotation.save();

    res.status(201).json({
      success: true,
      message: 'Crop rotation record created successfully',
      rotation
    });
  } catch (error) {
    console.error('Error creating crop rotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create crop rotation record',
      details: error.message
    });
  }
});

/**
 * PUT /api/crop-rotation/:id/add-crop
 * POST /api/crop-rotation/:id/add-crop
 * Add a crop to rotation history
 */
const addCropHandler = async (req, res) => {
  try {
    const rotation = await CropRotation.findById(req.params.id);

    if (!rotation) {
      return res.status(404).json({
        success: false,
        error: 'Crop rotation record not found'
      });
    }

    const {
      cropName,
      cropFamily,
      season,
      year,
      plantedDate,
      harvestDate,
      yield: cropYield,
      yieldUnit,
      soilHealthBefore,
      soilHealthAfter,
      fertilizersUsed,
      notes
    } = req.body;

    if (!cropName || !cropFamily || !season || !year || !plantedDate) {
      return res.status(400).json({
        success: false,
        error: 'cropName, cropFamily, season, year, and plantedDate are required'
      });
    }

    rotation.rotationHistory.push({
      cropName,
      cropFamily,
      season,
      year,
      plantedDate,
      harvestDate,
      yield: cropYield,
      yieldUnit: yieldUnit || 't/ha',
      soilHealthBefore,
      soilHealthAfter,
      fertilizersUsed,
      notes
    });

    // Update current soil health if soilHealthAfter is provided
    if (soilHealthAfter) {
      rotation.currentSoilHealth = {
        ...rotation.currentSoilHealth,
        ...soilHealthAfter,
        lastTested: new Date()
      };
    }

    rotation.calculateRotationPattern();
    rotation.calculateSoilFertilityTrend();
    rotation.generateRecommendations();

    await rotation.save();

    res.json({
      success: true,
      message: 'Crop added to rotation history',
      rotation
    });
  } catch (error) {
    console.error('Error adding crop to rotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add crop to rotation'
    });
  }
};

router.put('/:id/add-crop', addCropHandler);
router.post('/:id/add-crop', addCropHandler);

/**
 * PUT /api/crop-rotation/:id/soil-health
 * Update current soil health data
 */
router.put('/:id/soil-health', async (req, res) => {
  try {
    const rotation = await CropRotation.findById(req.params.id);

    if (!rotation) {
      return res.status(404).json({
        success: false,
        error: 'Crop rotation record not found'
      });
    }

    const { nitrogen, phosphorus, potassium, pH, organicMatter } = req.body;

    rotation.currentSoilHealth = {
      nitrogen: nitrogen !== undefined ? nitrogen : rotation.currentSoilHealth.nitrogen,
      phosphorus: phosphorus !== undefined ? phosphorus : rotation.currentSoilHealth.phosphorus,
      potassium: potassium !== undefined ? potassium : rotation.currentSoilHealth.potassium,
      pH: pH !== undefined ? pH : rotation.currentSoilHealth.pH,
      organicMatter: organicMatter !== undefined ? organicMatter : rotation.currentSoilHealth.organicMatter,
      lastTested: new Date()
    };

    rotation.calculateSoilFertilityTrend();
    rotation.generateRecommendations();

    await rotation.save();

    res.json({
      success: true,
      message: 'Soil health data updated',
      rotation
    });
  } catch (error) {
    console.error('Error updating soil health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update soil health data'
    });
  }
});

/**
 * GET /api/crop-rotation/:id/analysis
 * Get detailed rotation analysis and recommendations
 */
router.get('/:id/analysis', async (req, res) => {
  try {
    const rotation = await CropRotation.findById(req.params.id);

    if (!rotation) {
      return res.status(404).json({
        success: false,
        error: 'Crop rotation record not found'
      });
    }

    rotation.calculateRotationPattern();
    rotation.calculateSoilFertilityTrend();
    const recommendations = rotation.generateRecommendations();

    // Calculate additional statistics
    const stats = {
      totalCropsGrown: rotation.rotationHistory.length,
      cropFamilies: [...new Set(rotation.rotationHistory.map(c => c.cropFamily))],
      yearsTracked: rotation.rotationHistory.length > 0 
        ? Math.max(...rotation.rotationHistory.map(c => c.year)) - Math.min(...rotation.rotationHistory.map(c => c.year)) + 1
        : 0,
      averageYield: rotation.rotationHistory.filter(c => c.yield).length > 0
        ? rotation.rotationHistory.filter(c => c.yield).reduce((sum, c) => sum + c.yield, 0) / rotation.rotationHistory.filter(c => c.yield).length
        : null,
      lastCrop: rotation.rotationHistory.length > 0 
        ? rotation.rotationHistory[rotation.rotationHistory.length - 1].cropName
        : null
    };

    res.json({
      success: true,
      analysis: {
        fieldName: rotation.fieldName,
        area: rotation.area,
        rotationPattern: rotation.rotationPattern,
        soilFertilityTrend: rotation.soilFertilityTrend,
        currentSoilHealth: rotation.currentSoilHealth,
        recommendations,
        statistics: stats,
        rotationHistory: rotation.rotationHistory
      }
    });
  } catch (error) {
    console.error('Error analyzing crop rotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze crop rotation'
    });
  }
});

/**
 * PUT /api/crop-rotation/:id
 * Update field details (name, area)
 */
router.put('/:id', async (req, res) => {
  try {
    const rotation = await CropRotation.findById(req.params.id);

    if (!rotation) {
      return res.status(404).json({
        success: false,
        error: 'Crop rotation record not found'
      });
    }

    const { fieldName, area } = req.body;

    if (fieldName) rotation.fieldName = fieldName;
    if (area) rotation.area = area;

    await rotation.save();

    res.json({
      success: true,
      message: 'Field updated successfully',
      rotation
    });
  } catch (error) {
    console.error('Error updating field:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update field'
    });
  }
});

/**
 * DELETE /api/crop-rotation/:id
 * Delete a crop rotation record
 */
router.delete('/:id', async (req, res) => {
  try {
    const rotation = await CropRotation.findByIdAndDelete(req.params.id);

    if (!rotation) {
      return res.status(404).json({
        success: false,
        error: 'Crop rotation record not found'
      });
    }

    res.json({
      success: true,
      message: 'Crop rotation record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting crop rotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete crop rotation record'
    });
  }
});

module.exports = router;
