import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// THE FIX: Standardize Leaflet's default icons (sometimes they break in React builds)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ==========================================================
// 1. CONFIGURATION: Precision Coordinates for Tanza
// ==========================================================
// Real Lat/Lng coordinates for Tanza, Cavite
const brgyLatLng: Record<string, [number, number]> = {
    'Amaya': [14.3871, 120.8412], 'Bagtas': [14.3362, 120.8585],
    'Biga': [14.3637, 120.8470], 'Biwas': [14.4031, 120.8513],
    'Bucal': [14.3860, 120.8628], 'Bunga': [14.3438, 120.8686], 
    'Calibuyo': [14.3591, 120.8068], 'Capipisa': [14.3512, 120.7896],
    'Daang Amaya': [14.3914, 120.8526], 'Halayhay': [14.3686, 120.8126],
    'Julugan': [14.4042, 120.8448], 'Lambingan': [14.3451, 120.8054],
    'Mulawin': [14.3835, 120.8528], 'Paradahan': [14.3207, 120.8585],
    'Poblacion': [14.4008, 120.8576], 'Punta': [14.3569, 120.8599], 
    'Sahud Ulan': [14.3618, 120.8241], 'Sanja Mayor': [14.3735, 120.8547],  
    'Santol': [14.3759, 120.8700], 'Tanauan': [14.2937, 120.8298],
    'Tres Cruses': [14.3351, 120.8298]
};

// The center point of Tanza town
const TANZA_CENTER: [number, number] = [14.3700, 120.8500];

// The Bounding Box: [SouthWest, NorthEast] 
// This locks the map so users cannot scroll away from Tanza
const TANZA_BOUNDS: [[number, number], [number, number]] = [
    [14.3100, 120.7800], // Southwest Corner
    [14.4400, 120.9200]  // Northeast Corner
];

// ==========================================================
// 2. COMPONENT
// ==========================================================
const TanzaDarkMap = ({ predictions = [] }: { predictions: any[] }) => {
    return (
        <MapContainer 
            center={TANZA_CENTER} 
            zoom={13} 
            minZoom={12} // Prevents user from zooming out too far to see Manila
            maxBounds={TANZA_BOUNDS} // Locks the camera to our bounding box
            maxBoundsViscosity={1.0} // Makes the boundary wall solid (no bouncing past it)
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
        >
            {/* ULTIMATE DARK MODE FLEX: CartoDB Dark Matter Tiles */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* 4. Map the Predictions: Loop through top 5 and render spatial circles! */}
            {predictions.map((loc) => {
                const coords = brgyLatLng[loc.name];
                
                // If the backend sends a name that isn't in our dictionary, skip it safely
                if (!coords) return null; 

                return (
                    <React.Fragment key={loc.rank}>
                        <Circle 
                            center={coords}
                            radius={250} // Radius in meters
                            pathOptions={{
                                color: loc.color,
                                fillColor: loc.color,
                                fillOpacity: 0.35,
                                weight: 2
                            }}
                        />
                        
                        {/* Invisible Marker to anchor the hover/click Popup details */}
                        <Marker position={coords} opacity={0}>
                            <Popup minWidth={150}>
                                <div style={{ color: '#111827', fontWeight: 'bold', textShadow: 'none', fontFamily: 'sans-serif' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.2rem', color: loc.color }}>#{loc.rank}</span>
                                        <span style={{ fontSize: '0.8rem', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                                            {loc.match}% Match
                                        </span>
                                    </div>
                                    <h3 style={{ margin: '8px 0 5px 0' }}>Barangay {loc.name}</h3>
                                    <div style={{ fontSize: '0.8rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span>🏡 Value: {loc.model_value}%</span>
                                        <span>💰 Price: {loc.price}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                );
            })}

        </MapContainer>
    );
};

export default TanzaDarkMap;