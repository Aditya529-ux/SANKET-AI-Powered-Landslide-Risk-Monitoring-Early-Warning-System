import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { HotspotRecord } from '../types';
import RiskMap from '../components/RiskMap';
import { isWithinNortheastIndia } from '../utils/geo';

const VALID_NE_STATES = [
  'Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 
  'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'
];

type SeverityFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

const RiskMapPage = () => {
  const [hotspots, setHotspots] = useState<HotspotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SeverityFilter>('ALL');

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        setLoading(true);
        const data = await api.getHotspots();
        setHotspots(data);
        setError(null);
      } catch (err) {
        setError('Backend unavailable. Start the SANKET FastAPI server.');
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  // First apply geographic validity filter
  const validGeoHotspots = useMemo(() => {
    return hotspots.filter(spot => 
      VALID_NE_STATES.includes(spot.state) && 
      isWithinNortheastIndia(spot.latitude, spot.longitude)
    );
  }, [hotspots]);

  // Then apply severity filter
  const displayedHotspots = useMemo(() => {
    if (filter === 'ALL') return validGeoHotspots;
    return validGeoHotspots.filter(spot => spot.risk_class === filter);
  }, [validGeoHotspots, filter]);

  // Priority sidebar sorted by risk score descending (only from the currently filtered view)
  const priorityHotspots = [...displayedHotspots]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10);

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-lg text-sanket-sage">Loading risk data...</p></div>;
  if (error) return <div className="flex items-center justify-center h-full"><p className="text-lg text-risk-critical">{error}</p></div>;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sanket-charcoal mb-1">Regional Risk Map</h2>
          <p className="text-sm font-medium text-gray-500">
            {filter === 'ALL' 
              ? `Showing all ${displayedHotspots.length} hotspots` 
              : `Showing ${displayedHotspots.length} ${filter} hotspots`
            }
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex bg-sanket-white rounded-lg border border-sanket-olive p-1 shadow-sm overflow-x-auto max-w-full">
          {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as SeverityFilter[]).map((level) => {
            let activeColor = 'bg-sanket-sage text-white';
            if (level === 'CRITICAL') activeColor = 'bg-risk-critical text-white';
            else if (level === 'HIGH') activeColor = 'bg-risk-high text-white';
            else if (level === 'MODERATE') activeColor = 'bg-risk-moderate text-white';
            else if (level === 'LOW') activeColor = 'bg-risk-low text-white';

            return (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                  filter === level 
                    ? activeColor 
                    : 'text-gray-500 hover:bg-sanket-bg'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)]">
        {/* Map Container */}
        <div className="flex-1 bg-sanket-white rounded-lg border border-sanket-olive shadow-sm overflow-hidden z-0">
          <RiskMap hotspots={displayedHotspots} />
        </div>

        {/* Priority Hotspots Sidebar */}
        <div className="w-full lg:w-80 bg-sanket-white rounded-lg border border-sanket-olive shadow-sm flex flex-col">
          <div className="p-4 border-b border-sanket-olive bg-sanket-bg">
            <h3 className="font-bold text-sanket-charcoal">Priority Threat Hotspots</h3>
            <p className="text-xs text-gray-500">Highest predicted risk scores</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {priorityHotspots.length > 0 ? priorityHotspots.map((spot, idx) => (
              <div key={idx} className="p-3 rounded border border-sanket-olive bg-sanket-bg hover:bg-sanket-beige transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">{spot.state}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    spot.risk_class === 'CRITICAL' ? 'bg-red-100 text-risk-critical' :
                    spot.risk_class === 'HIGH' ? 'bg-orange-100 text-risk-high' :
                    spot.risk_class === 'MODERATE' ? 'bg-yellow-100 text-risk-moderate' :
                    'bg-green-100 text-risk-low'
                  }`}>
                    {spot.risk_score.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 flex justify-between">
                  <span>{spot.date}</span>
                  <span className="font-medium">{spot.risk_class}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                No {filter !== 'ALL' ? filter : ''} records found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMapPage;
