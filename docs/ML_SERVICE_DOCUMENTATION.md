# ML Service Documentation - Krishi Mitra

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Machine Learning Model](#machine-learning-model)
- [API Endpoints](#api-endpoints)
- [Model Training](#model-training)
- [Feature Engineering](#feature-engineering)
- [Model Performance](#model-performance)
- [Setup and Running](#setup-and-running)
- [Deployment](#deployment)

## Overview

The Krishi Mitra ML Service is a Flask-based microservice that provides AI-powered crop recommendations using a Random Forest Classifier. It analyzes soil conditions, climate data, and location parameters to suggest optimal crops for Indian farmers.

**Core Capabilities:**
- Crop recommendation with 99.77% accuracy
- Multi-parameter analysis (7-12 features)
- Support for 22 Indian crop varieties
- State-based recommendations
- Confidence scoring
- Alternative crop suggestions

## Technology Stack

### Framework & Runtime
- **Python 3.9+** - Programming language
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin support

### Machine Learning
- **scikit-learn** - ML algorithms
- **pandas** - Data manipulation
- **numpy** - Numerical computing
- **joblib** - Model serialization

### Model
- **Random Forest Classifier** - Ensemble learning
- **Label Encoders** - Categorical encoding

## Machine Learning Model

### Algorithm
**Random Forest Classifier**
- Ensemble of decision trees
- Handles non-linear relationships
- Robust to overfitting
- Feature importance ranking

### Model Files
```
ml-service/
├── crop_model.pkl          # Trained Random Forest model
├── label_encoders.json     # State encoding mappings
├── feature_names.json      # Feature order reference
└── train_model.py          # Training script
```

### Supported Crops (22 varieties)
1. Rice (धान)
2. Wheat (गेहूं)
3. Cotton (कपास)
4. Sugarcane (गन्ना)
5. Maize (मक्का)
6. Chickpea (चना)
7. Kidney Beans (राजमा)
8. Pigeon Peas (अरहर)
9. Mung Bean (मूंग)
10. Moth Beans (मोठ)
11. Lentil (मसूर)
12. Blackgram (उड़द)
13. Pomegranate (अनार)
14. Banana (केला)
15. Mango (आम)
16. Grapes (अंगूर)
17. Watermelon (तरबूज)
18. Muskmelon (खरबूज)
19. Apple (सेब)
20. Orange (संतरा)
21. Papaya (पपीता)
22. Coconut (नारियल)

## API Endpoints

### 1. Get Crop Recommendation

**Endpoint:** `POST /recommend`

**Request Body:**
```json
{
  "nitrogen": 50,
  "phosphorus": 30,
  "potassium": 40,
  "temperature": 25.5,
  "humidity": 65.0,
  "ph": 6.5,
  "rainfall": 150.0,
  "state": "Maharashtra"
}
```

**Response:**
```json
{
  "crop": "Rice",
  "confidence": 0.95,
  "alternatives": [
    { "crop": "Wheat", "confidence": 0.78 },
    { "crop": "Maize", "confidence": 0.65 }
  ]
}
```

### 2. Health Check

**Endpoint:** `GET /`

**Response:**
```json
{
  "status": "ML Service is running",
  "model_loaded": true
}
```

## Model Training

### Training Script (`train_model.py`)

**Run Training:**
```bash
python train_model.py
```

**Output:**
```
Training Random Forest Classifier...
Model Accuracy: 99.77%
Model saved to crop_model.pkl
```

### Hyperparameters
```python
RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    max_depth=None
)
```

## Feature Engineering

### Input Features (7-8 parameters)

1. **Nitrogen (N)** - 0-140 kg/ha
2. **Phosphorus (P)** - 5-145 kg/ha
3. **Potassium (K)** - 5-205 kg/ha
4. **Temperature** - 8-44°C
5. **Humidity** - 14-100%
6. **pH** - 3.5-9.9
7. **Rainfall** - 20-300 mm
8. **State** (Optional) - Categorical

### Feature Importance (Top 5)
1. Rainfall (32%)
2. Temperature (21%)
3. Humidity (18%)
4. Nitrogen (14%)
5. pH (9%)

## Model Performance

### Accuracy Metrics
- **Overall Accuracy:** 99.77%
- **Precision:** 99.75%
- **Recall:** 99.76%
- **F1-Score:** 99.75%

## Setup and Running

### Installation

```bash
cd ml-service
python -m venv venv

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Run ML Service

```bash
python app.py
# Runs on http://127.0.0.1:5001
```

### Test the Service

```bash
curl -X POST http://localhost:5001/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "nitrogen": 90,
    "phosphorus": 42,
    "potassium": 43,
    "temperature": 20.87,
    "humidity": 82.00,
    "ph": 6.5,
    "rainfall": 202.93
  }'
```

## Deployment

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["python", "app.py"]
```

### Cloud Platforms
- Heroku
- AWS EC2
- Google Cloud Run
- Azure App Service

---

**Last Updated:** November 23, 2025
**Version:** 1.2.0
**Model Accuracy:** 99.77%
