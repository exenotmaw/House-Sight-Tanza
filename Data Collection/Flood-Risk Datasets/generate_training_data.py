import geopandas as gpd
import pandas as pd
import requests
import time
import re
import os

# --- SETTINGS ---
SHP_PATH = r'Tanza_shapefile\gadm41_PHL_3.shp' 
CSV_PATH = 'flood_risk_data.csv' 
START_DATE = "20160101"
END_DATE = "20260420"

# --- HELPER FUNCTIONS ---
def get_mother_name(name):
    """
    Specifically targets the Tanza GADM structure:
    1. Converts 'Barangay I/II/III/IV' to 'Poblacion'
    2. Strips suffixes from 'Julugan', 'Amaya', etc.
    """
    # Force string for safety
    name = str(name).strip()
    
    # SPECIAL CASE: Tanza's town center
    # If it's 'Barangay' followed by a Roman numeral or digit, it's Poblacion
    if re.match(r'^Barangay\s+([IVXLCDM]+|\d+)$', name, flags=re.IGNORECASE):
        return "Poblacion"
        
    # GENERAL CASE: Strip suffixes (e.g., 'Julugan VIII' -> 'Julugan')
    # This removes a space followed by Roman numerals or digits at the end
    name = re.sub(r'\s+([IVXLCDM]+|\d+)$', '', name, flags=re.IGNORECASE)
    
    # Remove 'Barangay' or 'Bgy' prefix if it exists elsewhere
    name = re.sub(r'^(Barangay|Bgy\.?)\s+', '', name, flags=re.IGNORECASE)
    
    return name.strip()

def fetch_rainfall(lat, lon):
    url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR&community=AG&longitude={lon}&latitude={lat}&start={START_DATE}&end={END_DATE}&format=JSON"
    try:
        r = requests.get(url, timeout=15)
        if r.status_code == 200:
            data = r.json()['properties']['parameter']['PRECTOTCORR']
            df = pd.DataFrame(list(data.items()), columns=['Date', 'Rainfall_mm'])
            df['Date'] = pd.to_datetime(df['Date'])
            return df
    except Exception as e:
        print(f"Error fetching NASA data: {e}")
    return None

# --- LOAD & PROCESS GEOMETRY ---
print("Reading GADM Shapefile...")
gdf = gpd.read_file(SHP_PATH)

# Filter for Tanza
tanza_gdf = gdf[gdf['NAME_2'].str.contains('Tanza', case=False, na=False)].copy()

# Create the 'Mother' name column (e.g., Julugan VIII -> Julugan)
tanza_gdf['Mother_Bgy'] = tanza_gdf['NAME_3'].apply(get_mother_name)

print("Dissolving sub-barangays into mother units...")
# Dissolve merges geometries; reset_index keeps 'Mother_Bgy' as a column
tanza_dissolved = tanza_gdf.dissolve(by='Mother_Bgy').reset_index()

# Calculate Centroids (Using UTM 51N for accuracy, then back to Lat/Lon for NASA)
tanza_dissolved = tanza_dissolved.to_crs(epsg=32651) 
tanza_dissolved['lat'] = tanza_dissolved.geometry.centroid.to_crs(epsg=4326).y
tanza_dissolved['lon'] = tanza_dissolved.geometry.centroid.to_crs(epsg=4326).x

# --- LOAD CSV DATA ---
user_stats = pd.read_csv(CSV_PATH)

# --- MATCHING & FETCHING LOOP ---
all_records = []

# Now we iterate through the mother barangays in your CSV
for _, bgy_row in user_stats.iterrows():
    csv_name = str(bgy_row['Barangay']).strip()
    
    # Match the CSV name against our new Mother_Bgy column
    match = tanza_dissolved[tanza_dissolved['Mother_Bgy'].str.contains(csv_name, case=False, na=False)]
    
    if not match.empty:
        target = match.iloc[0]
        print(f"Matched: '{csv_name}' -> Mother Barangay: '{target['Mother_Bgy']}'")
        
        rain_df = fetch_rainfall(target['lat'], target['lon'])
        if rain_df is not None:
            rain_df['Barangay'] = target['Mother_Bgy']
            rain_df['Static_Score'] = bgy_row['Total Score']
            
            # Feature Engineering: 3-day rolling sum
            rain_df['Rain_3Day_Sum'] = rain_df['Rainfall_mm'].rolling(window=3).sum()
            
            all_records.append(rain_df)
        
        time.sleep(0.6) # Gentle delay for API rate limits
    else:
        print(f"!!! No match found for mother barangay: {csv_name}")

# --- SAVE OUTPUT ---
if all_records:
    final_df = pd.concat(all_records)
    final_df = final_df.sort_values(['Barangay', 'Date'])
    final_df.to_csv('XGBOOST_BULK_DATA.csv', index=False)
    print(f"\nDONE! Created XGBOOST_BULK_DATA.csv with {final_df['Barangay'].nunique()} unique locations.")
else:
    print("\nProcess failed: No data records were compiled.")