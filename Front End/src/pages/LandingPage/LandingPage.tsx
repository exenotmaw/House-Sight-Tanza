import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { Compass, Map, Telescope, BookOpen, Landmark, FileUpIcon, ShieldCheckIcon, DatabaseBackupIcon, Activity, Zap } from 'lucide-react';

// --- DESIGN SYSTEM CONSTANTS (Industrial Skeuomorphism) ---
const theme = {
  chassis: "bg-[#e0e5ec]",
  text: "text-[#2d3436]",
  textMuted: "text-[#4a5568]",
  accent: "text-[#ff4757]",
  
  // Elevations
  panel: "bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]",
  recessed: "bg-[#e0e5ec] rounded-xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]",
  
  // Mechanical Buttons
  btnBase: "flex items-center justify-center gap-2 px-8 py-4 font-bold text-xs uppercase tracking-[0.1em] transition-all duration-150 active:translate-y-[2px]",
  btnStandard: "bg-[#e0e5ec] text-[#4a5568] rounded-xl shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] hover:text-[#ff4757]",
  btnAccent: "bg-[#ff4757] text-white rounded-xl shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.4)] active:shadow-[inset_6px_6px_12px_rgba(180,30,40,0.6),inset_-2px_-2px_4px_rgba(255,100,100,0.4)] hover:brightness-110",
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
  <div className={`px-4 py-1 ${color} border border-black/10 shadow-sm skew-x-[-12deg] flex items-center justify-center`}>
    <span className="font-mono text-[9px] font-black uppercase text-[#2d3436] skew-x-[12deg] tracking-widest">{text}</span>
  </div>
);

// --- DATA ARRAYS ---
const features = [
  {
    title: 'Cartographic Heatmaps',
    description: 'Visualize housing value across different areas of Tanza with detailed, color-coded municipal maps.',
    icon: Map,
  },
  {
    title: 'Multifactorial Study',
    description: 'Analyze flood risk, air quality, house prices, and proximity to the city center to inform your research.',
    icon: Telescope,
  },
  {
    title: 'Predictive Prophecy',
    description: 'Review comprehensive future projections regarding housing value based on historical data points.',
    icon: BookOpen,
  },
  {
    title: 'Scholarly Decisions',
    description: 'Make informed decisions about settlement or investment based on rigorous area analysis.',
    icon: Landmark,
  },
];

const factors = ['Flood Risk Assessment', 'Air Quality Index', 'Housing Valuation', 'Proximity to Center'];

const barangays = [
  'Amaya', 'Bagtas', 'Biga', 'Biwas', 'Bucal', 'Bunga', 'Calibuyo', 'Capipisa', 
  'Daang Amaya', 'Halayhay', 'Julugan', 'Lambingan', 'Mulawin', 'Paradahan', 
  'Poblacion', 'Punta', 'Sahud Ulan', 'Sanja Mayor', 'Santol', 'Tanauan', 'Tres Cruses'
];

// --- MAIN COMPONENT ---
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Force light mode to respect the chassis material colors
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className={`min-h-screen font-sans ${theme.chassis} ${theme.text} relative overflow-x-hidden`}>
      
      {/* MACRO-TEXTURE: Matte Plastic Noise */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

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
        <div className="flex gap-4">
          <button onClick={() => navigate('/')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}> Home</button>
          <button onClick={() => navigate('/studio')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}> Studio</button>
          <button onClick={() => navigate('/analysis')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}> Analysis</button>
          <button onClick={() => navigate('/contribute')} className={`${theme.btnBase} ${theme.btnAccent} !px-4 !py-2`}> Contribute</button>
        </div>
      </nav>

      {/* HERO SECTION (Centered, No Device Mockup) */}
      <main className="container mx-auto px-6 pt-32 pb-32 flex flex-col items-center text-center relative z-10">
        <div className="mb-8 inline-block">
          <TapeLabel text="System Operational: v2.4.0" />
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black text-[#2d3436] mb-8 tracking-tight drop-shadow-[0_2px_0_#ffffff]">
          House Sight Tanza
        </h1>
        
        {/* Changed border-l to border-t since it is now centered */}
        <p className="text-xl md:text-2xl text-[#4a5568] max-w-3xl mx-auto mb-16 font-medium leading-relaxed italic border-t-4 border-[#ff4757] pt-8 drop-shadow-[0_1px_0_#ffffff]">
          A specialized telemetry suite for real estate valuation in the Tanza municipality. Make informed decisions rooted in mechanical precision.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center">
          {/* OVERSIZED BUTTONS - Notice the !px-12, !py-6, and !text-sm overrides */}
          <button 
            onClick={() => navigate('/studio')} 
            className={`${theme.btnBase} ${theme.btnAccent} !px-12 !py-6 !text-sm flex-1`}
          >
            Studio Page
          </button>
          <button 
            onClick={() => navigate('/analysis')}   
            className={`${theme.btnBase} ${theme.btnStandard} !px-12 !py-6 !text-sm flex-1`}
          >
            Analysis Page
          </button>
        </div>
      </main>

      {/* METHODOLOGY MODULES */}
      <section className="container mx-auto px-6 py-32 relative z-10">
        <div className="mb-16 flex flex-col items-center text-center">
          <TapeLabel text="Volume I" color="bg-[#d1d9e6]" />
          <h2 className="text-4xl font-black uppercase drop-shadow-[0_1px_0_#ffffff] mt-6">Core Methodology</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className={`${theme.panel} p-10 relative group hover:shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] transition-all duration-300`}>
              <div className="absolute top-4 right-4"><Screw/></div>
              <div className="absolute bottom-4 left-4"><Screw/></div>
              
              <div className={`${theme.recessed} w-14 h-14 flex items-center justify-center mb-6`}>
                <f.icon className={theme.accent} size={24} />
              </div>
              
              <h3 className="text-xl font-black mb-3 drop-shadow-[0_1px_0_#ffffff]">{f.title}</h3>
              <p className="text-sm font-medium leading-relaxed text-[#4a5568]">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EVALUATED VARIABLES */}
      <section className="container mx-auto px-6 pb-32 relative z-10">
        <div className="w-full max-w-2xl mx-auto h-1 bg-[#d1d9e6] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] mb-20"></div>
        
        <div className="text-center mb-12 flex flex-col items-center">
          <TapeLabel text="Volume II" color="bg-[#d1d9e6]" />
          <h2 className="text-4xl font-black uppercase drop-shadow-[0_1px_0_#ffffff] mt-6">Evaluated Variables</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
          {factors.map((factor) => (
            <div key={factor} className={`${theme.recessed} text-[#2d3436] px-4 py-8 rounded-xl font-mono font-bold tracking-widest text-[10px] uppercase flex items-center justify-center text-center`}>
              {factor}
            </div>
          ))}
        </div>
      </section>

      {/* BARANGAYS LIST */}
      <section className="container mx-auto px-6 pb-32 relative z-10">
        <div className="w-full max-w-2xl mx-auto h-1 bg-[#d1d9e6] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] mb-20"></div>

        <div className="text-center mb-12 flex flex-col items-center">
          <TapeLabel text="Volume III" color="bg-[#d1d9e6]" />
          <h2 className="text-4xl font-black uppercase drop-shadow-[0_1px_0_#ffffff] mt-6">The Municipal Ledger</h2>
        </div>

        <div className={`${theme.panel} p-12 max-w-5xl mx-auto relative`}>
          <div className="absolute top-4 left-4"><Screw/></div>
          <div className="absolute top-4 right-4"><Screw/></div>
          <div className="absolute bottom-4 left-4"><Screw/></div>
          <div className="absolute bottom-4 right-4"><Screw/></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
            {barangays.map((brgy, idx) => (
              <div key={brgy} className="flex items-center gap-4 border-b border-[#babecc]/40 pb-2 hover:border-[#babecc] transition-colors duration-300">
                <span className={`font-mono text-[10px] font-black ${theme.accent} w-6`}>
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span className="text-[#2d3436] font-bold text-sm drop-shadow-[0_1px_0_#ffffff]">{brgy}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE UNIVERSAL RUBRIC (Recessed Grid) */}
      <section className="container mx-auto px-6 pb-32 relative z-10">
        <div className="w-full max-w-2xl mx-auto h-1 bg-[#d1d9e6] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] mb-20"></div>

        <div className="text-center mb-16 flex flex-col items-center">
          <TapeLabel text="Volume IV" color="bg-[#d1d9e6]" />
          <h2 className="text-4xl font-black uppercase drop-shadow-[0_1px_0_#ffffff] mt-6">Universal Rubric</h2>
          <p className="text-[#4a5568] text-sm mt-4 max-w-2xl mx-auto font-medium italic drop-shadow-[0_1px_0_#ffffff]">
            The precise scientific and economic standards utilized by the prediction engine.
          </p>
        </div>

        <div className={`${theme.panel} p-12 max-w-6xl mx-auto relative`}>
          <div className="absolute top-4 left-4"><Screw/></div>
          <div className="absolute top-4 right-4"><Screw/></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             
             {/* AQI Reference */}
             <div className={`${theme.recessed} p-6`}>
                <div className="flex items-center gap-3 mb-6 border-b border-[#babecc]/50 pb-4">
                  <Activity size={18} className={theme.accent}/>
                  <h3 className="font-mono text-xs font-black uppercase tracking-widest">Air Quality</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono font-bold text-center">
                  <div className="bg-[#2ed573]/10 text-[#157a3b] p-3 rounded shadow-inner">0-50<br/>GOOD</div>
                  <div className="bg-[#ffa502]/10 text-[#966100] p-3 rounded shadow-inner">51-100<br/>MOD</div>
                  <div className="bg-[#ff4757]/10 text-[#ff4757] p-3 rounded shadow-inner">101-150<br/>SENSITIVE</div>
                  <div className="bg-[#ff4757]/20 text-[#ff4757] p-3 rounded shadow-inner">151-200<br/>UNHEALTHY</div>
                  <div className="bg-[#c0392b]/20 text-[#c0392b] p-3 rounded shadow-inner">201-300<br/>V. UNHLTHY</div>
                  <div className="bg-[#2d3436] text-white p-3 rounded shadow-inner">&gt; 300<br/>HAZARD</div>
                </div>
             </div>
             
             {/* Flood Reference */}
             <div className={`${theme.recessed} p-6`}>
                <div className="flex items-center gap-3 mb-6 border-b border-[#babecc]/50 pb-4">
                  <Zap size={18} className="text-cyan-500"/>
                  <h3 className="font-mono text-xs font-black uppercase tracking-widest">Flood Hazard</h3>
                </div>
                <div className="space-y-3 font-mono text-[10px] font-bold">
                  <div className="flex justify-between p-4 bg-white/50 rounded shadow-inner border border-[#babecc]/30"><span>&lt; 1.0</span><span>LOW_RISK</span></div>
                  <div className="flex justify-between p-4 bg-white/50 rounded shadow-inner border border-[#babecc]/30"><span>1.0 - 2.4</span><span>MODERATE</span></div>
                  <div className="flex justify-between p-4 bg-[#ff4757] text-white rounded shadow-inner"><span>&gt; 2.5</span><span>HIGH_RISK</span></div>
                </div>
             </div>
             
             {/* Price Reference */}
             <div className={`${theme.recessed} p-6`}>
                <div className="flex items-center gap-3 mb-6 border-b border-[#babecc]/50 pb-4">
                  <DatabaseBackupIcon size={18} className={theme.text}/>
                  <h3 className="font-mono text-xs font-black uppercase tracking-widest">Market Value</h3>
                </div>
                <div className="space-y-3 font-mono text-[10px] font-bold">
                   <div className="p-4 bg-white/50 rounded shadow-inner border border-[#babecc]/30">&lt; ₱1.5M: AFFORDABLE</div>
                   <div className="p-4 bg-white/50 rounded shadow-inner border border-[#babecc]/30">₱1.5M - ₱3M: MID-MARKET</div>
                   <div className="p-4 bg-[#2d3436] text-white rounded shadow-inner">&ge; ₱3.0M: PREMIUM ASSET</div>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* CONTRIBUTION PIPELINE (Dark Accent Surface Panel) */}
      <section className="container mx-auto px-6 py-40 bg-[#2d3436] rounded-[4rem] text-white relative z-10 shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Top Status Indicators */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-4">
          <LED active color="red"/><LED active color="yellow"/><LED active color="green"/>
        </div>

        <div className="text-center mb-20 flex flex-col items-center">
          <TapeLabel text="Crowdsourced Intelligence" />
          <h2 className="text-4xl font-black uppercase tracking-widest mt-6">Data Ingestion Pipeline</h2>
          <p className="text-[#a8b2d1] text-sm max-w-2xl mx-auto mt-4 leading-relaxed">
            Artificial Intelligence degrades over time. To ensure predictions remain accurate, House Sight Tanza operates as a living matrix, relying on public data ingestion to update its baseline.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
          
          {/* Hardware Connector Pipe (Desktop Only) */}
          <div className="hidden md:block absolute top-[44px] left-0 w-full h-3 bg-[#1c1c1c] rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] z-0"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#2d3436] border-[6px] border-[#ff4757] rounded-full flex items-center justify-center mb-6 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(0,0,0,0.5)]"><FileUpIcon size={32} className="text-[#ff4757]"/></div>
            <h3 className="text-xl font-black mb-3">1. SUBMISSION</h3>
            <p className="text-sm text-[#a8b2d1]">Public data block ingest via CSV upload by users or LGUs.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#2d3436] border-[6px] border-[#eccc68] rounded-full flex items-center justify-center mb-6 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(0,0,0,0.5)]"><ShieldCheckIcon size={32} className="text-[#eccc68]"/></div>
            <h3 className="text-xl font-black mb-3">2. AUTHORIZATION</h3>
            <p className="text-sm text-[#a8b2d1]">Maker-checker staging queue for Admin review protocol.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#2d3436] border-[6px] border-[#2ed573] rounded-full flex items-center justify-center mb-6 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(0,0,0,0.5)]"><DatabaseBackupIcon size={32} className="text-[#2ed573]"/></div>
            <h3 className="text-xl font-black mb-3">3. INTEGRATION</h3>
            <p className="text-sm text-[#a8b2d1]">Batch MLOps retraining for system XGBoost cores.</p>
          </div>
        </div>

        <div className="mt-20 flex justify-center">
          <button onClick={() => navigate('/contribute')} className={`${theme.btnBase} ${theme.btnAccent} !px-12 !py-5 shadow-[0_10px_20px_rgba(255,71,87,0.3)]`}>
            Contribute to the Matrix
          </button>
        </div>
      </section>

      <footer className="py-20 text-center font-mono text-[10px] font-bold text-[#a3b1c6] uppercase tracking-widest drop-shadow-[0_1px_0_#ffffff]">
        &copy; 2026 HOUSE_SIGHT_TANZA // ARCH_UNIT_01
      </footer>
      
    </div>
  );
};

export default LandingPage;