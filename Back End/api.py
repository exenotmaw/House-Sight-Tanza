from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import pandas as pd
import xgboost as xgb
import io
import os
import uuid
import datetime
import glob
import shutil

# =====================================================================
# 1. SERVER SETUP & MIDDLEWARE
# =====================================================================
app = FastAPI(title="Tanza House Sight API")

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# =====================================================================
# 2. SYSTEM ARCHITECTURE & STATE
# =====================================================================
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
features = ['year', 'proximity_km'] + spatial_cols

model_aqi = xgb.XGBRegressor()
model_flood = xgb.XGBRegressor()
model_price = xgb.XGBRegressor()

def load_all_models():
    """Loads or reloads the AI models into live RAM."""
    global model_aqi, model_flood, model_price
    try:
        model_aqi.load_model("models/model_aqi.json")
        model_flood.load_model("models/model_flood.json")
        model_price.load_model("models/model_price.json")
        print("✅ Models loaded into live RAM successfully!")
    except Exception as e:
        print(f"⚠️ WARNING: Could not load models: {e}")

load_all_models()

# MLOps State
pending_queue = {}
dynamic_offsets = {"house_price": {}, "flood_risk": {}, "air_quality": {}}

# Ensure directories exist
os.makedirs("approved_datasets", exist_ok=True)
os.makedirs("archived_datasets", exist_ok=True)
os.makedirs("models", exist_ok=True)

# =====================================================================
# 3. AUTHENTICATION LAYER
# =====================================================================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

ADMIN_USER = os.getenv("ADMIN_USER", "housesightadmin")
ADMIN_PASS = os.getenv("ADMIN_PASS", "housesightpassword")

@app.post("/admin/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username == ADMIN_USER and form_data.password == ADMIN_PASS:
        return {"access_token": "housesight_secure_admin_token_2026", "token_type": "bearer"}
    raise HTTPException(status_code=400, detail="Incorrect username or password")

def verify_admin(token: str = Depends(oauth2_scheme)):
    if token != "housesight_secure_admin_token_2026":
        raise HTTPException(status_code=401, detail="Unauthorized Action. Invalid Token.")
    return True

# =====================================================================
# 4. ASYNCHRONOUS RETRAINING ENGINE (Runs in Background)
# =====================================================================
def background_retrain_task(factor_name: str, target_barangay: str):
    """Quietly retrains the AI in the background without freezing the website."""
    print(f"\n⚙️ [ASYNC TASK] Retraining {factor_name.upper()} model in background...")
    master_csv = f"master_{factor_name}.csv"
    
    try:
        # 1. Load Data
        if not os.path.exists(master_csv):
            print(f"❌ [ASYNC TASK] Master file {master_csv} missing. Aborting.")
            return
            
        master_df = pd.read_csv(master_csv)
        new_files = glob.glob(f"approved_datasets/*_{factor_name}_*.csv")
        
        if not new_files:
            return
            
        new_dfs = [pd.read_csv(f) for f in new_files]
        combined_df = pd.concat([master_df] + new_dfs, ignore_index=True)
        
        # 2. One-Hot Encode
        for brgy in all_barangays:
            if brgy == 'Amaya': continue
            col_name = f"barangay_{brgy}"
            if 'barangay' in combined_df.columns:
                combined_df[col_name] = (combined_df['barangay'] == brgy).astype(int)
            elif col_name not in combined_df.columns:
                combined_df[col_name] = 0
                
        # 3. Train Model
        feature_cols = ['year', 'proximity_km'] + spatial_cols
        X = combined_df[feature_cols]
        y = combined_df['value']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100, learning_rate=0.1, max_depth=5)
        model.fit(X_train, y_train)
        
        # 4. Save New Model
        model_name = factor_name.split('_')[0] if "price" not in factor_name else "price" # Handles "air", "flood", "house_price" mapping
        if factor_name == "house_price": model_name = "price"
        elif factor_name == "flood_risk": model_name = "flood"
        else: model_name = "aqi"
        
        model_path = os.path.join("models", f"model_{model_name}.json")
        model.save_model(model_path)
        
        # 5. Archive files & Update Master
        combined_df.to_csv(master_csv, index=False)
        for f in new_files:
            shutil.move(f, os.path.join("archived_datasets", os.path.basename(f)))
            
        # 6. LIVE RELOAD: Reload RAM and wipe the temporary offset!
        global dynamic_offsets
        load_all_models()
        dynamic_offsets[factor_name][target_barangay] = 0
        
        print(f"✅ [ASYNC TASK] Retraining Complete! AI Brain Updated.")
        
    except Exception as e:
        print(f"❌ [ASYNC TASK FAILED]: {str(e)}")


# =====================================================================
# 5. DATA INGESTION & ADMIN ENDPOINTS
# =====================================================================

@app.post("/public/submit-csv")
async def public_submit_csv(
    barangay: str = Form(...), factor: str = Form(...),
    contributor_name: str = Form(...), file: UploadFile = File(...)
):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        if df.empty or 'value' not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain a 'value' column.")
            
        upload_id = str(uuid.uuid4())
        pending_queue[upload_id] = {
            "id": upload_id, "barangay": barangay, "factor": factor,
            "contributor": contributor_name, "filename": file.filename,
            "status": "Pending Review", "data": df.to_dict() 
        }
        return {"status": "success", "message": "File submitted to Admin for review!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/queue")
def get_pending_queue(is_admin: bool = Depends(verify_admin)):
    return [
        {"id": k, "barangay": v["barangay"], "factor": v["factor"], 
         "contributor": v["contributor"], "filename": v["filename"]} 
        for k, v in pending_queue.items()
    ]

@app.post("/admin/review/{upload_id}")
def admin_review(upload_id: str, background_tasks: BackgroundTasks, action: str = Form(...), is_admin: bool = Depends(verify_admin)):
    if upload_id not in pending_queue:
        raise HTTPException(status_code=404, detail="Upload not found.")
        
    entry = pending_queue[upload_id]
    
    if action == "reject":
        del pending_queue[upload_id]
        return {"message": "Rejected! File has been purged from the queue."}

    elif action == "approve":
        try:
            df = pd.DataFrame(entry["data"])
            t_factor = entry["factor"]
            t_barangay = entry["barangay"]
            
            prox = proximity_map.get(t_barangay, 5.0)
            input_base = {'year': 2025, 'proximity_km': prox}
            for col in spatial_cols:
                input_base[col] = 1 if f"barangay_{t_barangay}" == col else 0
            df_input = pd.DataFrame([input_base])[features]
            
            if t_factor == "house_price": base_pred = float(model_price.predict(df_input)[0])
            elif t_factor == "flood_risk": base_pred = float(model_flood.predict(df_input)[0])
            else: base_pred = float(model_aqi.predict(df_input)[0])
                
            uploaded_avg = float(df['value'].mean())
            LEARNING_RATE = 0.5 
            merged_value = (base_pred * (1.0 - LEARNING_RATE)) + (uploaded_avg * LEARNING_RATE)
                
            offset = merged_value - base_pred
            current_offset = dynamic_offsets[t_factor].get(t_barangay, 0)
            dynamic_offsets[t_factor][t_barangay] = current_offset + offset
            
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"approved_datasets/{timestamp}_{t_factor}_{t_barangay.replace(' ', '')}.csv"
            df.to_csv(filename, index=False)
            del pending_queue[upload_id]

            # 🔥 THE MAGIC: We tell FastAPI to start retraining the model in the background
            # while instantly sending the success message back to the user's browser!
            background_tasks.add_task(background_retrain_task, t_factor, t_barangay)
            
            return {"message": f"Approved! UI updated instantly. AI is retraining in the background."}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Backend Math Error: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Invalid action parameter.")

@app.get("/admin/approved-files")
def get_approved_files(is_admin: bool = Depends(verify_admin)):
    files = []
    
    # Scan both directories: 'approved' (currently training) and 'archived' (finished training)
    for directory in ["approved_datasets", "archived_datasets"]:
        if os.path.exists(directory):
            for filename in os.listdir(directory):
                if filename.endswith(".csv"):
                    parts = filename.replace('.csv', '').split('_')
                    if len(parts) >= 4:
                        files.append({
                            "filename": filename,
                            "timestamp": parts[0] + "_" + parts[1],
                            "factor": parts[2] if len(parts) == 4 else parts[2] + "_" + parts[3], 
                            "barangay": parts[-1]
                        })
    
    # Sort by timestamp, newest files at the top
    files.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return files

@app.delete("/admin/approved-files/{filename}")
def delete_approved_file(filename: str, is_admin: bool = Depends(verify_admin)):
    # 1. Point the scanner to the Archive where the merged files now live
    file_path = os.path.join("archived_datasets", filename)
    
    # 2. Fallback: Check if it's currently in the middle of background training
    if not os.path.exists(file_path):
        file_path = os.path.join("approved_datasets", filename)
        
    # 3. If it doesn't exist in either place, throw a 404
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found in Matrix Memory.")
        
    try:
        # 4. Physically delete the file from the hard drive
        os.remove(file_path)
        
        # 5. Tell React it worked so the UI removes it from the screen
        return {"message": "Purge Protocol Engaged. File permanently deleted from Matrix Memory logs."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/admin/queue/{upload_id}/data")
def get_pending_data(upload_id: str, is_admin: bool = Depends(verify_admin)):
    if upload_id not in pending_queue:
        raise HTTPException(status_code=404, detail="Upload not found.")
    df = pd.DataFrame(pending_queue[upload_id]["data"])
    return df.to_dict(orient="records")

@app.get("/admin/approved-files/{filename}/data")
def get_approved_data(filename: str, is_admin: bool = Depends(verify_admin)):
    file_path = os.path.join("archived_datasets", filename) # Redirected to archive
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    df = pd.read_csv(file_path)
    return df.to_dict(orient="records")

# =====================================================================
# 6. PREDICTION ENDPOINTS (STUDIO & ANALYSIS)
# =====================================================================

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
        input_base = {'year': xgboost_year, 'proximity_km': prox}
        for col in spatial_cols:
            input_base[col] = 1 if f"barangay_{brgy}" == col else 0
            
        df_input = pd.DataFrame([input_base])[features]
        
        base_aqi = float(model_aqi.predict(df_input)[0])
        base_flood = float(model_flood.predict(df_input)[0])
        base_price = float(model_price.predict(df_input)[0])
        
        base_aqi += dynamic_offsets["air_quality"].get(brgy, 0)
        base_flood += dynamic_offsets["flood_risk"].get(brgy, 0)
        base_price += dynamic_offsets["house_price"].get(brgy, 0)
        
        base_aqi = max(0.0, base_aqi)
        base_flood = max(0.0, base_flood)
        base_price = max(100000.0, base_price)
        
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
        
        input_base = {'year': xgboost_year, 'proximity_km': prox}
        for col in spatial_cols:
            input_base[col] = 1 if f"barangay_{target_barangay}" == col else 0
            
        df_input = pd.DataFrame([input_base])[features]
        
        base_aqi = float(model_aqi.predict(df_input)[0])
        base_flood = float(model_flood.predict(df_input)[0])
        base_price = float(model_price.predict(df_input)[0])
        
        base_aqi += dynamic_offsets["air_quality"].get(target_barangay, 0)
        base_flood += dynamic_offsets["flood_risk"].get(target_barangay, 0)
        base_price += dynamic_offsets["house_price"].get(target_barangay, 0)
        
        base_aqi = max(0.0, base_aqi)
        base_flood = max(0.0, base_flood)
        base_price = max(100000.0, base_price)
        
        p_aqi = base_aqi + (years_into_future * 0.5)
        p_flood = base_flood + (years_into_future * 0.02)
        p_price = base_price * ((1 + 0.06) ** years_into_future)
        
        predictions_list.append({
            "Timeline": "Current" if offset == 0 else f"+{offset} Years",
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