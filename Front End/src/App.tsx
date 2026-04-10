import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import Studio from './pages/PredictionStudio/Studio';
import Analysis from './pages/AnalysisPage/Analysis';

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </Router>
    
  );
}

export default App;