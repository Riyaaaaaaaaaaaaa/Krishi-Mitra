"""
Flask API for Crop Recommendation System
Provides ML-powered crop predictions based on soil and climate parameters
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load the trained model
MODEL_PATH = 'crop_model.pkl'
FEATURE_NAMES_PATH = 'feature_names.json'

# Crop metadata (season, yield estimates, profit margins for Indian agriculture)
CROP_INFO = {
    'rice': {'season': 'Kharif', 'yield': '4500 kg/ha', 'profit': '₹45000/ha'},
    'wheat': {'season': 'Rabi', 'yield': '4000 kg/ha', 'profit': '₹38000/ha'},
    'maize': {'season': 'Kharif', 'yield': '3500 kg/ha', 'profit': '₹32000/ha'},
    'chickpea': {'season': 'Rabi', 'yield': '2000 kg/ha', 'profit': '₹35000/ha'},
    'kidneybeans': {'season': 'Rabi', 'yield': '1800 kg/ha', 'profit': '₹42000/ha'},
    'pigeonpeas': {'season': 'Kharif', 'yield': '1500 kg/ha', 'profit': '₹30000/ha'},
    'mothbeans': {'season': 'Kharif', 'yield': '1200 kg/ha', 'profit': '₹25000/ha'},
    'mungbean': {'season': 'Kharif', 'yield': '1000 kg/ha', 'profit': '₹28000/ha'},
    'blackgram': {'season': 'Kharif', 'yield': '900 kg/ha', 'profit': '₹27000/ha'},
    'lentil': {'season': 'Rabi', 'yield': '1100 kg/ha', 'profit': '₹32000/ha'},
    'pomegranate': {'season': 'Zaid', 'yield': '15000 kg/ha', 'profit': '₹120000/ha'},
    'banana': {'season': 'Year-round', 'yield': '25000 kg/ha', 'profit': '₹85000/ha'},
    'mango': {'season': 'Zaid', 'yield': '10000 kg/ha', 'profit': '₹95000/ha'},
    'grapes': {'season': 'Zaid', 'yield': '18000 kg/ha', 'profit': '₹110000/ha'},
    'watermelon': {'season': 'Zaid', 'yield': '20000 kg/ha', 'profit': '₹55000/ha'},
    'muskmelon': {'season': 'Zaid', 'yield': '15000 kg/ha', 'profit': '₹48000/ha'},
    'apple': {'season': 'Rabi', 'yield': '12000 kg/ha', 'profit': '₹105000/ha'},
    'orange': {'season': 'Rabi', 'yield': '20000 kg/ha', 'profit': '₹75000/ha'},
    'papaya': {'season': 'Year-round', 'yield': '30000 kg/ha', 'profit': '₹68000/ha'},
    'coconut': {'season': 'Year-round', 'yield': '8000 nuts/ha', 'profit': '₹52000/ha'},
    'cotton': {'season': 'Kharif', 'yield': '2500 kg/ha', 'profit': '₹65000/ha'},
    'jute': {'season': 'Kharif', 'yield': '3000 kg/ha', 'profit': '₹42000/ha'},
    'coffee': {'season': 'Year-round', 'yield': '1200 kg/ha', 'profit': '₹88000/ha'}
}

try:
    model = joblib.load(MODEL_PATH)
    with open(FEATURE_NAMES_PATH, 'r') as f:
        feature_names = json.load(f)
    with open('label_encoders.json', 'r') as f:
        label_encoders = json.load(f)
    print("✅ Model loaded successfully!")
    print(f"📋 Features: {feature_names}")
    print(f"🗺️  States: {len(label_encoders['state'])}")
    print(f"🌾 Seasons: {label_encoders['season']}")
    print(f"🏞️  Soil Types: {label_encoders['soil_type']}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None
    feature_names = None
    label_encoders = None

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'Krishi Mitra ML Service',
        'version': '1.0.0',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict crop recommendation based on soil, climate, location, and farm parameters
    
    Expected JSON input:
    {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 28,
        "humidity": 80,
        "ph": 6.5,
        "rainfall": 200,
        "state": "Punjab",
        "season": "Kharif",
        "soil_type": "Clay",
        "irrigation": "Flood",
        "farm_size": "Medium"
    }
    
    Returns:
    {
        "success": true,
        "prediction": {
            "crop": "rice",
            "confidence": 0.95,
            "alternatives": [...]
        }
    }
    """
    try:
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded. Please run train_model.py first.'
            }), 500
        
        # Get JSON data
        data = request.get_json()
        print(f"📥 Received request: {data}")
        
        # Validate required fields
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall',
                          'state', 'season', 'soil_type', 'irrigation', 'farm_size']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Extract and validate input values
        try:
            # Numerical features
            numerical_inputs = [
                float(data['N']),
                float(data['P']),
                float(data['K']),
                float(data['temperature']),
                float(data['humidity']),
                float(data['ph']),
                float(data['rainfall'])
            ]
            
            # Categorical features - encode them
            state = data['state']
            season = data['season']
            soil_type = data['soil_type']
            irrigation = data['irrigation']
            farm_size = data['farm_size']
            
            # Validate categorical values
            if state not in label_encoders['state']:
                return jsonify({
                    'success': False,
                    'error': f'Invalid state. Must be one of: {", ".join(label_encoders["state"])}'
                }), 400
            
            if season not in label_encoders['season']:
                return jsonify({
                    'success': False,
                    'error': f'Invalid season. Must be one of: {", ".join(label_encoders["season"])}'
                }), 400
            
            if soil_type not in label_encoders['soil_type']:
                return jsonify({
                    'success': False,
                    'error': f'Invalid soil type. Must be one of: {", ".join(label_encoders["soil_type"])}'
                }), 400
                
            if irrigation not in label_encoders['irrigation']:
                return jsonify({
                    'success': False,
                    'error': f'Invalid irrigation. Must be one of: {", ".join(label_encoders["irrigation"])}'
                }), 400
                
            if farm_size not in label_encoders['farm_size']:
                return jsonify({
                    'success': False,
                    'error': f'Invalid farm size. Must be one of: {", ".join(label_encoders["farm_size"])}'
                }), 400
            
            # Encode categorical features
            state_encoded = label_encoders['state'].index(state)
            season_encoded = label_encoders['season'].index(season)
            soil_type_encoded = label_encoders['soil_type'].index(soil_type)
            irrigation_encoded = label_encoders['irrigation'].index(irrigation)
            farm_size_encoded = label_encoders['farm_size'].index(farm_size)
            
            # Combine all features in correct order
            input_values = numerical_inputs + [
                state_encoded,
                season_encoded,
                soil_type_encoded,
                irrigation_encoded,
                farm_size_encoded
            ]
            
        except (ValueError, TypeError) as e:
            return jsonify({
                'success': False,
                'error': f'Invalid input values. {str(e)}'
            }), 400
        
        # Validate ranges
        if not (0 <= input_values[0] <= 140):  # N
            return jsonify({'success': False, 'error': 'Nitrogen (N) must be between 0-140'}), 400
        if not (5 <= input_values[1] <= 145):  # P
            return jsonify({'success': False, 'error': 'Phosphorus (P) must be between 5-145'}), 400
        if not (5 <= input_values[2] <= 205):  # K
            return jsonify({'success': False, 'error': 'Potassium (K) must be between 5-205'}), 400
        if not (8 <= input_values[3] <= 43):  # temperature
            return jsonify({'success': False, 'error': 'Temperature must be between 8-43°C'}), 400
        if not (14 <= input_values[4] <= 99):  # humidity
            return jsonify({'success': False, 'error': 'Humidity must be between 14-99%'}), 400
        if not (3.5 <= input_values[5] <= 9.9):  # ph
            return jsonify({'success': False, 'error': 'pH must be between 3.5-9.9'}), 400
        if not (20 <= input_values[6] <= 300):  # rainfall
            return jsonify({'success': False, 'error': 'Rainfall must be between 20-300mm'}), 400
        
        # Prepare input for model
        input_array = np.array([input_values])
        
        # Get prediction
        prediction = model.predict(input_array)[0]
        probabilities = model.predict_proba(input_array)[0]
        
        # Get class names and their probabilities
        class_names = model.classes_
        crop_probabilities = list(zip(class_names, probabilities))
        crop_probabilities.sort(key=lambda x: x[1], reverse=True)
        
        # Top prediction
        top_crop = prediction
        confidence = max(probabilities)
        
        # Get crop info
        crop_data = CROP_INFO.get(top_crop, {
            'season': 'Unknown',
            'yield': 'N/A',
            'profit': 'N/A'
        })
        
        # Build alternatives list (top 3)
        alternatives = []
        for crop_name, prob in crop_probabilities[1:4]:  # Skip first (it's the main prediction)
            alt_data = CROP_INFO.get(crop_name, {
                'season': 'Unknown',
                'yield': 'N/A',
                'profit': 'N/A'
            })
            alternatives.append({
                'crop': crop_name.capitalize(),
                'confidence': round(float(prob), 3),
                'season': alt_data['season'],
                'yield': alt_data['yield'],
                'profit': alt_data['profit']
            })
        
        # Build response
        response = {
            'success': True,
            'prediction': {
                'crop': top_crop.capitalize(),
                'confidence': round(float(confidence), 3),
                'season': crop_data['season'],
                'yield_estimate': crop_data['yield'],
                'profit_margin': crop_data['profit'],
                'alternatives': alternatives
            },
            'input': {
                'N': numerical_inputs[0],
                'P': numerical_inputs[1],
                'K': numerical_inputs[2],
                'temperature': numerical_inputs[3],
                'humidity': numerical_inputs[4],
                'ph': numerical_inputs[5],
                'rainfall': numerical_inputs[6],
                'state': state,
                'season': season,
                'soil_type': soil_type,
                'irrigation': irrigation,
                'farm_size': farm_size
            },
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"✅ Prediction: {top_crop} (confidence: {confidence:.2%})")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error during prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_path': MODEL_PATH,
        'model_exists': os.path.exists(MODEL_PATH),
        'features': feature_names if feature_names else [],
        'num_features': len(feature_names) if feature_names else 0,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🌾 Krishi Mitra ML Service")
    print("=" * 50)
    print(f"Model loaded: {model is not None}")
    print(f"Listening on: http://localhost:5001")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)
