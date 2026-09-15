import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { HotspotRecord, BroadcastResponse } from '../types';
import { Bell, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { isWithinNortheastIndia } from '../utils/geo';

const VALID_NE_STATES = [
  'Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 
  'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'
];

const Alerts = () => {
  const [alerts, setAlerts] = useState<HotspotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL'|'CRITICAL'|'HIGH'|'MODERATE'|'LOW'>('ALL');
  
  // Modal State
  const [selectedAlert, setSelectedAlert] = useState<HotspotRecord | null>(null);
  const [broadcastStatus, setBroadcastStatus] = useState<'IDLE' | 'LOADING' | 'ERROR'>('IDLE');
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  
  // Track successful broadcasts locally to prevent duplicates
  const [broadcastedRecords, setBroadcastedRecords] = useState<Record<string, BroadcastResponse>>({});

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await api.getHotspots();
        const actionable = data.filter(h => 
          VALID_NE_STATES.includes(h.state) &&
          isWithinNortheastIndia(h.latitude, h.longitude)
        ).sort((a,b) => b.risk_score - a.risk_score);
        
        setAlerts(actionable);
      } catch (err) {
        setError('Backend unavailable. Start the SANKET FastAPI server.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const displayedAlerts = useMemo(() => {
    if (filter === 'ALL') return alerts.filter(a => a.risk_class === 'CRITICAL' || a.risk_class === 'HIGH');
    return alerts.filter(a => a.risk_class === filter);
  }, [alerts, filter]);

  const handleBroadcastConfirm = async () => {
    if (!selectedAlert) return;
    
    setBroadcastStatus('LOADING');
    setBroadcastError(null);
    
    try {
      const response = await api.broadcastAlert({
        state: selectedAlert.state,
        latitude: selectedAlert.latitude,
        longitude: selectedAlert.longitude,
        risk_score: selectedAlert.risk_score,
        risk_class: selectedAlert.risk_class,
        message: `LANDSLIDE EARLY WARNING:\nElevated landslide risk has been detected for ${selectedAlert.state}.\nRisk Score: ${selectedAlert.risk_score.toFixed(1)}/100.\nRisk Level: ${selectedAlert.risk_class}\nAuthorities and field teams are advised to review the location and take appropriate precautionary action.`
      });
      
      setBroadcastedRecords(prev => ({
        ...prev,
        [`${selectedAlert.latitude}-${selectedAlert.longitude}-${selectedAlert.date}`]: response
      }));
      setBroadcastStatus('IDLE');
      setSelectedAlert(null); // Close modal
    } catch (e: any) {
      setBroadcastError('Broadcast service unavailable. Please retry.');
      setBroadcastStatus('ERROR');
    }
  };

  if (loading) return <div className="flex justify-center h-full"><p className="text-lg text-sanket-sage">Loading alert data...</p></div>;
  if (error) return <div className="flex justify-center h-full"><p className="text-lg text-risk-critical">{error}</p></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-sanket-charcoal flex items-center gap-2">
            <Bell /> Actionable Risk Alerts
          </h2>
          <p className="text-sm text-gray-500 mt-1">{displayedAlerts.length} Active Alerts</p>
        </div>

        <div className="flex bg-sanket-white rounded-lg border border-sanket-olive p-1 shadow-sm overflow-x-auto max-w-full">
          {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map((level) => {
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

      <div className="space-y-4">
        {displayedAlerts.map((alert, idx) => {
          const alertKey = `${alert.latitude}-${alert.longitude}-${alert.date}`;
          const isBroadcasted = !!broadcastedRecords[alertKey];
          const broadcastData = broadcastedRecords[alertKey];

          return (
            <div key={idx} className={`bg-sanket-white p-5 rounded-lg border-l-4 shadow-sm flex flex-col sm:flex-row justify-between ${
              alert.risk_class === 'CRITICAL' ? 'border-l-risk-critical' : 
              alert.risk_class === 'HIGH' ? 'border-l-risk-high' : 
              alert.risk_class === 'MODERATE' ? 'border-l-risk-moderate' : 'border-l-risk-low'
            }`}>
              <div className="flex items-start gap-4 mb-4 sm:mb-0">
                <div className={`p-3 rounded-full mt-1 ${
                  alert.risk_class === 'CRITICAL' ? 'bg-red-100 text-risk-critical' : 
                  alert.risk_class === 'HIGH' ? 'bg-orange-100 text-risk-high' : 
                  alert.risk_class === 'MODERATE' ? 'bg-yellow-100 text-risk-moderate' : 'bg-green-100 text-risk-low'
                }`}>
                  {alert.risk_class === 'CRITICAL' || alert.risk_class === 'HIGH' ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-sanket-charcoal">{alert.state}</h3>
                  <p className="text-sm text-gray-500 mb-2">Predicted Date: {alert.date}</p>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600 mb-3">
                    <div><span className="font-semibold text-gray-400">LAT:</span> {alert.latitude.toFixed(5)}</div>
                    <div><span className="font-semibold text-gray-400">LON:</span> {alert.longitude.toFixed(5)}</div>
                  </div>
                  
                  <div className="text-sm bg-sanket-bg p-2 rounded border border-sanket-olive inline-block">
                    <span className="font-semibold text-gray-600">Trigger:</span> Triggered by elevated model-predicted landslide probability.
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Risk Score</p>
                    <p className={`text-2xl font-bold ${
                      alert.risk_class === 'CRITICAL' ? 'text-risk-critical' : 
                      alert.risk_class === 'HIGH' ? 'text-risk-high' : 
                      alert.risk_class === 'MODERATE' ? 'text-risk-moderate' : 'text-risk-low'
                    }`}>
                      {alert.risk_score.toFixed(1)}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded text-sm font-bold tracking-widest text-white ${
                    alert.risk_class === 'CRITICAL' ? 'bg-risk-critical' : 
                    alert.risk_class === 'HIGH' ? 'bg-risk-high' : 
                    alert.risk_class === 'MODERATE' ? 'bg-risk-moderate' : 'bg-risk-low'
                  }`}>
                    {alert.risk_class}
                  </div>
                </div>
                
                {isBroadcasted ? (
                  <div className="text-right bg-green-50 border border-green-200 px-3 py-2 rounded-md w-full sm:w-auto">
                    <p className="text-sm font-bold text-green-700 flex items-center justify-end gap-1"><CheckCircle size={16} /> EARLY WARNING DISPATCH RECORDED</p>
                    <p className="text-[10px] text-green-600 mt-1">Audience: BRO Field Officers, Local Administration, Registered Contacts</p>
                    <p className="text-[10px] text-green-600 font-mono mt-1">Broadcast ID: {broadcastData.broadcast_id}</p>
                    <p className="text-[10px] text-green-600 font-mono">Time: {new Date(broadcastData.timestamp).toLocaleString()}</p>
                  </div>
                ) : (
                  (alert.risk_class === 'CRITICAL' || alert.risk_class === 'HIGH') && (
                    <button 
                      onClick={() => setSelectedAlert(alert)}
                      className="w-full sm:w-auto px-4 py-2 bg-sanket-charcoal hover:bg-sanket-sage text-white text-sm font-bold rounded transition-colors"
                    >
                      Broadcast Alert
                    </button>
                  )
                )}
              </div>
            </div>
          )
        })}
        {displayedAlerts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No alerts found for this severity.
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-sanket-white rounded-lg border border-sanket-olive max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-risk-critical p-4 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><ShieldAlert /> SANKET EARLY WARNING BROADCAST</h3>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Location</p>
                    <p className="font-semibold text-sanket-charcoal">{selectedAlert.state}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Date</p>
                    <p className="font-semibold text-sanket-charcoal">{selectedAlert.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Risk Score</p>
                    <p className={`font-bold ${selectedAlert.risk_class === 'CRITICAL' ? 'text-risk-critical' : 'text-risk-high'}`}>{selectedAlert.risk_score.toFixed(1)}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Risk Level</p>
                    <p className={`font-bold ${selectedAlert.risk_class === 'CRITICAL' ? 'text-risk-critical' : 'text-risk-high'}`}>{selectedAlert.risk_class}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Dispatch Audience</p>
                  <ul className="list-disc list-inside text-sm font-semibold text-sanket-charcoal bg-sanket-bg p-3 border border-sanket-olive rounded">
                    <li>BRO Field Officers</li>
                    <li>Local District Administration</li>
                    <li>Registered Local Emergency Contacts</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Warning Message</p>
                  <div className="bg-sanket-bg p-3 rounded border border-sanket-olive text-sm font-mono text-sanket-charcoal whitespace-pre-wrap">
                    LANDSLIDE EARLY WARNING:
                    Elevated landslide risk has been detected for {selectedAlert.state}.
                    
                    Risk Score: {selectedAlert.risk_score.toFixed(1)}/100
                    Risk Level: {selectedAlert.risk_class}
                    
                    Authorities and field teams are advised to review the location and take appropriate precautionary action.
                  </div>
                </div>

                {broadcastStatus === 'ERROR' && (
                  <div className="p-3 bg-red-50 text-risk-critical text-sm rounded border border-red-200">
                    {broadcastError}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-sanket-olive bg-sanket-beige flex justify-end gap-3">
              <button 
                onClick={() => { setSelectedAlert(null); setBroadcastError(null); }}
                disabled={broadcastStatus === 'LOADING'}
                className="px-4 py-2 text-sanket-charcoal hover:bg-gray-200 font-bold rounded transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleBroadcastConfirm}
                disabled={broadcastStatus === 'LOADING'}
                className="px-6 py-2 bg-risk-critical hover:bg-red-700 text-white font-bold rounded transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {broadcastStatus === 'LOADING' ? 'Broadcasting...' : 'Confirm Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Alerts;
