import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Compass, Library, ScrollText, Scale, Hourglass, Star, Loader2, Sparkles, Map } from 'lucide-react';
// IMPORT YOUR NEW MAP HERE:
import TanzaDarkMap from './TanzaMap'; // Check this path matches where you saved it!

const getLabel = (value: number) => {
  if (value < 33) return 'Low';
  if (value < 66) return 'Medium';
  return 'High';
};

// Keeping original map marker colors for clear data visualization, 
// but we will mute the UI colors to match the Academia theme.
const rankColors = ['#10b981', '#84cc16', '#eab308', '#f97316', '#ef4444'];

const Studio: React.FC = () => {
  const navigate = useNavigate();

  const [years, setYears] = useState(5);
  const [floodRisk, setFloodRisk] = useState(50);
  const [airQuality, setAirQuality] = useState(50);
  const [housePrice, setHousePrice] = useState(50);
  const [proximity, setProximity] = useState(50);

  const [activeFactors, setActiveFactors] = useState({
    floodRisk: true,
    airQuality: true,
    housePrice: true,
    proximity: true
  });

  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsPredicting(true);
      try {
        const response = await fetch('https://house-sight-tanza.onrender.com/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            years: years, 
            flood_risk: activeFactors.floodRisk ? floodRisk : -1,
            air_quality: activeFactors.airQuality ? airQuality : -1,
            house_price: activeFactors.housePrice ? housePrice : -1,
            proximity: activeFactors.proximity ? proximity : -1
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch from backend");

        const locationArray = await response.json();

        // THE FIX: Strict sorting algorithm added here!
        const formattedLocations = locationArray
          .map((loc: any) => ({
            name: loc.name,
            price: loc.price,
            aqi: loc.raw_aqi,      
            flood: loc.raw_flood,   
            prox: loc.raw_prox,     
            match: loc.match,
            model_value: loc.model_value
          }))
          .sort((a: any, b: any) => b.match - a.match) // Sort highest match to lowest
          .map((loc: any, index: number) => ({
            ...loc,
            rank: index + 1,
            color: index < 5 ? rankColors[index] : '#374151'
          }));

        setAllLocations(formattedLocations);
      } catch (error) {
        console.error("Error communicating with AI Engine:", error);
      } finally {
        setIsPredicting(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPredictions();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [years, floodRisk, airQuality, housePrice, proximity, activeFactors]);

  const topLocation = allLocations.length > 0 ? allLocations[0] : null;
  const topMatchScore = topLocation ? topLocation.match : 0;
  
  // Academia Themed Context Colors (Brass for High, Faded for Med, Crimson for Low)
  const topColor = topMatchScore < 50 ? 'text-academia-accentSecondary' : topMatchScore < 80 ? 'text-academia-mutedForeground' : 'text-academia-accent';
  const topBarColor = topMatchScore < 50 ? 'bg-academia-accentSecondary' : topMatchScore < 80 ? 'bg-academia-mutedForeground' : 'bg-academia-accent';

  const topModelScore = topLocation ? topLocation.model_value : 0;
  const topModelColor = topModelScore < 50 ? 'text-academia-accentSecondary' : topModelScore < 75 ? 'text-academia-mutedForeground' : 'text-academia-accent';
  const topModelBarColor = topModelScore < 50 ? 'bg-academia-accentSecondary' : topModelScore < 75 ? 'bg-academia-mutedForeground' : 'bg-academia-accent';

  return (
    // Main wrapper relies on global CSS for background, text, and noise texture
    <div className="flex flex-col relative z-10 min-h-screen">
      <style>{`
        /* Brass slider styling */
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #C9A962;
          cursor: pointer;
          border: 2px solid #1C1714;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
        input[type=range]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #C9A962;
          cursor: pointer;
          border: 2px solid #1C1714;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
        /* Leaflet map integration styles mapped to Academia */
        .leaflet-container {
          background-color: #1C1714 !important;
          border-radius: 4px;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="border-b border-academia-border px-8 py-5 flex justify-between items-center z-20 bg-academia-bg/90 backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-3 text-academia-accent font-display tracking-widest uppercase text-sm">
          <Compass size={22} className="text-academia-accent" />
          <span>House Sight Tanza</span>
        </div>
        <div className="flex gap-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all">
            <Library size={16} /> Home
          </button>
          <button onClick={() => navigate('/studio')} className="flex items-center gap-2 text-academia-accent font-display uppercase tracking-widest text-xs hover:brightness-125 transition-all">
            <ScrollText size={16} /> Studio
          </button>
          <button onClick={() => navigate('/analysis')} className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all">
            <Scale size={16} /> Analysis
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="px-10 pt-16 pb-10 text-center max-w-4xl mx-auto w-full">
        <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-4 block">The Oracle</span>
        <h1 className="text-5xl md:text-6xl font-heading text-academia-foreground mb-4">Cartographic Studio</h1>
        <div className="ornate-divider max-w-xs mx-auto mb-6"></div>
        <p className="text-academia-mutedForeground text-lg italic">Adjust your empirical constraints below to manifest the optimal geographical coordinates.</p>
      </header>

      <main className="flex-1 px-8 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto w-full">
        
        {/* LEFT COLUMN: Controls & Stats */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          
          {/* YEAR SELECTOR */}
          <div className="bg-academia-bgAlt border border-academia-border rounded p-6 shadow-[0_4px_12px_rgba(0,0,0,0.2)] corner-flourish relative">
            {isPredicting && (
               <div className="absolute top-6 right-6 text-academia-accent flex items-center gap-2 text-[10px] font-display tracking-wider">
                 <Loader2 className="animate-spin" size={14} /> CALCULATING
               </div>
            )}
            <h2 className="font-display uppercase text-xs tracking-[0.2em] text-academia-foreground mb-1">Temporal Projection</h2>
            <p className="text-academia-mutedForeground text-sm italic mb-6">Select the future horizon</p>
            
            <div className="relative">
              <Hourglass className="absolute left-4 top-3 text-academia-accent" size={16} />
              <select 
                value={years} 
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full bg-academia-bg border border-academia-border text-academia-foreground text-sm rounded focus:ring-1 focus:ring-academia-accent focus:border-academia-accent block pl-12 p-3 outline-none appearance-none cursor-pointer hover:border-academia-accent/50 transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] font-body"
              >
                <option value={5}>V Years Hence (2030)</option>
                <option value={10}>X Years Hence (2035)</option>
                <option value={15}>XV Years Hence (2040)</option>
                <option value={20}>XX Years Hence (2045)</option>
              </select>
            </div>
          </div>

          {/* AREA FACTORS */}
          <div className="bg-academia-bgAlt border border-academia-border rounded p-6 shadow-[0_4px_12px_rgba(0,0,0,0.2)] corner-flourish flex-1">
            <h2 className="font-display uppercase text-xs tracking-[0.2em] text-academia-foreground mb-1">Empirical Factors</h2>
            <p className="text-academia-mutedForeground text-sm italic mb-8">Set desired environmental weights</p>

            <div className="space-y-8">
              {[
                { key: 'floodRisk', label: 'Flood Risk', desc: 'Lower = Minimal Inundation.', val: floodRisk, set: setFloodRisk },
                { key: 'airQuality', label: 'Air Quality', desc: 'Lower = Purest Atmosphere.', val: airQuality, set: setAirQuality },
                { key: 'housePrice', label: 'Housing Price', desc: 'Lower = Economical Valuation.', val: housePrice, set: setHousePrice },
                { key: 'proximity', label: 'Proximity to Center', desc: 'Lower = Nearest to Hub.', val: proximity, set: setProximity }
              ].map((item) => {
                
                const isActive = activeFactors[item.key as keyof typeof activeFactors];

                return (
                <div key={item.key} className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      {/* Custom Toggle */}
                      <button 
                        onClick={() => setActiveFactors({...activeFactors, [item.key]: !isActive})}
                        className={`w-10 h-5 rounded-full relative transition-colors border border-academia-border ${isActive ? 'bg-academia-accent' : 'bg-academia-muted'}`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full bg-academia-bg absolute top-[2px] transition-all shadow-sm ${isActive ? 'left-[20px]' : 'left-[4px]'}`}></div>
                      </button>
                      <label className="text-academia-foreground font-body font-medium text-base tracking-wide">{item.label}</label>
                    </div>
                    
                    {isActive && (
                      <span className="font-display text-[9px] tracking-widest px-2 py-1 rounded border border-academia-accent/30 text-academia-accent bg-academia-bg">
                        {getLabel(item.val)}
                      </span>
                    )}
                  </div>
                  
                  {/* Brass Custom Slider */}
                  <input 
                    type="range" min="0" max="100" 
                    value={item.val} 
                    onChange={(e) => item.set(Number(e.target.value))}
                    disabled={!isActive}
                    className={`w-full h-1 rounded-full appearance-none outline-none mb-2 ${isActive ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    style={{ background: isActive ? `linear-gradient(to right, #C9A962 ${item.val}%, #3D332B ${item.val}%)` : '#3D332B' }}
                  />
                  <p className="text-academia-mutedForeground text-xs italic">{isActive ? item.desc : 'Factor excluded from computation'}</p>
                </div>
              )})}
            </div>
          </div>

          {/* TOP MATCH SCORE */}
          <div className="bg-academia-bgAlt border border-academia-border rounded p-6 shadow-[0_4px_12px_rgba(0,0,0,0.2)] corner-flourish">
            <h2 className="font-display uppercase text-xs tracking-[0.2em] text-academia-foreground mb-1">Primary Match</h2>
            <p className="text-academia-mutedForeground text-sm italic mb-5">Calculated for {topLocation?.name || '...'}</p>
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-academia-accent">
                <Star size={16} />
                <span className="font-display text-[10px] tracking-widest uppercase">Target Alignment</span>
              </div>
              <span className={`${topColor} font-heading text-xl font-bold`}>
                {topMatchScore}%
              </span>
            </div>

            <div className="w-full bg-academia-bg border border-academia-border rounded-full h-2 mb-4 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
              <div 
                className={`${topBarColor} h-2 rounded-full transition-all duration-1000 ease-out`} 
                style={{ width: `${topMatchScore}%` }}
              ></div>
            </div>
          </div>

          {/* BASELINE HOUSING VALUE */}
          <div className="bg-academia-bgAlt border border-academia-border rounded p-6 shadow-[0_4px_12px_rgba(0,0,0,0.2)] corner-flourish">
            <h2 className="font-display uppercase text-xs tracking-[0.2em] text-academia-foreground mb-1">Baseline Valuation</h2>
            <p className="text-academia-mutedForeground text-sm italic mb-5">Objective score for {topLocation?.name || '...'}</p>
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-academia-accent">
                <Library size={16} />
                <span className="font-display text-[10px] tracking-widest uppercase">Housing Value</span>
              </div>
              <span className={`${topModelColor} font-heading text-xl font-bold`}>
                {topModelScore}%
              </span>
            </div>

            <div className="w-full bg-academia-bg border border-academia-border rounded-full h-2 mb-4 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
              <div 
                className={`${topModelBarColor} h-2 rounded-full transition-all duration-1000 ease-out`} 
                style={{ width: `${topModelScore}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Map & Table */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
          
          {/* MAP WRAPPER */}
          <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_8px_24px_rgba(0,0,0,0.3)] corner-flourish flex flex-col relative">
            
            <div className="flex justify-between items-end mb-6">
              <div>
                <div className="flex items-center gap-3 text-academia-foreground font-heading text-2xl mb-1">
                  <Map size={24} className="text-academia-accent"/> Cartographic Analysis
                </div>
                <p className="text-academia-mutedForeground text-sm italic">Geospatial visualization of optimal coordinates based on your directives.</p>
              </div>
              
              {/* Top 5 Legend */}
              <div className="hidden md:flex items-center gap-4 bg-academia-bg border border-academia-border px-4 py-2 rounded">
                <span className="font-display text-[9px] uppercase tracking-widest text-academia-mutedForeground">Rankings:</span>
                <div className="flex gap-3">
                  {rankColors.map((color, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full border border-academia-bg shadow-sm" style={{backgroundColor: color}}></div>
                      <span className="font-display text-[10px] text-academia-foreground">
                        {['I','II','III','IV','V'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* THE LEAFLET MAP WRAPPER - Elegant frame */}
            <div className={`w-full aspect-[4/3] lg:aspect-[16/10] bg-academia-bg border border-academia-border p-2 rounded shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] transition-opacity duration-500 ${isPredicting ? 'opacity-60 grayscale' : 'opacity-100'} z-0`}>
              <div className="w-full h-full rounded overflow-hidden">
                <TanzaDarkMap predictions={allLocations.slice(0, 5)} />
              </div>
            </div>

          </div>

          {/* LEDGER TABLE */}
          <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_4px_20px_rgba(0,0,0,0.2)] corner-flourish">
            <div className="flex items-center gap-3 text-academia-foreground font-heading text-2xl mb-2">
              <Sparkles size={20} className="text-academia-accent"/> The Municipal Ledger
            </div>
            <p className="text-academia-mutedForeground text-sm italic mb-6">Tabular ranking of the finest estates per your criteria</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-academia-border font-display text-[10px] uppercase tracking-widest text-academia-mutedForeground">
                    <th className="pb-4 pt-2 font-medium">Rank</th>
                    <th className="pb-4 pt-2 font-medium">Barangay</th>
                    <th className="pb-4 pt-2 font-medium text-center">Match Score</th>
                    <th className="pb-4 pt-2 font-medium text-center">Housing Value</th>
                    <th className="pb-4 pt-2 font-medium text-center">Air Quality</th>
                    <th className="pb-4 pt-2 font-medium text-center">Flood Risk</th>
                    <th className="pb-4 pt-2 font-medium text-center">Proximity to Center</th>
                    <th className="pb-4 pt-2 font-medium text-right">Housing Price</th>
                  </tr>
                </thead>
                <tbody className="font-body text-base">
                  {allLocations.length === 0 || isPredicting ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-academia-accent">
                        <Loader2 className="animate-spin mx-auto mb-2" size={28} />
                        <span className="font-display text-[10px] tracking-[0.2em] uppercase">Consulting the Archives...</span>
                      </td>
                    </tr>
                  ) : (
                    allLocations.slice(0, 5).map((loc) => (
                      <tr key={loc.rank} className="border-b border-academia-border/40 hover:bg-academia-bg/50 transition-colors duration-300">
                        <td className="py-4">
                          {/* Wax-seal style rank badge */}
                          <div className="w-6 h-6 rounded-full flex items-center justify-center font-display text-[10px] font-bold text-[#1C1714] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.4)]" style={{ backgroundColor: loc.color }}>
                            {['I','II','III','IV','V'][loc.rank - 1]}
                          </div>
                        </td>
                        <td className="py-4 text-academia-foreground font-medium text-lg">{loc.name}</td>
                        
                        <td className="py-4 text-center">
                           <span className={`font-semibold ${loc.match >= 80 ? "text-academia-accent" : loc.match >= 50 ? "text-academia-mutedForeground" : "text-academia-accentSecondary"}`}>
                              {loc.match}% 
                           </span>
                        </td>

                        <td className="py-4 text-center">
                           <span className={`font-semibold ${loc.model_value >= 75 ? "text-academia-accent" : loc.model_value >= 50 ? "text-academia-mutedForeground" : "text-academia-accentSecondary"}`}>
                              {loc.model_value}% 
                           </span>
                        </td>
                        
                        <td className="py-4 text-academia-mutedForeground text-center">{loc.aqi ?? '-'}</td>
                        <td className="py-4 text-academia-mutedForeground text-center">{loc.flood ?? '-'}</td>
                        <td className="py-4 text-academia-mutedForeground text-center">{loc.prox ? `${loc.prox} km` : '-'}</td>
                        <td className="py-4 text-right text-academia-accent font-semibold">{loc.price}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Studio;