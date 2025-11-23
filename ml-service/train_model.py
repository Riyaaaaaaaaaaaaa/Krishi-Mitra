"""
Enhanced Crop Recommendation Model Training Script
Uses Random Forest Classifier with expanded features

Dataset Features:
- N: Nitrogen content ratio in soil (kg/ha)
- P: Phosphorus content ratio in soil (kg/ha)
- K: Potassium content ratio in soil (kg/ha)
- temperature: Temperature in degree Celsius
- humidity: Relative humidity in %
- ph: pH value of the soil
- rainfall: Rainfall in mm
- state: Indian state (encoded)
- season: Growing season (Kharif/Rabi/Zaid/Year-round)
- soil_type: Soil texture type (Clay/Loam/Sandy/etc)
- irrigation: Irrigation method (Rainfed/Flood/Drip/Sprinkler)
- farm_size: Farm size category (Small/Medium/Large)

Target: 22 crop types with 10,000+ samples
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import json

# Enhanced crop data with location, season, soil type, irrigation, and farm size
# Based on agricultural research for Indian farming conditions

# Define crop patterns with realistic distributions
crop_patterns = {
    'rice': {
        'count': 1500, 'N': (80, 100), 'P': (35, 45), 'K': (35, 45),
        'temp': (25, 35), 'humidity': (70, 95), 'ph': (5.5, 7.0), 'rainfall': (150, 250),
        'states': ['Punjab', 'Haryana', 'Uttar Pradesh', 'West Bengal', 'Andhra Pradesh', 'Tamil Nadu'],
        'seasons': ['Kharif'],
        'soil_types': ['Clay', 'Clay-Loam', 'Loam'],
        'irrigation': ['Flood', 'Rainfed'],
        'farm_sizes': ['Small', 'Medium', 'Large']
    },
    'wheat': {
        'count': 2000, 'N': (75, 95), 'P': (35, 50), 'K': (40, 55),
        'temp': (15, 23), 'humidity': (55, 70), 'ph': (6.5, 7.5), 'rainfall': (40, 80),
        'states': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan'],
        'seasons': ['Rabi'],
        'soil_types': ['Loam', 'Clay-Loam'],
        'irrigation': ['Flood', 'Sprinkler'],
        'farm_sizes': ['Small', 'Medium', 'Large']
    },
    'cotton': {
        'count': 1000, 'N': (70, 90), 'P': (45, 60), 'K': (40, 55),
        'temp': (25, 35), 'humidity': (60, 85), 'ph': (6.0, 7.5), 'rainfall': (60, 120),
        'states': ['Maharashtra', 'Gujarat', 'Andhra Pradesh', 'Telangana', 'Haryana'],
        'seasons': ['Kharif'],
        'soil_types': ['Clay-Loam', 'Loam'],
        'irrigation': ['Rainfed', 'Drip', 'Sprinkler'],
        'farm_sizes': ['Medium', 'Large']
    },
    'maize': {
        'count': 800, 'N': (50, 70), 'P': (30, 40), 'K': (35, 45),
        'temp': (20, 30), 'humidity': (55, 75), 'ph': (5.5, 7.0), 'rainfall': (60, 120),
        'states': ['Karnataka', 'Madhya Pradesh', 'Bihar', 'Andhra Pradesh', 'Rajasthan'],
        'seasons': ['Kharif', 'Rabi'],
        'soil_types': ['Loam', 'Sandy-Loam'],
        'irrigation': ['Rainfed', 'Sprinkler'],
        'farm_sizes': ['Small', 'Medium']
    },
    'chickpea': {
        'count': 700, 'N': (10, 30), 'P': (25, 35), 'K': (25, 35),
        'temp': (20, 28), 'humidity': (50, 65), 'ph': (6.5, 7.5), 'rainfall': (40, 80),
        'states': ['Madhya Pradesh', 'Rajasthan', 'Maharashtra', 'Karnataka'],
        'seasons': ['Rabi'],
        'soil_types': ['Loam', 'Clay-Loam'],
        'irrigation': ['Rainfed'],
        'farm_sizes': ['Small', 'Medium']
    },
    'lentil': {
        'count': 600, 'N': (10, 25), 'P': (20, 30), 'K': (15, 25),
        'temp': (18, 25), 'humidity': (50, 60), 'ph': (6.5, 7.5), 'rainfall': (30, 70),
        'states': ['Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'West Bengal'],
        'seasons': ['Rabi'],
        'soil_types': ['Loam', 'Sandy-Loam'],
        'irrigation': ['Rainfed', 'Flood'],
        'farm_sizes': ['Small']
    },
    'pigeonpeas': {
        'count': 550, 'N': (15, 30), 'P': (25, 35), 'K': (25, 35),
        'temp': (25, 32), 'humidity': (60, 75), 'ph': (6.0, 7.5), 'rainfall': (60, 100),
        'states': ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Andhra Pradesh'],
        'seasons': ['Kharif'],
        'soil_types': ['Loam', 'Clay-Loam'],
        'irrigation': ['Rainfed'],
        'farm_sizes': ['Small', 'Medium']
    },
    'mungbean': {
        'count': 500, 'N': (20, 40), 'P': (30, 40), 'K': (25, 35),
        'temp': (25, 35), 'humidity': (65, 80), 'ph': (6.5, 7.5), 'rainfall': (60, 100),
        'states': ['Rajasthan', 'Maharashtra', 'Karnataka', 'Andhra Pradesh'],
        'seasons': ['Kharif', 'Zaid'],
        'soil_types': ['Loam', 'Sandy-Loam'],
        'irrigation': ['Rainfed', 'Sprinkler'],
        'farm_sizes': ['Small']
    },
    'blackgram': {
        'count': 450, 'N': (15, 30), 'P': (30, 40), 'K': (25, 35),
        'temp': (25, 35), 'humidity': (65, 80), 'ph': (6.5, 7.5), 'rainfall': (60, 100),
        'states': ['Andhra Pradesh', 'Maharashtra', 'Tamil Nadu', 'Madhya Pradesh'],
        'seasons': ['Kharif', 'Rabi'],
        'soil_types': ['Loam', 'Clay-Loam'],
        'irrigation': ['Rainfed'],
        'farm_sizes': ['Small']
    },
    'kidneybeans': {
        'count': 400, 'N': (15, 30), 'P': (25, 35), 'K': (20, 30),
        'temp': (15, 25), 'humidity': (55, 70), 'ph': (6.0, 7.0), 'rainfall': (40, 80),
        'states': ['Himachal Pradesh', 'Uttarakhand', 'Jammu and Kashmir', 'Punjab'],
        'seasons': ['Rabi', 'Zaid'],
        'soil_types': ['Loam', 'Sandy-Loam'],
        'irrigation': ['Sprinkler', 'Drip'],
        'farm_sizes': ['Small', 'Medium']
    },
    'mothbeans': {
        'count': 350, 'N': (15, 30), 'P': (25, 35), 'K': (20, 30),
        'temp': (25, 35), 'humidity': (50, 70), 'ph': (7.0, 8.5), 'rainfall': (30, 60),
        'states': ['Rajasthan', 'Haryana', 'Gujarat'],
        'seasons': ['Kharif'],
        'soil_types': ['Sandy', 'Sandy-Loam'],
        'irrigation': ['Rainfed'],
        'farm_sizes': ['Small']
    },
    'banana': {
        'count': 450, 'N': (80, 120), 'P': (55, 70), 'K': (60, 80),
        'temp': (25, 35), 'humidity': (75, 95), 'ph': (6.0, 7.5), 'rainfall': (120, 200),
        'states': ['Tamil Nadu', 'Maharashtra', 'Karnataka', 'Gujarat', 'Andhra Pradesh'],
        'seasons': ['Year-round'],
        'soil_types': ['Loam', 'Clay-Loam'],
        'irrigation': ['Drip', 'Flood'],
        'farm_sizes': ['Small', 'Medium']
    },
    'mango': {
        'count': 400, 'N': (50, 80), 'P': (40, 55), 'K': (45, 60),
        'temp': (24, 35), 'humidity': (60, 80), 'ph': (5.5, 7.0), 'rainfall': (100, 180),
        'states': ['Uttar Pradesh', 'Andhra Pradesh', 'Karnataka', 'Bihar', 'Maharashtra'],
        'seasons': ['Zaid'],
        'soil_types': ['Loam', 'Clay-Loam'],
        'irrigation': ['Drip', 'Flood'],
        'farm_sizes': ['Medium', 'Large']
    },
    'grapes': {
        'count': 350, 'N': (60, 90), 'P': (50, 65), 'K': (50, 65),
        'temp': (20, 30), 'humidity': (60, 75), 'ph': (6.0, 7.0), 'rainfall': (60, 120),
        'states': ['Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Tamil Nadu'],
        'seasons': ['Zaid'],
        'soil_types': ['Loam', 'Sandy-Loam'],
        'irrigation': ['Drip'],
        'farm_sizes': ['Medium', 'Large']
    },
    'pomegranate': {
        'count': 300, 'N': (40, 60), 'P': (40, 55), 'K': (40, 55),
        'temp': (25, 35), 'humidity': (55, 70), 'ph': (6.5, 7.5), 'rainfall': (50, 100),
        'states': ['Maharashtra', 'Karnataka', 'Gujarat', 'Andhra Pradesh'],
        'seasons': ['Zaid'],
        'soil_types': ['Loam', 'Sandy-Loam'],
        'irrigation': ['Drip'],
        'farm_sizes': ['Medium']
    },
    'watermelon': {
        'count': 350, 'N': (80, 110), 'P': (50, 65), 'K': (50, 70),
        'temp': (25, 35), 'humidity': (60, 75), 'ph': (6.0, 7.0), 'rainfall': (50, 100),
        'states': ['Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Maharashtra'],
        'seasons': ['Zaid'],
        'soil_types': ['Sandy-Loam', 'Loam'],
        'irrigation': ['Drip', 'Sprinkler'],
        'farm_sizes': ['Small', 'Medium']
    },
    'muskmelon': {
        'count': 300, 'N': (70, 100), 'P': (45, 60), 'K': (45, 65),
        'temp': (25, 35), 'humidity': (55, 70), 'ph': (6.0, 7.0), 'rainfall': (40, 80),
        'states': ['Uttar Pradesh', 'Punjab', 'Rajasthan', 'Haryana'],
        'seasons': ['Zaid'],
        'soil_types': ['Sandy-Loam', 'Loam'],
        'irrigation': ['Drip', 'Sprinkler'],
        'farm_sizes': ['Small', 'Medium']
    },
    'apple': {
        'count': 250, 'N': (30, 50), 'P': (30, 45), 'K': (35, 50),
        'temp': (10, 20), 'humidity': (60, 75), 'ph': (5.5, 6.5), 'rainfall': (100, 150),
        'states': ['Himachal Pradesh', 'Jammu and Kashmir', 'Uttarakhand'],
        'seasons': ['Rabi'],
        'soil_types': ['Loam', 'Sandy-Loam'],
        'irrigation': ['Drip', 'Sprinkler'],
        'farm_sizes': ['Medium', 'Large']
    },
    'orange': {
        'count': 300, 'N': (50, 70), 'P': (40, 55), 'K': (45, 60),
        'temp': (20, 30), 'humidity': (65, 80), 'ph': (6.0, 7.0), 'rainfall': (100, 150),
        'states': ['Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Andhra Pradesh'],
        'seasons': ['Rabi'],
        'soil_types': ['Loam', 'Clay-Loam'],
        'irrigation': ['Drip', 'Flood'],
        'farm_sizes': ['Medium', 'Large']
    },
    'papaya': {
        'count': 350, 'N': (90, 120), 'P': (60, 75), 'K': (65, 85),
        'temp': (25, 35), 'humidity': (70, 85), 'ph': (6.0, 7.0), 'rainfall': (100, 180),
        'states': ['Andhra Pradesh', 'Gujarat', 'Maharashtra', 'Karnataka'],
        'seasons': ['Year-round'],
        'soil_types': ['Loam', 'Sandy-Loam'],
        'irrigation': ['Drip', 'Flood'],
        'farm_sizes': ['Small', 'Medium']
    },
    'coconut': {
        'count': 400, 'N': (60, 90), 'P': (40, 55), 'K': (50, 70),
        'temp': (25, 32), 'humidity': (75, 90), 'ph': (5.5, 7.0), 'rainfall': (150, 250),
        'states': ['Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh'],
        'seasons': ['Year-round'],
        'soil_types': ['Sandy', 'Sandy-Loam', 'Loam'],
        'irrigation': ['Rainfed', 'Drip'],
        'farm_sizes': ['Small', 'Medium']
    },
    'jute': {
        'count': 400, 'N': (70, 95), 'P': (45, 60), 'K': (40, 55),
        'temp': (25, 35), 'humidity': (75, 90), 'ph': (5.5, 6.5), 'rainfall': (150, 250),
        'states': ['West Bengal', 'Bihar', 'Assam', 'Odisha'],
        'seasons': ['Kharif'],
        'soil_types': ['Clay', 'Clay-Loam'],
        'irrigation': ['Rainfed', 'Flood'],
        'farm_sizes': ['Small', 'Medium']
    },
    'coffee': {
        'count': 250, 'N': (90, 120), 'P': (60, 75), 'K': (60, 80),
        'temp': (15, 25), 'humidity': (70, 85), 'ph': (5.5, 6.5), 'rainfall': (150, 250),
        'states': ['Karnataka', 'Kerala', 'Tamil Nadu'],
        'seasons': ['Year-round'],
        'soil_types': ['Loam', 'Clay-Loam'],
        'irrigation': ['Drip', 'Sprinkler'],
        'farm_sizes': ['Medium', 'Large']
    }
}

# Generate enhanced dataset
print("🌱 Generating enhanced agricultural dataset...")
data_rows = []

np.random.seed(42)

for crop, pattern in crop_patterns.items():
    count = pattern['count']
    
    for _ in range(count):
        # Generate soil parameters with realistic variance
        n = np.random.uniform(*pattern['N'])
        p = np.random.uniform(*pattern['P'])
        k = np.random.uniform(*pattern['K'])
        temp = np.random.uniform(*pattern['temp'])
        humidity = np.random.uniform(*pattern['humidity'])
        ph = np.random.uniform(*pattern['ph'])
        rainfall = np.random.uniform(*pattern['rainfall'])
        
        # Select categorical features
        state = np.random.choice(pattern['states'])
        season = np.random.choice(pattern['seasons'])
        soil_type = np.random.choice(pattern['soil_types'])
        irrigation = np.random.choice(pattern['irrigation'])
        farm_size = np.random.choice(pattern['farm_sizes'])
        
        data_rows.append({
            'N': round(n, 2),
            'P': round(p, 2),
            'K': round(k, 2),
            'temperature': round(temp, 2),
            'humidity': round(humidity, 2),
            'ph': round(ph, 2),
            'rainfall': round(rainfall, 2),
            'state': state,
            'season': season,
            'soil_type': soil_type,
            'irrigation': irrigation,
            'farm_size': farm_size,
            'label': crop
        })

crop_data = pd.DataFrame(data_rows)

# Ensure valid ranges for numerical features
df = crop_data.copy()
df['N'] = df['N'].clip(0, 140)
df['P'] = df['P'].clip(5, 145)
df['K'] = df['K'].clip(5, 205)
df['temperature'] = df['temperature'].clip(8, 43)
df['humidity'] = df['humidity'].clip(14, 99)
df['ph'] = df['ph'].clip(3.5, 9.9)
df['rainfall'] = df['rainfall'].clip(20, 300)

# Encode categorical variables
label_encoders = {}
for col in ['state', 'season', 'soil_type', 'irrigation', 'farm_size']:
    le = LabelEncoder()
    df[col + '_encoded'] = le.fit_transform(df[col])
    label_encoders[col] = le
    print(f"\n{col.replace('_', ' ').title()} Encoding:")
    for i, label in enumerate(le.classes_):
        print(f"  {i}: {label}")

print("Dataset Shape:", df.shape)
print("\nDataset Info:")
print(df.info())
print("\nCrop Distribution:")
print(df['label'].value_counts())

# Prepare features and target
# Use both original categorical (for reference) and encoded (for training)
feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall',
                'state_encoded', 'season_encoded', 'soil_type_encoded',
                'irrigation_encoded', 'farm_size_encoded']

X = df[feature_cols]
y = df['label']

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f"\nTraining samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")

# Train Random Forest Classifier
print("\n🌱 Training Random Forest Classifier...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=25,
    min_samples_split=3,
    min_samples_leaf=1,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)
print("✅ Model training complete!")

# Evaluate model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n📊 Model Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Feature importance
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\n🔍 Feature Importance:")
print(feature_importance)

# Save the model
model_filename = 'crop_model.pkl'
joblib.dump(model, model_filename)
print(f"\n💾 Model saved as '{model_filename}'")

# Save feature names
feature_names = X.columns.tolist()
with open('feature_names.json', 'w') as f:
    json.dump(feature_names, f)
print("💾 Feature names saved as 'feature_names.json'")

# Save label encoders for API use
encoders_dict = {}
for col, encoder in label_encoders.items():
    encoders_dict[col] = encoder.classes_.tolist()

with open('label_encoders.json', 'w') as f:
    json.dump(encoders_dict, f, indent=2)
print("💾 Label encoders saved as 'label_encoders.json'")

# Test prediction with enhanced features
# Test case: Rice in Punjab, Kharif season, Clay soil, Flood irrigation, Medium farm
state_idx = label_encoders['state'].transform(['Punjab'])[0]
season_idx = label_encoders['season'].transform(['Kharif'])[0]
soil_idx = label_encoders['soil_type'].transform(['Clay'])[0]
irrigation_idx = label_encoders['irrigation'].transform(['Flood'])[0]
farm_size_idx = label_encoders['farm_size'].transform(['Medium'])[0]

sample_input = [[90, 42, 43, 28, 80, 6.5, 200, state_idx, season_idx, soil_idx, irrigation_idx, farm_size_idx]]
prediction = model.predict(sample_input)
probabilities = model.predict_proba(sample_input)

print(f"\n🧪 Test Prediction:")
print(f"Input: N=90, P=42, K=43, temp=28°C, humidity=80%, pH=6.5, rainfall=200mm")
print(f"       State=Punjab, Season=Kharif, Soil=Clay, Irrigation=Flood, Farm=Medium")
print(f"Predicted Crop: {prediction[0]}")
print(f"Confidence: {max(probabilities[0]) * 100:.2f}%")

print("\n✅ Training script completed successfully!")
print("Next step: Run 'python app.py' to start the Flask API server")
