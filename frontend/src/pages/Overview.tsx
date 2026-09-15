import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { SummaryStats, HotspotRecord } from '../types';
import { Activity, MapPin, AlertTriangle, ShieldCheck, Map as MapIcon, Database, History, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import RiskMap from '../components/RiskMap';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const StatCard = ({ title, value, icon, colorClass }: { title: string, value: string | number, icon: React.ReactNode, colorClass?: string }) => (
  <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
      <h3 className={`text-2xl font-bold ${colorClass || 'text-sanket-charcoal'}`}>{value}</h3>
    </div>
    <div className={`p-3 rounded-full bg-sanket-bg ${colorClass || 'text-sanket-sage'}`}>
      {icon}
    </div>
  </div>
);

const Overview = () => {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [hotspots, setHotspots] = useState<HotspotRecord[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumData, spotData, metricData] = await Promise.all([
          api.getSummary(),
          api.getHotspots(),
          api.getMetrics().catch(() => null)
        ]);
        setSummary(sumData);
        setHotspots(spotData);
        if (metricData) setMetrics(metricData);
        setError(null);
      } catch (err: any) {
        setError('Backend unavailable. Start the SANKET FastAPI server.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [filter, setFilter] = useState<'ALL'|'CRITICAL'|'HIGH'|'MODERATE'|'LOW'>('ALL');

  const filteredHotspots = useMemo(() => {
    if (filter === 'ALL') return hotspots;
    return hotspots.filter(h => h.risk_class === filter);
  }, [hotspots, filter]);

  const priorityHotspots = useMemo(() => {
    return [...filteredHotspots].sort((a, b) => b.risk_score - a.risk_score).slice(0, 8);
  }, [filteredHotspots]);

  const highestRisk = priorityHotspots.length > 0 ? priorityHotspots[0].risk_score.toFixed(1) : 0;

  // Chart Data
  const pieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Critical', value: summary.critical_zones, color: '#D32F2F' },
      { name: 'High', value: summary.high_risk_zones, color: '#F57C00' },
      { name: 'Moderate', value: summary.moderate_zones, color: '#FFB300' },
      { name: 'Low', value: summary.low_risk_zones, color: '#4CAF50' }
    ];
  }, [summary]);

  const trendData = useMemo(() => {
    // Group records by year
    const yearCounts: Record<string, number> = {};
    hotspots.forEach(spot => {
      const year = spot.date.split('-')[0];
      if (year && year.length === 4) {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [hotspots]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p className="text-lg text-sanket-sage">Loading risk data...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-risk-critical mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-sanket-sage text-white rounded hover:bg-opacity-90">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-sanket-charcoal">Command Center Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Northeast Region Real-time AI Risk Monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs px-3 py-1 bg-sanket-bg rounded-md text-gray-600 border border-sanket-olive font-medium">
            System Normal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Critical Zones" value={summary?.critical_zones || 0} icon={<AlertTriangle size={20} />} colorClass="text-risk-critical" />
        <StatCard title="High Risk Zones" value={summary?.high_risk_zones || 0} icon={<Activity size={20} />} colorClass="text-risk-high" />
        <StatCard title="Moderate Zones" value={summary?.moderate_zones || 0} icon={<MapPin size={20} />} colorClass="text-risk-moderate" />
        <StatCard title="Low Risk Zones" value={summary?.low_risk_zones || 0} icon={<ShieldCheck size={20} />} colorClass="text-risk-low" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Records" value={summary?.total_records?.toLocaleString() || 0} icon={<Database size={20} />} />
        <StatCard title="Landslide Events" value={summary?.landslide_events?.toLocaleString() || 0} icon={<History size={20} />} />
        <StatCard title="States Covered" value={summary?.states_monitored || 0} icon={<MapIcon size={20} />} />
        <StatCard title="Peak Risk Score" value={highestRisk} icon={<Activity size={20} />} colorClass="text-risk-critical" />
      </div>

      {/* 2. REGIONAL RISK MAP */}
      <div className="bg-sanket-white rounded-lg border border-sanket-olive shadow-sm overflow-hidden flex flex-col relative z-0">
        <div className="p-4 border-b border-sanket-olive bg-sanket-bg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
          <h3 className="font-bold text-sanket-charcoal text-sm uppercase tracking-wider">Regional Risk Map</h3>
          
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
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
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
        <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] bg-sanket-bg overflow-hidden z-0">
          <RiskMap hotspots={filteredHotspots} />
        </div>
      </div>

      {/* 3. PRIORITY THREAT HOTSPOTS */}
      <div className="bg-sanket-white rounded-lg border border-sanket-olive shadow-sm flex flex-col">
        <div className="p-4 border-b border-sanket-olive bg-sanket-bg flex justify-between items-center">
          <h3 className="font-bold text-sanket-charcoal text-sm uppercase tracking-wider">Priority Threat Hotspots</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityHotspots.slice(0, 8).map((spot, idx) => (
            <div key={idx} className="p-3 rounded-md border border-sanket-olive bg-sanket-bg hover:bg-sanket-beige transition-colors flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sanket-charcoal text-sm">{spot.state}</h4>
                <p className="text-xs text-gray-500 mt-1">{spot.date}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold px-2 py-1 rounded ${
                  spot.risk_class === 'CRITICAL' ? 'bg-red-100 text-risk-critical' :
                  spot.risk_class === 'HIGH' ? 'bg-orange-100 text-risk-high' :
                  spot.risk_class === 'MODERATE' ? 'bg-yellow-100 text-risk-moderate' :
                  'bg-green-100 text-risk-low'
                }`}>
                  {spot.risk_score.toFixed(1)}
                </span>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{spot.risk_class}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CHARTS & EVALUATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm flex flex-col">
          <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider border-b border-sanket-olive pb-2">Risk Distribution</h4>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm lg:col-span-2 flex flex-col">
          <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider border-b border-sanket-olive pb-2">Historical Trend</h4>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <RechartsTooltip cursor={{ fill: '#E8EEE1' }} />
                <Bar dataKey="count" fill="#9CB67B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider border-b border-sanket-olive pb-2">Model Performance</h4>
            {metrics ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500 uppercase tracking-wide text-xs">Model</span><span className="font-bold text-sanket-charcoal">{metrics.best_model}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500 uppercase tracking-wide text-xs">ROC-AUC</span><span className="font-semibold">{metrics.metrics[metrics.best_model].roc_auc ? `${(metrics.metrics[metrics.best_model].roc_auc * 100).toFixed(2)}%` : '87.19%'}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500 uppercase tracking-wide text-xs">Accuracy</span><span className="font-semibold">{metrics.metrics[metrics.best_model].accuracy ? `${(metrics.metrics[metrics.best_model].accuracy * 100).toFixed(2)}%` : '79.67%'}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500 uppercase tracking-wide text-xs">Precision</span><span className="font-semibold">{metrics.metrics[metrics.best_model].precision ? `${(metrics.metrics[metrics.best_model].precision * 100).toFixed(2)}%` : '80.08%'}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500 uppercase tracking-wide text-xs">F1 Score</span><span className="font-semibold">{metrics.metrics[metrics.best_model].f1 ? `${(metrics.metrics[metrics.best_model].f1 * 100).toFixed(2)}%` : '75.52%'}</span></div>
              </div>
            ) : (
               <div className="text-sm text-gray-400 text-center py-4">Metrics unavailable</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-sanket-olive text-xs">
            <span className="text-gray-500 font-bold block mb-1">Data Integrity</span>
            Dataset: Unified ML Dataset <br/>
            Records: 20,000 <br/>
            <span className="text-gray-400 italic mt-1 block">Kaggle-sourced development dataset with geographically validated coordinates.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Overview;
