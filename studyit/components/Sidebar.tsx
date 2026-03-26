import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  Search, 
  MapPin, 
  Zap,
  CreditCard,
  LockKeyhole,
  Video,
  Gift,
  CheckSquare,
  GraduationCap,
  FileText,
  Info,
  X
} from 'lucide-react';
import { AppMode, PlanTier } from '../types';
import { sounds } from '../services/sound';
import Logo from './Logo';

interface SidebarProps {
  currentMode: AppMode;
  currentPlan: PlanTier;
  onModeChange: (mode: AppMode) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, currentPlan, onModeChange, isOpen, onClose }) => {
  
  const isLocked = (mode: AppMode) => {
    switch (mode) {
      case AppMode.PYPS:
        return currentPlan === PlanTier.FREE;
      // Task Manager is now free for all (Basic features)
      case AppMode.RESEARCH:
        return currentPlan === PlanTier.FREE;
      case AppMode.FLASHCARDS:
        return currentPlan === PlanTier.FREE || currentPlan === PlanTier.PLUS;
      case AppMode.LIVE:
        return currentPlan !== PlanTier.ULTIMATE;
      default:
        return false;
    }
  };

  const handleModeClick = (mode: AppMode) => {
    const locked = isLocked(mode);
    if (!locked) {
      if (mode !== currentMode) {
        sounds.playTabChange();
        onModeChange(mode);
      }
      onClose(); // Close sidebar after selection for better flow
    }
  };

  const menuItems = [
    { mode: AppMode.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { mode: AppMode.TASKS, icon: CheckSquare, label: 'Tasks' },
    { mode: AppMode.EXAMS, icon: GraduationCap, label: 'Exams' },
    { mode: AppMode.PYPS, icon: FileText, label: 'PYPs' },
    { mode: AppMode.CHAT, icon: MessageSquareText, label: 'AI Tutor' },
    { mode: AppMode.RESEARCH, icon: Search, label: 'Research' },
    { mode: AppMode.MAPS, icon: MapPin, label: 'Study Spots' },
    { mode: AppMode.FLASHCARDS, icon: Zap, label: 'Flashcards' },
    { mode: AppMode.LIVE, icon: Video, label: 'Live Tutor' },
    { mode: AppMode.OFFERS, icon: Gift, label: 'Offers' },
    { mode: AppMode.PLANS, icon: CreditCard, label: 'Plans' },
    { mode: AppMode.ABOUT, icon: Info, label: 'About App' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col py-6 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 mb-8">
          <Logo size="md" />
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentMode === item.mode;
            const locked = isLocked(item.mode);
            const Icon = item.icon;
            
            return (
              <button
                key={item.mode}
                onClick={() => handleModeClick(item.mode)}
                className={`flex items-center p-3.5 rounded-2xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                    : locked 
                      ? 'text-slate-300 cursor-not-allowed hover:bg-transparent'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="ml-3 text-sm">
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600" />
                )}
                {locked && (
                  <LockKeyhole size={14} className="ml-auto opacity-40" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pt-4 border-t border-slate-50">
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Current Plan</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                currentPlan === PlanTier.ULTIMATE ? 'bg-amber-400 text-amber-900' : 'bg-slate-700 text-slate-300'
              }`}>
                {currentPlan}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full transition-all duration-700 ${
                  currentPlan === PlanTier.ULTIMATE ? 'w-full bg-amber-400' : 
                  currentPlan === PlanTier.PRO ? 'w-3/4 bg-indigo-400' :
                  currentPlan === PlanTier.PLUS ? 'w-1/2 bg-blue-400' : 'w-1/4 bg-slate-400'
                }`} 
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;