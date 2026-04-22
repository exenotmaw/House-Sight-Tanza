import requests
import pandas as pd
import time

def get_nasa_averages(lat, lon, start_date="20140101", end_date="20241231"):
    """
    Fetches 10 years of AOD and Humidity data from NASA POWER.
    Returns the average values while ignoring missing data (-999).
    """
    url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": "AOD_55,RH2M",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": start_date,
        "end": end_date,
        "format": "JSON"
    }
    
    try:
        # Increase timeout because 10 years of daily data is a large request
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Get parameter dictionaries
        records = data['properties']['parameter']
        
        # Calculate Average AOD (Air Quality)
        aod_vals = [v for v in records['AOD_55'].values() if v != -999]
        avg_aod = sum(aod_vals) / len(aod_vals) if aod_vals else 0
        
        # Calculate Average Relative Humidity
        rh_vals = [v for v in records['RH2M'].values() if v != -999]
        avg_rh = sum(rh_vals) / len(rh_vals) if rh_vals else 0
        
        return avg_aod, avg_rh

    except Exception as e:
        print(f"  Warning: Could not fetch data for {lat}, {lon}. Error: {e}")
        return None, None

# --- Main Execution ---

# 1. Load your specific Tanza CSV
input_filename = "Tanza_Coordinates.csv"
output_filename = "Tanza_AOD-Humidity-14-24avg.csv"

try:
    df = pd.read_csv(input_filename)
    print(f"Successfully loaded {len(df)} locations from {input_filename}")
except FileNotFoundError:
    print(f"Error: Could not find '{input_filename}'. Make sure it's in the same folder.")
    exit()

# 2. Storage for results
aod_results = []
rh_results = []

print(f"\nStarting NASA data pull (2014-2024). This will take about 1-2 minutes...")

for index, row in df.iterrows():
    # Use 'location' from your CSV for the print message
    place = row['location']
    print(f"[{index+1}/{len(df)}] Processing {place}...")
    
    aod, rh = get_nasa_averages(row['latitude'], row['longitude'])
    
    aod_results.append(aod)
    rh_results.append(rh)
    
    # Wait 1 second between requests to be polite to NASA's server
    time.sleep(1)

# 3. Add results to the dataframe
df['avg_aod_10yr'] = aod_results
df['avg_humidity_10yr'] = rh_results

# 4. Save to new file
df.to_csv(output_filename, index=False)

print("\n" + "="*30)
print(f"COMPLETED!")
print(f"Results saved to: {output_filename}")
print("="*30)
print(df.head())