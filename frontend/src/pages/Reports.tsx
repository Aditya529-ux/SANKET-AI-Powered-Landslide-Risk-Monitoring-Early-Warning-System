import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileText, Download, CheckCircle, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const m = await api.getMetrics();
        setMetrics(m);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const handleExport = () => {
    const content = JSON.stringify(metrics, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SANKET_Model_Evaluation_Report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center h-full"><p className="text-lg text-sanket-sage">Loading reports...</p></div>;

  // Prepare chart data
  const chartData = metrics && metrics.metrics ? Object.keys(metrics.metrics).map(key => ({
    name: key,
    Accuracy: Number((metrics.metrics[key].accuracy * 100).toFixed(2)),
    Precision: Number((metrics.metrics[key].precision * 100).toFixed(2)),
    Recall: Number((metrics.metrics[key].recall * 100).toFixed(2)),
    F1: Number((metrics.metrics[key].f1 * 100).toFixed(2)),
    'ROC-AUC': Number((metrics.metrics[key].roc_auc * 100).toFixed(2))
  })) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-sanket-olive pb-4">
        <div>
          <h2 className="text-2xl font-bold text-sanket-charcoal flex items-center gap-2">
            <FileText /> ML Model Evaluation Report
          </h2>
          <p className="text-sm text-gray-500 mt-1">Detailed performance analysis of evaluated prediction algorithms</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-sanket-charcoal text-white px-4 py-2 rounded font-bold hover:bg-sanket-sage transition-colors text-sm"
        >
          <Download size={16} /> Export JSON
        </button>
      </div>

      {metrics && metrics.metrics && (
        <>
          {/* MODEL CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Logistic Regression', 'Random Forest', 'Gradient Boosting'].map(modelName => {
              const m = metrics.metrics[modelName];
              const isSelected = metrics.best_model === modelName;

              return (
                <div key={modelName} className={`p-5 rounded-lg border shadow-sm ${isSelected ? 'bg-sanket-white border-sanket-olive ring-2 ring-sanket-sage' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-sanket-charcoal uppercase tracking-wider">{modelName}</h3>
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-white bg-sanket-sage px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle size={12} /> SELECTED MODEL
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                        <Info size={12} /> EVALUATED MODEL
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-sm text-gray-600 font-medium">Accuracy</span>
                      <span className="text-sm font-bold text-sanket-charcoal">{(m.accuracy * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-sm text-gray-600 font-medium">Precision</span>
                      <span className="text-sm font-bold text-sanket-charcoal">{(m.precision * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-sm text-gray-600 font-medium">Recall</span>
                      <span className="text-sm font-bold text-sanket-charcoal">{(m.recall * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-sm text-gray-600 font-medium">F1 Score</span>
                      <span className="text-sm font-bold text-sanket-charcoal">{(m.f1 * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-sm text-gray-600 font-medium">ROC-AUC</span>
                      <span className="text-sm font-bold text-sanket-charcoal">{(m.roc_auc * 100).toFixed(2)}%</span>
                    </div>
                  </div>

                  {isSelected && (
                    <p className="text-xs text-sanket-sage mt-4 leading-relaxed font-medium">
                      Selected for the SANKET prediction engine based on the strongest overall F1 Score and ROC-AUC among the evaluated models.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* MODEL COMPARISON GRAPH */}
          <div className="bg-sanket-white p-6 rounded-lg border border-sanket-olive shadow-sm">
            <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-6 border-b border-sanket-olive pb-2">Model Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEE1" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} domain={['dataMin - 5', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #B8C99F' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Bar dataKey="Accuracy" fill="#9CB67B" />
                  <Bar dataKey="Precision" fill="#B8C99F" />
                  <Bar dataKey="Recall" fill="#E8EEE1" stroke="#9CB67B" />
                  <Bar dataKey="F1" fill="#4CAF50" />
                  <Bar dataKey="ROC-AUC" fill="#252525" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-500 mt-6 max-w-2xl mx-auto">
              Logistic Regression achieved the highest F1 Score and ROC-AUC among the evaluated models and is therefore used by the SANKET prediction engine.
            </p>
          </div>

          {/* MODEL SELECTION SUMMARY */}
          <div className="bg-sanket-white p-6 rounded-lg border border-sanket-olive shadow-sm overflow-x-auto">
            <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-6 border-b border-sanket-olive pb-2">Model Selection Summary</h3>
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Precision</th>
                  <th className="py-3 px-4">Recall</th>
                  <th className="py-3 px-4">F1 Score</th>
                  <th className="py-3 px-4">ROC-AUC</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-sanket-charcoal font-medium divide-y divide-gray-100">
                {['Logistic Regression', 'Random Forest', 'Gradient Boosting'].map(modelName => {
                  const m = metrics.metrics[modelName];
                  const isSelected = metrics.best_model === modelName;

                  return (
                    <tr key={modelName} className={isSelected ? 'bg-sanket-sage bg-opacity-10' : 'hover:bg-gray-50'}>
                      <td className={`py-3 px-4 ${isSelected ? 'font-bold' : ''}`}>{modelName}</td>
                      <td className="py-3 px-4">{(m.accuracy * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4">{(m.precision * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4">{(m.recall * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4">{(m.f1 * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4">{(m.roc_auc * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4 text-right">
                        {isSelected ? (
                          <span className="text-[10px] font-bold text-white bg-sanket-sage px-2 py-1 rounded">SELECTED</span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">EVALUATED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Dataset Summary (preserved from old layout but cleaner) */}
      <div className="bg-sanket-white p-6 rounded-lg border border-sanket-olive shadow-sm">
        <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-6 border-b border-sanket-olive pb-2">Dataset & Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Dataset Size</span>
            <span className="text-lg font-bold text-sanket-charcoal">20,000</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">States</span>
            <span className="text-lg font-bold text-sanket-charcoal">8</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Time Period</span>
            <span className="text-lg font-bold text-sanket-charcoal">2018–2025</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Features</span>
            <span className="text-lg font-bold text-sanket-charcoal">20</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
