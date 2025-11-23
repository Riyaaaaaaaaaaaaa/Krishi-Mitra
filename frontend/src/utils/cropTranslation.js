// Utility to translate crop names based on i18n
import i18n from '../i18n'

/**
 * Translate crop name to current language
 * @param {string} cropName - Crop name in English
 * @returns {string} - Translated crop name
 */
export const translateCropName = (cropName) => {
  if (!cropName) return cropName
  
  const normalizedName = cropName.toLowerCase().replace(/\s+/g, '')
  const key = `app.crops.${normalizedName}`
  
  // Try to translate using i18n
  const translated = i18n.t(key)
  
  // If translation key not found, return original name
  if (translated === key) {
    return cropName
  }
  
  return translated
}

/**
 * Get crop name key for i18n translation
 * @param {string} cropName - Crop name in English
 * @returns {string} - i18n key for the crop
 */
export const getCropNameKey = (cropName) => {
  if (!cropName) return ''
  const normalizedName = cropName.toLowerCase().replace(/\s+/g, '')
  return `app.crops.${normalizedName}`
}
