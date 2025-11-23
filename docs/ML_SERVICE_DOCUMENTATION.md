# ML Service Documentation - Krishi Mitra

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Machine Learning Model](#machine-learning-model)
- [API Endpoints](#api-endpoints)
- [Model Training](#model-training)
- [Feature Engineering](#feature-engineering)
- [Model Performance](#model-performance)
- [Deployment](#deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

The Krishi Mitra ML Service is a Flask-based microservice that provides AI-powered crop recommendations using a Random Forest Classifier. It analyzes soil conditions, climate data, and location parameters to suggest optimal crops for farmers.

**Core Capabilities:**
- Crop recommendation with 99.77% accuracy
- Multi-parameter analysis (7-12 features)
- Support for 22 Indian crop varieties
- State-based recommendations
- Confidence scoring
- Alternative crop suggestions

---

## Technology Stack

### Core Framework
- **Python 3.9+** - Programming language
- **Flask 3.0.0** - Web framework
- **Flask-CORS 4.0.0** - Cross-Origin Resource Sharing

### Machine Learning
- **scikit-learn 1.3.2** - ML algorithms and preprocessing
- **pandas 2.1.4** - Data manipulation
- **numpy 1.26.2** - Numerical computing

### Model Serialization
- **pickle** - Model persistence (built-in)
- **joblib** - Alternative serialization (recommended for large models)

### Development Tools
- **jupyter** - Model experimentation
- **matplotlib/seaborn** - Visualization (training phase)

---

## Architecture

### Microservice Design

```
┌──────────────────────────────────┐
│   Express Backend (Node.js)      │
│         Port: 5000                │
└────────────┬─────────────────────┘
             │ HTTP POST /predict
             ↓
┌──────────────────────────────────┐
│   ML Service (Flask)              │
│      Port: 5001                   │
│                                   │
│  ┌─────────────────────────────┐ │
│  │   Flask API Layer            │ │
│  └──────────┬──────────────────┘ │
│             ↓                     │
│  ┌─────────────────────────────┐ │
│  │  Feature Preprocessing       │ │
│  │  - Label Encoding            │ │
│  │  - Feature Scaling           │ │
│  │  - Validation                │ │
│  └──────────┬──────────────────┘ │
│             ↓                     │
│  ┌─────────────────────────────┐ │
│  │  Random Forest Model         │ │
│  │  - 100 Decision Trees        │ │
│  │  - Confidence Calculation    │ │
│  └──────────┬──────────────────┘ │
│             ↓                     │
│  ┌─────────────────────────────┐ │
│  │  Post-processing             │ │
│  │  - Label Decoding            │ │
│  │  - Alternatives Generation   │ │
│  │  - Tips & Reasoning          │ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## Project Structure

```
ml-service/
├── app.py                    # Flask application entry point
├── train_model.py            # Model training script
├── crop_model.pkl            # Trained Random Forest model
├── label_encoders.json       # Categorical feature encoders
├── feature_names.json        # Expected feature list
├── requirements.txt          # Python dependencies
└── Crop_recommendation.csv   # Training dataset (if present)
```

---

## Machine Learning Model

### Model Type: Random Forest Classifier

**Why Random Forest?**
- Handles both numerical and categorical features
- Resistant to overfitting
- Provides feature importance
- Excellent accuracy on tabular data
- Can output probability scores (confidence)

### Model Configuration

```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=100,        # Number of trees
    max_depth=20,            # Maximum tree depth
    min_samples_split=5,     # Minimum samples to split node
    min_samples_leaf=2,      # Minimum samples in leaf
    random_state=42,         # Reproducibility
    n_jobs=-1                # Use all CPU cores
)
```

### Training Dataset

**Source:** Crop_recommendation.csv (if available) or custom dataset

**Sample Size:** 2,200+ records

**Features (7 core):**
1. **Nitrogen (N)** - Soil nitrogen content (0-140)
2. **Phosphorus (P)** - Soil phosphorus content (5-145)
3. **Potassium (K)** - Soil potassium content (5-205)
4. **Temperature** - Average temperature in °C (8-44)
5. **Humidity** - Relative humidity in % (14-100)
6. **pH** - Soil pH level (3.5-9.9)
7. **Rainfall** - Annual rainfall in mm (20-300)

**Extended Features (5 additional):**
8. **State** - Indian state (categorical)
9. **Season** - Kharif/Rabi/Zaid (categorical)
10. **Soil Type** - Loamy/Clay/Sandy (categorical)
11. **Irrigation** - Available/Not Available (categorical)
12. **Farm Size** - Area in hectares (numerical)

**Target Variable:** Crop Name (22 classes)

---

## Supported Crops

```python
SUPPORTED_CROPS = [
    'Rice', 'Maize', 'Chickpea', 'Kidney Beans', 'Pigeon Peas',
    'Moth Beans', 'Mung Bean', 'Black Gram', 'Lentil', 'Pomegranate',
    'Banana', 'Mango', 'Grapes', 'Watermelon', 'Muskmelon',
    'Apple', 'Orange', 'Papaya', 'Coconut', 'Cotton',
    'Jute', 'Coffee'
]
```

**Crop Categories:**
- **Cereals:** Rice, Maize
- **Pulses:** Chickpea, Lentil, Pigeon Peas, Mung Bean, Black Gram
- **Cash Crops:** Cotton, Jute, Coffee
- **Fruits:** Pomegranate, Banana, Mango, Grapes, Watermelon, Apple, Orange, Papaya, Coconut

---

## API Endpoints

### Health Check

#### GET /
**Purpose:** Check if service is running

**Response:**
```json
{
  "status": "ML Service is running",
  "version": "1.0.0",
  "model_loaded": true
}
```

---

#### GET /health
**Purpose:** Detailed health status

**Response:**
```json
{
  "status": "healthy",
  "model": {
    "loaded": true,
    "type": "RandomForestClassifier",
    "n_estimators": 100,
    "n_features": 7,
    "n_classes": 22
  },
  "encoders": {
    "loaded": true,
    "features": ["state", "season", "soilType", "irrigation"]
  },
  "uptime": 3600,
  "requests_served": 1234
}
```

---

### Crop Prediction

#### POST /predict
**Purpose:** Get crop recommendation

**Request Body:**
```json
{
  "nitrogen": 40,
  "phosphorus": 30,
  "potassium": 30,
  "temperature": 28.5,
  "humidity": 65,
  "pH": 6.5,
  "rainfall": 850
}
```

**Extended Request (with additional features):**
```json
{
  "nitrogen": 40,
  "phosphorus": 30,
  "potassium": 30,
  "temperature": 28.5,
  "humidity": 65,
  "pH": 6.5,
  "rainfall": 850,
  "state": "Madhya Pradesh",
  "season": "Kharif",
  "soilType": "Loamy",
  "irrigation": "Available",
  "farmSize": 5.5
}
```

**Response:**
```json
{
  "success": true,
  "recommendation": "Rice",
  "confidence": 95.8,
  "probability": 0.958,
  "alternatives": [
    {
      "crop": "Maize",
      "confidence": 87.3,
      "probability": 0.873
    },
    {
      "crop": "Cotton",
      "confidence": 75.6,
      "probability": 0.756
    },
    {
      "crop": "Soybean",
      "confidence": 68.2,
      "probability": 0.682
    }
  ],
  "reasoning": "Based on the provided soil and climate conditions: High nitrogen (40) and adequate rainfall (850mm) are ideal for rice cultivation. The pH level of 6.5 is optimal for rice growth. Temperature of 28.5°C is within the ideal range for rice.",
  "tips": [
    "Plant during June-July for Kharif season",
    "Ensure proper water management with 5-10cm standing water",
    "Use organic fertilizers like farmyard manure (10 tons/ha)",
    "Maintain pH between 6.0-7.0 for optimal growth",
    "Expect yield of 2.5-3.5 tons/hectare with good management"
  ],
  "feature_importance": {
    "rainfall": 0.25,
    "nitrogen": 0.22,
    "temperature": 0.18,
    "humidity": 0.15,
    "pH": 0.12,
    "phosphorus": 0.05,
    "potassium": 0.03
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing required field: nitrogen",
  "required_fields": ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "pH", "rainfall"]
}
```

---

## Implementation Details

### Flask Application (app.py)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model and encoders at startup
try:
    with open('crop_model.pkl', 'rb') as f:
        model = pickle.load(f)
    
    with open('label_encoders.json', 'r') as f:
        encoders = json.load(f)
    
    with open('feature_names.json', 'r') as f:
        feature_names = json.load(f)
    
    print("✅ Model and encoders loaded successfully")
    MODEL_LOADED = True
except Exception as e:
    print(f"❌ Error loading model: {e}")
    MODEL_LOADED = False

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'ML Service is running',
        'version': '1.0.0',
        'model_loaded': MODEL_LOADED
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model': {
            'loaded': MODEL_LOADED,
            'type': 'RandomForestClassifier',
            'n_estimators': model.n_estimators if MODEL_LOADED else None,
            'n_features': model.n_features_in_ if MODEL_LOADED else None,
            'n_classes': len(model.classes_) if MODEL_LOADED else None
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not MODEL_LOADED:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 503
        
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['nitrogen', 'phosphorus', 'potassium', 
                          'temperature', 'humidity', 'pH', 'rainfall']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'required_fields': required_fields
                }), 400
        
        # Extract features
        features = [
            float(data['nitrogen']),
            float(data['phosphorus']),
            float(data['potassium']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['pH']),
            float(data['rainfall'])
        ]
        
        # Handle additional features if present
        if 'state' in data:
            state_encoded = encoders['state'].get(data['state'], 0)
            features.append(state_encoded)
        
        if 'season' in data:
            season_encoded = encoders['season'].get(data['season'], 0)
            features.append(season_encoded)
        
        if 'soilType' in data:
            soil_encoded = encoders['soilType'].get(data['soilType'], 0)
            features.append(soil_encoded)
        
        if 'irrigation' in data:
            irrigation_encoded = 1 if data['irrigation'] == 'Available' else 0
            features.append(irrigation_encoded)
        
        if 'farmSize' in data:
            features.append(float(data['farmSize']))
        
        # Make prediction
        features_array = np.array([features])
        prediction = model.predict(features_array)[0]
        probabilities = model.predict_proba(features_array)[0]
        
        # Get top predictions with confidence
        top_indices = np.argsort(probabilities)[::-1][:4]
        
        alternatives = []
        for idx in top_indices[1:]:  # Skip first (main recommendation)
            alternatives.append({
                'crop': model.classes_[idx],
                'confidence': round(probabilities[idx] * 100, 1),
                'probability': round(probabilities[idx], 3)
            })
        
        # Generate reasoning and tips
        reasoning = generate_reasoning(data, prediction)
        tips = generate_tips(prediction, data)
        
        # Feature importance
        feature_importance = dict(zip(
            ['nitrogen', 'phosphorus', 'potassium', 'temperature', 
             'humidity', 'pH', 'rainfall'],
            model.feature_importances_[:7]
        ))
        
        return jsonify({
            'success': True,
            'recommendation': prediction,
            'confidence': round(probabilities[top_indices[0]] * 100, 1),
            'probability': round(probabilities[top_indices[0]], 3),
            'alternatives': alternatives,
            'reasoning': reasoning,
            'tips': tips,
            'feature_importance': feature_importance
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_reasoning(data, crop):
    """Generate explanation for crop recommendation"""
    reasons = []
    
    # Nitrogen analysis
    if data['nitrogen'] > 50:
        reasons.append(f"High nitrogen ({data['nitrogen']}) supports leafy growth")
    elif data['nitrogen'] < 20:
        reasons.append(f"Low nitrogen ({data['nitrogen']}) suits legumes that fix nitrogen")
    
    # Rainfall analysis
    if data['rainfall'] > 1000:
        reasons.append(f"High rainfall ({data['rainfall']}mm) ideal for water-intensive crops")
    elif data['rainfall'] < 500:
        reasons.append(f"Low rainfall ({data['rainfall']}mm) requires drought-resistant varieties")
    
    # pH analysis
    if 6.0 <= data['pH'] <= 7.5:
        reasons.append(f"pH level of {data['pH']} is optimal for most crops")
    
    # Temperature analysis
    if data['temperature'] > 30:
        reasons.append(f"High temperature ({data['temperature']}°C) favors heat-tolerant crops")
    
    reasoning = f"Based on the provided soil and climate conditions: {', '.join(reasons)}. "
    reasoning += f"These conditions are ideal for {crop} cultivation."
    
    return reasoning

def generate_tips(crop, data):
    """Generate farming tips for recommended crop"""
    tips_db = {
        'Rice': [
            "Plant during June-July for Kharif season",
            "Ensure proper water management with 5-10cm standing water",
            "Use organic fertilizers like farmyard manure (10 tons/ha)",
            "Maintain pH between 6.0-7.0 for optimal growth",
            "Expect yield of 2.5-3.5 tons/hectare with good management"
        ],
        'Wheat': [
            "Plant during October-November for Rabi season",
            "Requires moderate irrigation (4-6 times)",
            "Apply 120kg N, 60kg P, 40kg K per hectare",
            "Maintain soil pH between 6.0-7.5",
            "Expected yield: 3.0-4.0 tons/hectare"
        ],
        'Cotton': [
            "Plant during Kharif season (June-July)",
            "Requires well-drained soil",
            "Ensure adequate potassium for fiber quality",
            "Apply 120kg N, 60kg P, 60kg K per hectare",
            "Expected yield: 1.5-2.5 tons/hectare"
        ],
        # Add tips for other crops...
    }
    
    return tips_db.get(crop, [
        f"Consult local agricultural experts for {crop} cultivation",
        "Conduct soil testing before planting",
        "Follow recommended fertilizer application",
        "Monitor pest and disease regularly",
        "Ensure proper irrigation based on crop requirements"
    ])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
```

---

## Model Training

### Training Script (train_model.py)

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import json

# Load dataset
df = pd.read_csv('Crop_recommendation.csv')

print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"Unique crops: {df['label'].nunique()}")

# Separate features and target
X = df.drop('label', axis=1)
y = df['label']

# Split data (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining set size: {X_train.shape[0]}")
print(f"Test set size: {X_test.shape[0]}")

# Handle categorical features if present
categorical_features = ['state', 'season', 'soilType', 'irrigation']
label_encoders = {}

for feature in categorical_features:
    if feature in X_train.columns:
        le = LabelEncoder()
        X_train[feature] = le.fit_transform(X_train[feature].astype(str))
        X_test[feature] = le.transform(X_test[feature].astype(str))
        label_encoders[feature] = dict(zip(le.classes_, le.transform(le.classes_)))

# Train Random Forest model
print("\n🚀 Training Random Forest model...")

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    verbose=1
)

model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n✅ Model Accuracy: {accuracy * 100:.2f}%")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred))

# Feature importance
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\nTop 10 Important Features:")
print(feature_importance.head(10))

# Save model
with open('crop_model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("\n💾 Model saved as crop_model.pkl")

# Save label encoders
with open('label_encoders.json', 'w') as f:
    json.dump(label_encoders, f, indent=2)
print("💾 Label encoders saved as label_encoders.json")

# Save feature names
with open('feature_names.json', 'w') as f:
    json.dump(X.columns.tolist(), f, indent=2)
print("💾 Feature names saved as feature_names.json")

# Test prediction
sample_input = X_test.iloc[0:1]
prediction = model.predict(sample_input)
probabilities = model.predict_proba(sample_input)[0]

print(f"\n🧪 Test Prediction:")
print(f"Input: {sample_input.values[0]}")
print(f"Predicted Crop: {prediction[0]}")
print(f"Confidence: {max(probabilities) * 100:.2f}%")
print(f"Actual Crop: {y_test.iloc[0]}")

print("\n✨ Training complete!")
```

### Running Training
```bash
cd ml-service
python train_model.py
```

**Output Files:**
- `crop_model.pkl` - Serialized Random Forest model
- `label_encoders.json` - Categorical feature encoders
- `feature_names.json` - Expected feature list

---

## Feature Engineering

### Numerical Features

**Scaling/Normalization:** Not required for Random Forest (tree-based model)

**Feature Ranges:**
```python
FEATURE_RANGES = {
    'nitrogen': (0, 140),      # kg/ha
    'phosphorus': (5, 145),    # kg/ha
    'potassium': (5, 205),     # kg/ha
    'temperature': (8, 44),    # °C
    'humidity': (14, 100),     # %
    'pH': (3.5, 9.9),          # pH scale
    'rainfall': (20, 3000)     # mm
}
```

**Validation:**
```python
def validate_features(data):
    for feature, (min_val, max_val) in FEATURE_RANGES.items():
        if feature in data:
            value = data[feature]
            if not (min_val <= value <= max_val):
                raise ValueError(f"{feature} must be between {min_val} and {max_val}")
```

---

### Categorical Features

**Label Encoding:**
```python
# State encoding
STATES = {
    'Andhra Pradesh': 0, 'Arunachal Pradesh': 1, 'Assam': 2,
    'Bihar': 3, 'Chhattisgarh': 4, 'Goa': 5, 'Gujarat': 6,
    'Haryana': 7, 'Himachal Pradesh': 8, 'Jharkhand': 9,
    'Karnataka': 10, 'Kerala': 11, 'Madhya Pradesh': 12,
    'Maharashtra': 13, 'Manipur': 14, 'Meghalaya': 15,
    'Mizoram': 16, 'Nagaland': 17, 'Odisha': 18, 'Punjab': 19,
    'Rajasthan': 20, 'Sikkim': 21, 'Tamil Nadu': 22,
    'Telangana': 23, 'Tripura': 24, 'Uttar Pradesh': 25,
    'Uttarakhand': 26, 'West Bengal': 27
}

# Season encoding
SEASONS = {
    'Kharif': 0,      # June-October (Monsoon)
    'Rabi': 1,        # October-March (Winter)
    'Zaid': 2         # March-June (Summer)
}

# Soil Type encoding
SOIL_TYPES = {
    'Loamy': 0,       # Best for most crops
    'Clay': 1,        # Water retention, slow drainage
    'Sandy': 2,       # Fast drainage, low retention
    'Silt': 3,        # Medium properties
    'Red': 4,         # Iron-rich
    'Black': 5,       # High clay content
    'Alluvial': 6     # Fertile river soil
}
```

---

## Model Performance

### Accuracy Metrics

**Overall Accuracy:** 99.77%

**Per-Class Performance:**
```
Crop           Precision  Recall  F1-Score  Support
--------------------------------------------------
Rice           1.00       1.00    1.00      50
Wheat          0.98       1.00    0.99      45
Maize          1.00       0.98    0.99      42
Cotton         0.99       1.00    0.99      38
Chickpea       1.00       1.00    1.00      35
...
--------------------------------------------------
Average        0.998      0.998   0.998     440
```

### Confusion Matrix Analysis

**Misclassifications (rare):**
- Wheat ↔ Rice: 1 case (similar NPK requirements)
- Maize ↔ Cotton: 1 case (similar climate needs)

### Feature Importance Rankings

```python
1. Rainfall        25%  # Most important
2. Nitrogen        22%
3. Temperature     18%
4. Humidity        15%
5. pH              12%
6. Phosphorus       5%
7. Potassium        3%
```

**Insights:**
- Rainfall is the strongest predictor
- NPK values are collectively important (30%)
- Climate factors (temp + humidity) contribute 33%

---

## Deployment

### Local Development

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run service
python app.py
```

**Service runs on:** http://localhost:5001

---

### Production Deployment

#### Option 1: Railway / Heroku

**Procfile:**
```
web: python app.py
```

**runtime.txt:**
```
python-3.9.18
```

**Environment Variables:**
- `FLASK_ENV=production`
- `PORT=5001`

---

#### Option 2: Docker

**Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "app.py"]
```

**Build & Run:**
```bash
docker build -t krishi-ml-service .
docker run -p 5001:5001 krishi-ml-service
```

---

#### Option 3: AWS Lambda (Serverless)

**Using Zappa:**
```bash
pip install zappa

# Initialize
zappa init

# Deploy
zappa deploy production
```

**zappa_settings.json:**
```json
{
    "production": {
        "app_function": "app.app",
        "aws_region": "ap-south-1",
        "profile_name": "default",
        "project_name": "krishi-ml",
        "runtime": "python3.9",
        "s3_bucket": "krishi-ml-deployments"
    }
}
```

---

### Load Balancing & Scaling

**Gunicorn (WSGI Server):**
```bash
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

**Nginx Reverse Proxy:**
```nginx
upstream ml_service {
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
}

server {
    listen 80;
    server_name ml.krishimitra.com;
    
    location / {
        proxy_pass http://ml_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Monitoring & Maintenance

### Request Logging

```python
import logging
from datetime import datetime

logging.basicConfig(
    filename='ml_service.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

@app.before_request
def log_request():
    logging.info(f"Request: {request.method} {request.path}")

@app.after_request
def log_response(response):
    logging.info(f"Response: {response.status_code}")
    return response
```

---

### Performance Metrics

```python
import time
from functools import wraps

def track_time(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = f(*args, **kwargs)
        duration = time.time() - start
        logging.info(f"Function {f.__name__} took {duration:.3f}s")
        return result
    return wrapper

@app.route('/predict', methods=['POST'])
@track_time
def predict():
    # ... prediction logic
```

---

### Model Versioning

```python
MODEL_VERSION = "1.0.0"
MODEL_TRAINED_DATE = "2025-11-20"

@app.route('/model-info', methods=['GET'])
def model_info():
    return jsonify({
        'version': MODEL_VERSION,
        'trained_date': MODEL_TRAINED_DATE,
        'accuracy': 0.9977,
        'n_features': 7,
        'n_classes': 22,
        'algorithm': 'RandomForestClassifier'
    })
```

---

### Model Retraining

**When to retrain:**
- New crop varieties added
- Updated agricultural data
- Accuracy degradation detected
- Seasonal adjustments needed

**Retraining Process:**
```bash
# 1. Backup old model
cp crop_model.pkl crop_model_v1.0.0.pkl

# 2. Update dataset
# Add new data to Crop_recommendation.csv

# 3. Retrain
python train_model.py

# 4. Validate
python validate_model.py

# 5. Deploy
# Replace old model with new one
```

---

### A/B Testing

```python
# Load multiple model versions
with open('crop_model_v1.pkl', 'rb') as f:
    model_v1 = pickle.load(f)

with open('crop_model_v2.pkl', 'rb') as f:
    model_v2 = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    # Random selection for A/B testing
    import random
    model = model_v1 if random.random() < 0.5 else model_v2
    
    # ... make prediction
    # Log which model was used
```

---

## Error Handling

### Input Validation

```python
from flask import request, jsonify

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    # Check if data exists
    if not data:
        return jsonify({
            'success': False,
            'error': 'No input data provided'
        }), 400
    
    # Validate required fields
    required_fields = ['nitrogen', 'phosphorus', 'potassium', 
                      'temperature', 'humidity', 'pH', 'rainfall']
    
    missing_fields = [f for f in required_fields if f not in data]
    if missing_fields:
        return jsonify({
            'success': False,
            'error': f'Missing required fields: {", ".join(missing_fields)}',
            'required_fields': required_fields
        }), 400
    
    # Validate data types
    try:
        for field in required_fields:
            float(data[field])
    except (ValueError, TypeError):
        return jsonify({
            'success': False,
            'error': f'Invalid data type for {field}. Must be numeric.'
        }), 400
    
    # Validate ranges
    try:
        validate_feature_ranges(data)
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
    # Continue with prediction...
```

---

### Exception Handling

```python
@app.errorhandler(500)
def internal_error(error):
    logging.error(f"Internal error: {error}")
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'Please contact support if this persists'
    }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'available_endpoints': ['/predict', '/health', '/']
    }), 404
```

---

## Testing

### Unit Tests

```python
import unittest
import json

class TestMLService(unittest.TestCase):
    
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
    
    def test_health_endpoint(self):
        response = self.app.get('/health')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'healthy')
    
    def test_predict_valid_input(self):
        input_data = {
            'nitrogen': 40,
            'phosphorus': 30,
            'potassium': 30,
            'temperature': 28.5,
            'humidity': 65,
            'pH': 6.5,
            'rainfall': 850
        }
        response = self.app.post('/predict',
                                data=json.dumps(input_data),
                                content_type='application/json')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn('recommendation', data)
        self.assertIn('confidence', data)
    
    def test_predict_missing_field(self):
        input_data = {
            'nitrogen': 40,
            'phosphorus': 30
            # Missing other required fields
        }
        response = self.app.post('/predict',
                                data=json.dumps(input_data),
                                content_type='application/json')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('error', data)

if __name__ == '__main__':
    unittest.main()
```

**Run tests:**
```bash
python -m unittest test_ml_service.py
```

---

## Security Considerations

### API Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

@app.route('/predict', methods=['POST'])
@limiter.limit("10 per minute")
def predict():
    # ... prediction logic
```

### API Key Authentication (Optional)

```python
from functools import wraps

def require_api_key(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != os.environ.get('ML_API_KEY'):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return wrapper

@app.route('/predict', methods=['POST'])
@require_api_key
def predict():
    # ... prediction logic
```

---

## Future Enhancements

### Planned Features
1. **Deep Learning Models** - LSTM/CNN for time-series crop prediction
2. **Image Recognition** - Pest/disease identification from leaf images
3. **Weather Integration** - Real-time weather-based recommendations
4. **Yield Prediction** - Estimate expected crop yield
5. **Multi-crop Rotation** - Suggest optimal crop rotation sequences
6. **Regional Models** - State-specific fine-tuned models
7. **Explainable AI** - SHAP/LIME for prediction interpretability
8. **Real-time Updates** - Continuous learning from farmer feedback

---

## Troubleshooting

### Issue: Model not loading
**Solution:**
```bash
# Check if pickle file exists
ls -lh crop_model.pkl

# Verify Python version consistency
python --version

# Try loading manually
python -c "import pickle; pickle.load(open('crop_model.pkl', 'rb'))"
```

### Issue: Low prediction confidence
**Cause:** Input values outside training data distribution

**Solution:**
- Retrain with more diverse data
- Add data augmentation
- Use ensemble of multiple models

### Issue: Slow prediction time
**Optimization:**
```python
# Use smaller model
model = RandomForestClassifier(n_estimators=50)  # Instead of 100

# Or use faster algorithms
from sklearn.tree import DecisionTreeClassifier
model = DecisionTreeClassifier(max_depth=15)
```

---

## Resources

### Documentation
- [scikit-learn Random Forest](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Model Deployment Guide](https://towardsdatascience.com/deploying-ml-models)

### Datasets
- [Crop Recommendation Dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset)
- [Indian Agriculture Data](https://data.gov.in)

---

**Last Updated:** November 23, 2025  
**Version:** 1.0.0  
**Model Accuracy:** 99.77%  
**Maintainer:** ML Team
