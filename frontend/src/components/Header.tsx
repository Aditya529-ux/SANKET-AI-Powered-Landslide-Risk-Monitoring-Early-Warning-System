import { UserCircle, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.checkHealth();
        setIsBackendConnected(res.model_loaded);
      } catch (e) {
        setIsBackendConnected(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    
    // Check local storage for avatar
    const stored = localStorage.getItem('team_avatar_12403769');
    if (stored) setAvatarUrl(stored);
    
    // Listen for avatar updates
    const handleStorageChange = () => {
      const updated = localStorage.getItem('team_avatar_12403769');
      setAvatarUrl(updated);
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className="h-16 bg-sanket-white border-b border-sanket-olive flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-bold text-sanket-charcoal leading-tight">SANKET</h1>
          <p className="text-xs text-gray-500 font-medium">North Eastern Region Command</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Link to="/alerts" className="text-sanket-charcoal hover:text-sanket-sage transition-colors" title="Alerts">
          <ShieldAlert size={20} />
        </Link>
        <div className="flex items-center space-x-3 border-l border-sanket-olive pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-sanket-charcoal leading-tight">Aditya Kumar Sharma</p>
            <p className="text-xs text-sanket-sage font-medium">Team Leader</p>
            <p className="text-[10px] text-gray-400">ID: 12403769</p>
          </div>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Aditya Kumar Sharma" className="w-8 h-8 rounded-full object-cover border border-sanket-olive" />
          ) : (
            <UserCircle size={32} className="text-sanket-charcoal" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
