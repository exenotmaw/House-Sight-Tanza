import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Compass, Hourglass, Loader2, Map, Activity, Settings2, Database } from 'lucide-react';
// IMPORT YOUR NEW MAP HERE:
import TanzaDarkMap from './TanzaMap';

// --- DESIGN SYSTEM CONSTANTS (Industrial Skeuomorphism) ---
const theme = {
  chassis: "bg-[#e0e5ec]",
  text: "text-[#2d3436]",
  textMuted: "text-[#4a5568]",
  accent: "text-[#ff4757]",
  panel: "bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]",
  recessed: "bg-[#e0e5ec] rounded-xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]",
  btnBase: "flex items-center justify-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-[0.1em] transition-all duration-150 active:translate-y-[2px]",
  btnStandard: "bg-[#e0e5ec] text-[#4a5568] rounded-xl shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] hover:text-[#ff4757]",
  btnAccent: "bg-[#ff4757] text-white rounded-xl shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.4)] active:shadow-[inset_6px_6px_12px_rgba(180,30,40,0.6),inset_-2px_-2px_4px_rgba(255,100,100,0.4)]",
};

// --- MANUFACTURING HARDWARE COMPONENTS ---
const Screw = () => (
  <div className="w-3 h-3 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" 
       style={{ background: 'radial-gradient(circle at 3px 3px, rgba(0,0,0,0.1) 1px, transparent 2px), radial-gradient(circle at 9px 9px, rgba(0,0,0,0.1) 1px, transparent 2px), #d1d9e6' }}>
  </div>
);

const LED = ({ active, color = "green" }: { active: boolean, color?: "green" | "red" | "yellow" }) => {
  const colors = {
    green: "bg-[#2ed573] shadow-[0_0_10px_2px_rgba(46,213,115,0.6)] animate-pulse",
    red: "bg-[#ff4757] shadow-[0_0_10px_2px_rgba(255,71,87,0.6)]",
    yellow: "bg-[#eccc68] shadow-[0_0_10px_2px_rgba(236,204,104,0.6)]"
  };
  return <div className={`w-2 h-2 rounded-full border border-black/10 ${active ? colors[color] : 'bg-[#a3b1c6] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]'}`} />;
};

const TapeLabel = ({ text, color = "bg-[#eccc68]" }: { text: string, color?: string }) => (
  <div className={`px-3 py-1 ${color} border border-black/10 shadow-sm skew-x-[-12deg] inline-flex items-center justify-center`}>
    <span className="font-mono text-[9px] font-black uppercase text-[#2d3436] skew-x-[12deg] tracking-widest">{text}</span>
  </div>
);

// Industrial Map Marker Colors
const rankColors = ['#ff4757', '#ffa502', '#eccc68', '#7bed9f', '#70a1ff'];

const getLabel = (value: number) => {
  if (value < 33) return 'LOW';
  if (value < 66) return 'MED';
  return 'HIGH';
};

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
    document.documentElement.classList.remove('dark'); // Force light mode
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsPredicting(true);
      try {
        const response = await fetch('https://house-sight-tanza.onrender.com/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

        const formattedLocations = locationArray
          .map((loc: any) => ({
            name: loc.name, price: loc.price, aqi: loc.raw_aqi, flood: loc.raw_flood, 
            prox: loc.raw_prox, match: loc.match, model_value: loc.model_value
          }))
          .sort((a: any, b: any) => b.match - a.match)
          .map((loc: any, index: number) => ({
            ...loc, rank: index + 1, color: index < 5 ? rankColors[index] : '#a3b1c6'
          }));

        setAllLocations(formattedLocations);
      } catch (error) {
        console.error("Error communicating with AI Engine:", error);
      } finally {
        setIsPredicting(false);
      }
    };

    const delayDebounceFn = setTimeout(() => { fetchPredictions(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [years, floodRisk, airQuality, housePrice, proximity, activeFactors]);

  const topLocation = allLocations.length > 0 ? allLocations[0] : null;
  const topMatchScore = topLocation ? topLocation.match : 0;
  const topModelScore = topLocation ? topLocation.model_value : 0;

  // Mechanical Gauge Colors
  const getGaugeColor = (score: number) => score < 50 ? '#ff4757' : score < 80 ? '#ffa502' : '#2ed573';

  return (
    <div className={`min-h-screen font-sans ${theme.chassis} ${theme.text} relative overflow-x-hidden pb-20`}>
      
      {/* MACRO-TEXTURE */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      <style>{`
        /* Industrial Fader Slider Styling */
        input[type=range] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 14px;
          border-radius: 4px;
          background: #e0e5ec;
          cursor: pointer;
          border: 1px solid #babecc;
          box-shadow: 2px 2px 4px rgba(0,0,0,0.2), -1px -1px 2px #ffffff;
          margin-top: -10px;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: #a3b1c6;
          border-radius: 4px;
          box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.5);
        }
        input[type=range]:disabled::-webkit-slider-thumb {
          background: #d1d9e6;
          box-shadow: none;
          cursor: not-allowed;
        }
        .leaflet-container {
          background-color: #d1d9e6 !important;
          border-radius: 12px;
        }
      `}</style>

      {/* NAV PANEL */}
      {/* NAV PANEL */}
      <nav className={`${theme.panel} mx-6 mt-6 px-8 py-5 flex justify-between items-center sticky top-6 z-50`}>
        
        {/* CLICKABLE BRAND LOGO */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-4 cursor-pointer group"
        >
          <div className={`${theme.recessed} p-2 flex items-center justify-center group-active:shadow-[inset_6px_6px_12px_#babecc,inset_-6px_-6px_12px_#ffffff] transition-all`}>
            <Compass size={20} className="text-[#2d3436] group-hover:text-[#ff4757] transition-colors" />
          </div>
          <h1 className="font-black tracking-widest uppercase text-xs drop-shadow-[0_1px_0_#ffffff] text-[#2d3436] group-hover:text-[#ff4757] transition-colors">
            House Sight Tanza
          </h1>
        </div>
        <div className="hidden md:flex gap-4">
          <button onClick={() => navigate('/')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}> Home</button>
          <button onClick={() => navigate('/studio')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}> Studio</button>
          <button onClick={() => navigate('/analysis')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}> Analysis</button>
          <button onClick={() => navigate('/contribute')} className={`${theme.btnBase} ${theme.btnAccent} !px-4 !py-2`}>Contribute</button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="px-10 pt-16 pb-10 text-center max-w-4xl mx-auto w-full relative z-10">
        <TapeLabel text="Interactive Module" />
        <h1 className="text-5xl md:text-6xl font-black uppercase mt-6 tracking-tight drop-shadow-[0_2px_0_#ffffff] text-[#2d3436]">
          Studio Page
        </h1>
        <p className="text-[#4a5568] text-lg font-medium italic mt-4 max-w-2xl mx-auto drop-shadow-[0_1px_0_#ffffff]">
          Adjust the physical parameters below to calculate optimal geographic coordinates based on your specifications.
        </p>
      </header>

      <main className="flex-1 px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1400px] mx-auto w-full relative z-10">
        
        {/* LEFT COLUMN: Hardware Controls & Diagnostics */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* TEMPORAL DIAL */}
          <div className={`${theme.panel} p-8 relative`}>
            <div className="absolute top-4 left-4"><Screw /></div>
            <div className="absolute top-4 right-4"><Screw /></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black uppercase text-xs tracking-widest drop-shadow-[0_1px_0_#ffffff] flex items-center gap-2">
                <Hourglass size={16} className={theme.accent}/> Years
              </h2>
              {isPredicting ? <LED active color="yellow" /> : <LED active color="green" />}
            </div>
            
            <div className={`${theme.recessed} p-2 relative`}>
              <select 
                value={years} 
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full bg-transparent font-mono font-bold text-sm text-[#2d3436] outline-none appearance-none cursor-pointer px-4 py-3"
              >
                <option value={5}>05 YEARS (2030)</option>
                <option value={10}>10 YEARS (2035)</option>
                <option value={15}>15 YEARS (2040)</option>
                <option value={20}>20 YEARS (2045)</option>
              </select>
              <Settings2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3b1c6] pointer-events-none" size={16} />
            </div>
          </div>

          {/* PHYSICAL FADERS (Factors) */}
          <div className={`${theme.panel} p-8 relative`}>
            <div className="absolute top-4 left-4"><Screw /></div>
            <div className="absolute top-4 right-4"><Screw /></div>
            <div className="absolute bottom-4 left-4"><Screw /></div>
            <div className="absolute bottom-4 right-4"><Screw /></div>

            <h2 className="font-black uppercase text-xs tracking-widest drop-shadow-[0_1px_0_#ffffff] flex items-center gap-2 mb-8">
              <Activity size={16} className={theme.accent}/> Parameter Faders
            </h2>

            <div className="space-y-10">
              {[
                { key: 'floodRisk', label: 'Flood Risk', val: floodRisk, set: setFloodRisk },
                { key: 'airQuality', label: 'Air Quality', val: airQuality, set: setAirQuality },
                { key: 'housePrice', label: 'Housing Price', val: housePrice, set: setHousePrice },
                { key: 'proximity', label: 'Proximity To City', val: proximity, set: setProximity }
              ].map((item) => {
                const isActive = activeFactors[item.key as keyof typeof activeFactors];
                return (
                <div key={item.key} className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      {/* Mechanical Toggle Switch */}
                      <button 
                        onClick={() => setActiveFactors({...activeFactors, [item.key]: !isActive})}
                        className={`w-12 h-6 rounded-full relative shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_#ffffff] transition-colors ${isActive ? 'bg-[#ff4757]' : 'bg-[#a3b1c6]'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-[#e0e5ec] absolute top-[4px] transition-all shadow-[2px_2px_4px_rgba(0,0,0,0.3)] ${isActive ? 'left-[26px]' : 'left-[4px]'}`}></div>
                      </button>
                      <label className="font-black uppercase text-xs tracking-widest drop-shadow-[0_1px_0_#ffffff]">{item.label}</label>
                    </div>
                    
                    {/* Readout LCD */}
                    <div className={`${theme.recessed} px-3 py-1 min-w-[60px] text-center`}>
                      <span className="font-mono text-[10px] font-bold text-[#2d3436]">
                        {isActive ? getLabel(item.val) : 'OFF'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Slider */}
                  <input 
                    type="range" min="0" max="100" 
                    value={item.val} 
                    onChange={(e) => item.set(Number(e.target.value))}
                    disabled={!isActive}
                    className="w-full mt-2"
                  />
                </div>
              )})}
            </div>
          </div>

          {/* DIGITAL GAUGES (Moved directly under controls) */}
          <div className="flex flex-col gap-6">
            
            {/* Match Score Gauge */}
            <div className={`${theme.panel} p-6 relative`}>
              <div className="absolute top-4 right-4"><Screw /></div>
              <h2 className="font-mono font-bold uppercase text-[10px] tracking-widest text-[#4a5568] mb-1">Target Alignment</h2>
              <p className="font-black text-sm uppercase drop-shadow-[0_1px_0_#ffffff] truncate mb-4">{topLocation?.name || 'Awaiting Data...'}</p>
              
              <div className="flex items-center gap-4">
                <div className={`${theme.recessed} flex-1 h-4 overflow-hidden p-0.5`}>
                   <div className="h-full rounded-[10px] transition-all duration-1000 shadow-sm" style={{ width: `${topMatchScore}%`, backgroundColor: getGaugeColor(topMatchScore) }}></div>
                </div>
                <span className="font-mono font-black text-xl w-16 text-right" style={{ color: getGaugeColor(topMatchScore) }}>{topMatchScore}%</span>
              </div>
            </div>

            {/* Model Value Gauge */}
            <div className={`${theme.panel} p-6 relative`}>
              <div className="absolute top-4 right-4"><Screw /></div>
              <h2 className="font-mono font-bold uppercase text-[10px] tracking-widest text-[#4a5568] mb-1">Housing Value</h2>
              <p className="font-black text-sm uppercase drop-shadow-[0_1px_0_#ffffff] truncate mb-4">{topLocation?.name || 'Awaiting Data...'}</p>
              
              <div className="flex items-center gap-4">
                <div className={`${theme.recessed} flex-1 h-4 overflow-hidden p-0.5`}>
                   <div className="h-full rounded-[10px] transition-all duration-1000 shadow-sm" style={{ width: `${topModelScore}%`, backgroundColor: getGaugeColor(topModelScore) }}></div>
                </div>
                <span className="font-mono font-black text-xl w-16 text-right" style={{ color: getGaugeColor(topModelScore) }}>{topModelScore}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Map & Table Only */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* MAP WRAPPER (CRT Display Style) */}
          <div className={`${theme.panel} p-8 relative flex flex-col`}>
            <div className="absolute top-4 left-4"><Screw /></div>
            <div className="absolute top-4 right-4"><Screw /></div>

            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="font-black uppercase text-xl tracking-tight drop-shadow-[0_1px_0_#ffffff] flex items-center gap-2">
                  <Map size={20} className={theme.accent}/> Cartographic Display
                </h2>
              </div>
              
              {/* Top 5 Legend (Plastic Pips) */}
              <div className={`${theme.recessed} hidden md:flex items-center gap-4 px-4 py-2`}>
                <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-[#4a5568]">Rank:</span>
                <div className="flex gap-3">
                  {rankColors.map((color, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.5),1px_1px_2px_rgba(0,0,0,0.3)]" style={{backgroundColor: color}}></div>
                      <span className="font-mono font-bold text-[10px] text-[#2d3436]">0{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* The Actual Map container recessed into the panel */}
            <div className={`${theme.recessed} w-full aspect-[4/3] lg:aspect-[16/9] p-2 relative transition-opacity duration-500 ${isPredicting ? 'opacity-60 grayscale' : 'opacity-100'}`}>
              <div className="w-full h-full rounded-lg overflow-hidden border border-[#babecc]/50">
                <TanzaDarkMap predictions={allLocations.slice(0, 5)} />
              </div>
              {/* Scanline overlay while loading */}
              {isPredicting && (
                <div className="absolute inset-0 pointer-events-none rounded-lg opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '100% 4px' }}></div>
              )}
            </div>
          </div>

          {/* LEDGER TABLE (Hardware Printout) */}
          <div className={`${theme.panel} p-8 relative flex-1`}>
            <div className="absolute top-4 left-4"><Screw /></div>
            <div className="absolute top-4 right-4"><Screw /></div>

            <h2 className="font-black uppercase text-xl tracking-tight drop-shadow-[0_1px_0_#ffffff] flex items-center gap-2 mb-6">
              <Database size={20} className={theme.accent}/> Data Ledger
            </h2>
            
            <div className={`${theme.recessed} p-4 overflow-x-auto`}>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#babecc]/50 font-mono text-[9px] font-black uppercase tracking-widest text-[#4a5568]">
                    <th className="pb-4 pt-2 px-2">RNK</th>
                    <th className="pb-4 pt-2 px-2">Sector</th>
                    <th className="pb-4 pt-2 px-2 text-center">Match</th>
                    <th className="pb-4 pt-2 px-2 text-center">Value</th>
                    <th className="pb-4 pt-2 px-2 text-center">AQI</th>
                    <th className="pb-4 pt-2 px-2 text-center">Flood</th>
                    <th className="pb-4 pt-2 px-2 text-center">Prox</th>
                    <th className="pb-4 pt-2 px-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {allLocations.length === 0 || isPredicting ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <Loader2 className="animate-spin mx-auto mb-3 text-[#ff4757]" size={24} />
                        <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[#4a5568]">Processing Telemetry...</span>
                      </td>
                    </tr>
                  ) : (
                    allLocations.slice(0, 5).map((loc) => (
                      <tr key={loc.rank} className="border-b border-[#babecc]/30 hover:bg-[#babecc]/10 transition-colors duration-150">
                        <td className="py-4 px-2">
                          <div className="w-5 h-5 rounded shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4),1px_1px_2px_rgba(0,0,0,0.3)] flex items-center justify-center text-[9px] font-black text-[#1C1714]" style={{ backgroundColor: loc.color }}>
                            0{loc.rank}
                          </div>
                        </td>
                        <td className="py-4 px-2 font-black text-[#2d3436] uppercase">{loc.name}</td>
                        <td className="py-4 px-2 text-center font-bold" style={{ color: getGaugeColor(loc.match) }}>{loc.match}%</td>
                        <td className="py-4 px-2 text-center font-bold" style={{ color: getGaugeColor(loc.model_value) }}>{loc.model_value}%</td>
                        <td className="py-4 px-2 text-center font-bold text-[#4a5568]">{loc.aqi ?? '-'}</td>
                        <td className="py-4 px-2 text-center font-bold text-[#4a5568]">{loc.flood ?? '-'}</td>
                        <td className="py-4 px-2 text-center font-bold text-[#4a5568]">{loc.prox ? `${loc.prox} km` : '-'}</td>
                        <td className="py-4 px-2 text-right font-black text-[#2d3436]">{loc.price}</td>
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