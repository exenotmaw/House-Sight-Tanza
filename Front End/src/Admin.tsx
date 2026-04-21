import React, { useState, useEffect } from 'react';
import { Compass, Library, CheckCircle, XCircle, Clock, Lock, Database, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [approvedFiles, setApprovedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // DATA VIEWER STATE
  const [viewingData, setViewingData] = useState<any[] | null>(null);
  const [viewingFileName, setViewingFileName] = useState<string>('');
  const [isViewerLoading, setIsViewerLoading] = useState(false);

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
        fetchApprovedFiles();
      } else {
        alert("Action failed. You might not have the correct permissions.");
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  const handleDeleteApproved = async (filename: string) => {
    if (!window.confirm("Are you sure? This will delete the dataset and reset the live prediction baseline.")) return;
    try {
      const response = await fetch(`https://house-sight-tanza.onrender.com/admin/approved-files/${filename}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchApprovedFiles();
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  // --- DATA VIEWER FUNCTIONS ---
  const handleViewPending = async (id: string, filename: string) => {
    setViewingFileName(filename);
    setIsViewerLoading(true);
    setViewingData(null);
    try {
      const response = await fetch(`https://house-sight-tanza.onrender.com/admin/queue/${id}/data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setViewingData(await response.json());
    } catch (err) {
      alert("Failed to load file data.");
    } finally {
      setIsViewerLoading(false);
    }
  };

  const handleViewApproved = async (filename: string) => {
    setViewingFileName(filename);
    setIsViewerLoading(true);
    setViewingData(null);
    try {
      const response = await fetch(`https://house-sight-tanza.onrender.com/admin/approved-files/${filename}/data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setViewingData(await response.json());
    } catch (err) {
      alert("Failed to load file data.");
    } finally {
      setIsViewerLoading(false);
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
          <button onClick={handleLogout} className="flex items-center gap-2 text-academia-accentSecondary font-display uppercase tracking-widest text-xs hover:brightness-125 transition-all">
            <Lock size={16} /> Logout
          </button>
        </div>
      </nav>

      <header className="px-10 pt-16 pb-10 text-center max-w-4xl mx-auto w-full">
        <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-4 block">System Maintenance</span>
        <h1 className="text-5xl font-heading text-academia-foreground mb-4">Pending Data Queue</h1>
        <div className="ornate-divider max-w-xs mx-auto mb-6"></div>
      </header>

      <main className="px-8 max-w-4xl w-full mx-auto relative">
        
        {/* QUEUE DASHBOARD */}
        <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_8px_24px_rgba(0,0,0,0.3)] corner-flourish">
          {loading ? (
            <div className="flex justify-center py-10"><p className="font-display text-xs uppercase text-academia-accent animate-pulse">Scanning Queue...</p></div>
          ) : queue.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-academia-mutedForeground">
              <Clock size={48} className="mb-4 opacity-50" />
              <p className="font-heading text-xl">The queue is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => (
                <div key={item.id} className="bg-academia-bg border border-academia-border p-5 rounded flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-academia-bgAlt text-academia-accent border border-academia-accent/30 px-2 py-1 rounded font-display text-[9px] uppercase">
                        {item.factor.replace('_', ' ')}
                      </span>
                      <span className="font-heading text-lg text-academia-foreground">{item.barangay}</span>
                    </div>
                    <p className="text-xs font-body text-academia-mutedForeground">
                      By: <span className="text-[#E8DFD4]">{item.contributor}</span> | {item.filename}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => handleViewPending(item.id, item.filename)} className="flex items-center gap-1 px-3 py-2 rounded text-[10px] font-display uppercase border border-academia-mutedForeground text-academia-mutedForeground hover:text-academia-foreground transition-colors">
                      <Eye size={14} /> View
                    </button>
                    <button onClick={() => handleReview(item.id, 'reject')} className="flex items-center gap-1 px-3 py-2 rounded text-[10px] font-display uppercase border border-academia-accentSecondary text-academia-accentSecondary hover:bg-academia-accentSecondary/10 transition-colors">
                      <XCircle size={14} /> Reject
                    </button>
                    <button onClick={() => handleReview(item.id, 'approve')} className="flex items-center gap-1 px-3 py-2 rounded text-[10px] font-display uppercase bg-academia-accent text-[#1C1714] font-bold hover:brightness-110">
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
            <div className="text-center py-8 text-academia-mutedForeground text-sm">No datasets integrated yet.</div>
          ) : (
            <div className="space-y-3">
              {approvedFiles.map((file) => (
                <div key={file.filename} className="bg-academia-bg border border-academia-border/50 p-4 rounded flex justify-between items-center hover:border-academia-border">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-academia-accent font-display text-[9px] uppercase bg-academia-bgAlt px-2 py-0.5 rounded border border-academia-accent/20">
                        {file.factor.replace('_', ' ')}
                      </span>
                      <span className="font-heading text-sm text-[#E8DFD4]">{file.barangay}</span>
                    </div>
                    <p className="text-[10px] font-mono text-academia-mutedForeground opacity-70">{file.filename}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => handleViewApproved(file.filename)} className="p-2 text-academia-mutedForeground hover:text-academia-foreground rounded transition-all" title="View Data">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleDeleteApproved(file.filename)} className="p-2 text-academia-mutedForeground hover:text-academia-accentSecondary rounded transition-all" title="Delete">
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CSV DATA VIEWER MODAL */}
        {(viewingData || isViewerLoading) && (
          <div className="fixed inset-0 bg-[#0A0806]/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-academia-bgAlt border border-academia-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="p-4 border-b border-academia-border flex justify-between items-center bg-academia-bg rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Database size={18} className="text-academia-accent" />
                  <h3 className="font-mono text-sm text-academia-foreground">{viewingFileName}</h3>
                </div>
                <button onClick={() => setViewingData(null)} className="text-academia-mutedForeground hover:text-academia-accentSecondary">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body (Table) */}
              <div className="p-6 overflow-auto">
                {isViewerLoading ? (
                  <div className="text-center text-academia-accent animate-pulse font-display text-xs">Decrypting File Contents...</div>
                ) : viewingData && viewingData.length > 0 ? (
                  <table className="w-full text-left text-sm text-academia-mutedForeground font-body">
                    <thead className="text-[10px] font-display uppercase tracking-widest text-academia-accent bg-academia-bg">
                      <tr>
                        {Object.keys(viewingData[0]).map(key => (
                          <th key={key} className="px-4 py-3 border-b border-academia-border">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {viewingData.map((row, index) => (
                        <tr key={index} className="border-b border-academia-border/30 hover:bg-academia-bg/50">
                          {Object.values(row).map((val: any, i) => (
                            <td key={i} className="px-4 py-3 text-[#E8DFD4]">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-academia-mutedForeground">No valid data found in this file.</div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Admin;