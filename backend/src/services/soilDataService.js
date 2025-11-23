const axios = require('axios');

/**
 * Soil Data Integration Service
 * Integrates with Bhuvan API (ISRO) and SoilGrids API for comprehensive soil data
 */

// Bhuvan API Configuration (ISRO Geoportal)
const BHUVAN_WMS_URL = 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms';
const BHUVAN_WFS_URL = 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wfs';
const SOILGRIDS_BASE_URL = 'https://rest.isric.org/soilgrids/v2.0';

/**
 * Fetch soil data from Bhuvan (ISRO) WMS/WFS Service
 * Uses publicly available Bhuvan geospatial services
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Object} Soil data from Bhuvan
 */
async function fetchBhuvanSoilData(latitude, longitude) {
  try {
    console.log(`Fetching Bhuvan data for: ${latitude}, ${longitude}`);
    
    // Try multiple Bhuvan layer names (some may be publicly available)
    const layerNames = [
      'bhuvan:soil_map',
      'nrsc:soil_resources',
      'india:soil_type',
      'soil_data',
      'agriculture:soil'
    ];
    
    for (const layerName of layerNames) {
      try {
        const response = await axios.get(BHUVAN_WFS_URL, {
          params: {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: layerName,
            outputFormat: 'application/json',
            srsName: 'EPSG:4326',
            bbox: `${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01},EPSG:4326`
          },
          timeout: 15000
        });

        console.log(`Bhuvan API response for ${layerName}:`, response.status);

        if (response.data && response.data.features && response.data.features.length > 0) {
          const feature = response.data.features[0];
          const properties = feature.properties;
          
          console.log(`✅ Bhuvan data found with layer: ${layerName}`, properties);
          
          return {
            source: 'bhuvan',
            soilType: properties.SOIL_TYPE || properties.soil_type || 'Loam',
            texture: properties.TEXTURE || properties.texture || 'Medium',
            organicCarbon: properties.ORG_CARBON || properties.organic_carbon || null,
            nitrogen: properties.NITROGEN || properties.nitrogen || null,
            phosphorus: properties.PHOSPHORUS || properties.phosphorus || null,
            potassium: properties.POTASSIUM || properties.potassium || null,
            pH: properties.PH || properties.ph || null,
            depth: properties.SOIL_DEPTH || properties.depth || 'Medium',
            drainage: properties.DRAINAGE || properties.drainage || 'Moderate',
            erosion: properties.EROSION || properties.erosion || 'Low',
            location: {
              latitude,
              longitude,
              state: properties.STATE || properties.state || null,
              district: properties.DISTRICT || properties.district || null
            }
          };
        }
      } catch (layerError) {
        console.log(`Layer ${layerName} not accessible:`, layerError.response?.status || layerError.message);
      }
    }

    console.log('❌ Bhuvan API: No accessible layers found');
    console.log('⚠️  Please configure Bhuvan API credentials in .env file');
    console.log('   Contact: bhuvan@nrsc.gov.in for layer access');
    return null;
  } catch (error) {
    console.error('Bhuvan API Error:', error.response?.status, error.message);
    return null;
  }
}

/**
 * Fetch soil data from SoilGrids API (global coverage)
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Object} Soil properties from SoilGrids
 */
async function fetchSoilGridsData(latitude, longitude) {
  try {
    console.log(`Fetching SoilGrids data for: ${latitude}, ${longitude}`);
    
    // SoilGrids v2.0 REST API - properties/query endpoint for point data
    const response = await axios.get(`${SOILGRIDS_BASE_URL}/properties/query`, {
      params: {
        lon: longitude,
        lat: latitude,
        property: ['nitrogen', 'phh2o', 'soc', 'clay', 'sand', 'silt', 'bdod', 'cec'],
        depth: ['0-5cm', '5-15cm'],
        value: ['Q0.5', 'mean']
      },
      timeout: 15000
    });

    console.log('SoilGrids API response status:', response.status);

    if (response.data && response.data.properties && response.data.properties.layers) {
      const layers = response.data.properties.layers;
      
      console.log('✅ SoilGrids real data retrieved');
      
      // Helper function to extract median value (Q0.5) from layer at 0-5cm depth
      const getValue = (property) => {
        const layer = layers.find(l => l.name === property);
        if (layer && layer.depths && layer.depths.length > 0) {
          // Get 0-5cm depth data
          const depth = layer.depths.find(d => d.label === '0-5cm');
          if (depth && depth.values) {
            return depth.values.Q0_5 || depth.values['Q0.5'] || depth.values.mean;
          }
        }
        return null;
      };
      
      // Extract values from API response
      const nitrogen = getValue('nitrogen');
      const ph = getValue('phh2o');
      const soc = getValue('soc');
      const clay = getValue('clay');
      const sand = getValue('sand');
      const silt = getValue('silt');
      const bdod = getValue('bdod');
      const cec = getValue('cec');
      
      console.log('Extracted values:', { nitrogen, ph, soc, clay, sand, silt });
      
      // Convert SoilGrids units to agricultural units
      // Nitrogen: cg/kg to kg/ha (approximate conversion)
      // pH: pH*10 to pH
      // SOC: dg/kg to g/kg (organic carbon %)
      // Texture: g/kg to %
      
      const nitrogenKgHa = nitrogen ? Math.round(nitrogen / 10) : null; // cg/kg to approximate kg/ha
      const phValue = ph ? parseFloat((ph / 10).toFixed(2)) : null;
      const organicCarbon = soc ? parseFloat((soc / 10).toFixed(2)) : null; // dg/kg to g/kg
      const clayPct = clay ? parseFloat((clay / 10).toFixed(1)) : null;
      const sandPct = sand ? parseFloat((sand / 10).toFixed(1)) : null;
      const siltPct = silt ? parseFloat((silt / 10).toFixed(1)) : null;
      
      return {
        source: 'soilgrids',
        nitrogen: nitrogenKgHa || 40, // Default if conversion fails
        phosphorus: 30, // SoilGrids doesn't provide P directly, use default
        potassium: 35, // SoilGrids doesn't provide K directly, use default
        pH: phValue || 6.5,
        organicCarbon: organicCarbon,
        clay: clayPct,
        sand: sandPct,
        silt: siltPct,
        bulkDensity: bdod ? bdod / 100 : null, // cg/cm³ to g/cm³
        cec: cec ? cec / 10 : null, // mmol(c)/kg to cmol(c)/kg
        texture: calculateSoilTexture(
          clayPct || 33,
          sandPct || 33,
          siltPct || 34
        ),
        soilType: calculateSoilTexture(
          clayPct || 33,
          sandPct || 33,
          siltPct || 34
        ),
        drainage: 'Moderate',
        depth: 'Deep',
        erosion: 'Low',
        location: {
          latitude,
          longitude
        },
        isRealData: true // Flag to indicate real API data
      };
    }

    console.log('⚠️  SoilGrids API: Unexpected response structure');
    console.log('Response structure:', JSON.stringify(response.data).substring(0, 200));
    
    // Return location-based fallback data with variation
    const latVariation = Math.abs(latitude % 10);
    const lonVariation = Math.abs(longitude % 10);
    const nBase = 35 + (latVariation * 2);
    const pBase = 25 + (lonVariation * 2);
    const kBase = 35 + ((latVariation + lonVariation) / 2 * 2);
    const phBase = 6.0 + (latVariation / 10);
    
    console.log('⚠️  Using fallback data with location-based variation');
    
    return {
      source: 'soilgrids',
      nitrogen: Math.round(nBase + Math.random() * 10),
      phosphorus: Math.round(pBase + Math.random() * 8),
      potassium: Math.round(kBase + Math.random() * 10),
      pH: parseFloat((phBase + Math.random() * 0.5).toFixed(2)),
      soilType: latitude > 20 ? 'Loam' : 'Clay Loam',
      texture: 'Medium',
      drainage: 'Moderate',
      depth: 'Deep',
      erosion: 'Low',
      organicCarbon: parseFloat((1.2 + Math.random() * 0.6).toFixed(2)),
      temperature: Math.round(20 + latVariation + Math.random() * 5),
      location: { latitude, longitude },
      isFallback: true
    };
  } catch (error) {
    console.error('❌ SoilGrids API Error:', error.response?.status, error.message);
    if (error.response) {
      console.error('SoilGrids Error Response:', error.response.data);
    }
    
    // Return location-based fallback data if API fails
    console.log('⚠️  Using fallback data due to API error');
    const latVariation = Math.abs(latitude % 10);
    const lonVariation = Math.abs(longitude % 10);
    const nBase = 35 + (latVariation * 2);
    const pBase = 25 + (lonVariation * 2);
    const kBase = 35 + ((latVariation + lonVariation) / 2 * 2);
    const phBase = 6.0 + (latVariation / 10);
    
    return {
      source: 'soilgrids',
      nitrogen: Math.round(nBase + Math.random() * 10),
      phosphorus: Math.round(pBase + Math.random() * 8),
      potassium: Math.round(kBase + Math.random() * 10),
      pH: parseFloat((phBase + Math.random() * 0.5).toFixed(2)),
      soilType: latitude > 20 ? 'Loam' : 'Clay Loam',
      texture: 'Medium',
      drainage: 'Moderate',
      depth: 'Deep',
      erosion: 'Low',
      organicCarbon: parseFloat((1.2 + Math.random() * 0.6).toFixed(2)),
      temperature: Math.round(20 + latVariation + Math.random() * 5),
      location: { latitude, longitude },
      isFallback: true
    };
  }
}

/**
 * Calculate soil texture based on clay, sand, silt percentages
 * @param {number} clay - Clay percentage
 * @param {number} sand - Sand percentage
 * @param {number} silt - Silt percentage
 * @returns {string} Soil texture class
 */
function calculateSoilTexture(clay, sand, silt) {
  if (clay > 40) return 'Clay';
  if (clay > 27 && sand < 45) return 'Clay Loam';
  if (clay > 20 && sand > 45) return 'Sandy Clay';
  if (sand > 85) return 'Sand';
  if (sand > 70 && clay < 15) return 'Loamy Sand';
  if (sand > 50 && clay < 20) return 'Sandy Loam';
  if (silt > 80) return 'Silt';
  if (silt > 50 && clay < 27) return 'Silt Loam';
  if (clay < 27 && sand > 20 && sand < 50) return 'Loam';
  return 'Loam';
}

/**
 * Process IoT sensor data
 * @param {Object} sensorData - Raw sensor data
 * @returns {Object} Processed soil parameters
 */
function processIoTSensorData(sensorData) {
  try {
    return {
      source: 'iot_sensor',
      nitrogen: sensorData.n || null,
      phosphorus: sensorData.p || null,
      potassium: sensorData.k || null,
      pH: sensorData.ph || null,
      moisture: sensorData.moisture || null,
      temperature: sensorData.temperature || null,
      conductivity: sensorData.ec || null, // Electrical conductivity
      timestamp: sensorData.timestamp || new Date().toISOString(),
      deviceId: sensorData.deviceId || 'unknown',
      calibrated: sensorData.calibrated !== false,
      accuracy: sensorData.accuracy || 'standard'
    };
  } catch (error) {
    console.error('IoT Sensor Data Processing Error:', error.message);
    return null;
  }
}

/**
 * Merge soil data from multiple sources
 * Priority: IoT Sensors > Bhuvan > SoilGrids > Defaults
 * @param {Object} iotData - IoT sensor data
 * @param {Object} bhuvanData - Bhuvan API data
 * @param {Object} soilGridsData - SoilGrids API data (fallback)
 * @returns {Object} Merged soil data
 */
function mergeSoilData(iotData, bhuvanData, soilGridsData) {
  // Mark sources as available even if they're fallback data
  const soilGridsAvailable = soilGridsData !== null;
  const soilGridsIsFallback = soilGridsData?.isFallback || false;
  
  return {
    nitrogen: iotData?.nitrogen || bhuvanData?.nitrogen || soilGridsData?.nitrogen || 40,
    phosphorus: iotData?.phosphorus || bhuvanData?.phosphorus || 30,
    potassium: iotData?.potassium || bhuvanData?.potassium || 30,
    pH: iotData?.pH || bhuvanData?.pH || soilGridsData?.pH || 6.5,
    temperature: iotData?.temperature || 25,
    moisture: iotData?.moisture || null,
    organicCarbon: bhuvanData?.organicCarbon || soilGridsData?.organicCarbon || null,
    soilType: bhuvanData?.soilType || soilGridsData?.texture || 'Loam',
    texture: bhuvanData?.texture || soilGridsData?.texture || 'Medium',
    drainage: bhuvanData?.drainage || 'Moderate',
    depth: bhuvanData?.depth || 'Deep',
    erosion: bhuvanData?.erosion || 'Low',
    sources: {
      iot: iotData !== null,
      bhuvan: bhuvanData !== null,
      soilgrids: soilGridsAvailable // Mark as available even if fallback
    },
    dataQuality: calculateDataQuality(iotData, bhuvanData, soilGridsData),
    lastUpdated: new Date().toISOString(),
    soilGridsFallback: soilGridsIsFallback // Add flag to indicate fallback usage
  };
}

/**
 * Calculate data quality score based on available sources
 * @returns {Object} Quality metrics
 */
function calculateDataQuality(iotData, bhuvanData, soilGridsData) {
  let score = 0;
  let sources = [];

  if (iotData) {
    score += 50;
    sources.push('IoT Sensor (Real-time)');
  }
  if (soilGridsData) {
    if (soilGridsData.isRealData) {
      score += 50; // Real SoilGrids data
      sources.push('SoilGrids (Global Database)');
    } else if (soilGridsData.isFallback) {
      score += 20; // Fallback/estimated data
      sources.push('SoilGrids (Estimated)');
    } else {
      score += 50;
      sources.push('SoilGrids (Global Database)');
    }
  }

  return {
    score: score,
    level: score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : score >= 20 ? 'Fair' : 'Low',
    sources: sources,
    recommendation: score < 50 
      ? 'Data quality is limited. Add IoT sensors for real-time soil monitoring or conduct soil testing for accurate NPK values' 
      : 'Data quality is good for agricultural planning'
  };
}

/**
 * Get comprehensive soil data for a location
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {Object} iotSensorData - Optional IoT sensor data
 * @returns {Object} Complete soil data
 */
async function getComprehensiveSoilData(latitude, longitude, iotSensorData = null) {
  try {
    // Fetch data from SoilGrids (temporary - will switch to Bhuvan when credentials are received)
    const soilGridsData = await fetchSoilGridsData(latitude, longitude);

    // Process IoT data if available
    const processedIoTData = iotSensorData ? processIoTSensorData(iotSensorData) : null;

    // Merge data sources (IoT + SoilGrids for now)
    const mergedData = mergeSoilData(processedIoTData, null, soilGridsData);

    return {
      success: true,
      data: mergedData,
      location: {
        latitude,
        longitude,
        state: null,
        district: null
      }
    };
  } catch (error) {
    console.error('Comprehensive Soil Data Error:', error.message);
    return {
      success: false,
      error: 'Failed to fetch soil data',
      message: error.message
    };
  }
}

module.exports = {
  getComprehensiveSoilData,
  fetchBhuvanSoilData,
  fetchSoilGridsData,
  processIoTSensorData,
  mergeSoilData,
  calculateSoilTexture
};
