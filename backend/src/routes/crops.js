const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

/**
 * GET /api/crops
 * Get all crops for a user
 * Query params: userId (required)
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const crops = await Crop.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: crops.length,
      crops
    });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crops'
    });
  }
});

/**
 * GET /api/crops/:id
 * Get a single crop by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found'
      });
    }

    res.json({
      success: true,
      crop
    });
  } catch (error) {
    console.error('Error fetching crop:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crop'
    });
  }
});

/**
 * POST /api/crops
 * Create a new crop
 * Body: { userId, cropName, area, plantedDate, harvestDate, expectedYield, status, health, notes }
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      cropName,
      area,
      plantedDate,
      harvestDate,
      expectedYield,
      status,
      health,
      notes
    } = req.body;

    // Validation
    if (!userId || !cropName || !area || !plantedDate) {
      return res.status(400).json({
        success: false,
        error: 'userId, cropName, area, and plantedDate are required'
      });
    }

    const crop = new Crop({
      userId,
      cropName,
      area,
      plantedDate,
      harvestDate,
      expectedYield,
      status: status || 'planted',
      health: health || 'good',
      notes
    });

    await crop.save();

    res.status(201).json({
      success: true,
      message: 'Crop created successfully',
      crop
    });
  } catch (error) {
    console.error('Error creating crop:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create crop'
    });
  }
});

/**
 * PUT /api/crops/:id
 * Update a crop
 * Body: { cropName, area, plantedDate, harvestDate, expectedYield, actualYield, status, health, notes }
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      cropName,
      area,
      plantedDate,
      harvestDate,
      expectedYield,
      actualYield,
      status,
      health,
      notes
    } = req.body;

    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found'
      });
    }

    // Update fields
    if (cropName) crop.cropName = cropName;
    if (area) crop.area = area;
    if (plantedDate) crop.plantedDate = plantedDate;
    if (harvestDate) crop.harvestDate = harvestDate;
    if (expectedYield !== undefined) crop.expectedYield = expectedYield;
    if (actualYield !== undefined) crop.actualYield = actualYield;
    if (status) crop.status = status;
    if (health) crop.health = health;
    if (notes !== undefined) crop.notes = notes;

    await crop.save();

    res.json({
      success: true,
      message: 'Crop updated successfully',
      crop
    });
  } catch (error) {
    console.error('Error updating crop:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update crop'
    });
  }
});

/**
 * DELETE /api/crops/:id
 * Delete a crop
 */
router.delete('/:id', async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found'
      });
    }

    res.json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting crop:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete crop'
    });
  }
});

/**
 * GET /api/crops/stats/:userId
 * Get crop statistics for a user
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const crops = await Crop.find({ userId: req.params.userId });

    const stats = {
      totalCrops: crops.length,
      totalArea: crops.reduce((sum, crop) => sum + crop.area, 0),
      activeCrops: crops.filter(c => c.status === 'growing' || c.status === 'planted').length,
      statusBreakdown: {
        planted: crops.filter(c => c.status === 'planted').length,
        growing: crops.filter(c => c.status === 'growing').length,
        harvesting: crops.filter(c => c.status === 'harvesting').length,
        harvested: crops.filter(c => c.status === 'harvested').length
      },
      healthBreakdown: {
        excellent: crops.filter(c => c.health === 'excellent').length,
        good: crops.filter(c => c.health === 'good').length,
        fair: crops.filter(c => c.health === 'fair').length,
        poor: crops.filter(c => c.health === 'poor').length
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching crop stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crop statistics'
    });
  }
});

module.exports = router;
