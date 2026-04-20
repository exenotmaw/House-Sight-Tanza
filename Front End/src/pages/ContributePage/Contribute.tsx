import React, { useState } from 'react';
import { Compass, Library, ScrollText, Scale, UploadCloud, Database, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      setUploadStatus({ type: 'error', message: 'Please provide your name and select a CSV file.' });
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
        setUploadStatus({ type: 'success', message: 'Success! Your dataset has been sent to the Admin for review.' });
        setFile(null);
        setContributorName(''); 
      } else {
        setUploadStatus({ type: 'error', message: data.detail || 'Submission failed.' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Network error. Could not reach the server.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10 flex flex-col pb-20">
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
          <button onClick={() => navigate('/analysis')} className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all">
            <Scale size={16} /> Analysis
          </button>
          <button className="flex items-center gap-2 text-academia-accent font-display uppercase tracking-widest text-xs">
            <FileUp size={16} /> Contribute
          </button>
        </div>
      </nav>

      <header className="px-10 pt-16 pb-10 text-center max-w-4xl mx-auto w-full">
        <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-4 block">Public Data Ingestion</span>
        <h1 className="text-5xl font-heading text-academia-foreground mb-4">Contribute to the Matrix</h1>
        <div className="ornate-divider max-w-xs mx-auto mb-6"></div>
        <p className="text-academia-mutedForeground text-lg italic">Submit local datasets to help improve the accuracy of our predictive models. All submissions are reviewed by an administrator before integration.</p>
      </header>

      <main className="px-8 max-w-2xl w-full mx-auto">
        <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_8px_24px_rgba(0,0,0,0.3)] corner-flourish">
          
          <div className="mb-6">
            <label className="block font-display text-[10px] tracking-widest uppercase text-academia-mutedForeground mb-2">Contributor Name / Organization</label>
            <input 
              type="text"
              placeholder="e.g., John Doe or Tanza LGU"
              className="w-full bg-academia-bg border border-academia-border text-academia-foreground p-3 rounded font-body outline-none focus:border-academia-accent transition-colors"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-display text-[10px] tracking-widest uppercase text-academia-mutedForeground mb-2">Target Municipality</label>
              <select 
                className="w-full bg-academia-bg border border-academia-border text-academia-foreground p-3 rounded font-body outline-none focus:border-academia-accent transition-colors"
                value={selectedBarangay}
                onChange={(e) => setSelectedBarangay(e.target.value)}
              >
                {barangays.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-display text-[10px] tracking-widest uppercase text-academia-mutedForeground mb-2">Environmental Variable</label>
              <select 
                className="w-full bg-academia-bg border border-academia-border text-academia-foreground p-3 rounded font-body outline-none focus:border-academia-accent transition-colors"
                value={selectedFactor}
                onChange={(e) => setSelectedFactor(e.target.value)}
              >
                {factors.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-display text-[10px] tracking-widest uppercase text-academia-mutedForeground mb-2">Dataset Upload (CSV only)</label>
            <div className="border-2 border-dashed border-academia-border hover:border-academia-accent/50 bg-academia-bg rounded-lg p-10 flex flex-col items-center justify-center transition-colors relative">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Database size={32} className={`mb-3 ${file ? 'text-academia-accent' : 'text-academia-mutedForeground'}`} />
              <p className="text-academia-foreground font-body text-sm text-center">
                {file ? (
                  <span className="text-academia-accent font-bold">{file.name}</span>
                ) : (
                  <span>Drag and drop your <span className="font-bold">.csv</span> file here, or click to browse.</span>
                )}
              </p>
            </div>
          </div>

          <div className="mb-8 text-center">
            <p className="text-xs font-body text-academia-mutedForeground">
              Need the correct format?{' '}
              <button 
                onClick={handleDownloadTemplate}
                className="text-academia-accent hover:text-[#E8DFD4] underline transition-colors"
              >
                Download a blank CSV template
              </button>
            </p>
          </div>

          {uploadStatus.message && (
            <div className={`p-4 rounded mb-6 text-sm font-body border ${uploadStatus.type === 'success' ? 'bg-academia-accent/10 border-academia-accent text-academia-accent' : 'bg-academia-accentSecondary/10 border-academia-accentSecondary text-academia-accentSecondary'}`}>
              {uploadStatus.message}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={isUploading || !file || !contributorName}
            className={`w-full py-4 rounded font-display uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
              isUploading || !file || !contributorName
                ? 'bg-academia-bg border border-academia-border text-academia-mutedForeground cursor-not-allowed'
                : 'bg-brass-gradient text-[#1C1714] font-bold hover:brightness-110 shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
            }`}
          >
            {isUploading ? 'Transmitting Data...' : <><UploadCloud size={16} /> Submit Dataset for Review</>}
          </button>

        </div>
      </main>
    </div>
  );
};

export default Contribute;