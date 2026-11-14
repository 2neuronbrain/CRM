import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Target, 
  AlertOctagon, 
  EyeOff, 
  FileSearch, 
  FileEdit, 
  Activity, 
  Briefcase, 
  Send,
  Building2,
  Sparkles
} from 'lucide-react';

export function Navbar() {
  const navItems = [
    { to: '/', label: 'Overview', icon: BarChart3 },
    { to: '/accounts', label: 'Accounts', icon: Building2 },
    { to: '/deals', label: 'Deals', icon: Briefcase },
    { to: '/power-map', label: 'Power Map', icon: Users },
    { to: '/actions', label: 'Next Actions', icon: Target },
    { to: '/risks', label: 'Risk Radar', icon: AlertOctagon },
    { to: '/blind-spots', label: 'Blind Spots', icon: EyeOff },
    { to: '/activity', label: 'Activity', icon: Activity },
    { to: '/evidence', label: 'Evidence', icon: FileSearch },
    { to: '/notes', label: 'Notes', icon: FileEdit },
    { to: '/hand-in', label: 'Hand In', icon: Send, highlight: true },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Name */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                FlytBase CRM
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Intelligence
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-800 text-emerald-400 font-semibold shadow-inner'
                        : item.highlight
                        ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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

      {/* Mobile Nav bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-800 gap-1 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1 px-2.5 py-1.5 rounded-md whitespace-nowrap text-xs ${
                  isActive ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-300 hover:text-white'
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
