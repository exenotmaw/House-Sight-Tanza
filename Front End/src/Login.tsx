import React, { useState } from 'react';
import { Compass, Library, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // NEW STATE FOR TOGGLE
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.access_token);
        navigate('/admin');
      } else {
        setError('Access Denied. Invalid credentials.');
      }
    } catch (err) {
      setError('Network error. Server might be offline.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10 flex flex-col justify-center items-center pb-20">
      
      {/* MINIMAL NAVBAR */}
      <nav className="absolute top-0 w-full border-b border-academia-border px-8 py-5 flex justify-between items-center z-20 bg-academia-bg/90 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-academia-accent font-display tracking-widest uppercase text-sm">
          <Compass size={22} className="text-academia-accent" />
          <span>House Sight Tanza</span>
        </div>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all">
          <Library size={16} /> Return Home
        </button>
      </nav>

      {/* LOGIN BOX */}
      <div className="bg-academia-bgAlt border border-academia-border rounded p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] corner-flourish max-w-md w-full mt-20">
        <div className="flex justify-center mb-6 text-academia-accent">
          <Lock size={40} />
        </div>
        <h1 className="text-3xl font-heading text-academia-foreground text-center mb-2">Admin Protocol</h1>
        <p className="text-academia-mutedForeground text-xs font-display tracking-widest uppercase text-center mb-8 block">Restricted Access</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-display text-[10px] tracking-widest uppercase text-academia-mutedForeground mb-2">Identifier</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-academia-bg border border-academia-border text-academia-foreground p-3 rounded font-body outline-none focus:border-academia-accent transition-colors"
              required
            />
          </div>
          
          {/* PASSWORD FIELD WITH TOGGLE */}
          <div>
            <label className="block font-display text-[10px] tracking-widest uppercase text-academia-mutedForeground mb-2">Passphrase</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-academia-bg border border-academia-border text-academia-foreground p-3 pr-12 rounded font-body outline-none focus:border-academia-accent transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-academia-mutedForeground hover:text-academia-accent transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-academia-accentSecondary text-sm font-body bg-academia-accentSecondary/10 p-3 rounded border border-academia-accentSecondary/30">
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 mt-4 rounded font-display uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
              isLoading 
                ? 'bg-academia-bg border border-academia-border text-academia-mutedForeground'
                : 'bg-brass-gradient text-[#1C1714] font-bold hover:brightness-110 shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
            }`}
          >
            {isLoading ? 'Authenticating...' : 'Establish Uplink'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;