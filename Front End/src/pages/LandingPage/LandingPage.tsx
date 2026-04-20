import { useNavigate } from 'react-router-dom';
import React from 'react';
import { 
  Compass, 
  Library, 
  ScrollText, 
  Scale, 
  Map, 
  Telescope, 
  BookOpen, 
  Landmark, 
  FileUpIcon,
  ShieldCheckIcon,
  DatabaseBackupIcon
} from 'lucide-react';

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

    return (
    // Main wrapper relies on global CSS for background, text, and noise texture
    <div className="relative z-10">
      
      {/* NAVBAR */}
      <nav className="border-b border-academia-border px-8 py-5 flex justify-between items-center z-20 relative bg-academia-bg/90 backdrop-blur-sm sticky top-0">
        
        {/* Logo Side */}
        <div className="flex items-center gap-3 text-academia-accent font-display tracking-widest uppercase text-sm">
          <Compass size={22} className="text-academia-accent" />
          <span>House Sight Tanza</span>
        </div>

        {/* Buttons Side */}
        <div className="flex gap-6">
          
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-academia-accent font-display uppercase tracking-widest text-xs hover:brightness-125 transition-all"
          >
            <Library size={16} /> Home
          </button>
          
          <button 
            onClick={() => navigate('/studio')} 
            className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all"
          >
            <ScrollText size={16} /> Studio
          </button>
          
          <button 
            onClick={() => navigate('/analysis')} 
            className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all"
          >
            <Scale size={16} /> Analysis
          </button>

          <button onClick={() => navigate('/contribute')} className="flex items-center gap-2 text-academia-mutedForeground hover:text-academia-accent font-display uppercase tracking-widest text-xs transition-all">
            <FileUpIcon size={16} /> Contribute
          </button>
          
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="container mx-auto px-6 pt-32 pb-40 flex flex-col items-center text-center relative z-10">
        
        {/* Elegant Top Label */}
        <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-6 block">
          A Predictive House Value Ledger
        </span>

        <h1 className="text-6xl md:text-7xl font-heading text-academia-foreground mb-6 leading-tight">
          House Sight Tanza
        </h1>
        
        <p className="text-academia-mutedForeground max-w-2xl mb-12 text-lg md:text-xl italic leading-relaxed">
          Your comprehensive scholastic platform for evaluating housing value in the municipality of Tanza. Make informed decisions rooted in meticulous data analysis.
        </p>

        {/* Ornate Divider */}
        <div className="ornate-divider max-w-xs mx-auto mb-12"></div>

        <div className="flex gap-6">
          {/* Primary Brass Button */}
          <button 
            onClick={() => navigate('/studio')} 
            className="bg-brass-gradient text-[#1C1714] font-display uppercase tracking-[0.15em] text-xs font-semibold px-10 py-4 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.3)] hover:brightness-110 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-300"
          >
            Open The Studio
          </button>
          
          {/* Secondary Outlined Button transforming to Crimson */}
          <button 
            onClick={() => navigate('/analysis')} 
            className="border-2 border-academia-accent text-academia-accent font-display uppercase tracking-[0.15em] text-xs font-semibold px-10 py-4 rounded hover:bg-academia-accentSecondary hover:border-academia-accentSecondary hover:text-academia-foreground transition-all duration-500"
          >
            Review Analysis
          </button>
        </div>
      </main>

      {/* KEY FEATURES */}
      <section className="container mx-auto px-6 pb-32 relative z-10">
        <div className="text-center mb-16">
          <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-3 block">Volume I</span>
          <h2 className="text-4xl md:text-5xl font-heading text-academia-foreground">Core Methodology</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-academia-bgAlt border border-academia-border rounded p-10 corner-flourish transition-all duration-500 hover:border-academia-accent/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] group relative">
              
              <div className="w-14 h-14 rounded-full border border-academia-accent/30 bg-academia-bg flex items-center justify-center mb-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] group-hover:border-academia-accent transition-colors duration-500">
                <feature.icon className="text-academia-accent" size={24} />
              </div>
              
              <h3 className="text-2xl font-heading text-academia-foreground mb-3">{feature.title}</h3>
              <p className="text-academia-mutedForeground text-lg leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYZED FACTORS */}
      <section className="container mx-auto px-6 pb-32 relative z-10">
        <div className="ornate-divider max-w-2xl mx-auto mb-20"></div>
        
        <div className="text-center mb-12">
          <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-3 block">Volume II</span>
          <h2 className="text-4xl md:text-5xl font-heading text-academia-foreground">Evaluated Variables</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto w-full">
          {factors.map((factor, idx) => (
            <div 
              key={idx} 
              className="bg-academia-bg border border-academia-border text-academia-foreground px-4 py-6 rounded font-display tracking-widest text-[11px] uppercase shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center text-center h-full"
            >
              {factor}
            </div>
          ))}
        </div>
      </section>

      {/* BARANGAYS LIST */}
      <section className="container mx-auto px-6 pb-32 relative z-10">
        <div className="ornate-divider max-w-2xl mx-auto mb-20"></div>

        <div className="text-center mb-12">
          <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-3 block">Volume III</span>
          <h2 className="text-4xl md:text-5xl font-heading text-academia-foreground">The Municipal Ledger</h2>
        </div>

        <div className="bg-academia-bgAlt border border-academia-border rounded p-12 max-w-5xl mx-auto corner-flourish shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
            {barangays.map((brgy, idx) => (
              <div key={idx} className="flex items-center gap-4 border-b border-academia-border/50 pb-2 hover:border-academia-accent/50 transition-colors duration-300">
                {/* Roman Numeral generation for the list (I, II, III...) */}
                <span className="font-display text-[10px] text-academia-accent w-6 text-right">
                  {['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'][idx]}.
                </span>
                <span className="text-academia-foreground font-body text-lg">{brgy}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNIVERSAL EVALUATION CRITERIA (The New Volume IV) */}
      <section className="container mx-auto px-6 pb-40 relative z-10">
        <div className="ornate-divider max-w-2xl mx-auto mb-20"></div>

        <div className="text-center mb-12">
          <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-3 block">Volume IV</span>
          <h2 className="text-4xl md:text-5xl font-heading text-academia-foreground">The Universal Rubric</h2>
          <p className="text-academia-mutedForeground text-lg italic mt-4 max-w-2xl mx-auto">
            The precise scientific and economic standards utilized by the prediction engine to evaluate municipal viability.
          </p>
        </div>

        <div className="bg-academia-bgAlt border border-academia-border rounded p-12 max-w-6xl mx-auto corner-flourish shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* AQI Reference (Updated to US EPA Scale) */}
            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-academia-border/50 pb-4">
                <BookOpen size={20} className="text-academia-accent" />
                <h3 className="font-display text-sm tracking-[0.2em] uppercase text-academia-foreground">Air Quality</h3>
              </div>
              <p className="font-body italic text-sm text-academia-mutedForeground mb-6">US EPA Index Standards</p>
              <div className="grid grid-cols-2 gap-3 text-xs font-body text-center">
                <div className="border border-academia-accent/30 bg-academia-accent/5 text-academia-accent rounded py-3">0 - 50<br/><span className="font-bold">Good</span></div>
                <div className="border border-academia-border bg-academia-bg/50 text-academia-mutedForeground rounded py-3">51 - 100<br/><span className="font-bold">Moderate</span></div>
                <div className="border border-academia-accentSecondary/30 bg-academia-accentSecondary/5 text-academia-accentSecondary rounded py-3">101 - 150<br/><span className="font-bold">Sensitive</span></div>
                <div className="border border-academia-accentSecondary/50 bg-academia-accentSecondary/10 text-academia-accentSecondary rounded py-3">151 - 200<br/><span className="font-bold">Unhealthy</span></div>
                <div className="border border-academia-accentSecondary/70 bg-academia-accentSecondary/15 text-academia-accentSecondary rounded py-3">201 - 300<br/><span className="font-bold">V. Unhealthy</span></div>
                <div className="border border-academia-accentSecondary bg-academia-accentSecondary/20 text-academia-accentSecondary rounded py-3">&gt; 300<br/><span className="font-bold">Hazardous</span></div>
              </div>
            </div>

            {/* Flood Reference */}
            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-academia-border/50 pb-4">
                <BookOpen size={20} className="text-academia-accentSecondary" />
                <h3 className="font-display text-sm tracking-[0.2em] uppercase text-academia-foreground">Flood Hazard</h3>
              </div>
              <p className="font-body italic text-sm text-academia-mutedForeground mb-6">0-5 Hazard Trajectory Scale</p>
              <div className="grid grid-cols-1 gap-3 text-xs font-body text-center">
                <div className="border border-academia-accent/30 bg-academia-accent/5 text-academia-accent rounded py-4">&lt; 1.0<br/><span className="font-bold">Low Risk</span></div>
                <div className="border border-academia-border bg-academia-bg/50 text-academia-mutedForeground rounded py-4">1.0 - 2.4<br/><span className="font-bold">Moderate</span></div>
                <div className="border border-academia-accentSecondary/30 bg-academia-accentSecondary/5 text-academia-accentSecondary rounded py-4">&ge; 2.5<br/><span className="font-bold">High Risk</span></div>
              </div>
            </div>

            {/* Price Reference */}
            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-academia-border/50 pb-4">
                <Landmark size={20} className="text-academia-accent" />
                <h3 className="font-display text-sm tracking-[0.2em] uppercase text-academia-foreground">Market Value</h3>
              </div>
              <p className="font-body italic text-sm text-academia-mutedForeground mb-6">Philippine Real Estate Segments</p>
              <div className="grid grid-cols-1 gap-3 text-xs font-body text-center">
                <div className="border border-academia-border bg-academia-bg/50 text-academia-mutedForeground rounded py-4">&lt; ₱1.5M<br/><span className="font-bold">Affordable</span></div>
                <div className="border border-academia-border bg-academia-bg/50 text-academia-mutedForeground rounded py-4">₱1.5M - ₱3M<br/><span className="font-bold">Mid-Market</span></div>
                <div className="border border-academia-accent/30 bg-academia-accent/5 text-academia-accent rounded py-4">&ge; ₱3.0M<br/><span className="font-bold">Premium Asset</span></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PUBLIC CONTRIBUTION SECTION */}
      <section className="px-10 py-20 max-w-5xl mx-auto w-full relative z-10 border-t border-academia-border">
        <div className="text-center mb-12">
          <span className="font-display text-xs text-academia-accent uppercase tracking-[0.3em] mb-4 block">Crowdsourced Intelligence</span>
          <h2 className="text-4xl font-heading text-academia-foreground mb-4">Combating Model Drift</h2>
          <div className="ornate-divider max-w-xs mx-auto mb-6"></div>
          <p className="text-academia-mutedForeground text-lg max-w-2xl mx-auto italic">
            Artificial Intelligence degrades over time as real-world economies and environments shift. To ensure our predictions remain highly accurate, House Sight Tanza operates as a living matrix, relying on public data ingestion to continuously update its mathematical baseline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Step 1 */}
          <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_4px_12px_rgba(0,0,0,0.2)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-academia-bg border border-academia-accent flex items-center justify-center text-academia-accent mb-4">
              <FileUpIcon size={20} />
            </div>
            <h3 className="font-heading text-xl text-academia-foreground mb-2">1. Public Submission</h3>
            <p className="font-body text-sm text-academia-mutedForeground">
              Researchers, LGUs, and citizens can upload localized CSV datasets containing recent housing prices, flood risks, or air quality indices.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_4px_12px_rgba(0,0,0,0.2)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-academia-bg border border-academia-accent flex items-center justify-center text-academia-accent mb-4">
              <ShieldCheckIcon size={20} />
            </div>
            <h3 className="font-heading text-xl text-academia-foreground mb-2">2. Maker-Checker Review</h3>
            <p className="font-body text-sm text-academia-mutedForeground">
              To preserve data integrity, all submissions enter a staging queue. A system administrator must review and authorize the data before integration.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-academia-bgAlt border border-academia-border rounded p-8 shadow-[0_4px_12px_rgba(0,0,0,0.2)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-academia-bg border border-academia-accent flex items-center justify-center text-academia-accent mb-4">
              <DatabaseBackupIcon size={20} />
            </div>
            <h3 className="font-heading text-xl text-academia-foreground mb-2">3. Batch MLOps Retraining</h3>
            <p className="font-body text-sm text-academia-mutedForeground">
              Approved datasets instantly update the system baseline, while an automated end-of-month pipeline retrains the core XGBoost engine.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/contribute')} 
            className="px-8 py-4 rounded font-display uppercase tracking-widest text-xs flex items-center justify-center gap-2 bg-brass-gradient text-[#1C1714] font-bold hover:brightness-110 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all"
          >
            <FileUpIcon size={16} /> Contribute to the Matrix
          </button>
        </div>
      </section>
      
    </div>
  );
};

export default LandingPage;