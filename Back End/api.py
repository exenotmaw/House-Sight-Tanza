from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sklearn.model_selection import train_test_split
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
        if os.path.exists("models/model_aqi.json"): model_aqi.load_model("models/model_aqi.json")
        if os.path.exists("models/model_flood.json"): model_flood.load_model("models/model_flood.json")
        if os.path.exists("models/model_price.json"): model_price.load_model("models/model_price.json")
        print("✅ Models loaded into live RAM successfully!")
    except Exception as e:
        print(f"⚠️ WARNING: Could not load models: {e}")

load_all_models()

pending_queue = {}
dynamic_offsets = {"house_price": {}, "flood_risk": {}, "air_quality": {}}

for folder in ["approved_datasets", "archived_datasets", "models"]:
    os.makedirs(folder, exist_ok=True)

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
        raise HTTPException(status_code=401, detail="Unauthorized Action.")
    return True

# =====================================================================
# 3. ASYNCHRONOUS RETRAINING ENGINE (Runs in Background)
# =====================================================================
def background_sync_matrix(factor_name: str, target_barangay: str = None):
    print(f"\n⚙️ [ASYNC TASK] Synchronizing {factor_name.upper()} Matrix...")
    master_csv = f"master_{factor_name}.csv"
    base_csv = f"base_{factor_name}.csv"
    
    try:
        if not os.path.exists(base_csv) and os.path.exists(master_csv):
            shutil.copy(master_csv, base_csv)
            print("🔒 Locked original data into a pristine Base file.")
            
        if not os.path.exists(base_csv): return
            
        combined_df = pd.read_csv(base_csv)
        archive_files = glob.glob(f"archived_datasets/*_{factor_name}_*.csv")
        
        if archive_files:
            new_dfs = [pd.read_csv(f) for f in archive_files]
            combined_df = pd.concat([combined_df] + new_dfs, ignore_index=True)
        
        # 🔥 AUTO-MAPPER FIX: Lowercase all columns to prevent case-sensitive crashes
        combined_df.columns = [col.lower().strip() for col in combined_df.columns]
        
        # 🔥 AUTO-MAPPER FIX: Translate user columns into AI 'value' columns
        rename_map = {'price_php': 'value', 'flood_risk': 'value', 'aqi': 'value'}
        combined_df = combined_df.rename(columns=rename_map)
        
        # 🔥 AUTO-MAPPER FIX: Inject missing proximity_km for Flood and AQI files!
        if 'proximity_km' not in combined_df.columns and 'barangay' in combined_df.columns:
            combined_df['proximity_km'] = combined_df['barangay'].map(proximity_map)
            
        # One-Hot Encode Spatial Data
        for brgy in all_barangays:
            if brgy == 'Amaya': continue
            col_name = f"barangay_{brgy}"
            combined_df[col_name] = (combined_df['barangay'] == brgy).astype(int) if 'barangay' in combined_df.columns else 0
                
        # Train Model
        X = combined_df[features]
        y = combined_df['value']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=120, learning_rate=0.05, max_depth=5)
        model.fit(X_train, y_train)
        
        # Re-capitalize columns before saving the snapshot so it looks nice for the admin
        export_df = combined_df.rename(columns={'value': factor_name.replace('house_', '').capitalize()})
        export_df.to_csv(master_csv, index=False)
        
        model_name = "price" if "price" in factor_name else ("flood" if "flood" in factor_name else "aqi")
        model.save_model(os.path.join("models", f"model_{model_name}.json"))
            
        global dynamic_offsets
        load_all_models()
        if target_barangay: dynamic_offsets[factor_name][target_barangay] = 0
        else: dynamic_offsets[factor_name] = {b: 0 for b in all_barangays}
        
        print(f"✅ AI Brain Healed!")
        
    except Exception as e:
        print(f"❌ [ASYNC TASK FAILED]: {str(e)}")

# =====================================================================
# 4. DATA INGESTION & ADMIN ENDPOINTS
# =====================================================================

@app.post("/public/submit-csv")
async def public_submit_csv(
    barangay: str = Form(...), factor: str = Form(...),
    contributor_name: str = Form(...), file: UploadFile = File(...)
):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Format columns safely before it enters the queue
        df.columns = [col.lower().strip() for col in df.columns]
        df = df.rename(columns={'price_php': 'value', 'flood_risk': 'value', 'aqi': 'value'})
        
        if df.empty or 'value' not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain a valid target column (Price_PHP, AQI, Flood_Risk, or value).")
            
        upload_id = str(uuid.uuid4())
        pending_queue[upload_id] = {
            "id": upload_id, "barangay": barangay, "factor": factor,
            "contributor": contributor_name, "filename": file.filename,
            "data": df.to_dict() 
        }
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/queue")
def get_pending_queue(is_admin: bool = Depends(verify_admin)):
    return [{"id": k, "barangay": v["barangay"], "factor": v["factor"], "contributor": v["contributor"], "filename": v["filename"]} for k, v in pending_queue.items()]

@app.post("/admin/review/{upload_id}")
def admin_review(upload_id: str, background_tasks: BackgroundTasks, action: str = Form(...), is_admin: bool = Depends(verify_admin)):
    if upload_id not in pending_queue: raise HTTPException(status_code=404)
        
    entry = pending_queue[upload_id]
    if action == "reject":
        del pending_queue[upload_id]
        return {"message": "Rejected"}

    elif action == "approve":
        try:
            df = pd.DataFrame(entry["data"])
            t_factor, t_barangay = entry["factor"], entry["barangay"]
            
            prox = proximity_map.get(t_barangay, 5.0)
            input_base = {'year': 2025, 'proximity_km': prox}
            for col in spatial_cols: input_base[col] = 1 if f"barangay_{t_barangay}" == col else 0
            df_input = pd.DataFrame([input_base])[features]
            
            model_target = model_price if t_factor == "house_price" else (model_flood if t_factor == "flood_risk" else model_aqi)
            base_pred = float(model_target.predict(df_input)[0])
                
            uploaded_avg = float(df['value'].mean())
            offset = ((base_pred * 0.5) + (uploaded_avg * 0.5)) - base_pred
            dynamic_offsets[t_factor][t_barangay] = dynamic_offsets[t_factor].get(t_barangay, 0) + offset
            
            filename = f"archived_datasets/{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{t_factor}_{t_barangay.replace(' ', '')}.csv"
            df.to_csv(filename, index=False)
            del pending_queue[upload_id]

            background_tasks.add_task(background_sync_matrix, t_factor, t_barangay)
            return {"message": "Approved. AI is retraining."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/approved-files")
def get_approved_files(is_admin: bool = Depends(verify_admin)):
    files = []
    for d in ["approved_datasets", "archived_datasets"]:
        if os.path.exists(d):
            for f in os.listdir(d):
                if f.endswith(".csv"):
                    p = f.replace('.csv', '').split('_')
                    if len(p) >= 4: files.append({"filename": f, "timestamp": f"{p[0]}_{p[1]}", "factor": p[2] if len(p)==4 else f"{p[2]}_{p[3]}", "barangay": p[-1]})
    files.sort(key=lambda x: x["timestamp"], reverse=True)
    return files

@app.delete("/admin/approved-files/{filename}")
def delete_approved_file(filename: str, background_tasks: BackgroundTasks, is_admin: bool = Depends(verify_admin)):
    file_path = os.path.join("archived_datasets", filename)
    if not os.path.exists(file_path): file_path = os.path.join("approved_datasets", filename)
    if not os.path.exists(file_path): raise HTTPException(status_code=404)
        
    os.remove(file_path)
    factor = "house_price" if "house_price" in filename else ("flood_risk" if "flood_risk" in filename else "air_quality")
    background_tasks.add_task(background_sync_matrix, factor)
    return {"message": "Deleted. Healing brain..."}
    
@app.get("/admin/queue/{upload_id}/data")
def get_pending_data(upload_id: str, is_admin: bool = Depends(verify_admin)):
    if upload_id not in pending_queue: raise HTTPException(status_code=404)
    return pd.DataFrame(pending_queue[upload_id]["data"]).to_dict(orient="records")

@app.get("/admin/approved-files/{filename}/data")
def get_approved_data(filename: str, is_admin: bool = Depends(verify_admin)):
    if not os.path.exists(os.path.join("archived_datasets", filename)): raise HTTPException(status_code=404)
    return pd.read_csv(os.path.join("archived_datasets", filename)).to_dict(orient="records")

# =====================================================================
# 5. PREDICTION & ANALYSIS ENDPOINTS
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
def get_recommendations(req: RecommendRequest):
    tgt_year = min(2025 + req.years, 2025)
    f_years = max(0, (2025 + req.years) - 2025)
    preds = []
    
    for brgy, prox in proximity_map.items():
        base = {'year': tgt_year, 'proximity_km': prox}
        for col in spatial_cols: base[col] = 1 if f"barangay_{brgy}" == col else 0
        df_in = pd.DataFrame([base])[features]
        
        p_aqi = max(0.0, float(model_aqi.predict(df_in)[0]) + dynamic_offsets["air_quality"].get(brgy, 0)) + (f_years * 0.5)
        p_flood = max(0.0, float(model_flood.predict(df_in)[0]) + dynamic_offsets["flood_risk"].get(brgy, 0)) + (f_years * 0.02)
        p_price = max(100000.0, float(model_price.predict(df_in)[0]) + dynamic_offsets["house_price"].get(brgy, 0)) * ((1.06) ** f_years)
        
        preds.append({"barangay": brgy, "raw_aqi": p_aqi, "raw_flood": p_flood, "raw_price": p_price, "raw_prox": prox})
        
    results = []
    # Normalization code remains the same...
    min_price, max_price = min(p['raw_price'] for p in preds), max(p['raw_price'] for p in preds)
    min_flood, max_flood = min(p['raw_flood'] for p in preds), max(p['raw_flood'] for p in preds)
    min_aqi, max_aqi = min(p['raw_aqi'] for p in preds), max(p['raw_aqi'] for p in preds)
    min_prox, max_prox = min(p['raw_prox'] for p in preds), max(p['raw_prox'] for p in preds)

    for r in preds:
        v_p = ((r['raw_price'] - min_price)/(max_price - min_price)*100) if max_price!=min_price else 50
        v_f = ((r['raw_flood'] - min_flood)/(max_flood - min_flood)*100) if max_flood!=min_flood else 50
        v_a = ((r['raw_aqi'] - min_aqi)/(max_aqi - min_aqi)*100) if max_aqi!=min_aqi else 50
        v_pr = ((r['raw_prox'] - min_prox)/(max_prox - min_prox)*100) if max_prox!=min_prox else 50

        matches = []
        if req.house_price != -1: matches.append(100 - abs(req.house_price - v_p))
        if req.flood_risk != -1: matches.append(100 - abs(req.flood_risk - v_f))
        if req.air_quality != -1: matches.append(100 - abs(req.air_quality - v_a))
        if req.proximity != -1: matches.append(100 - abs(req.proximity - v_pr))

        em = sum(matches)/len(matches) if matches else 0.0
        mv = round(
            max(0, 100 - (r['raw_price']/GLOBAL_MAX_PRICE)*100)*0.4 +
            max(0, 100 - (r['raw_flood']/5)*100)*0.25 +
            max(0, 100 - (r['raw_prox']*10))*0.20 +
            max(0, 100 - (r['raw_aqi']/150)*100)*0.15
        )
        
        results.append({
            "id": r['barangay'].lower().replace(" ", "-"), "name": r['barangay'], "exact_match": em,
            "match": int(round(em)), "model_value": mv, "price": f"₱{r['raw_price']:,.0f}",
            "raw_aqi": round(r['raw_aqi'], 1), "raw_flood": round(r['raw_flood'], 2), "raw_prox": r['raw_prox']
        })
    results.sort(key=lambda x: x['exact_match'], reverse=True)
    return results

@app.post("/analyze")
def analyze_barangay(req: AnalyzeRequest):
    brgy = req.barangay
    if brgy not in proximity_map: raise HTTPException(status_code=404)

    prox = proximity_map.get(brgy, 5.0)
    preds = []
    
    for offset in [0, 5, 10, 15, 20]:
        tgt = 2025 + offset
        xg_yr, fut_yr = min(tgt, 2025), max(0, tgt - 2025)
        
        base = {'year': xg_yr, 'proximity_km': prox}
        for col in spatial_cols: base[col] = 1 if f"barangay_{brgy}" == col else 0
        df_in = pd.DataFrame([base])[features]
        
        aqi = max(0.0, float(model_aqi.predict(df_in)[0]) + dynamic_offsets["air_quality"].get(brgy, 0)) + (fut_yr * 0.5)
        flood = max(0.0, float(model_flood.predict(df_in)[0]) + dynamic_offsets["flood_risk"].get(brgy, 0)) + (fut_yr * 0.02)
        price = max(100000.0, float(model_price.predict(df_in)[0]) + dynamic_offsets["house_price"].get(brgy, 0)) * ((1.06) ** fut_yr)
        
        fs = max(0, 100 - (flood/5)*100)
        as_ = max(0, 100 - (aqi/150)*100)
        ps = max(0, 100 - ((price-GLOBAL_MIN_PRICE)/(GLOBAL_MAX_PRICE-GLOBAL_MIN_PRICE))*100)
        
        preds.append({
            "year": "Current" if offset==0 else f"+{offset} Years", 
            "model_value": round(ps*0.4 + fs*0.25 + max(0, 100-(prox*10))*0.2 + as_*0.15),
            "flood_score": round(fs), "aqi_score": round(as_), "price_score": round(ps),
            "raw_price": price, "raw_aqi": aqi, "raw_flood": flood, "raw_prox": prox
        })

    return {"barangay": brgy, "future_projections": preds}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)