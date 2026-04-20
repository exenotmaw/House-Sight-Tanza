import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import Studio from './pages/PredictionStudio/Studio';
import Analysis from './pages/AnalysisPage/Analysis';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import Contribute from './pages/ContributePage/Contribute';
import Admin from './Admin';
import Login from './Login';

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/contribute" element={<Contribute />} />
        <Route path="/admin/login" element={<Login />} />
      </Routes>
      <Analytics /> 
      <SpeedInsights /> 
    </Router>
    
  );
}

export default App;