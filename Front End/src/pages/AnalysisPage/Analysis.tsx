import React, { useState, useEffect } from 'react';
import { Compass, Library, ScrollText, Scale, ChevronDown, Hourglass, BookOpen, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const barangays = [
  'Amaya', 'Bagtas', 'Biga', 'Biwas', 'Bucal', 'Bunga', 'Calibuyo', 'Capipisa', 
  'Daang Amaya', 'Halayhay', 'Julugan', 'Lambingan', 'Mulawin', 'Paradahan', 
  'Poblacion', 'Punta', 'Sahud Ulan', 'Sanja Mayor', 'Santol', 'Tanauan', 'Tres Cruses'
];

const Analysis: React.FC = () => {
  const navigate = useNavigate();

  // UI States
  const [activeTab, setActiveTab] = useState<'current' | 'future' | 'trends'>('current');
  const [selectedBarangay, setSelectedBarangay] = useState('Amaya');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Real AI Data States
  const [currentFactorData, setCurrentFactorData] = useState<any[]>([]);
  const [futureProjectionData, setFutureProjectionData] = useState<any[]>([]);
  const [valueTrendData, setValueTrendData] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); 

  // --- FETCH REAL DATA FROM FASTAPI ---
  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barangay: selectedBarangay })
        });
        
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();
        const projections = data.future_projections;

        // 1. Grab the "Current" year data
        const currentData = projections[0];

        // 2. Format data for the Current Status Bar Chart
        setCurrentFactorData([
          { name: 'Flood Risk', score: currentData.flood_score },
          { name: 'Air Quality', score: currentData.aqi_score },
          { name: 'House Price', score: currentData.price_score }
        ]);

        // Helper function to translate "+5 Years" into actual calendar years
        const formatYear = (yearStr: string) => {
          if (yearStr === "Current") return "2025";
          const addedYears = parseInt(yearStr.replace(/[^0-9]/g, ''));
          return (2025 + addedYears).toString();
        };

        // 3. Format data for the Line Charts
        const futureData = projections.map((p: any) => ({
          year: formatYear(p.year), 
          aqi: p.raw_aqi !== undefined ? Number(p.raw_aqi.toFixed(1)) : 0,
          flood: p.raw_flood !== undefined ? Number(p.raw_flood.toFixed(2)) : 0,
          price: p.raw_price !== undefined ? p.raw_price : 0
        }));
        setFutureProjectionData(futureData);

       // 4. Format data for the Housing Value Trends
        const trendData = projections.map((p: any) => ({
          year: formatYear(p.year), 
          modelValue: p.model_value || 0 
        }));
        setValueTrendData(trendData);

        // --- UNIVERSAL SCIENTIFIC & ECONOMIC RUBRICS ---
        const getUniversalAssessment = (type: string, rawValue: number) => {
          switch (type) {
            case 'aqi':
              // Based on US EPA AQI Standards
              if (rawValue <= 50) return { status: 'Good', trend: 'Optimal Air', color: 'text-academia-accent' };
              if (rawValue <= 100) return { status: 'Moderate', trend: 'Acceptable', color: 'text-academia-mutedForeground' };
              if (rawValue <= 150) return { status: 'Sensitive', trend: 'Cautionary', color: 'text-academia-accentSecondary' };
              if (rawValue <= 200) return { status: 'Unhealthy', trend: 'Suboptimal', color: 'text-academia-accentSecondary' };
              if (rawValue <= 300) return { status: 'V. Unhealthy', trend: 'Hazardous', color: 'text-academia-accentSecondary' };
              return { status: 'Hazardous', trend: 'Critical Level', color: 'text-academia-accentSecondary' };
              
            case 'flood':
              if (rawValue < 1.0) return { status: 'Low Risk', trend: 'Highly Favorable', color: 'text-academia-accent' };
              if (rawValue < 2.5) return { status: 'Moderate Risk', trend: 'Manageable', color: 'text-academia-mutedForeground' };
              return { status: 'High Risk', trend: 'Requires Action', color: 'text-academia-accentSecondary' };
              
            case 'price':
              if (rawValue >= 3000000) return { status: 'Premium Asset', trend: 'High Valuation', color: 'text-academia-accent' };
              if (rawValue >= 1500000) return { status: 'Mid-Market', trend: 'Stable Value', color: 'text-academia-mutedForeground' };
              return { status: 'Affordable', trend: 'Highly Accessible', color: 'text-academia-mutedForeground' };
              
            default:
              return { status: 'Unknown', trend: 'N/A', color: 'text-academia-mutedForeground' };
          }
        };

        // 5. Format the Summary Stats Card
        setSummaryStats({
          flood: { 
            score: currentData.flood_score, 
            ...getUniversalAssessment('flood', currentData.raw_flood || 0) 
          },
          aqi: { 
            score: currentData.aqi_score, 
            ...getUniversalAssessment('aqi', currentData.raw_aqi || 0) 
          },
          price: { 
            score: currentData.price_score, 
            ...getUniversalAssessment('price', currentData.raw_price || 0) 
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

  // ACADEMIA RECHARTS THEME
  const CustomTooltipStyle = {
    backgroundColor: '#251E19', // bgAlt
    border: '1px solid #4A3F35', // border
    borderRadius: '4px',
    color: '#E8DFD4', // foreground
    fontSize: '14px',
    fontFamily: '"Crimson Pro", serif',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  };
  
  const chartAxisProps = {
    stroke: "#9C8B7A", // mutedForeground
    fontSize: 12,
    fontFamily: '"Cinzel", serif',
    axisLine: { stroke: '#4A3F35' }, // border
    tickLine: false
  };

  return (
    <div className="min-h-screen relative z-10 flex flex-col pb-20">
      
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
          <button onClick={() => navigate('/studio')} className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all">
            <ScrollText size={16} /> Studio
          </button>
          <button onClick={() => navigate('/analysis')} className="flex items-center gap-2 text-academia-accent font-display uppercase tracking-widest text-xs hover:brightness-125 transition-all">
            <Scale size={16} /> Analysis
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="px-10 pt-16 pb-10 text-center max-w-4xl mx-auto w-full">
        <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-4 block">The Archives</span>
        <h1 className="text-5xl md:text-6xl font-heading text-academia-foreground mb-4">Analytical Ledger</h1>
        <div className="ornate-divider max-w-xs mx-auto mb-6"></div>
        <p className="text-academia-mutedForeground text-lg italic">Examine detailed environmental factors and chronological projections for specific municipalities.</p>
      </header>

      <main className="px-8 max-w-[1200px] w-full mx-auto flex flex-col gap-10">
        
        {/* LOCATION SELECTOR ONLY */}
        <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_4px_12px_rgba(0,0,0,0.2)] corner-flourish !overflow-visible relative z-50 w-full max-w-2xl mx-auto flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="font-display uppercase text-xs tracking-[0.2em] text-academia-foreground mb-2">Subject Selection</h2>
            <p className="text-academia-mutedForeground text-sm italic">Identify a municipal sector to scrutinize its records</p>
          </div>
          
          <div className="relative">
            <div 
              className="bg-academia-bg border border-academia-border text-academia-foreground text-lg font-heading rounded p-4 flex justify-between items-center cursor-pointer hover:border-academia-accent/50 transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedBarangay}</span>
              <ChevronDown size={20} className={`text-academia-accent transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full bg-academia-bg border border-academia-border rounded shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-50 max-h-72 overflow-y-auto">
                {barangays.map(brgy => (
                  <div 
                    key={brgy}
                    className={`px-6 py-3 font-heading text-lg cursor-pointer transition-colors ${selectedBarangay === brgy ? 'bg-academia-accent/10 text-academia-accent' : 'text-academia-foreground hover:bg-academia-bgAlt'}`}
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
        {isLoading || !summaryStats ? (
          <div className="flex flex-col justify-center items-center h-[40vh] gap-6">
            <Hourglass className="animate-spin text-academia-accent" size={32} />
            <p className="text-academia-accent font-display text-xs tracking-[0.3em] uppercase animate-pulse">Retrieving Archival Data...</p>
          </div>
        ) : (
          <div className="bg-academia-bgAlt border border-academia-border rounded p-8 md:p-12 corner-flourish shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            
            {/* TAB NAVIGATION */}
            <div className="flex flex-wrap gap-2 border-b border-academia-border pb-6 mb-10 justify-center">
              {[
                { id: 'current', label: 'Current State' },
                { id: 'future', label: 'Chronological Projections' },
                { id: 'trends', label: 'Valuation Index' },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-8 py-3 rounded text-xs font-display tracking-[0.15em] uppercase transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-academia-bg border border-academia-accent text-academia-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.2)]' 
                      : 'bg-transparent text-academia-mutedForeground border border-transparent hover:text-academia-foreground hover:border-academia-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: CURRENT STATUS */}
            {activeTab === 'current' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 flex flex-col">
                  <h3 className="font-heading text-3xl text-academia-foreground mb-1">Empirical Analysis</h3>
                  <p className="text-academia-mutedForeground text-sm italic mb-8">Normalized baseline scores (0-100) for {selectedBarangay}</p>
                  
                  <div className="h-[350px] w-full bg-academia-bg border border-academia-border p-6 rounded shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={currentFactorData} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A3F35" vertical={false} />
                        <XAxis dataKey="name" {...chartAxisProps} angle={-35} textAnchor="end" />
                        <YAxis {...chartAxisProps} domain={[0, 100]} />
                        <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: '#1C1714' }} />
                        <Bar dataKey="score" fill="#C9A962" radius={[2, 2, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col">
                  <h3 className="font-heading text-3xl text-academia-foreground mb-1">Executive Summary</h3>
                  <p className="text-academia-mutedForeground text-sm italic mb-8">Qualitative assessment of recorded data</p>

                  <div className="bg-academia-bg border border-academia-border rounded p-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] flex-1">
                    <div className="space-y-6">
                      {[
                        { name: 'Flood Risk', data: summaryStats.flood },
                        { name: 'Air Quality', data: summaryStats.aqi },
                        { name: 'House Price', data: summaryStats.price },
                      ].map((factor, idx) => (
                        <div key={idx} className="border-b border-academia-border/50 pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-academia-foreground font-display text-[11px] tracking-widest uppercase">
                              {factor.name}
                            </span>
                            <span className="text-academia-accent font-heading text-xl font-bold">{factor.data.score}/100</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-body italic ${factor.data.color}`}>{factor.data.trend}</span>
                            <span className={`font-display text-[9px] tracking-widest uppercase px-3 py-1 rounded border ${
                              ['Premium Asset', 'Good', 'Low Risk'].includes(factor.data.status)
                                ? 'bg-academia-bgAlt text-academia-accent border-academia-accent/50' 
                                : ['Sensitive', 'Unhealthy', 'V. Unhealthy', 'Hazardous', 'High Risk'].includes(factor.data.status)
                                ? 'bg-academia-bgAlt text-academia-accentSecondary border-academia-accentSecondary/50' 
                                : 'bg-academia-bgAlt text-academia-mutedForeground border-academia-border'
                            }`}>
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

            {/* TAB CONTENT: FUTURE PROJECTIONS */}
            {activeTab === 'future' && (
              <div>
                <div className="text-center mb-10">
                  <h3 className="font-heading text-3xl text-academia-foreground mb-1">Chronological Disturbance</h3>
                  <p className="text-academia-mutedForeground text-sm italic">Simulated projections spanning two decades in {selectedBarangay}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-12">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen size={16} className="text-academia-mutedForeground" />
                      <h4 className="font-display text-xs tracking-[0.2em] uppercase text-academia-foreground">Air Quality Index</h4>
                    </div>
                    <div className="h-[200px] w-full bg-academia-bg border border-academia-border p-4 rounded shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={futureProjectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4A3F35" vertical={false} />
                          <XAxis dataKey="year" {...chartAxisProps} />
                          <YAxis {...chartAxisProps} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={CustomTooltipStyle} />
                          <Line type="monotone" dataKey="aqi" name="Raw AQI" stroke="#9C8B7A" strokeWidth={2} dot={{ fill: '#1C1714', stroke: '#9C8B7A', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen size={16} className="text-academia-accentSecondary" />
                      <h4 className="font-display text-xs tracking-[0.2em] uppercase text-academia-foreground">Flood Risk Trajectory</h4>
                    </div>
                    <div className="h-[200px] w-full bg-academia-bg border border-academia-border p-4 rounded shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={futureProjectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4A3F35" vertical={false} />
                          <XAxis dataKey="year" {...chartAxisProps} />
                          <YAxis {...chartAxisProps} domain={[0, 5]} />
                          <Tooltip contentStyle={CustomTooltipStyle} />
                          <Line type="monotone" dataKey="flood" name="Hazard Level" stroke="#8B2635" strokeWidth={2} dot={{ fill: '#1C1714', stroke: '#8B2635', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Landmark size={16} className="text-academia-accent" />
                      <h4 className="font-display text-xs tracking-[0.2em] uppercase text-academia-foreground">Housing Price Projection</h4>
                    </div>
                    <div className="h-[200px] w-full bg-academia-bg border border-academia-border p-4 rounded shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={futureProjectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4A3F35" vertical={false} />
                          <XAxis dataKey="year" {...chartAxisProps} />
                          <YAxis {...chartAxisProps} domain={['auto', 'auto']} tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} />
                          <Tooltip contentStyle={CustomTooltipStyle} formatter={(value: any) => `₱${Number(value).toLocaleString()}`} />
                          <Line type="monotone" dataKey="price" name="Predicted Price" stroke="#C9A962" strokeWidth={2} dot={{ fill: '#1C1714', stroke: '#C9A962', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VALUE TRENDS (TRUE MODEL VALUE ONLY) */}
            {activeTab === 'trends' && (
              <div>
                <div className="text-center mb-10">
                  <h3 className="font-heading text-3xl text-academia-foreground mb-1">Housing Value Index</h3>
                  <p className="text-academia-mutedForeground text-sm italic">The official baseline algorithm output of Housing Value</p>
                </div>
                
                <div className="flex justify-center items-center gap-3 text-academia-accent font-display text-[10px] tracking-widest uppercase mb-6">
                  <span className="w-3 h-3 rounded-full border-2 border-academia-accent bg-academia-bg"></span> Housing Value
                </div>

                <div className="h-[400px] w-full bg-academia-bg border border-academia-border p-6 rounded shadow-[inset_0_4px_16px_rgba(0,0,0,0.4)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={valueTrendData} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4A3F35" vertical={false} />
                      <XAxis dataKey="year" {...chartAxisProps} />
                      <YAxis {...chartAxisProps} domain={[0, 100]} />
                      <Tooltip contentStyle={CustomTooltipStyle} />
                      <Line 
                        type="monotone" 
                        dataKey="modelValue" 
                        name="Model Score" 
                        stroke="#C9A962" 
                        strokeWidth={3} 
                        dot={{ fill: '#1C1714', stroke: '#C9A962', strokeWidth: 2, r: 6 }} 
                        activeDot={{ r: 8, fill: '#C9A962' }} 
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