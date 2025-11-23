# 🌾 Krishi Mitra (कृषि मित्र)

**AI-Powered Agricultural Platform for Indian Farmers**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![ML Accuracy](https://img.shields.io/badge/ML_Accuracy-99.77%25-success.svg)](https://github.com/your-username/Krishi-Mitra)

---

## 📖 Overview

Krishi Mitra (Friend of Farmers) is a comprehensive AI-powered agricultural platform designed to help Indian farmers make data-driven decisions. It provides crop recommendations, real-time market prices, weather forecasts, soil analysis, and crop rotation management.

### ✨ Key Features

- 🤖 **AI Crop Recommendations** - ML-powered suggestions with 99.77% accuracy
- 💰 **Live Market Prices** - Real-time commodity prices from government APIs
- 🌦️ **Weather Forecasts** - 7-day weather predictions with agricultural alerts
- 🌱 **Crop Management** - Track planting, growth, and harvest
- 🔄 **Crop Rotation** - Optimize soil health with rotation analysis
- 🌍 **Soil Data Analysis** - NPK levels, pH, and fertility tracking
- 🤖 **AI Chat Assistant** - Conversational AI for farming queries
- 🌐 **Bilingual Support** - Full English & Hindi interface (1900+ translations)

---

## 🎥 Screenshots

[Add screenshots here]

---

## 🏗️ Architecture

**3-Tier Microservices Architecture:**

```
Frontend (React + Vite)
    ↓
Backend (Node.js + Express)
    ↓
┌─────────┬─────────┬──────────┐
MongoDB   ML Service  External
          (Flask)     APIs
```

---

## 🚀 Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **Vite 5.4.9** - Build tool
- **TailwindCSS 3.4.12** - Styling
- **i18next** - Internationalization (English & Hindi)

### Backend
- **Node.js + Express 4.19.2** - API server
- **MongoDB + Mongoose 8.8.1** - Database
- **bcryptjs** - Authentication
- **Nodemailer** - Email service

### ML Service
- **Python 3.9+ with Flask** - ML API
- **scikit-learn** - Machine learning
- **Random Forest Classifier** - 99.77% accuracy
- **22 Crop Varieties** - Rice, Wheat, Cotton, Maize, etc.

### External APIs
- **Agmarknet API** - Government market prices
- **OpenWeather API** - Weather data
- **SoilGrids API** - Global soil data

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/Krishi-Mitra.git
cd Krishi-Mitra
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev
```

### 4. ML Service Setup
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/krishimitra
ML_SERVICE_URL=http://127.0.0.1:5001
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
AGMARKNET_API_KEY=your-api-key
```

### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:5000
VITE_OPENWEATHER_API_KEY=your-weather-api-key
```

---

## 📚 Documentation

Comprehensive documentation available in the [`/docs`](./docs) folder:

- **[Frontend Documentation](./docs/FRONTEND_DOCUMENTATION.md)** - React components, pages, API integration
- **[Backend Documentation](./docs/BACKEND_DOCUMENTATION.md)** - API endpoints, database models, services
- **[ML Service Documentation](./docs/ML_SERVICE_DOCUMENTATION.md)** - Model training, deployment, performance
- **[Project Summary](./docs/PROJECT_SUMMARY.md)** - Complete project overview

---

## 🎯 Features in Detail

### 🤖 AI Crop Recommendation
- 12-parameter analysis (N, P, K, temperature, humidity, pH, rainfall, state, season, soil type, irrigation, farm size)
- Random Forest ML model with 99.77% accuracy
- Confidence scores and alternative suggestions
- Detailed farming tips and reasoning

### 💰 Market Prices
- Live commodity prices from Agmarknet (Government of India)
- State/District filtering (19+ states)
- MSP (Minimum Support Price) comparison
- Price alerts with database persistence
- Trending analysis (↑/↓)

### 🔄 Crop Rotation
- Pattern analysis with severity levels (Critical/Caution/Good)
- Soil fertility trend tracking with sparkline charts
- Prioritized recommendations (numbered 1-2-3)
- Expandable educational guides (Hindi + English)
- Before/After soil health tracking

### 🌍 Soil Data
- NPK (Nitrogen, Phosphorus, Potassium) levels
- pH and organic matter analysis
- SoilGrids API integration
- Color-coded health indicators
- Historical data tracking

---

## 🌐 Supported Languages

- 🇬🇧 **English** - Full interface
- 🇮🇳 **हिंदी (Hindi)** - Complete translation (1900+ keys)

---

## 📊 Project Statistics

- **Lines of Code:** 16,000+
- **Pages:** 10 complete pages
- **API Endpoints:** 20+
- **Database Models:** 5 (User, Crop, Alert, CropRotation, Conversation)
- **Supported Crops:** 22 varieties
- **ML Model Accuracy:** 99.77%
- **States Supported:** 19+ Indian states
- **Translation Keys:** 1900+

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Developed by:** [Your Name/Team Name]

---

## 📧 Contact

**Project Link:** [https://github.com/YOUR_USERNAME/Krishi-Mitra](https://github.com/YOUR_USERNAME/Krishi-Mitra)

**Email:** your-email@example.com

---

## 🙏 Acknowledgments

- Government of India for Agmarknet API
- OpenWeather for weather data API
- ISRIC for SoilGrids API
- Indian farmers for inspiration

---

**Made with ❤️ for Indian Farmers**
