import { useState } from 'react';
import { api } from '../services/api';
import { PredictionInput, PredictionResult } from '../types';
import { BrainCircuit, AlertTriangle, ShieldCheck } from 'lucide-react';

const defaultFeatures: PredictionInput = {
    latitude: 23.31518,
    longitude: 93.30381,
    rainfall_24h_mm: 68.85,
    rainfall_72h_mm: 177.12,
    rainfall_7d_mm: 263.33,
    rainfall_intensity_3h_mm: 17.27,
    rainfall_anomaly_pct: 111.68,
    elevation_m: 633.21,
    slope_deg: 4.44,
    aspect_deg: 42.67,
    curvature: 0.1071,
    soil_moisture: 0.7029,
    clay_pct: 21.48,
    ndvi: 0.8126,
    geology_risk_index: 0.4449,
    displacement_mm: 7.24,
    historical_landslide_count: 3,
    distance_to_road_km: 0.03,
    distance_to_settlement_km: 6.068,
    infrastructure_exposure_index: 60.39
};

const AIAnalysis = () => {
  const [features, setFeatures] = useState<PredictionInput>(defaultFeatures);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictRisk(features);
      setResult(res);
    } catch (err: any) {
      setError('Prediction failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (cls?: string) => {
    switch(cls) {
      case 'CRITICAL': return 'text-risk-critical';
      case 'HIGH': return 'text-risk-high';
      case 'MODERATE': return 'text-risk-moderate';
      case 'LOW': return 'text-risk-low';
      default: return 'text-sanket-charcoal';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sanket-charcoal flex items-center gap-2">
          <BrainCircuit /> AI Risk Analysis Engine
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Form */}
        <div className="lg:col-span-2 bg-sanket-white p-6 rounded-lg border border-sanket-olive shadow-sm">
          <h3 className="text-lg font-bold mb-4 border-b border-sanket-olive pb-2">Environmental & Geological Features</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
            {Object.entries(features).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <label className="text-xs text-gray-600 font-medium mb-1 truncate" title={key}>{key}</label>
                <input 
                  type="number" 
                  step="any"
                  value={value}
                  onChange={(e) => setFeatures({...features, [key]: parseFloat(e.target.value) || 0})}
                  className="px-3 py-2 bg-sanket-bg border border-sanket-olive rounded focus:outline-none focus:border-sanket-sage text-sm"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-3 bg-sanket-sage text-white font-bold rounded hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Running AI Model...' : 'Run Prediction Model'}
          </button>
          {error && <p className="text-risk-critical text-sm mt-2">{error}</p>}
        </div>

        {/* Results Panel */}
        <div className="bg-sanket-white p-6 rounded-lg border border-sanket-olive shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-4 border-b border-sanket-olive pb-2">Analysis Results</h3>
          
          {result ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Model Probability</p>
                <p className="text-5xl font-light">{(result.landslide_probability * 100).toFixed(1)}<span className="text-2xl text-gray-400">%</span></p>
              </div>

              <div className="w-full border-t border-sanket-olive pt-6 text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Risk Score</p>
                <p className={`text-6xl font-bold ${getRiskColor(result.risk_class)}`}>
                  {result.risk_score.toFixed(1)}<span className="text-xl text-gray-400 font-normal">/100</span>
                </p>
              </div>

              <div className={`w-full py-3 rounded text-center font-bold tracking-widest text-white ${
                result.risk_class === 'CRITICAL' ? 'bg-risk-critical' :
                result.risk_class === 'HIGH' ? 'bg-risk-high' :
                result.risk_class === 'MODERATE' ? 'bg-risk-moderate' :
                'bg-risk-low'
              }`}>
                {result.risk_class} RISK
              </div>
              
              <div className="text-xs text-gray-500 text-center mt-4">
                Note: Prototype AI model. SHAP interpretation disabled in current configuration.
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
              <ShieldCheck size={48} className="mb-4 opacity-50" />
              <p>Enter features and run prediction to view AI analysis.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIAnalysis;
