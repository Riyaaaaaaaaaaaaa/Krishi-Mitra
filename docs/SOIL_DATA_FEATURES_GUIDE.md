# Soil Data Management - User Guide

## 📱 Page Overview

```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Soil Data Management           [🎤 Voice Guide]         │
│  Get comprehensive soil data from multiple sources...        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ⚠️ CRITICAL ALERT: Nitrogen                    [🔊]        │
│  Critical: Nitrogen levels extremely low...                  │
│  💡 Action Required: Apply 150-200 kg/ha Urea immediately   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📍 Location                                                 │
│  [Latitude Input] [Longitude Input] [📍 Use Current Loc]    │
│  [🔍 Fetch Soil Data] [📡 Submit IoT Data]                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📊 Data Quality: Good - 100%                                │
│  Sources: ✅ IoT Sensor ✅ SoilGrids                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ 🌱 NPK Levels│ 🧪 Soil Props│ 🏞️ Physical   │
│              │              │              │
│ N: 45 kg/ha  │ pH: 6.8      │ Drainage: Mod│
│ ━━━━━━━━ 🟢  │ ━━━━━━━━     │ Depth: Deep  │
│ Good-Optimal │ Neutral ← →  │ Erosion: Low │
│              │ Acidic Alk   │              │
│ P: 35 kg/ha  │              │              │
│ ━━━━━━━━ 🟢  │ Soil: Loam   │              │
│              │ Texture: Med │              │
│ K: 38 kg/ha  │              │              │
│ ━━━━━━ 🟡    │ [🔊 Read]    │              │
│ Medium       │              │              │
│              │              │              │
│ [🔊 Read NPK]│              │              │
└──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📈 Soil Parameter Trends (6 Months)      [🔊 Explain Chart]│
│                                                              │
│  NPK Levels Over Time                                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │     ╱╲                                             │     │
│  │    ╱  ╲    ╱╲        ← Nitrogen (N)               │     │
│  │   ╱    ╲  ╱  ╲                                    │     │
│  │  ╱      ╲╱    ╲   ← Phosphorus (P)               │     │
│  │ ╱              ╲╱                                  │     │
│  │──────────────────────────────────────────────     │     │
│  │        ╱╲    ╱╲    ╱╲  ← Potassium (K)           │     │
│  │       ╱  ╲  ╱  ╲  ╱  ╲                           │     │
│  └────────────────────────────────────────────────────┘     │
│  Jan  Feb  Mar  Apr  May  Jun                               │
│                                                              │
│  pH Level Trend                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │      ╱╲                                            │     │
│  │     ╱  ╲      ╱╲                                  │     │
│  │    ╱    ╲    ╱  ╲    ╱╲                          │     │
│  │   ╱      ╲  ╱    ╲  ╱  ╲                         │     │
│  │  ╱        ╲╱      ╲╱                              │     │
│  └────────────────────────────────────────────────────┘     │
│  Jan  Feb  Mar  Apr  May  Jun                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🌾 Soil-Based Recommendations       [🔊 Read Recommendations]│
│                                                              │
│  🌱 Recommended Crops                                        │
│  ┌────────────────────────┬────────────────────────┐       │
│  │ Rice                   │ Wheat                  │       │
│  │ High Suitability       │ High Suitability       │       │
│  │ 💡 Optimal pH and      │ 💡 Good soil          │       │
│  │ nitrogen levels        │ conditions             │       │
│  └────────────────────────┴────────────────────────┘       │
│                                                              │
│  🧪 Recommended Fertilizers & Amendments                     │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Muriate of Potash (MOP)                          │       │
│  │ 📏 Application Rate: 40-60 kg/ha                 │       │
│  │ 💡 Low potassium levels                          │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  👨‍🌾 Expert Advisory                                        │
│  • Conduct soil testing every 6-12 months                    │
│  • Consider crop rotation to maintain soil health            │
│  • Apply organic matter (compost/FYM) annually               │
│  • Monitor soil moisture regularly                           │
│  • Consult local agricultural extension services             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📡 Data Source Status                                       │
│  ✅ IoT Sensors    ❌ Bhuvan (ISRO)    ✅ SoilGrids         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features Explained

### 1. **Visual Status Indicators**

**NPK Progress Bars**:
- 🟢 **Green**: Optimal range (Good for crops)
- 🟡 **Yellow**: Medium range (Acceptable but monitor)
- 🔴 **Red**: Poor range (Needs attention)

**pH Gradient Meter**:
```
Acidic (3) ─────── Neutral (7) ─────── Alkaline (14)
   🔴                  🟢                  🔵
```
- Black indicator shows current pH position
- Most crops prefer 6.0-7.5 (green zone)

### 2. **Alert System**

**Critical Alerts** 🔴:
- Nitrogen < 30 kg/ha
- pH < 5.5 or > 8.5
- Immediate action required

**Warning Alerts** 🟡:
- Phosphorus < 20 kg/ha
- Potassium < 30 kg/ha
- Moisture < 15%
- Preventive action recommended

### 3. **Trend Charts**

**NPK Chart**: Track nutrient changes over 6 months
- Identify depletion trends
- Plan fertilization schedule
- Monitor improvement after amendments

**pH Chart**: Monitor soil acidity/alkalinity
- Detect acidification trends
- Verify lime/sulfur effectiveness

**Moisture Chart**: Track soil water content
- Plan irrigation schedules
- Identify drought stress periods

### 4. **Recommendations Engine**

**Crop Suggestions Based On**:
- pH range (acidic/neutral/alkaline)
- NPK levels (deficient/adequate/excess)
- Soil type (clay/loam/sandy)
- Soil texture and drainage

**Fertilizer Recommendations**:
- Urea for low nitrogen
- DAP for low phosphorus
- MOP for low potassium
- Lime for acidic soil (pH < 6.0)
- Sulfur for alkaline soil (pH > 7.5)
- FYM for low organic matter

### 5. **Voice Navigation** 🔊

**Available Commands**:
- "Voice Guide": Introduces the page
- "Read NPK Status": Speaks nitrogen, phosphorus, potassium levels
- "Read Soil Properties": Announces pH, soil type, texture
- "Read Recommendations": Lists recommended crops and fertilizers
- "Explain Chart": Describes trend data
- Alert reading buttons: Speak critical alerts with actions

**How to Use**:
1. Click any 🔊 button
2. Listen to the information
3. Browser will speak in English
4. Cancel anytime by clicking again

---

## 📊 Optimal Soil Ranges Reference

| Parameter   | Low          | Optimal      | High         | Unit   |
|-------------|--------------|--------------|--------------|--------|
| Nitrogen    | < 40         | 40-80        | > 80         | kg/ha  |
| Phosphorus  | < 30         | 30-60        | > 60         | kg/ha  |
| Potassium   | < 40         | 40-80        | > 80         | kg/ha  |
| pH          | < 6.0        | 6.0-7.5      | > 7.5        | -      |
| Moisture    | < 20         | 20-60        | > 60         | %      |
| Temperature | < 15         | 15-35        | > 35         | °C     |

---

## 🌾 Crop-Soil Compatibility Quick Guide

**For pH 6.0-7.5 (Neutral)**:
- ✅ Rice, Wheat, Maize, Cotton, Vegetables
- ✅ Most commercial crops

**For pH < 6.0 (Acidic)**:
- ✅ Tea, Coffee, Potato, Blueberries
- ⚠️ Add lime to raise pH for other crops

**For pH > 7.5 (Alkaline)**:
- ✅ Cotton, Barley, Sugar Beet
- ⚠️ Add sulfur to lower pH for other crops

**For High Nitrogen (> 80 kg/ha)**:
- ✅ Leafy vegetables, Sugarcane
- ⚠️ Reduce N fertilizer

**For Low Nitrogen (< 40 kg/ha)**:
- ✅ Legumes (fix nitrogen naturally)
- ⚠️ Apply urea or compost

**Clay Soil (Heavy)**:
- ✅ Rice, Sugarcane, Wheat
- Retains water well

**Sandy Soil (Light)**:
- ✅ Groundnut, Millets, Watermelon
- Good drainage

---

## 🛠️ Troubleshooting

**Issue**: No data displayed after fetching
- Check internet connection
- Verify coordinates are valid
- Try different location

**Issue**: Voice not working
- Enable sound on device
- Use modern browser (Chrome/Edge/Safari)
- Check browser permissions

**Issue**: Charts not showing
- Fetch soil data first
- Charts appear after successful data load
- Refresh page if needed

**Issue**: Wrong recommendations
- Ensure accurate soil test data
- Use IoT sensors for real-time values
- Consult agronomist for validation

---

## 📱 Mobile Usage Tips

1. Use "Current Location" for easy coordinate input
2. Scroll horizontally on charts for full view
3. Tap 🔊 buttons for voice guidance (helpful in field)
4. Recommendations panel scrolls for all content
5. Take screenshots of recommendations for reference

---

## 🌍 Language Support

Currently supports:
- **English (en)**: Full UI and voice
- **Hindi (hi)**: UI translations available

To change language:
1. Go to Settings or Language Switcher
2. Select preferred language
3. UI updates instantly
4. Voice synthesis uses selected language (if available)

---

## 📞 Support & Feedback

For issues or suggestions:
- Email: support@krishimitra.gov.in
- Phone: 1800-180-1551 (toll-free)
- Help & Support page in app

---

## ✅ Quick Start Checklist

- [ ] Enter or detect location
- [ ] Click "Fetch Soil Data"
- [ ] Review alerts (if any)
- [ ] Check NPK visual indicators
- [ ] Note pH status
- [ ] Review trend charts
- [ ] Read crop recommendations
- [ ] Note fertilizer requirements
- [ ] Save recommendations (screenshot/note)
- [ ] Plan next soil test (6-12 months)

**Happy Farming! 🌾**
