import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, BrainCircuit, Bell, History, FileText, Settings, Menu, UserCircle } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Risk Map', path: '/map', icon: <Map size={20} /> },
    { name: 'AI Analysis', path: '/analysis', icon: <BrainCircuit size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <Bell size={20} /> },
    { name: 'Historical', path: '/historical', icon: <History size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'Team', path: '/team', icon: <UserCircle size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`bg-sanket-white border-r border-sanket-olive flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-sanket-olive">
        {isOpen && <span className="font-bold text-lg tracking-wider text-sanket-charcoal">SANKET</span>}
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-sanket-bg text-sanket-sage">
          <Menu size={24} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-sanket-sage text-white' 
                    : 'text-sanket-charcoal hover:bg-sanket-bg hover:text-sanket-sage'
                }`
              }
              title={!isOpen ? item.name : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
