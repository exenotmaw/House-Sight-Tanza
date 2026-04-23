import React, { useState, useEffect } from 'react';
import { Compass, Library, ChevronDown, Hourglass, Landmark, Activity, Zap, Cpu, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

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
  btnAccent: "bg-[#ff4757] text-white rounded-xl shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.4)] active:shadow-[inset_6px_6px_12px_rgba(180,30,40,0.6),inset_-2px_-2px_4px_rgba(255,100,100,0.4)] hover:brightness-110",
  btnPressed: "bg-[#e0e5ec] text-[#ff4757] rounded-xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] translate-y-[2px]", 
};

// --- MANUFACTURING HARDWARE COMPONENTS ---
const Screw = () => (
  <div className="w-3 h-3 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" 
       style={{ background: 'radial-gradient(circle at 3px 3px, rgba(0,0,0,0.1) 1px, transparent 2px), radial-gradient(circle at 9px 9px, rgba(0,0,0,0.1) 1px, transparent 2px), #d1d9e6' }}>
  </div>
);

const TapeLabel = ({ text, color = "bg-[#eccc68]" }: { text: string, color?: string }) => (
  <div className={`px-3 py-1 ${color} border border-black/10 shadow-sm skew-x-[-12deg] inline-flex items-center justify-center`}>
    <span className="font-mono text-[9px] font-black uppercase text-[#2d3436] skew-x-[12deg] tracking-widest">{text}</span>
  </div>
);

const barangays = [
  'Amaya', 'Bagtas', 'Biga', 'Biwas', 'Bucal', 'Bunga', 'Calibuyo', 'Capipisa', 
  'Daang Amaya', 'Halayhay', 'Julugan', 'Lambingan', 'Mulawin', 'Paradahan', 
  'Poblacion', 'Punta', 'Sahud Ulan', 'Sanja Mayor', 'Santol', 'Tanauan', 'Tres Cruses'
];

const Analysis: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'current' | 'future' | 'trends'>('current');
  const [selectedBarangay, setSelectedBarangay] = useState('Amaya');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [futureProjectionData, setFutureProjectionData] = useState<any[]>([]);
  const [valueTrendData, setValueTrendData] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [currentAlgorithmData, setCurrentAlgorithmData] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://house-sight-tanza.onrender.com/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barangay: selectedBarangay })
        });
        
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();
        const projections = data.future_projections;
        const currentData = projections[0];

        const formatYear = (yearStr: string) => {
          if (yearStr === "Current") return "2025";
          const addedYears = parseInt(yearStr.replace(/[^0-9]/g, ''));
          return (2025 + addedYears).toString();
        };

        const futureData = projections.map((p: any) => ({
          year: formatYear(p.year), 
          aqi: p.raw_aqi !== undefined ? Number(p.raw_aqi.toFixed(1)) : 0,
          flood: p.raw_flood !== undefined ? Number(p.raw_flood.toFixed(2)) : 0,
          price: p.raw_price !== undefined ? p.raw_price : 0
        }));
        setFutureProjectionData(futureData);

        const trendData = projections.map((p: any) => ({
          year: formatYear(p.year), 
          modelValue: p.model_value || 0 
        }));
        setValueTrendData(trendData);

        // --- CALCULATE THE DETAILED NORMALIZATION MATH ---
        const rawProx = currentData.raw_prox || 0;
        const proxScore = Math.max(0, Math.min(100, 100 - (rawProx * 10.0)));
        const rawPriceM = (currentData.raw_price || 0) / 1000000;
        const rawFlood = currentData.raw_flood || 0;
        const rawAqi = currentData.raw_aqi || 0;
        
        setCurrentAlgorithmData({
          modelValue: currentData.model_value,
          price: { 
            raw: `₱${rawPriceM.toFixed(2)}M`,
            normMath: `100 - ((${rawPriceM.toFixed(1)} - 1.5)/48.5 * 100)`,
            score: currentData.price_score, 
            weight: 0.40, 
            contribution: currentData.price_score * 0.40 
          },
          flood: { 
            raw: `${rawFlood.toFixed(1)}m`,
            normMath: `100 - (${rawFlood.toFixed(1)} / 5.0 * 100)`,
            score: currentData.flood_score, 
            weight: 0.25, 
            contribution: currentData.flood_score * 0.25 
          },
          prox: { 
            raw: `${rawProx.toFixed(1)}km`,
            normMath: `100 - (${rawProx.toFixed(1)} * 10.0)`,
            score: Math.round(proxScore), 
            weight: 0.20, 
            contribution: Math.round(proxScore) * 0.20 
          },
          aqi: { 
            raw: `${rawAqi.toFixed(0)}`,
            normMath: `100 - (${rawAqi.toFixed(0)} / 150 * 100)`,
            score: currentData.aqi_score, 
            weight: 0.15, 
            contribution: currentData.aqi_score * 0.15 
          },
        });

        // --- UNIVERSAL RUBRIC (Industrial Hardware Colors) ---
        const getUniversalAssessment = (type: string, rawValue: number) => {
          switch (type) {
            case 'aqi':
              if (rawValue <= 50) return { status: 'GOOD', color: 'text-[#2ed573]', border: 'border-[#2ed573]/50' };
              if (rawValue <= 100) return { status: 'MODERATE', color: 'text-[#ffa502]', border: 'border-[#ffa502]/50' };
              if (rawValue <= 150) return { status: 'SENSITIVE', color: 'text-[#ff4757]', border: 'border-[#ff4757]/50' };
              if (rawValue <= 200) return { status: 'UNHEALTHY', color: 'text-[#ff4757]', border: 'border-[#ff4757]/50' };
              if (rawValue <= 300) return { status: 'V. UNHLTHY', color: 'text-[#ff4757]', border: 'border-[#ff4757]/50' };
              return { status: 'HAZARDOUS', color: 'text-[#2d3436]', border: 'border-[#2d3436]/50' };
              
            case 'flood':
              if (rawValue < 1.0) return { status: 'LOW RISK', color: 'text-[#2ed573]', border: 'border-[#2ed573]/50' };
              if (rawValue < 2.5) return { status: 'MODERATE', color: 'text-[#ffa502]', border: 'border-[#ffa502]/50' };
              return { status: 'HIGH RISK', color: 'text-[#ff4757]', border: 'border-[#ff4757]/50' };
              
            case 'price':
              if (rawValue >= 3000000) return { status: 'PREMIUM', color: 'text-[#2d3436]', border: 'border-[#2d3436]/50' };
              if (rawValue >= 1500000) return { status: 'MID-MARKET', color: 'text-[#4a5568]', border: 'border-[#4a5568]/50' };
              return { status: 'AFFORDABLE', color: 'text-[#2ed573]', border: 'border-[#2ed573]/50' };
              
            case 'prox':
              if (rawValue <= 3.0) return { status: 'PRIME CORE', color: 'text-[#2ed573]', border: 'border-[#2ed573]/50' };
              if (rawValue <= 8.0) return { status: 'ACCESSIBLE', color: 'text-[#ffa502]', border: 'border-[#ffa502]/50' };
              return { status: 'REMOTE', color: 'text-[#4a5568]', border: 'border-[#4a5568]/50' }; // Muted grey instead of hazard red
              
            default:
              return { status: 'UNKNOWN', color: 'text-[#4a5568]', border: 'border-[#4a5568]/50' };
          }
        };

        setSummaryStats({
          flood: { 
            raw: `${(currentData.raw_flood || 0).toFixed(2)}m`, 
            ...getUniversalAssessment('flood', currentData.raw_flood || 0) 
          },
          aqi: { 
            raw: `${(currentData.raw_aqi || 0).toFixed(0)} AQI`, 
            ...getUniversalAssessment('aqi', currentData.raw_aqi || 0) 
          },
          price: { 
            raw: `₱${((currentData.raw_price || 0) / 1000000).toFixed(2)}M`, 
            ...getUniversalAssessment('price', currentData.raw_price || 0) 
          },
          prox: {
            raw: `${(currentData.raw_prox || 0).toFixed(1)}km`,
            ...getUniversalAssessment('prox', currentData.raw_prox || 0)
          }
        });

      } catch (error) {
        console.error("Error fetching analysis data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [selectedBarangay]);

  const CustomTooltipStyle = {
    backgroundColor: '#e0e5ec',
    border: '1px solid #babecc',
    borderRadius: '8px',
    color: '#2d3436',
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px #ffffff'
  };
  
  const chartAxisProps = {
    stroke: "#a3b1c6",
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    axisLine: { stroke: '#babecc' },
    tickLine: false
  };

  return (
    <div className={`min-h-screen relative z-10 flex flex-col pb-20 font-sans ${theme.chassis} ${theme.text}`}>
      
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      {/* NAV PANEL */}
      <nav className={`${theme.panel} mx-6 mt-6 px-8 py-5 flex justify-between items-center sticky top-6 z-50`}>
        <div onClick={() => navigate('/')} className="flex items-center gap-4 cursor-pointer group">
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
          <button onClick={() => navigate('/analysis')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}>Analysis</button>
          <button onClick={() => navigate('/contribute')} className={`${theme.btnBase} ${theme.btnAccent} !px-4 !py-2`}> Contribute</button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="px-10 pt-16 pb-10 text-center max-w-4xl mx-auto w-full relative z-10">
        <TapeLabel text="Diagnostic Readouts" />
        <h1 className="text-5xl md:text-6xl font-black uppercase mt-6 tracking-tight drop-shadow-[0_2px_0_#ffffff] text-[#2d3436]">
          Analytical Ledger
        </h1>
        <p className="text-[#4a5568] text-lg font-medium italic mt-4 max-w-2xl mx-auto drop-shadow-[0_1px_0_#ffffff]">
          Examine chronological projections and empirical rubrics for specific municipal sectors.
        </p>
      </header>

      <main className="px-6 max-w-[1200px] w-full mx-auto flex flex-col gap-10 relative z-10">
        
        {/* LOCATION SELECTOR */}
        <div className={`${theme.panel} p-8 !overflow-visible relative w-full max-w-2xl mx-auto flex flex-col justify-center`}>
          <div className="absolute top-4 left-4"><Screw/></div>
          <div className="absolute top-4 right-4"><Screw/></div>

          <div className="text-center mb-6">
            <h2 className="font-black uppercase text-xs tracking-widest drop-shadow-[0_1px_0_#ffffff] mb-2">Subject Selection</h2>
            <p className="text-[#4a5568] text-sm italic font-medium">Calibrate the scanning array to a specific sector.</p>
          </div>
          
          <div className="relative">
            <div 
              className={`${theme.recessed} text-[#2d3436] font-black text-xl uppercase tracking-widest p-5 flex justify-between items-center cursor-pointer`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="drop-shadow-[0_1px_0_#ffffff]">{selectedBarangay}</span>
              <ChevronDown size={24} className={`text-[#ff4757] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className={`${theme.panel} absolute top-[110%] w-full z-50 max-h-72 overflow-y-auto p-2`}>
                {barangays.map(brgy => (
                  <div 
                    key={brgy}
                    className={`px-6 py-3 font-bold font-mono text-sm tracking-widest uppercase cursor-pointer rounded-lg transition-colors ${selectedBarangay === brgy ? 'bg-[#ff4757] text-white shadow-inner' : 'text-[#4a5568] hover:bg-[#babecc]/20'}`}
                    onClick={() => {
                      setSelectedBarangay(brgy);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {brgy}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading || !summaryStats || !currentAlgorithmData ? (
          <div className="flex flex-col justify-center items-center h-[40vh] gap-6">
            <Hourglass className="animate-spin text-[#ff4757]" size={32} />
            <p className="text-[#ff4757] font-mono text-[10px] font-bold tracking-[0.2em] uppercase animate-pulse">Retrieving Archival Data...</p>
          </div>
        ) : (
          <div className={`${theme.panel} p-8 md:p-12 relative`}>
            <div className="absolute top-4 left-4"><Screw/></div>
            <div className="absolute top-4 right-4"><Screw/></div>
            <div className="absolute bottom-4 left-4"><Screw/></div>
            <div className="absolute bottom-4 right-4"><Screw/></div>
            
            {/* TABS (Mechanical Switches) */}
            <div className="flex flex-wrap gap-4 pb-10 mb-10 justify-center border-b border-[#babecc]/50">
              {[
                { id: 'current', label: 'Current State' },
                { id: 'future', label: 'Chronological Projections' },
                { id: 'trends', label: 'Valuation Index' },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${theme.btnBase} ${activeTab === tab.id ? theme.btnPressed : theme.btnStandard}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: CURRENT STATUS & MATHEMATICAL COMPUTATION */}
            {activeTab === 'current' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* LEFT: ALGORITHM COMPUTATION TERMINAL */}
                <div className="flex flex-col w-full">
                  <div className="text-center mb-10">
                    <h3 className="font-black text-2xl md:text-3xl uppercase tracking-tight drop-shadow-[0_1px_0_#ffffff] mb-2 flex items-center justify-center gap-3">
                      <Cpu size={24} className={theme.accent} /> Telemetry Processing
                    </h3>
                    <p className="text-[#4a5568] text-sm italic font-medium">Normalization & Weighted Baseline Computation.</p>
                  </div>

                  <div className={`${theme.recessed} flex-1 p-6 md:p-8 flex flex-col justify-center bg-[#d1d9e6]/30 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)]`}>
                    <div className="font-mono text-[9px] md:text-[11px] font-bold text-[#4a5568] space-y-6 w-full max-w-sm mx-auto">
                      
                      <div className="flex items-center gap-2 text-[#ff4757] font-black uppercase mb-2 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-[#ff4757] shadow-[0_0_8px_#ff4757]"></div> Array Processing Active
                      </div>

                      {/* COMPUTATION ROWS */}
                      {[
                        { label: 'HOUSING price', raw: currentAlgorithmData.price.raw, norm: currentAlgorithmData.price.normMath, score: currentAlgorithmData.price.score, weight: currentAlgorithmData.price.weight, contrib: currentAlgorithmData.price.contribution },
                        { label: 'FLOOD Risk', raw: currentAlgorithmData.flood.raw, norm: currentAlgorithmData.flood.normMath, score: currentAlgorithmData.flood.score, weight: currentAlgorithmData.flood.weight, contrib: currentAlgorithmData.flood.contribution },
                        { label: 'Proximity To City Center', raw: currentAlgorithmData.prox.raw, norm: currentAlgorithmData.prox.normMath, score: currentAlgorithmData.prox.score, weight: currentAlgorithmData.prox.weight, contrib: currentAlgorithmData.prox.contribution },
                        { label: 'AIR Quality', raw: currentAlgorithmData.aqi.raw, norm: currentAlgorithmData.aqi.normMath, score: currentAlgorithmData.aqi.score, weight: currentAlgorithmData.aqi.weight, contrib: currentAlgorithmData.aqi.contribution },
                      ].map((item, idx) => (
                        <div key={idx} className="border-b border-[#babecc]/50 pb-4 last:border-0 hover:bg-[#babecc]/10 p-2 rounded transition-colors">
                          <div className="flex justify-between text-[#2d3436] font-black uppercase mb-2 drop-shadow-[0_1px_0_#ffffff]">
                            <span>{item.label} [{item.raw}]</span>
                          </div>
                          
                          {/* Step 1: Normalization Formula */}
                          <div className="flex justify-between items-center text-[#4a5568] mb-1">
                            <span className="truncate mr-4">↳ NRM: {item.norm}</span>
                            <span className="text-[#2d3436] flex-shrink-0">=&gt; {item.score}</span>
                          </div>
                          
                          {/* Step 2: Weighting Formula */}
                          <div className="flex justify-between items-center text-[#4a5568]">
                            <span>↳ WGT: {item.score.toString().padStart(3, '0')} &times; {item.weight.toFixed(2)}</span>
                            <span className="text-[#2d3436] font-black">=&gt; {item.contrib.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}

                      {/* FINAL OUTPUT */}
                      <div className="border-t-2 border-dashed border-[#babecc] pt-4 mt-4 flex justify-between items-center font-black text-[#ff4757]">
                        <span className="uppercase tracking-widest text-sm">Housing Value</span>
                        <span className="text-2xl drop-shadow-[0_1px_0_#ffffff]">=&gt; {currentAlgorithmData.modelValue.toFixed(1)}</span>
                      </div>
                      
                    </div>
                  </div>
                </div>

                {/* RIGHT: THE RAW UNIVERSAL RUBRIC */}
                <div className="flex flex-col w-full">
                  <div className="text-center mb-10">
                    <h3 className="font-black text-2xl md:text-3xl uppercase tracking-tight drop-shadow-[0_1px_0_#ffffff] mb-2 flex items-center justify-center gap-3">
                      <Library size={24} className={theme.accent} /> Executive Summary
                    </h3>
                    <p className="text-[#4a5568] text-sm italic font-medium">Raw telemetry mapped to Universal Rubric standards.</p>
                  </div>

                  <div className="bg-[#e0e5ec] border border-[#babecc]/50 rounded-2xl p-8 shadow-[inset_0_4px_8px_rgba(0,0,0,0.05),0_1px_0_#ffffff] flex-1">
                    <div className="space-y-6">
                      {[
                        { name: 'House Price', data: summaryStats.price, icon: Landmark },
                        { name: 'Flood Risk', data: summaryStats.flood, icon: Zap },
                        { name: 'Proximity To City Center', data: summaryStats.prox, icon: MapPin },
                        { name: 'Air Quality', data: summaryStats.aqi, icon: Activity },
                      ].map((factor, idx) => (
                        <div key={idx} className="border-b border-[#babecc]/60 pb-5 last:border-0 last:pb-0">
                          
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[#4a5568] font-black text-xs tracking-widest uppercase flex items-center gap-3">
                              <factor.icon size={18} className={theme.accent}/> {factor.name}
                            </span>
                            <span className="text-[#2d3436] font-mono text-xl font-black drop-shadow-[0_1px_0_#ffffff]">
                              {factor.data.raw}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-mono font-black tracking-widest uppercase px-3 py-1.5 rounded border ${factor.data.color} ${factor.data.border} shadow-sm bg-white/40`}>
                              {factor.data.status}
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: FUTURE PROJECTIONS (Recessed Line Charts) */}
            {activeTab === 'future' && (
              <div>
                <div className="text-center mb-12">
                  <h3 className="font-black text-3xl uppercase tracking-tight drop-shadow-[0_1px_0_#ffffff] mb-2">Chronological Disturbance</h3>
                  <p className="text-[#4a5568] text-sm italic font-medium">Simulated telemetry projections spanning two decades.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-12">
                  
                  {/* AQI Chart */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Activity size={16} className={theme.accent} />
                      <h4 className="font-black text-xs tracking-widest uppercase text-[#2d3436] drop-shadow-[0_1px_0_#ffffff]">Air Quality Index</h4>
                    </div>
                    <div className={`${theme.recessed} h-[200px] w-full p-4`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={futureProjectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#babecc" vertical={false} />
                          <XAxis dataKey="year" {...chartAxisProps} />
                          <YAxis {...chartAxisProps} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={CustomTooltipStyle} />
                          <Line type="monotone" dataKey="aqi" name="Predicted Air Quality" stroke="#a3b1c6" strokeWidth={3} dot={{ fill: '#e0e5ec', stroke: '#a3b1c6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Flood Chart */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Zap size={16} className="text-cyan-500" />
                      <h4 className="font-black text-xs tracking-widest uppercase text-[#2d3436] drop-shadow-[0_1px_0_#ffffff]">Flood Risk Trajectory</h4>
                    </div>
                    <div className={`${theme.recessed} h-[200px] w-full p-4`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={futureProjectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#babecc" vertical={false} />
                          <XAxis dataKey="year" {...chartAxisProps} />
                          <YAxis {...chartAxisProps} domain={[0, 5]} />
                          <Tooltip contentStyle={CustomTooltipStyle} />
                          <Line type="monotone" dataKey="flood" name="Predicted Flood Risk" stroke="#ff4757" strokeWidth={3} dot={{ fill: '#e0e5ec', stroke: '#ff4757', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Price Chart */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Landmark size={16} className="text-[#2d3436]" />
                      <h4 className="font-black text-xs tracking-widest uppercase text-[#2d3436] drop-shadow-[0_1px_0_#ffffff]">Housing Price Projection</h4>
                    </div>
                    <div className={`${theme.recessed} h-[200px] w-full p-4`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={futureProjectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#babecc" vertical={false} />
                          <XAxis dataKey="year" {...chartAxisProps} />
                          <YAxis {...chartAxisProps} domain={['auto', 'auto']} tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} />
                          <Tooltip contentStyle={CustomTooltipStyle} formatter={(value: any) => `₱${Number(value).toLocaleString()}`} />
                          <Line type="monotone" dataKey="price" name="Predicted Housing Price" stroke="#2d3436" strokeWidth={3} dot={{ fill: '#e0e5ec', stroke: '#2d3436', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: VALUE TRENDS */}
            {activeTab === 'trends' && (
              <div>
                <div className="text-center mb-10">
                  <h3 className="font-black text-3xl uppercase tracking-tight drop-shadow-[0_1px_0_#ffffff] mb-2">Housing Value Index</h3>
                  <p className="text-[#4a5568] text-sm italic font-medium">The official baseline algorithm output of Housing Value.</p>
                </div>
                
                <div className="flex justify-center items-center gap-3 text-[#2d3436] font-black text-[10px] tracking-widest uppercase mb-6 drop-shadow-[0_1px_0_#ffffff]">
                  <span className="w-3 h-3 rounded-full border-[3px] border-[#ff4757] bg-[#e0e5ec]"></span> Housing Value Score
                </div>

                <div className={`${theme.recessed} h-[400px] w-full p-6`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={valueTrendData} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#babecc" vertical={false} />
                      <XAxis dataKey="year" {...chartAxisProps} />
                      <YAxis {...chartAxisProps} domain={[0, 100]} />
                      <Tooltip contentStyle={CustomTooltipStyle} />
                      <Line 
                        type="monotone" 
                        dataKey="modelValue" 
                        name="Housing Value Score" 
                        stroke="#ff4757" 
                        strokeWidth={4} 
                        dot={{ fill: '#e0e5ec', stroke: '#ff4757', strokeWidth: 3, r: 6 }} 
                        activeDot={{ r: 8, fill: '#ff4757' }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default Analysis;