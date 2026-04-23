import React, { useState, useEffect } from 'react';
import {CheckCircle, XCircle, Eye, X, Power, Activity, HardDrive, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- DESIGN SYSTEM CONSTANTS (Industrial Skeuomorphism) ---
// Strictly Light Mode hardware aesthetic
const theme = {
  chassis: "bg-[#e0e5ec]",
  text: "text-[#2d3436]",
  textMuted: "text-[#4a5568]",
  accent: "text-[#ff4757]",
  
  // Elevation Level +1: Raised Panels
  panel: "bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]",
  
  // Elevation Level -1: Sunken Wells & Grooves
  recessed: "bg-[#e0e5ec] rounded-xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]",
  
  // Elevation Level +2: Tactile Physical Switches
  btnBase: "flex items-center justify-center gap-2 px-4 py-2 font-bold text-[10px] uppercase tracking-[0.05em] transition-all duration-150 active:translate-y-[2px]",
  btnStandard: "bg-[#e0e5ec] text-[#4a5568] rounded-lg shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] hover:text-[#ff4757]",
  btnAccent: "bg-[#ff4757] text-white rounded-lg shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.4)] active:shadow-[inset_6px_6px_12px_rgba(180,30,40,0.6),inset_-2px_-2px_4px_rgba(255,100,100,0.4)]",
};

// --- MANUFACTURING HARDWARE COMPONENTS ---
const Screw = () => (
  <div className="w-3 h-3 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" 
       style={{ background: 'radial-gradient(circle at 3px 3px, rgba(0,0,0,0.1) 1px, transparent 2px), radial-gradient(circle at 9px 9px, rgba(0,0,0,0.1) 1px, transparent 2px), #d1d9e6' }}>
  </div>
);

const Vents = () => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="w-1.5 h-6 rounded-full bg-[#d1d9e6] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2),inset_-1px_-1px_2px_#ffffff]" />
    ))}
  </div>
);

const LED = ({ active, color = "green" }: { active: boolean, color?: "green" | "red" | "yellow" }) => {
  const glowColors = {
    green: "bg-[#2ed573] shadow-[0_0_10px_2px_rgba(46,213,115,0.6)] animate-pulse",
    red: "bg-[#ff4757] shadow-[0_0_10px_2px_rgba(255,71,87,0.6)]",
    yellow: "bg-[#eccc68] shadow-[0_0_10px_2px_rgba(236,204,104,0.6)]"
  };
  return (
    <div className={`w-2.5 h-2.5 rounded-full border border-black/10 ${active ? glowColors[color] : 'bg-[#a3b1c6] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]'}`} />
  );
};

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [approvedFiles, setApprovedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Data Viewer Modal State
  const [viewingData, setViewingData] = useState<any[] | null>(null);
  const [viewingFileName, setViewingFileName] = useState<string>('');
  const [isViewerLoading, setIsViewerLoading] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    // Strip away dark mode globally
    document.documentElement.classList.remove('dark');
    if (!token) navigate('/admin/login');
    else { fetchQueue(); fetchApprovedFiles(); }
  }, [token, navigate]);

  const handleLogout = () => { localStorage.removeItem('adminToken'); navigate('/admin/login'); };

  const fetchQueue = async () => {
    try {
      const res = await fetch('https://house-sight-tanza.onrender.com/admin/queue', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setQueue(await res.json()); else if (res.status === 401) handleLogout();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchApprovedFiles = async () => {
    try {
      const res = await fetch('https://house-sight-tanza.onrender.com/admin/approved-files', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setApprovedFiles(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    const formData = new FormData(); formData.append('action', action);
    try {
      const res = await fetch(`https://house-sight-tanza.onrender.com/admin/review/${id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (res.ok) { fetchQueue(); fetchApprovedFiles(); } else alert("Permission Denied.");
    } catch (e) { alert("Network Error."); }
  };

  const handleDeleteApproved = async (filename: string) => {
    if (!window.confirm("ENGAGE PURGE PROTOCOL? This physically deletes the file and recalculates the live baseline.")) return;
    try {
      const res = await fetch(`https://house-sight-tanza.onrender.com/admin/approved-files/${filename}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchApprovedFiles();
    } catch (e) { alert("Network Error."); }
  };

  const handleView = async (endpoint: string, filename: string) => {
    setViewingFileName(filename); setIsViewerLoading(true); setViewingData(null);
    try {
      const res = await fetch(`https://house-sight-tanza.onrender.com${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setViewingData(await res.json());
    } catch (err) { alert("Failed to load file."); } finally { setIsViewerLoading(false); }
  };

  if (!token) return null;

  return (
    <div className={`min-h-screen font-sans ${theme.chassis} ${theme.text} pb-20 relative`}>
      
      {/* MACRO-TEXTURE: Matte Plastic Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      {/* TOP NAVBAR (Mounted Dashboard Strip) */}
      <nav className={`${theme.panel} mx-6 mt-6 px-6 py-4 flex justify-between items-center sticky top-6 z-20`}>
        <div className="flex items-center gap-4">
          <div className={`${theme.recessed} p-3 rounded-full flex items-center justify-center`}>
            <Cpu size={20} className={theme.text} />
          </div>
          <div>
            <h1 className="font-bold tracking-widest uppercase text-xs flex items-center gap-2 drop-shadow-[0_1px_0_#ffffff]">
              House Sight <LED active={true} color="green" />
            </h1>
            <p className={`text-[9px] font-bold tracking-[0.1em] uppercase font-mono ${theme.textMuted}`}>Admin SetUp</p>
          </div>
        </div>
        
        <button onClick={handleLogout} className={`${theme.btnBase} ${theme.btnStandard} !px-3`}>
          <Power size={14} className="text-[#ff4757]" /> Disconnect
        </button>
      </nav>

      {/* MAIN DASHBOARD */}
      <main className="w-full max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
        
        {/* MODULE 1: PENDING QUEUE */}
        <div className={`${theme.panel} p-8 relative flex flex-col min-h-[500px]`}>
          <div className="absolute top-4 left-4"><Screw /></div>
          <div className="absolute top-4 right-4"><Vents /></div>
          <div className="absolute bottom-4 left-4"><Screw /></div>
          <div className="absolute bottom-4 right-4"><Screw /></div>

          <header className="mb-6 mt-4 pl-4 border-l-4 border-[#ff4757]">
            <h2 className="text-xl font-black uppercase tracking-tight drop-shadow-[0_1px_0_#ffffff]">Pending Ingestion</h2>
            <p className={`font-mono font-bold tracking-[0.08em] text-[10px] mt-1 ${theme.textMuted} uppercase`}>Awaiting Authorization</p>
          </header>

          <div className={`${theme.recessed} flex-1 p-5 overflow-y-auto space-y-4`}>
            {loading ? (
              <div className="h-full flex items-center justify-center font-mono font-bold text-[10px] tracking-widest uppercase text-[#a3b1c6] animate-pulse">Scanning Memory...</div>
            ) : queue.length === 0 ? (
              <div className={`h-full flex flex-col items-center justify-center font-mono font-bold text-[10px] tracking-widest uppercase ${theme.textMuted}`}>
                <Activity size={32} className="mb-3 opacity-40 drop-shadow-sm" />
                No Pending Datasets
              </div>
            ) : (
              queue.map((item) => (
                <div key={item.id} className={`${theme.panel} !shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] p-4 flex flex-col sm:flex-row justify-between gap-4 border-none`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${theme.recessed} !shadow-[inset_2px_2px_4px_#babecc,inset_-2px_-2px_4px_#ffffff] px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest`}>
                        {item.factor.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-sm drop-shadow-[0_1px_0_#ffffff]">{item.barangay}</span>
                    </div>
                    <p className={`text-[10px] font-mono font-bold ${theme.textMuted}`}>SRC: {item.contributor} | {item.filename}</p>
                  </div>
                  <div className="flex gap-3 items-center mt-2 sm:mt-0">
                    <button onClick={() => handleView(`/admin/queue/${item.id}/data`, item.filename)} className={`${theme.btnBase} ${theme.btnStandard} !px-3`} title="Inspect"><Eye size={14}/></button>
                    <button onClick={() => handleReview(item.id, 'reject')} className={`${theme.btnBase} ${theme.btnStandard} !px-3`} title="Reject"><XCircle size={14}/></button>
                    <button onClick={() => handleReview(item.id, 'approve')} className={`${theme.btnBase} ${theme.btnAccent} !px-4`}><CheckCircle size={14}/> Auth</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODULE 2: MASTER DATABASE */}
        <div className={`${theme.panel} p-8 relative flex flex-col min-h-[500px]`}>
          <div className="absolute top-4 left-4"><Screw /></div>
          <div className="absolute top-4 right-4"><Screw /></div>
          <div className="absolute bottom-4 left-4"><Vents /></div>
          <div className="absolute bottom-4 right-4"><Screw /></div>

          <header className="mb-6 mt-4 pl-4 border-l-4 border-[#2ed573]">
            <h2 className="text-xl font-black uppercase tracking-tight drop-shadow-[0_1px_0_#ffffff] flex items-center gap-2">Matrix Memory <HardDrive size={18}/></h2>
            <p className={`font-mono font-bold tracking-[0.08em] text-[10px] mt-1 ${theme.textMuted} uppercase`}>Integrated Baselines</p>
          </header>

          <div className={`${theme.recessed} flex-1 p-5 overflow-y-auto space-y-4`}>
            {approvedFiles.length === 0 ? (
              <div className={`h-full flex flex-col items-center justify-center font-mono font-bold text-[10px] tracking-widest uppercase ${theme.textMuted}`}>
                 <HardDrive size={32} className="mb-3 opacity-40 drop-shadow-sm" />
                 System at Default Baseline
              </div>
            ) : (
              approvedFiles.map((file) => (
                <div key={file.filename} className={`${theme.panel} !shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] p-4 flex flex-col sm:flex-row justify-between gap-4 border-none`}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <LED active={true} color="green" />
                      <span className="font-bold text-sm drop-shadow-[0_1px_0_#ffffff]">{file.barangay}</span>
                      <span className={`text-[9px] font-mono font-bold tracking-widest ${theme.textMuted} uppercase`}>[{file.factor.replace('_', ' ')}]</span>
                    </div>
                    <p className={`text-[10px] font-mono font-bold ${theme.textMuted}`}>{file.filename}</p>
                  </div>
                  <div className="flex gap-3 items-center mt-2 sm:mt-0">
                    <button onClick={() => handleView(`/admin/approved-files/${file.filename}/data`, file.filename)} className={`${theme.btnBase} ${theme.btnStandard} !px-3`}><Eye size={14}/></button>
                    <button onClick={() => handleDeleteApproved(file.filename)} className={`${theme.btnBase} ${theme.btnStandard} !px-3 !text-[#ff4757]`}><XCircle size={14}/></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DATA VIEWER MODAL (Hardware Display Panel) */}
        {(viewingData || isViewerLoading) && (
          <div className="fixed inset-0 bg-[#e0e5ec]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-10">
            <div className={`${theme.panel} w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden relative`}>
              
              {/* Hardware Screws for Modal */}
              <div className="absolute top-4 left-4"><Screw /></div>
              <div className="absolute top-4 right-4"><Screw /></div>
              
              {/* Modal Header */}
              <div className="px-12 py-5 flex justify-between items-center z-10 border-b border-[#babecc]/30 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3">
                  <LED active={true} color="yellow" />
                  <h3 className="font-mono text-xs font-bold tracking-[0.1em] text-[#2d3436] uppercase drop-shadow-[0_1px_0_#ffffff]">Data Block: {viewingFileName}</h3>
                </div>
                <button onClick={() => setViewingData(null)} className={`${theme.btnBase} ${theme.btnStandard} !px-3`}>
                  <X size={14} /> Close
                </button>
              </div>

              {/* Data Table Area (Sunken Display Screen) */}
              <div className="flex-1 p-6">
                <div className={`${theme.recessed} w-full h-full p-4 overflow-auto`}>
                  {isViewerLoading ? (
                    <div className="flex items-center justify-center h-full text-[#a3b1c6] font-mono text-[10px] font-bold uppercase tracking-widest animate-pulse">Accessing Sector...</div>
                  ) : viewingData && viewingData.length > 0 ? (
                    <table className="w-full text-left font-mono text-[11px] text-[#4a5568]">
                      <thead className="text-[#2d3436] sticky top-0 bg-[#e0e5ec] shadow-[0_2px_4px_rgba(0,0,0,0.05)] z-10">
                        <tr>
                          {Object.keys(viewingData[0]).map(key => (
                            <th key={key} className="py-3 px-6 uppercase font-black tracking-widest drop-shadow-[0_1px_0_#ffffff]">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {viewingData.map((row, index) => (
                          <tr key={index} className="border-b border-[#babecc]/40 hover:bg-[#babecc]/10 transition-colors">
                            {Object.values(row).map((val: any, i) => (
                              <td key={i} className="py-3 px-6 font-bold">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex items-center justify-center h-full font-mono text-[10px] font-bold uppercase tracking-widest text-[#ff4757]">No Data Blocks Found</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Admin;