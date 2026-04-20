import React, { useState, useEffect } from 'react';
import { Compass, Library, ScrollText, Scale, Settings, CheckCircle, XCircle, Clock, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. SECURITY CHECK: Ensure the admin has a valid token
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    // If there is no token, immediately kick them out to the login page
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchQueue();
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // 2. FETCH QUEUE: Ask the server for pending datasets
  const fetchQueue = async () => {
    try {
      const response = await fetch('https://house-sight-tanza.onrender.com/admin/queue', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueue(data);
      } else if (response.status === 401) {
        // Token expired or invalid
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to fetch queue", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. REVIEW ACTION: Approve or Reject the file
  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    const formData = new FormData();
    formData.append('action', action);

    try {
      const response = await fetch(`https://house-sight-tanza.onrender.com/admin/review/${id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      if (response.ok) {
        // Refresh the queue to show the file has been removed
        fetchQueue();
      } else {
        alert("Action failed. You might not have the correct permissions.");
      }
    } catch (error) {
      alert("Network error. Check if the server is running.");
    }
  };

  // Don't render the dashboard if they are being redirected
  if (!token) return null; 

  return (
    <div className="min-h-screen relative z-10 flex flex-col pb-20">
      {/* SECURE NAVBAR */}
      <nav className="border-b border-academia-border px-8 py-5 flex justify-between items-center z-20 bg-academia-bg/90 backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-3 text-academia-accent font-display tracking-widest uppercase text-sm">
          <Compass size={22} className="text-academia-accent" />
          <span>House Sight Tanza <span className="text-[9px] text-academia-accentSecondary ml-2 border border-academia-accentSecondary px-1 py-0.5 rounded">SECURE</span></span>
        </div>
        <div className="flex gap-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all">
            <Library size={16} /> Home
          </button>
          <button onClick={() => navigate('/studio')} className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all">
            <ScrollText size={16} /> Studio
          </button>
          <button onClick={() => navigate('/analysis')} className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all">
            <Scale size={16} /> Analysis
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-academia-accentSecondary font-display uppercase tracking-widest text-xs hover:brightness-125 transition-all">
            <Lock size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="px-10 pt-16 pb-10 text-center max-w-4xl mx-auto w-full">
        <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-4 block">System Maintenance</span>
        <h1 className="text-5xl font-heading text-academia-foreground mb-4">Pending Data Queue</h1>
        <div className="ornate-divider max-w-xs mx-auto mb-6"></div>
        <p className="text-academia-mutedForeground text-lg italic">Review and authorize datasets submitted by public contributors before they enter the prediction matrix.</p>
      </header>

      {/* QUEUE DASHBOARD */}
      <main className="px-8 max-w-4xl w-full mx-auto">
        <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_8px_24px_rgba(0,0,0,0.3)] corner-flourish">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-academia-accent">
               <p className="font-display tracking-[0.2em] text-xs uppercase animate-pulse">Scanning Secure Queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-academia-mutedForeground">
              <Clock size={48} className="mb-4 opacity-50" />
              <p className="font-heading text-xl">The queue is empty.</p>
              <p className="font-body italic text-sm mt-2">No pending datasets require authorization.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => (
                <div key={item.id} className="bg-academia-bg border border-academia-border p-5 rounded flex justify-between items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-academia-bgAlt text-academia-accent border border-academia-accent/30 px-2 py-1 rounded font-display text-[9px] tracking-widest uppercase">
                        {item.factor.replace('_', ' ')}
                      </span>
                      <span className="font-heading text-lg text-academia-foreground">{item.barangay}</span>
                    </div>
                    <p className="text-xs font-body text-academia-mutedForeground">
                      Submitted by: <span className="font-bold text-[#E8DFD4]">{item.contributor}</span> | File: {item.filename}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleReview(item.id, 'reject')}
                      className="flex items-center gap-2 px-4 py-2 rounded text-xs font-display tracking-widest uppercase border border-academia-accentSecondary text-academia-accentSecondary hover:bg-academia-accentSecondary/10 transition-colors"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button 
                      onClick={() => handleReview(item.id, 'approve')}
                      className="flex items-center gap-2 px-4 py-2 rounded text-xs font-display tracking-widest uppercase bg-academia-accent text-[#1C1714] hover:brightness-110 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.3)] font-bold"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;