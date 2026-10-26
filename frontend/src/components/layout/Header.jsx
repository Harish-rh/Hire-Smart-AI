import React from 'react';
import { Menu, User, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onToggleSidebar, title = 'Recruitment Portal' }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Engine Active</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-medium"
            title="User Profile"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span className="hidden lg:inline">{user?.full_name || user?.username}</span>
          </Link>
          <Link
            to="/change-password"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Change Password"
          >
            <Lock className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
