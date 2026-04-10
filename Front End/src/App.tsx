import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import Studio from './pages/PredictionStudio/Studio';
import Analysis from './pages/AnalysisPage/Analysis';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
      <Analytics /> 
    </Router>
    
  );
}

export default App;