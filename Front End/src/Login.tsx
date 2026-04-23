import React, { useState, useEffect } from 'react';
import { Library, Lock, Eye, EyeOff, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- DESIGN SYSTEM CONSTANTS (Industrial Skeuomorphism) ---
// Note: Strictly Light Mode per the design system constraints.
const theme = {
  chassis: "bg-[#e0e5ec]", 
  text: "text-[#2d3436]",
  textMuted: "text-[#4a5568]",
  accent: "text-[#ff4757]",
  
  // Elevation Level +1: Raised Panels
  panel: "bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]",
  
  // Elevation Level -1: Sunken Input Wells
  recessed: "bg-[#e0e5ec] rounded-lg shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]",
  input: "w-full bg-transparent outline-none font-mono text-sm text-[#2d3436] placeholder-[#4a5568]/50 p-4 focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757] rounded-lg transition-shadow",
  
  // Elevation Level +2: Tactile Physical Switches
  btnBase: "flex items-center justify-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-[0.05em] transition-all duration-150 active:translate-y-[2px]",
  btnStandard: "bg-[#e0e5ec] text-[#4a5568] rounded-xl shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] hover:text-[#ff4757] hover:brightness-105",
  btnAccent: "bg-[#ff4757] text-white rounded-xl shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.4)] active:shadow-[inset_6px_6px_12px_rgba(180,30,40,0.6),inset_-2px_-2px_4px_rgba(255,100,100,0.4)] hover:brightness-110",
};

// --- MANUFACTURING HARDWARE COMPONENTS ---
const Screw = () => (
  <div className="w-3 h-3 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" 
       style={{ background: 'radial-gradient(circle at 3px 3px, rgba(0,0,0,0.1) 1px, transparent 2px), radial-gradient(circle at 9px 9px, rgba(0,0,0,0.1) 1px, transparent 2px), #d1d9e6' }}>
  </div>
);

const LED = ({ active, type = "status" }: { active: boolean, type?: "status" | "alert" }) => (
  <div className={`w-2.5 h-2.5 rounded-full border border-black/10 
    ${active 
      ? type === 'status' 
        ? 'bg-[#2ed573] shadow-[0_0_10px_2px_rgba(46,213,115,0.6)] animate-pulse' 
        : 'bg-[#ff4757] shadow-[0_0_10px_2px_rgba(255,71,87,0.6)]'
      : 'bg-[#a3b1c6] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]'
    }`} 
  />
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Strip away dark mode to respect the industrial palette
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('https://house-sight-tanza.onrender.com/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.access_token);
        navigate('/admin');
      } else {
        setError(data.detail || 'ERR: INVALID_CREDENTIALS');
      }
    } catch (err) {
      setError('SYS_OFFLINE: CHECK UPLINK');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-center items-center pb-20 font-sans ${theme.chassis} ${theme.text}`}>
      
      {/* MACRO-TEXTURE: Matte Plastic Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      {/* TOP CONTROL PANEL */}
      <nav className="absolute top-0 w-full p-6 md:p-10 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className={`${theme.panel} p-3 rounded-full flex items-center justify-center`}>
            <Cpu size={20} className={theme.text} />
          </div>
          <div>
            <h1 className="font-bold tracking-widest uppercase text-sm flex items-center gap-2 drop-shadow-[0_1px_0_#ffffff]">
              House Sight
            </h1>
            <p className={`text-[10px] uppercase font-mono font-bold tracking-[0.08em] ${theme.textMuted}`}>Security Gateway</p>
          </div>
        </div>
        
        <button onClick={() => navigate('/')} className={`${theme.btnBase} ${theme.btnStandard}`}>
          <Library size={16} /> Home
        </button>
      </nav>

      {/* LOGIN MODULE (The Chassis Mount) */}
      <div className={`${theme.panel} p-10 max-w-md w-full mt-10 z-10 relative`}>
        
        {/* Hardware Mounting Screws */}
        <div className="absolute top-4 left-4"><Screw /></div>
        <div className="absolute top-4 right-4"><Screw /></div>
        <div className="absolute bottom-4 left-4"><Screw /></div>
        <div className="absolute bottom-4 right-4"><Screw /></div>

        <div className="flex justify-center mb-8">
          <div className={`${theme.recessed} p-5 rounded-full flex items-center justify-center`}>
            <Lock size={32} className={theme.textMuted} />
          </div>
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tight text-center mb-3 drop-shadow-[0_1px_0_#ffffff]">
          Admin Protocol
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-10">
          <LED active={true} type="status" />
          <p className={`font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-center ${theme.textMuted}`}>
            Restricted Access
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* IDENTIFIER FIELD */}
          <div>
            <label className={`block font-mono text-[10px] font-bold tracking-[0.08em] uppercase ${theme.textMuted} mb-2 pl-1 drop-shadow-[0_1px_0_#ffffff]`}>
              Identifier
            </label>
            <div className={theme.recessed}>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={theme.input}
                placeholder="Enter Admin ID"
                required
              />
            </div>
          </div>
          
          {/* PASSPHRASE FIELD */}
          <div>
            <label className={`block font-mono text-[10px] font-bold tracking-[0.08em] uppercase ${theme.textMuted} mb-2 pl-1 drop-shadow-[0_1px_0_#ffffff]`}>
              Passphrase
            </label>
            <div className={`${theme.recessed} relative flex items-center`}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${theme.input} pr-16`}
                placeholder="••••••••••••"
                required
              />
              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-2 p-2.5 ${theme.btnStandard} !px-3 !py-2 !rounded-md`}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* ERROR DISPLAY (LED Alert) */}
          {error && (
            <div className="flex items-center gap-3 p-4 mt-2 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),0_1px_0_#ffffff]">
              <LED active={true} type="alert" />
              <span className={`font-mono text-[11px] font-bold tracking-[0.05em] uppercase ${theme.accent}`}>{error}</span>
            </div>
          )}

          {/* SUBMIT BUTTON (Safety Orange Push Button) */}
          <div className="pt-6">
            <button 
              type="submit"
              disabled={isLoading}
              className={`${theme.btnBase} ${isLoading ? theme.btnStandard : theme.btnAccent} w-full py-4 text-sm`}
            >
              {isLoading ? 'Processing...' : 'Establish Uplink'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;