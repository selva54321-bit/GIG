import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import xgboost as xgb
import os

class FraudDetector:
    def __init__(self):
        # Layer 3: Isolation Forest for velocity checks
        self.iso_forest = IsolationForest(contamination=0.1, random_state=42)
        # Mocking some past data for fitting (for prototype only)
        mock_data = np.random.normal(size=(100, 1)) 
        self.iso_forest.fit(mock_data)

    def layer_5_gating(self, gig_score):
        """Layer 5: Block if GigScore < 100 (Bronze)"""
        return gig_score < 100

    def detect_risk(self, claim_data):
        score = 0
        
        # Layer 1: GPS Consistency (Mocked rule)
        if not claim_data.get('gps_valid', True):
            score += 40
            
        # Layer 2: Zone Integrity (Mocked rule)
        if claim_data.get('zone_changes_month', 0) > 2:
            score += 20
            
        # Layer 3: Velocity (Isolation Forest)
        claims_freq = np.array([[claim_data.get('claims_count_7d', 0)]])
        is_outlier = self.iso_forest.predict(claims_freq)[0] == -1
        if is_outlier:
            score += 30
            
        # Layer 4: Network (Mock GNN logic for clustering)
        if claim_data.get('device_id_shared', False):
            score += 25
            
        # Layer 5: Gating
        if self.layer_5_gating(claim_data.get('gig_score', 500)):
            score = 100 # Immediate rejection
            
        return min(score, 100)

class PricingModel:
    def __init__(self):
        # Simple XGBoost regressor for premium adjustment
        # In a real app, we'd load a pre-trained model .json/.bin
        self.model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=10)
        
        # Mock training
        X = np.random.rand(100, 4) # weather, aqi, zone_risk, gig_score
        y = np.random.rand(100) * 10 # adjustments
        self.model.fit(X, y)

    def predict_adjustment(self, features):
        """Predicts a loading or discount (Rs 0 to Rs 10)"""
        input_data = np.array([features])
        prediction = self.model.predict(input_data)[0]
        return float(np.clip(prediction, -10, 10))

def calculate_gig_score_update(current_score, events):
    """
    Events list containing: 'payment_on_time', 'streak_4w', 'fraud_detected'
    """
    new_score = current_score
    for event in events:
        if event == 'payment_on_time':
            new_score += 10
        elif event == 'streak_4w':
            new_score += 20
        elif event == 'fraud_detected':
            new_score -= 50
            
    return max(0, min(1000, new_score))
