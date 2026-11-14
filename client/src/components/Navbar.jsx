import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  CheckSquare, 
  HeartHandshake, 
  Briefcase, 
  AlertTriangle, 
  FileSearch, 
  FileEdit, 
  Send
} from 'lucide-react';

export function Navbar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/accounts', label: 'Accounts', icon: Building2 },
    { to: '/tasks', label: 'Priority Tasks', icon: CheckSquare },
    { to: '/sentiment', label: 'Sentiment', icon: HeartHandshake },
    { to: '/deals', label: 'Deals & Book', icon: Briefcase },
    { to: '/risks', label: 'Risk Radar', icon: AlertTriangle },
    { to: '/evidence', label: 'Evidence', icon: FileSearch },
    { to: '/notes', label: 'Write-Back', icon: FileEdit },
    { to: '/hand-in', label: 'Hand In', icon: Send, highlight: true },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Product Name */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm">
              AG
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">
                Account Intelligence CRM
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                MVP
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold'
                        : item.highlight
                        ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-1.5 border-t border-slate-800 gap-1 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1 px-2.5 py-1 rounded whitespace-nowrap text-xs ${
                  isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </header>
  );
}

export default Navbar;
