import os
import glob
import shutil
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_absolute_error

# =====================================================================
# 1. SYSTEM ARCHITECTURE & STATE
# =====================================================================
proximity_map = {
    'Amaya': 1.8, 'Bagtas': 6.9, 'Biga': 4.8, 'Biwas': 2.1, 'Bucal': 1.7, 
    'Bunga': 7.0, 'Calibuyo': 6.8, 'Capipisa': 9.0, 'Daang Amaya': 0.8,
    'Halayhay': 6.1, 'Julugan': 3.0, 'Lambingan': 10.4, 'Mulawin': 1.5, 
    'Paradahan': 8.9, 'Poblacion': 0.6, 'Punta': 4.4, 'Sahud Ulan': 5.9, 
    'Sanja Mayor': 2.5, 'Santol': 3.0, 'Tanauan': 17.6, 'Tres Cruses': 9.6
}

all_barangays = sorted(list(proximity_map.keys()))
spatial_cols = [f"barangay_{b}" for b in all_barangays if b != 'Amaya']

# These MUST match the exact features your api.py expects
EXPECTED_FEATURES = ['year', 'proximity_km'] + spatial_cols

def prepare_dataframe(df, factor_name):
    """Converts the raw dataset into the exact mathematical format XGBoost needs."""
    print(f"🔧 Engineering features for {factor_name}...")
    
    # Ensure standard naming from the Admin CSV
    if 'year_recorded' in df.columns:
        df = df.rename(columns={'year_recorded': 'year'})
    
    if 'barangay' not in df.columns:
        print("⚠️ Warning: 'barangay' column missing. Skipping dataset.")
        return pd.DataFrame()

    df['proximity_km'] = df['barangay'].map(proximity_map)
    
    # Create the One-Hot Encoding for Barangays (Spatial Columns)
    for col in spatial_cols:
        target_brgy = col.replace('barangay_', '')
        df[col] = (df['barangay'] == target_brgy).astype(int)
        
    final_cols = EXPECTED_FEATURES + ['value']
    return df[final_cols].dropna()

def retrain_model(factor_name, model_filename):
    print(f"\n=======================================================")
    print(f"🚀 INITIATING RETRAINING PIPELINE FOR: {factor_name.upper()}")
    print(f"=======================================================")
    
    # 1. Check for new files. IF EMPTY, EXIT GRACEFULLY.
    search_pattern = f"approved_datasets/*_{factor_name}_*.csv"
    new_files = glob.glob(search_pattern)
    
    if not new_files:
        print(f"✅ No new data found for {factor_name}. Current model remains active.")
        return

    # 2. Extract and concatenate new data
    df_list = []
    for file in new_files:
        # Extract the barangay name from the filename created by api.py
        basename = os.path.basename(file).replace('.csv', '')
        parts = basename.split('_')
        if len(parts) >= 3:
            barangay_name = parts[-1]
            temp_df = pd.read_csv(file)
            temp_df['barangay'] = barangay_name 
            df_list.append(temp_df)
            
    if not df_list:
        return
        
    new_data = pd.concat(df_list, ignore_index=True)
    
    # 3. MERGE HISTORY WITH FUTURE
    print("📂 Loading Historical Master Dataset...")
    master_filename = f"master_{factor_name}.csv"
    
    try:
        # Load your specific master history file
        historical_data = pd.read_csv(master_filename) 
        
        # Merge the old history with the brand new approved data
        combined_data = pd.concat([historical_data, new_data], ignore_index=True)
        print(f"🔗 Successfully merged! Total records: {len(combined_data)}")
        
        # Overwrite the old master file to establish the new history for NEXT month!
        combined_data.to_csv(master_filename, index=False)
        
    except FileNotFoundError:
        print(f"⚠️ CRITICAL ERROR: '{master_filename}' not found.")
        print("⚠️ You must run your setup script to generate the master files first.")
        return
    
    # 4. Prepare data for ML
    processed_df = prepare_dataframe(combined_data, factor_name)
    if processed_df.empty:
        return

    # 5. Train / Test Split (80% Train, 20% Test)
    print("🔀 Performing 80/20 Train-Test Split...")
    X = processed_df[EXPECTED_FEATURES]
    y = processed_df['value']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 6. Auto-Tune Hyperparameters (GridSearchCV)
    print("🧠 Initiating GridSearchCV for Auto-Tuning...")
    if factor_name == "house_price":
        param_grid = {'max_depth': [3, 4, 5], 'learning_rate': [0.01, 0.05, 0.1], 'n_estimators': [200, 300]}
        grid_search = GridSearchCV(
            xgb.XGBRegressor(objective='reg:squarederror', random_state=42), 
            param_grid, cv=3, scoring='neg_mean_absolute_error'
        )
    else:
        # Slightly smaller grid for environment variables
        param_grid = {'max_depth': [3, 4], 'learning_rate': [0.01, 0.05], 'n_estimators': [100, 150]}
        grid_search = GridSearchCV(
            xgb.XGBRegressor(random_state=42), 
            param_grid, cv=3, scoring='neg_mean_absolute_error'
        )

    # Let the AI find the perfect settings
    grid_search.fit(X_train, y_train)
    model = grid_search.best_estimator_
    print(f"✨ Perfect hyperparameters found: {grid_search.best_params_}")
    
    # Optional: Run a final fit if you want to track learning curves like your original code did
    model.fit(X_train, y_train, eval_set=[(X_train, y_train), (X_test, y_test)], verbose=False)
    
    # Evaluate Accuracy against the blind 20% test set
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    print(f"📊 Validation Complete. Mean Absolute Error (MAE): {mae:.2f}")
    
    # 7. Save the new model to the "models" folder
    os.makedirs("models", exist_ok=True)
    model_path = f"models/{model_filename}"
    model.save_model(model_path)
    print(f"💾 New engine deployed to: {model_path}")
    
    # 8. Archive the processed CSV files securely
    os.makedirs("archived_datasets", exist_ok=True)
    for file in new_files:
        shutil.move(file, os.path.join("archived_datasets", os.path.basename(file)))
    print("📁 Raw data securely archived.")

if __name__ == "__main__":
    print("\n[STARTING HOUSE SIGHT TANZA BATCH MLOPS PIPELINE]\n")
    
    retrain_model("house_price", "model_price.json")
    retrain_model("flood_risk", "model_flood.json")
    retrain_model("air_quality", "model_aqi.json")
    
    print("\n✅ PIPELINE COMPLETE. READY FOR GITHUB PUSH.")