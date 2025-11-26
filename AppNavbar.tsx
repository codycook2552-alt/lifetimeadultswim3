import React from 'react';
import { User } from '../types';
import { LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onHomeClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onLoginClick, onHomeClick }) => {
  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex flex-col justify-center cursor-pointer select-none" onClick={onHomeClick}>
          <div className="text-zinc-900 font-extrabold text-2xl leading-none tracking-tight uppercase">
            LIFE TIME
          </div>
          <div className="text-zinc-900 font-serif italic text-xl leading-none -mt-1 ml-0.5">
            Swim
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
              <div className="flex flex-col items-end mr-2 hidden md:block">
                <span className="text-sm font-bold text-zinc-900">{currentUser.name}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{currentUser.role}</span>
              </div>
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full border border-zinc-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                  <UserIcon size={20} />
                </div>
              )}
              <button onClick={onLogout} className="ml-2 text-zinc-400 hover:text-red-600 transition-colors" title="Log Out">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={onLoginClick} className="flex items-center gap-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white">
              <LogIn size={16} /> Member Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};