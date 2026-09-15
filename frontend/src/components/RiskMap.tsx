import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { HotspotRecord } from '../types';
import { useMemo } from 'react';
import { isWithinNortheastIndia } from '../utils/geo';

const VALID_NE_STATES = [
  'Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 
  'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'
];

const RiskMap = ({ hotspots }: { hotspots: HotspotRecord[] }) => {
  const center: [number, number] = [26.2, 92.5];

  const getMarkerColor = (riskClass: string) => {
    switch(riskClass) {
      case 'CRITICAL': return '#D32F2F';
      case 'HIGH': return '#F57C00';
      case 'MODERATE': return '#FFB300';
      case 'LOW': return '#4CAF50';
      default: return '#9CB67B';
    }
  };

  const displaySpots = useMemo(() => {
    const validSpots = hotspots.filter(spot => {
      const isNEState = VALID_NE_STATES.includes(spot.state);
      const isInside = isWithinNortheastIndia(spot.latitude, spot.longitude);
      return isNEState && isInside;
    });

    // Instead of strictly slicing 300, we can show all valid points because of clustering
    return validSpots; 
  }, [hotspots]);

  return (
    <MapContainer center={center} zoom={6} className="h-full w-full" style={{ width: "100%", height: "100%", zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        showCoverageOnHover={false}
      >
        {displaySpots.map((spot, idx) => (
          <CircleMarker
            key={idx}
            center={[spot.latitude, spot.longitude]}
            radius={spot.risk_class === 'CRITICAL' ? 7 : spot.risk_class === 'HIGH' ? 5 : 3}
            pathOptions={{
              color: getMarkerColor(spot.risk_class),
              fillColor: getMarkerColor(spot.risk_class),
              fillOpacity: 0.8,
              weight: 1
            }}
          >
            <Popup>
              <div className="p-2 min-w-[150px]">
                <h4 className="font-bold border-b border-gray-200 pb-1 mb-2 text-sanket-charcoal">{spot.state}</h4>
                <p className="text-xs text-gray-500 mb-1">Date: {spot.date}</p>
                <div className="flex justify-between items-center text-sm font-semibold mt-2">
                  <span className="text-gray-600">Risk Score:</span>
                  <span style={{ color: getMarkerColor(spot.risk_class) }}>{spot.risk_score.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-600">Class:</span>
                  <span style={{ color: getMarkerColor(spot.risk_class) }}>{spot.risk_class}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default RiskMap;
