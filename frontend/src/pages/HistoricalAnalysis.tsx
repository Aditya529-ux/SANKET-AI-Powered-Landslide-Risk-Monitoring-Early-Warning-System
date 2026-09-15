import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { HotspotRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { History } from 'lucide-react';
import { isWithinNortheastIndia } from '../utils/geo';

const VALID_NE_STATES = [
  'Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 
  'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'
];

const HistoricalAnalysis = () => {
  const [data, setData] = useState<HotspotRecord[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [spots, metricData] = await Promise.all([
          api.getHotspots(),
          api.getMetrics().catch(() => null)
        ]);
        
        const validSpots = spots.filter(spot => 
          VALID_NE_STATES.includes(spot.state) &&
          isWithinNortheastIndia(spot.latitude, spot.longitude)
        );
        setData(validSpots);
        setMetrics(metricData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { eventsByYear, stateWiseCount, riskByYear } = useMemo(() => {
    const byYear: Record<string, number> = {};
    const stateCount: Record<string, number> = {};
    const riskY: Record<string, any> = {};

    data.forEach(spot => {
      const year = spot.date.split('-')[0];
      if (!year || year.length !== 4) return;
      
      byYear[year] = (byYear[year] || 0) + 1;
      
      stateCount[spot.state] = (stateCount[spot.state] || 0) + 1;
      
      if (!riskY[year]) {
        riskY[year] = { year, CRITICAL: 0, HIGH: 0, MODERATE: 0, LOW: 0 };
      }
      riskY[year][spot.risk_class]++;
    });

    return {
      eventsByYear: Object.keys(byYear).sort().map(year => ({ year, count: byYear[year] })),
      stateWiseCount: Object.keys(stateCount).map(state => ({ state, count: stateCount[state] })).sort((a,b) => b.count - a.count),
      riskByYear: Object.values(riskY).sort((a:any, b:any) => a.year.localeCompare(b.year))
    };
  }, [data]);

  const COLORS = ['#9CB67B', '#839E63', '#6A864B', '#516E33', '#38561B'];

  if (loading) return <div className="flex justify-center h-full"><p className="text-lg text-sanket-sage">Loading historical data...</p></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sanket-charcoal flex items-center gap-2">
          <History /> Historical Risk Analysis
        </h2>
        <span className="text-sm px-3 py-1 bg-sanket-white rounded-full border border-sanket-olive font-bold text-gray-600">
          {data.length.toLocaleString()} Total Valid Records
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-sanket-white p-4 rounded-lg border border-sanket-olive shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">Model</p>
          <p className="text-lg font-bold text-sanket-charcoal">{metrics ? metrics.best_model : 'Logistic Regression'}</p>
        </div>
        <div className="bg-sanket-white p-4 rounded-lg border border-sanket-olive shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">Accuracy & Precision</p>
          <p className="text-lg font-bold text-sanket-charcoal">
            {metrics ? `${(metrics.metrics[metrics.best_model].accuracy * 100).toFixed(2)}% / ${(metrics.metrics[metrics.best_model].precision * 100).toFixed(2)}%` : '...'}
          </p>
        </div>
        <div className="bg-sanket-white p-4 rounded-lg border border-sanket-olive shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">Recall & F1 Score</p>
          <p className="text-lg font-bold text-sanket-charcoal">
            {metrics ? `${(metrics.metrics[metrics.best_model].recall * 100).toFixed(2)}% / ${(metrics.metrics[metrics.best_model].f1 * 100).toFixed(2)}%` : '...'}
          </p>
        </div>
        <div className="bg-sanket-white p-4 rounded-lg border border-sanket-olive shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">ROC-AUC</p>
          <p className="text-lg font-bold text-sanket-charcoal">
            {metrics ? `${(metrics.metrics[metrics.best_model].roc_auc * 100).toFixed(2)}%` : '...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Events By Year */}
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm">
          <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-4 border-b border-sanket-olive pb-2">Risk Observations by Year</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={eventsByYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEE1" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#F57C00" strokeWidth={3} dot={{ r: 4, fill: '#F57C00' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Wise Count */}
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm">
          <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-4 border-b border-sanket-olive pb-2">State-wise Event Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stateWiseCount} dataKey="count" nameKey="state" cx="50%" cy="50%" outerRadius={80} label={({ state }) => state}>
                  {stateWiseCount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution by Year */}
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-4 border-b border-sanket-olive pb-2">Risk Severity Trend by Year</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskByYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEE1" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip />
                <Bar dataKey="CRITICAL" stackId="a" fill="#D32F2F" name="Critical" />
                <Bar dataKey="HIGH" stackId="a" fill="#F57C00" name="High" />
                <Bar dataKey="MODERATE" stackId="a" fill="#FFB300" name="Moderate" />
                <Bar dataKey="LOW" stackId="a" fill="#4CAF50" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HistoricalAnalysis;
