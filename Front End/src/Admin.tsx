import React, { useState, useEffect } from 'react';
import { Compass, Library, ScrollText, Scale, CheckCircle, XCircle, Clock, Lock, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [approvedFiles, setApprovedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // SECURITY CHECK
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchQueue();
      fetchApprovedFiles();
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // FETCH QUEUE
  const fetchQueue = async () => {
    try {
      const response = await fetch('https://house-sight-tanza.onrender.com/admin/queue', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueue(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to fetch queue", error);
    } finally {
      setLoading(false);
    }
  };

  // FETCH APPROVED FILES
  const fetchApprovedFiles = async () => {
    try {
      const response = await fetch('https://house-sight-tanza.onrender.com/admin/approved-files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApprovedFiles(data);
      }
    } catch (error) {
      console.error("Failed to fetch approved files", error);
    }
  };

  // REVIEW ACTION (Approve/Reject Pending)
  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    const formData = new FormData();
    formData.append('action', action);

    try {
      const response = await fetch(`https://house-sight-tanza.onrender.com/admin/review/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchQueue();
        fetchApprovedFiles(); // Refresh the list of approved files
      } else {
        alert("Action failed. You might not have the correct permissions.");
      }
    } catch (error) {
      alert("Network error. Check if the server is running.");
    }
  };

  // DELETE APPROVED FILE (Revert Baseline)
  const handleDeleteApproved = async (filename: string) => {
    if (!window.confirm("Are you sure? This will delete the dataset and reset the live prediction baseline.")) return;
    
    try {
      const response = await fetch(`https://house-sight-tanza.onrender.com/admin/approved-files/${filename}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchApprovedFiles();
      } else {
        alert("Action failed. You might not have the correct permissions.");
      }
    } catch (error) {
      alert("Network error.");
    }
  };

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

      <main className="px-8 max-w-4xl w-full mx-auto">
        {/* QUEUE DASHBOARD */}
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

        {/* APPROVED FILES HISTORY */}
        <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_8px_24px_rgba(0,0,0,0.3)] corner-flourish mt-8">
          <div className="flex items-center gap-3 mb-6 border-b border-academia-border pb-4">
            <Database size={24} className="text-academia-accent" />
            <h2 className="text-2xl font-heading text-academia-foreground">Integrated Datasets</h2>
          </div>

          {approvedFiles.length === 0 ? (
            <div className="text-center py-8 text-academia-mutedForeground font-body italic text-sm">
              No datasets have been integrated into the system yet.
            </div>
          ) : (
            <div className="space-y-3">
              {approvedFiles.map((file) => (
                <div key={file.filename} className="bg-academia-bg border border-academia-border/50 p-4 rounded flex justify-between items-center transition-colors hover:border-academia-border">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-academia-accent font-display text-[9px] tracking-widest uppercase bg-academia-bgAlt px-2 py-0.5 rounded border border-academia-accent/20">
                        {file.factor.replace('_', ' ')}
                      </span>
                      <span className="font-heading text-sm text-[#E8DFD4]">{file.barangay}</span>
                    </div>
                    <p className="text-[10px] font-mono text-academia-mutedForeground opacity-70">
                      File: {file.filename}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteApproved(file.filename)}
                    className="p-2 text-academia-mutedForeground hover:text-academia-accentSecondary hover:bg-academia-accentSecondary/10 rounded transition-all"
                    title="Delete and Revert Baseline"
                  >
                    <XCircle size={18} />
                  </button>
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