import geopandas as gpd
import pandas as pd
import re

# --- SETTINGS ---
SHP_PATH = r'Tanza_shapefile\Tanza_shapefile.shp'

# --- LOAD AND AGGREGATE ---
gdf = gpd.read_file(SHP_PATH)
tanza_gdf = gdf[gdf['NAME_2'].str.contains('Tanza', case=False, na=False)].copy()

def get_mother_name(name):
    """
    Removes Roman numerals, Arabic numbers, and 'Barangay' 
    to get the core name (e.g., 'Julugan VIII' -> 'Julugan')
    """
    # Remove 'Barangay' prefixes
    name = re.sub(r'^(Barangay)\s+', '', name, flags=re.IGNORECASE)
    # Remove trailing Roman numerals (I, V, X) or Arabic numbers
    # This regex looks for spaces followed by I, V, or X at the end of the string
    name = re.sub(r'\s+([IVXLCDM]+|\d+)$', '', name, flags=re.IGNORECASE)
    return name.strip()

# Apply the grouping
tanza_gdf['Mother_Bgy'] = tanza_gdf['NAME_3'].apply(get_mother_name)

# --- DISSOLVE GEOMETRIES ---
# This merges all 'Julugan' polygons into one and all 'Amaya' into one
dissolved_gdf = tanza_gdf.dissolve(by='Mother_Bgy').reset_index()

# Reproject for accurate centroid calculation
dissolved_gdf = dissolved_gdf.to_crs(epsg=32651) 
dissolved_gdf['lat'] = dissolved_gdf.geometry.centroid.to_crs(epsg=4326).y
dissolved_gdf['lon'] = dissolved_gdf.geometry.centroid.to_crs(epsg=4326).x

# Check the new list
print("Aggregated Barangays ready for API:")
print(dissolved_gdf['Mother_Bgy'].tolist())