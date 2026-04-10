from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import xgboost as xgb
from fastapi.middleware.cors import CORSMiddleware

# Find where you defined app = FastAPI() and add this below it:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # This is the magic line that allows Vercel to talk to it
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI(title="Tanza House Sight API")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

proximity_map = {
    'Amaya': 1.8, 'Bagtas': 6.9, 'Biga': 4.8, 'Biwas': 2.1, 'Bucal': 1.7, 
    'Bunga': 7.0, 'Calibuyo': 6.8, 'Capipisa': 9.0, 'Daang Amaya': 0.8,
    'Halayhay': 6.1, 'Julugan': 3.0, 'Lambingan': 10.4, 'Mulawin': 1.5, 
    'Paradahan': 8.9, 'Poblacion': 0.6, 'Punta': 4.4, 'Sahud Ulan': 5.9, 
    'Sanja Mayor': 2.5, 'Santol': 3.0, 'Tanauan': 17.6, 'Tres Cruses': 9.6
}

GLOBAL_MIN_PRICE = 1500000   
GLOBAL_MAX_PRICE = 50000000  

all_barangays = sorted(list(proximity_map.keys()))
spatial_cols = [f"barangay_{b}" for b in all_barangays if b != 'Amaya']

# MASTER FEATURE SET FOR ALL 3 MODELS
features = ['year', 'proximity_km'] + spatial_cols

model_aqi = xgb.XGBRegressor()
model_flood = xgb.XGBRegressor()
model_price = xgb.XGBRegressor()

try:
    model_aqi.load_model("models/model_aqi.json")
    model_flood.load_model("models/model_flood.json")
    model_price.load_model("models/model_price.json")
    print("✅ All Independent AI Models loaded successfully!")
except Exception as e:
    print(f"⚠️ WARNING: Could not load models: {e}")

class RecommendRequest(BaseModel):
    flood_risk: float = Field(ge=-1.0, le=100.0)
    air_quality: float = Field(ge=-1.0, le=100.0)
    house_price: float = Field(ge=-1.0, le=100.0)
    proximity: float = Field(ge=-1.0, le=100.0)
    years: int = Field(ge=0, le=20)

class AnalyzeRequest(BaseModel):
    barangay: str = Field(min_length=2, max_length=50)

@app.post("/recommend")
def get_recommendations(request: RecommendRequest):
    target_year = 2025 + request.years 
    xgboost_year = min(target_year, 2025)
    years_into_future = max(0, target_year - 2025)
    
    all_predictions = []
    
    for brgy, prox in proximity_map.items():
        # 1. Prepare SINGLE Input Dataframe
        input_base = {'year': xgboost_year, 'proximity_km': prox}
        for col in spatial_cols:
            input_base[col] = 1 if f"barangay_{brgy}" == col else 0
            
        df_input = pd.DataFrame([input_base])[features]
        
        # 2. Predict ALL 3 Variables Independently 
        base_aqi = float(model_aqi.predict(df_input)[0])
        base_flood = float(model_flood.predict(df_input)[0])
        base_price = float(model_price.predict(df_input)[0])
        
        # 3. Apply Future Creep
        p_aqi = base_aqi + (years_into_future * 0.5)
        p_flood = base_flood + (years_into_future * 0.02)
        p_price = base_price * ((1 + 0.06) ** years_into_future)
        
        all_predictions.append({
            "barangay": brgy, "raw_aqi": float(p_aqi), "raw_flood": float(p_flood), 
            "raw_price": float(p_price), "raw_prox": float(prox)
        })
        
    min_price = min(p['raw_price'] for p in all_predictions)
    max_price = max(p['raw_price'] for p in all_predictions)
    min_flood = min(p['raw_flood'] for p in all_predictions)
    max_flood = max(p['raw_flood'] for p in all_predictions)
    min_aqi = min(p['raw_aqi'] for p in all_predictions)
    max_aqi = max(p['raw_aqi'] for p in all_predictions)
    min_prox = min(p['raw_prox'] for p in all_predictions)
    max_prox = max(p['raw_prox'] for p in all_predictions)

    results = []
    
    for row in all_predictions:
        v_price = ((row['raw_price'] - min_price) / (max_price - min_price) * 100.0) if max_price != min_price else 50.0
        v_flood = ((row['raw_flood'] - min_flood) / (max_flood - min_flood) * 100.0) if max_flood != min_flood else 50.0
        v_aqi = ((row['raw_aqi'] - min_aqi) / (max_aqi - min_aqi) * 100.0) if max_aqi != min_aqi else 50.0
        v_prox = ((row['raw_prox'] - min_prox) / (max_prox - min_prox) * 100.0) if max_prox != min_prox else 50.0

        def get_target_match(slider_val, current_val):
            if slider_val == -1: return None 
            return 100.0 - abs(slider_val - current_val)

        matches = []
        if request.house_price != -1: matches.append(get_target_match(request.house_price, v_price))
        if request.flood_risk != -1: matches.append(get_target_match(request.flood_risk, v_flood))
        if request.air_quality != -1: matches.append(get_target_match(request.air_quality, v_aqi))
        if request.proximity != -1: matches.append(get_target_match(request.proximity, v_prox))

        exact_match = sum(matches) / len(matches) if matches else 0.0

        flood_score = max(0.0, min(100.0, 100.0 - ((row['raw_flood'] / 5.0) * 100.0)))
        aqi_score = max(0.0, min(100.0, 100.0 - ((row['raw_aqi'] / 150.0) * 100.0)))
        prox_score = max(0.0, min(100.0, 100.0 - (row['raw_prox'] * 10.0)))
        
        price_ratio = (row['raw_price'] - GLOBAL_MIN_PRICE) / (GLOBAL_MAX_PRICE - GLOBAL_MIN_PRICE)
        price_score = max(0.0, min(100.0, 100.0 - (price_ratio * 100.0)))
        
        model_value = round((price_score * 0.40) + (flood_score * 0.25) + (prox_score * 0.20) + (aqi_score * 0.15))
        
        # STRICT PYTHON TYPES ENFORCED HERE
        results.append({
            "id": str(row['barangay'].lower().replace(" ", "-")),
            "name": str(row['barangay']), 
            "exact_match": float(exact_match),                 
            "match": int(round(exact_match)), 
            "model_value": int(model_value),         
            "price": f"₱{row['raw_price']:,.0f}",
            "raw_aqi": float(round(row['raw_aqi'], 1)),     
            "raw_flood": float(round(row['raw_flood'], 2)), 
            "raw_prox": float(row['raw_prox'])
        })
        
    results.sort(key=lambda x: x['exact_match'], reverse=True)
    return results

@app.post("/analyze")
def analyze_barangay(request: AnalyzeRequest):
    target_barangay = request.barangay
    if target_barangay not in proximity_map:
        raise HTTPException(status_code=404, detail="Barangay not found.")

    timeframes = [0, 5, 10, 15, 20]
    prox = proximity_map.get(target_barangay, 5.0)
    current_year = 2025 
    
    predictions_list = []

    for offset in timeframes:
        target_year = current_year + offset
        xgboost_year = min(target_year, 2025)
        years_into_future = max(0, target_year - 2025)
        
        # 1. Prepare SINGLE Input Dataframe
        input_base = {'year': xgboost_year, 'proximity_km': prox}
        for col in spatial_cols:
            input_base[col] = 1 if f"barangay_{target_barangay}" == col else 0
            
        df_input = pd.DataFrame([input_base])[features]
        
        # 2. Predict ALL 3 Variables Independently using the exact same input
        base_aqi = float(model_aqi.predict(df_input)[0])
        base_flood = float(model_flood.predict(df_input)[0])
        base_price = float(model_price.predict(df_input)[0])
        
        # 3. Apply Future Creep
        p_aqi = base_aqi + (years_into_future * 0.5)
        p_flood = base_flood + (years_into_future * 0.02)
        p_price = base_price * ((1 + 0.06) ** years_into_future)
        
        predictions_list.append({
            "Timeline": "0" if offset == 0 else f"+{offset} Years",
            "AQI": p_aqi, "Flood": p_flood, "Predicted Price": p_price
        })

    predictions_df = pd.DataFrame(predictions_list)
    frontend_response = []

    for index, row in predictions_df.iterrows():
        raw_price = row['Predicted Price']
        raw_flood = row['Flood']
        raw_aqi = row['AQI']
        
        flood_score = max(0.0, min(100.0, 100.0 - ((raw_flood / 5.0) * 100.0)))
        aqi_score = max(0.0, min(100.0, 100.0 - ((raw_aqi / 150.0) * 100.0)))
        prox_score = max(0.0, min(100.0, 100.0 - (prox * 10.0)))
        
        price_ratio = (raw_price - GLOBAL_MIN_PRICE) / (GLOBAL_MAX_PRICE - GLOBAL_MIN_PRICE)
        price_score = max(0.0, min(100.0, 100.0 - (price_ratio * 100.0)))
        
        model_value = round((price_score * 0.40) + (flood_score * 0.25) + (prox_score * 0.20) + (aqi_score * 0.15))

        frontend_response.append({
            "year": row['Timeline'], "model_value": model_value,
            "flood_score": round(flood_score), "aqi_score": round(aqi_score),
            "price_score": round(price_score), "raw_price": raw_price,
            "raw_aqi": raw_aqi, "raw_flood": raw_flood, "raw_prox": prox
        })

    return {"barangay": target_barangay, "future_projections": frontend_response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)