import React, { useState, useEffect } from 'react';
import { Compass, UploadCloud, Database, Download, ChevronDown, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- DESIGN SYSTEM CONSTANTS (Industrial Skeuomorphism) ---
const theme = {
  chassis: "bg-[#e0e5ec]",
  text: "text-[#2d3436]",
  textMuted: "text-[#4a5568]",
  accent: "text-[#ff4757]",
  panel: "bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]",
  recessed: "bg-[#e0e5ec] rounded-xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]",
  input: "w-full bg-transparent outline-none font-mono text-sm font-bold text-[#2d3436] placeholder-[#4a5568]/50 p-4 focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757] rounded-xl transition-shadow",
  btnBase: "flex items-center justify-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-[0.1em] transition-all duration-150 active:translate-y-[2px]",
  btnStandard: "bg-[#e0e5ec] text-[#4a5568] rounded-xl shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] hover:text-[#ff4757]",
  btnAccent: "bg-[#ff4757] text-white rounded-xl shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.4)] active:shadow-[inset_6px_6px_12px_rgba(180,30,40,0.6),inset_-2px_-2px_4px_rgba(255,100,100,0.4)] hover:brightness-110 disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.4)] disabled:cursor-not-allowed",
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

const factors = [
  { id: 'house_price', label: 'Housing Prices (PHP)' },
  { id: 'flood_risk', label: 'Flood Hazard Trajectory (0-5)' },
  { id: 'air_quality', label: 'Air Quality Index (EPA)' }
];

const Contribute: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBarangay, setSelectedBarangay] = useState(barangays[0]);
  const [selectedFactor, setSelectedFactor] = useState(factors[0].id);
  const [contributorName, setContributorName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error' | null, message: string}>({ type: null, message: '' });

  useEffect(() => {
    // Strip away dark mode to respect the industrial palette
    document.documentElement.classList.remove('dark');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "year_recorded,value,specific_location,source\n2024,0,Enter Location Here,Enter Source Here";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "HouseSight_Data_Template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (!file || !contributorName) {
      setUploadStatus({ type: 'error', message: 'ERR: DATASET OR IDENTIFIER MISSING' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append('barangay', selectedBarangay);
    formData.append('factor', selectedFactor);
    formData.append('contributor_name', contributorName);
    formData.append('file', file);

    try {
      const response = await fetch('https://house-sight-tanza.onrender.com/public/submit-csv', {
        method: 'POST',
        body: formData, 
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus({ type: 'success', message: 'DATASET TRANSMITTED FOR ADMIN REVIEW' });
        setFile(null);
        setContributorName(''); 
      } else {
        setUploadStatus({ type: 'error', message: data.detail || 'ERR: TRANSMISSION FAILED' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'SYS_OFFLINE: UPLINK DISCONNECTED' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`min-h-screen relative z-10 flex flex-col pb-20 font-sans ${theme.chassis} ${theme.text}`}>
      
      {/* MACRO-TEXTURE */}
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
        <div className="hidden md:flex gap-4">
          <button onClick={() => navigate('/')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}>Home</button>
          <button onClick={() => navigate('/studio')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}> Studio</button>
          <button onClick={() => navigate('/analysis')} className={`${theme.btnBase} ${theme.btnStandard} !px-4 !py-2`}> Analysis</button>
          <button className={`${theme.btnBase} ${theme.btnAccent} !px-4 !py-2`}>Contribute</button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="px-10 pt-16 pb-10 text-center max-w-4xl mx-auto w-full relative z-10">
        <TapeLabel text="Public Data Ingestion" />
        <h1 className="text-5xl md:text-6xl font-black uppercase mt-6 tracking-tight drop-shadow-[0_2px_0_#ffffff] text-[#2d3436]">
          Data Portal
        </h1>
        <p className="text-[#4a5568] text-lg font-medium italic mt-4 max-w-2xl mx-auto drop-shadow-[0_1px_0_#ffffff]">
          Submit raw telemetry to enhance the predictive matrix. All submissions require Maker-Checker authorization prior to integration.
        </p>
      </header>

      <main className="px-6 max-w-2xl w-full mx-auto relative z-10">
        <div className={`${theme.panel} p-8 md:p-12 relative flex flex-col gap-8`}>
          <div className="absolute top-4 left-4"><Screw /></div>
          <div className="absolute top-4 right-4"><Screw /></div>
          <div className="absolute bottom-4 left-4"><Screw /></div>
          <div className="absolute bottom-4 right-4"><Screw /></div>
          
          <h2 className="font-black uppercase text-xl tracking-tight drop-shadow-[0_1px_0_#ffffff] flex items-center gap-2 mb-2 border-b border-[#babecc]/50 pb-4">
            <Cpu size={20} className={theme.accent}/> Ingestion Interface
          </h2>

          {/* NAME FIELD */}
          <div>
            <label className="block font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-[#4a5568] mb-2 pl-1 drop-shadow-[0_1px_0_#ffffff]">
              Operator / Organization Identifier
            </label>
            <div className={theme.recessed}>
              <input 
                type="text"
                placeholder="e.g., John Doe or Tanza LGU"
                className={theme.input}
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TARGET MUNICIPALITY */}
            <div>
              <label className="block font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-[#4a5568] mb-2 pl-1 drop-shadow-[0_1px_0_#ffffff]">
                Target Sector
              </label>
              <div className={`${theme.recessed} relative`}>
                <select 
                  className={`${theme.input} appearance-none cursor-pointer pr-10`}
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                >
                  {barangays.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5568] pointer-events-none" />
              </div>
            </div>

            {/* ENVIRONMENTAL VARIABLE */}
            <div>
              <label className="block font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-[#4a5568] mb-2 pl-1 drop-shadow-[0_1px_0_#ffffff]">
                Telemetry Type
              </label>
              <div className={`${theme.recessed} relative`}>
                <select 
                  className={`${theme.input} appearance-none cursor-pointer pr-10`}
                  value={selectedFactor}
                  onChange={(e) => setSelectedFactor(e.target.value)}
                >
                  {factors.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5568] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* FILE DROPZONE (Recessed Port) */}
          <div>
            <label className="block font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-[#4a5568] mb-2 pl-1 drop-shadow-[0_1px_0_#ffffff] flex justify-between items-end">
              <span>Data Block (.csv only)</span>
              <button 
                onClick={handleDownloadTemplate}
                className="text-[#ff4757] hover:text-[#2d3436] flex items-center gap-1 font-mono text-[9px] transition-colors"
                title="Download Template"
              >
                <Download size={12}/> Get Template
              </button>
            </label>
            
            <div className={`${theme.recessed} relative flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[#babecc]/50 hover:border-[#ff4757] transition-colors duration-300 group overflow-hidden`}>
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {/* Internal styling based on file presence */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] bg-[#e0e5ec] transition-transform duration-300 group-hover:-translate-y-1 ${file ? 'text-[#2ed573]' : 'text-[#a3b1c6]'}`}>
                <Database size={28} />
              </div>
              
              {file ? (
                <div className="font-mono text-sm font-black text-[#2ed573] flex flex-col items-center gap-2">
                  <CheckCircle2 size={20} />
                  <span>{file.name} LOADED</span>
                </div>
              ) : (
                <p className="font-mono text-[11px] font-bold text-[#4a5568] uppercase tracking-widest leading-relaxed">
                  Insert .CSV block here <br/> or <span className="text-[#ff4757]">click to browse system</span>
                </p>
              )}
            </div>
          </div>

          {/* STATUS LCD SCREEN */}
          {uploadStatus.message && (
            <div className={`${theme.recessed} p-4 flex items-center gap-3 border ${uploadStatus.type === 'success' ? 'border-[#2ed573]/50 bg-[#2ed573]/10' : 'border-[#ff4757]/50 bg-[#ff4757]/10'}`}>
              {uploadStatus.type === 'success' ? <CheckCircle2 size={18} className="text-[#2ed573]" /> : <AlertTriangle size={18} className="text-[#ff4757]" />}
              <span className={`font-mono text-[10px] font-black uppercase tracking-widest ${uploadStatus.type === 'success' ? 'text-[#157a3b]' : 'text-[#c0392b]'}`}>
                {uploadStatus.message}
              </span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button 
              onClick={handleSubmit}
              disabled={isUploading || !file || !contributorName}
              className={`${theme.btnBase} ${theme.btnAccent} w-full !py-5`}
            >
              {isUploading ? (
                <span className="flex items-center gap-2 animate-pulse"><Cpu size={18} className="animate-spin" /> Transmitting...</span>
              ) : (
                <span className="flex items-center gap-2"><UploadCloud size={18} /> Initialize Transfer</span>
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Contribute;