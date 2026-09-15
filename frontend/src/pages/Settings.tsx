import { Settings as SettingsIcon, Save } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sanket-charcoal flex items-center gap-2">
          <SettingsIcon /> System Settings
        </h2>
        <button className="flex items-center gap-2 bg-sanket-sage text-white px-4 py-2 rounded font-bold hover:bg-opacity-90 transition-colors text-sm">
          <Save size={16} /> Save Changes
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SYSTEM */}
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm">
          <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-4 border-b border-sanket-olive pb-2">System</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">System Name</label>
              <input type="text" disabled value="SANKET" className="w-full bg-sanket-bg border border-sanket-olive rounded px-3 py-2 text-sm font-medium text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Region</label>
              <input type="text" disabled value="North Eastern Region of India" className="w-full bg-sanket-bg border border-sanket-olive rounded px-3 py-2 text-sm font-medium text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Monitored States</label>
              <input type="text" disabled value="8" className="w-full bg-sanket-bg border border-sanket-olive rounded px-3 py-2 text-sm font-medium text-gray-700" />
            </div>
          </div>
        </div>
        {/* MODEL */}
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm">
          <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-4 border-b border-sanket-olive pb-2">Model</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Model</label>
              <input type="text" disabled value="Logistic Regression" className="w-full bg-sanket-bg border border-sanket-olive rounded px-3 py-2 text-sm font-medium text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Risk Prediction</label>
              <select disabled className="w-full bg-sanket-bg border border-sanket-olive rounded px-3 py-2 text-sm font-medium text-green-700 font-bold">
                <option>Enabled</option>
              </select>
            </div>
          </div>
        </div>
        {/* ALERT SETTINGS */}
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm">
          <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-4 border-b border-sanket-olive pb-2">Alert Settings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-sanket-charcoal">Critical Alert</span>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-sanket-charcoal">High Risk Alert</span>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-sanket-charcoal">Moderate Alert</span>
              <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Optional</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-sanket-charcoal">Low Risk Alert</span>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Disabled by default</span>
            </div>
          </div>
        </div>
        {/* NOTIFICATION CHANNELS */}
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm">
          <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-4 border-b border-sanket-olive pb-2">Notification Channels</h3>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked disabled className="rounded text-sanket-sage" />
              <span className="text-sm font-medium text-sanket-charcoal">BRO Field Officers</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked disabled className="rounded text-sanket-sage" />
              <span className="text-sm font-medium text-sanket-charcoal">Local Administration</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked disabled className="rounded text-sanket-sage" />
              <span className="text-sm font-medium text-sanket-charcoal">Registered Local Contacts</span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-xs font-bold text-blue-800">Current State: <span className="font-mono bg-blue-100 px-1 rounded">Prototype Dispatch</span></p>
          </div>
        </div>
        {/* MAP SETTINGS */}
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm">
          <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-4 border-b border-sanket-olive pb-2">Map Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Default Region</label>
              <input type="text" disabled value="North Eastern India" className="w-full bg-sanket-bg border border-sanket-olive rounded px-3 py-2 text-sm font-medium text-gray-700" />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-sanket-charcoal">Marker Clustering</span>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Enabled</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-sanket-charcoal">Default Risk Filter</span>
              <span className="text-xs font-bold text-sanket-sage bg-sanket-bg border border-sanket-olive px-2 py-1 rounded">ALL</span>
            </div>
          </div>
        </div>
        {/* PROFILE */}
        <div className="bg-sanket-white p-5 rounded-lg border border-sanket-olive shadow-sm">
          <h3 className="text-sm font-bold text-sanket-charcoal uppercase tracking-wider mb-4 border-b border-sanket-olive pb-2">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
              <input type="text" disabled value="Aditya Kumar Sharma" className="w-full bg-sanket-bg border border-sanket-olive rounded px-3 py-2 text-sm font-medium text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role</label>
              <input type="text" disabled value="Team Leader" className="w-full bg-sanket-bg border border-sanket-olive rounded px-3 py-2 text-sm font-medium text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ID</label>
              <input type="text" disabled value="12403769" className="w-full bg-sanket-bg border border-sanket-olive rounded px-3 py-2 text-sm font-medium text-gray-700 font-mono" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
