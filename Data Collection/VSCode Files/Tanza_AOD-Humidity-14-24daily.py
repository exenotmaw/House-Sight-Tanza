import requests
import pandas as pd
import time

def fetch_daily_environmental_data(lat, lon, location_name):
    url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": "AOD_55,RH2M",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": "20140101",
        "end": "20241231",
        "format": "JSON"
    }
    
    try:
        response = requests.get(url, params=params, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        # Extract the date-indexed dictionaries
        aod_dict = data['properties']['parameter']['AOD_55']
        rh_dict = data['properties']['parameter']['RH2M']
        
        # Convert to a list of records
        daily_records = []
        for date_str in aod_dict.keys():
            daily_records.append({
                "location": location_name,
                "date": date_str,
                "aod": aod_dict[date_str] if aod_dict[date_str] != -999 else None,
                "humidity": rh_dict[date_str] if rh_dict[date_str] != -999 else None
            })
        return daily_records
    except Exception as e:
        print(f"Error fetching {location_name}: {e}")
        return []

# --- Main Logic ---
input_df = pd.read_csv("Tanza_Coordinates.csv")
all_daily_data = []

print("Starting 10-year daily data pull for Tanza...")

for _, row in input_df.iterrows():
    print(f"Fetching daily history for {row['location']}...")
    records = fetch_daily_environmental_data(row['latitude'], row['longitude'], row['location'])
    all_daily_data.extend(records)
    time.sleep(1.5) # NASA servers prefer a small gap

# Create the giant historical dataframe
full_df = pd.DataFrame(all_daily_data)

# Save for your analysis
full_df.to_csv("Tanza_AOD-Humidity-14-24daily.csv", index=False)
print(f"Done! Saved {len(full_df)} daily records.")