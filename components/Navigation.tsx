import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, Settings, LogOut, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    {
      name: 'Reports',
      path: '/reports',
      icon: FileText
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-100 w-64 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <BarChart2 className="h-5 w-5 text-[#4a86ff]" />
          <h1 className="ml-2 text-lg font-medium text-gray-900">CompetitivePulse</h1>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 mt-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-white text-[#4a86ff] font-medium shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Log out
        </button>
      </div>
    </div>
  );
}

export default Navigation;