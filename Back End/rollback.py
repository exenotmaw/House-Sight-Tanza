import pandas as pd
import xgboost as xgb
import os

print("⚠️ INITIATING MATRIX ROLLBACK...")

# 1. Load the Cleaned Textbook
master_csv = "master_house_price.csv"
if not os.path.exists(master_csv):
    print("Error: Could not find master_house_price.csv")
    exit()

df = pd.read_csv(master_csv)

# 2. Rebuild the Spatial Matrix (One-Hot Encoding)
proximity_map = {
    'Amaya': 1.8, 'Bagtas': 6.9, 'Biga': 4.8, 'Biwas': 2.1, 'Bucal': 1.7, 
    'Bunga': 7.0, 'Calibuyo': 6.8, 'Capipisa': 9.0, 'Daang Amaya': 0.8,
    'Halayhay': 6.1, 'Julugan': 3.0, 'Lambingan': 10.4, 'Mulawin': 1.5, 
    'Paradahan': 8.9, 'Poblacion': 0.6, 'Punta': 4.4, 'Sahud Ulan': 5.9, 
    'Sanja Mayor': 2.5, 'Santol': 3.0, 'Tanauan': 17.6, 'Tres Cruses': 9.6
}
all_barangays = sorted(list(proximity_map.keys()))

for brgy in all_barangays:
    if brgy == 'Amaya': continue # Amaya is the baseline
    col_name = f"barangay_{brgy}"
    if 'barangay' in df.columns:
        df[col_name] = (df['barangay'] == brgy).astype(int)
    elif col_name not in df.columns:
        df[col_name] = 0

spatial_cols = [f"barangay_{b}" for b in all_barangays if b != 'Amaya']
features = ['year', 'proximity_km'] + spatial_cols

X = df[features]
y = df['value']

# 3. Train a fresh, clean brain
print("🧠 Retraining AI on Clean Data...")
model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100, learning_rate=0.1, max_depth=5)
model.fit(X, y)

# 4. Overwrite the corrupted brain
model.save_model("models/model_price.json")
print("✅ ROLLBACK COMPLETE! The AI has forgotten the bad data.")