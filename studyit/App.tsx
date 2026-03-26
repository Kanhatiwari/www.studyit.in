import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ResearchAssistant from './components/ResearchAssistant';
import StudySpots from './components/StudySpots';
import FlashcardGenerator from './components/FlashcardGenerator';
import SubscriptionPlans from './components/SubscriptionPlans';
import LiveTutor from './components/LiveTutor';
import Offers from './components/Offers';
import TaskManager from './components/TaskManager';
import ScholarshipExams from './components/ScholarshipExams';
import PYPViewer from './components/PYPViewer';
import AboutApp from './components/AboutApp';
import StickyNoteOverlay from './components/StickyNoteOverlay';
import { AppMode, PlanTier, Task, AppNotification } from './types';
import { X, CheckCircle2, Bell, Clock, AlertCircle, MessageSquareText, GraduationCap, FileText, LockKeyhole, Menu, Maximize, Minimize, Video, ArrowRight, Tag, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { sounds } from './services/sound';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [userPlan, setUserPlan] = useState<PlanTier>(PlanTier.FREE);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeAlert, setActiveAlert] = useState<Task | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [activeExamResult, setActiveExamResult] = useState<any | null>(null);
  
  // New UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'SYSTEM', payload?: any) => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: Date.now(),
      read: false,
      type,
      payload
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleNavigate = (mode: AppMode) => {
    sounds.playTabChange();
    setCurrentMode(mode);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    sounds.playClick();
    if (notif.type === 'RESULT' && notif.payload) {
      setActiveExamResult(notif.payload);
      setCurrentMode(AppMode.EXAMS);
      setShowNotificationPanel(false);
    }
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
  };

  const handleExamResultReady = (title: string, message: string, scoreData: any) => {
    sounds.playSuccess();
    addNotification(title, message, 'RESULT', scoreData);
  };

  const handleTaskToggle = (id: string) => {
    setTasks(p => p.map(t => t.id === id ? {...t, isCompleted: !t.isCompleted} : t));
  };

  // Robust Fullscreen Toggle - Synchronous to preserve User Gesture
  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
          .then(() => {
            sounds.playClick();
            // State update happens via event listener
          })
          .catch((err) => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
            .then(() => {
              sounds.playClick();
            })
            .catch((err) => {
              console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
      }
    } catch (err: any) {
      console.error(`Error toggling fullscreen: ${err.message}`);
    }
  }, []);

  // Listen for fullscreen change events to sync state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Listen for 'F' key shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      // Check for 'F' key (both code and key for broader support)
      if (e.code === 'KeyF' || e.key.toLowerCase() === 'f') {
        e.preventDefault(); 
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <Sidebar 
        currentMode={currentMode} 
        currentPlan={userPlan}
        onModeChange={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 relative overflow-hidden flex flex-col w-full h-full transition-all duration-300">
        {/* Header - Borderless */}
        <header className="h-16 px-6 flex items-center justify-between z-30 flex-shrink-0">
          
          {/* Left: Menu Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { sounds.playClick(); setIsSidebarOpen(true); }}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{currentMode}</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            
            {/* Fullscreen Toggle */}
            <button 
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title="Fullscreen (Press 'F')"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => { sounds.playClick(); setShowNotificationPanel(!showNotificationPanel); }}
                className={`p-2 rounded-full transition-all ${showNotificationPanel ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <div className="relative">
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-white font-black">{unreadCount}</span>
                    </div>
                  )}
                </div>
              </button>
              
              {showNotificationPanel && (
                <div className="absolute right-0 mt-4 w-96 bg-white shadow-2xl rounded-[32px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 ring-1 ring-slate-100">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    <button onClick={() => setShowNotificationPanel(false)}><X size={16} className="text-slate-400" /></button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-slate-400 italic text-sm">No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-5 border-b border-slate-50 last:border-none transition-colors cursor-pointer hover:bg-slate-50 ${n.read ? 'bg-transparent' : 'bg-indigo-50/30'}`}
                        >
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'RESULT' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                              {n.type === 'RESULT' ? <CheckCircle2 size={18} /> : <Bell size={18} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{n.title}</p>
                              <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                              <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                <Clock size={10} />
                                {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {(() => {
            switch (currentMode) {
              case AppMode.CHAT: return <ChatInterface />;
              case AppMode.RESEARCH: return <ResearchAssistant />;
              case AppMode.MAPS: return <StudySpots />;
              case AppMode.FLASHCARDS: return <FlashcardGenerator />;
              case AppMode.PLANS: return <SubscriptionPlans currentPlan={userPlan} onSelectPlan={setUserPlan} />;
              case AppMode.OFFERS: return <Offers onNavigate={handleNavigate} onUpdatePlan={setUserPlan} />;
              case AppMode.LIVE: return <LiveTutor onEnd={() => setCurrentMode(AppMode.DASHBOARD)} />;
              case AppMode.TASKS: return <TaskManager tasks={tasks} onAddTask={(t, ty, m) => setTasks(p => [...p, { id: Date.now().toString(), text: t, type: ty, createdAt: Date.now(), isCompleted: false, triggerTime: m ? Date.now()+(m*60000) : undefined }])} onRemoveTask={id => setTasks(p => p.filter(t => t.id !== id))} onToggleTask={handleTaskToggle} userPlan={userPlan} />;
              case AppMode.EXAMS: return <ScholarshipExams onNotifyResult={handleExamResultReady} externalResult={activeExamResult} onClearExternalResult={() => setActiveExamResult(null)} />;
              case AppMode.PYPS: return <PYPViewer />;
              case AppMode.ABOUT: return <AboutApp />;
              default: return <Dashboard onNavigate={handleNavigate} userPlan={userPlan} />;
            }
          })()}
        </div>

        {/* Global Overlays */}
        <StickyNoteOverlay tasks={tasks} onToggleTask={handleTaskToggle} />

        {activeAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-[32px] shadow-2xl max-w-sm w-full mx-4 text-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Reminder</h3>
              <p className="text-slate-500 mb-6">{activeAlert.text}</p>
              <button onClick={() => { sounds.playClick(); setActiveAlert(null); }} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">Dismiss</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Dashboard: React.FC<{onNavigate: (mode: AppMode) => void, userPlan: PlanTier}> = ({ onNavigate, userPlan }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const offers = [
    {
      id: 'pyp',
      title: "PYP Lifetime Access",
      desc: "Get permanent access to previous year papers for just ₹100. 24 Hours Left!",
      gradient: "from-emerald-600 via-teal-500 to-cyan-500",
      icon: <FileText className="text-emerald-100" size={32} />,
      badge: "LIMITED DEAL"
    },
    {
      id: 'ultimate',
      title: "50% OFF Ultimate",
      desc: "Unlock Live Tutor and Deep Thinking for half price.",
      gradient: "from-pink-600 via-rose-500 to-orange-500",
      icon: <Sparkles className="text-pink-100" size={32} />,
      badge: "SPECIAL OFFER"
    }
  ];

  const nextSlide = () => {
    sounds.playClick();
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    sounds.playClick();
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const handleRestrictedNavigate = (mode: AppMode) => {
    if (mode === AppMode.PYPS && userPlan === PlanTier.FREE) {
      onNavigate(AppMode.PLANS);
    } else if (mode === AppMode.LIVE && userPlan !== PlanTier.ULTIMATE) {
      onNavigate(AppMode.PLANS);
    } else {
      onNavigate(mode);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Hub.</h1>
        <p className="text-slate-500 mt-2">Your personalized learning center.</p>
      </header>

      {/* Special Offers Carousel */}
      <div className="relative w-full h-64 mb-10 group">
        <div className="overflow-hidden rounded-[32px] h-full shadow-xl">
          <div 
            className="flex h-full transition-transform duration-500 ease-out" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {offers.map((offer) => (
              <div 
                key={offer.id} 
                className={`w-full h-full flex-shrink-0 bg-gradient-to-br ${offer.gradient} p-8 md:p-12 relative flex flex-col justify-center text-white cursor-pointer`}
                onClick={() => onNavigate(AppMode.OFFERS)}
              >
                {/* Background Shapes */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
                
                <div className="relative z-10 flex items-start gap-6">
                  <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                    {offer.icon}
                  </div>
                  <div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm mb-3 inline-block">
                      {offer.badge}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black mb-2">{offer.title}</h2>
                    <p className="text-white/90 text-lg font-medium">{offer.desc}</p>
                    <div className="mt-6 flex items-center gap-2 font-bold text-sm bg-white text-slate-900 px-4 py-2 rounded-xl w-fit">
                      View Offer <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Controls */}
        <button 
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className="absolute top-1/2 left-4 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className="absolute top-1/2 right-4 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {offers.map((_, idx) => (
            <div 
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/50'}`} 
            />
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        
        {/* 1. AI Tutor */}
        <div 
          onClick={() => onNavigate(AppMode.CHAT)} 
          className="p-8 bg-slate-900 text-white rounded-[32px] cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <MessageSquareText size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-900/50">
               <MessageSquareText className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-black mb-2">AI Tutor</h3>
            <p className="text-slate-400 text-sm">Personalized deep reasoning & homework help.</p>
          </div>
        </div>

        {/* 2. Vidyakul Scholarship */}
        <div 
          onClick={() => onNavigate(AppMode.EXAMS)} 
          className="p-8 bg-white text-slate-900 rounded-[32px] border border-slate-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <GraduationCap size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <GraduationCap size={28} />
            </div>
            <h3 className="text-2xl font-black mb-2">Vidyakul Scholarship</h3>
            <p className="text-slate-500 text-sm">₹25,000 grant assessments. Win your future.</p>
          </div>
        </div>

        {/* 3. PYP Archives */}
        <div 
          onClick={() => handleRestrictedNavigate(AppMode.PYPS)} 
          className={`p-8 bg-white text-slate-900 rounded-[32px] border border-slate-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden ${userPlan === PlanTier.FREE ? 'opacity-70' : ''}`}
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FileText size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={28} />
              </div>
              {userPlan === PlanTier.FREE && <LockKeyhole size={20} className="text-slate-300" />}
            </div>
            <h3 className="text-2xl font-black mb-2">PYP Archives</h3>
            <p className="text-slate-500 text-sm">Master previous years (2020-2025).</p>
          </div>
        </div>

        {/* 4. Live Tutor */}
        <div 
          onClick={() => handleRestrictedNavigate(AppMode.LIVE)} 
          className={`p-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-[32px] cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden ${userPlan !== PlanTier.ULTIMATE ? 'opacity-80 grayscale-[0.5]' : ''}`}
        >
           <div className="absolute top-0 right-0 p-8 opacity-10">
            <Video size={100} />
          </div>
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video size={28} className="text-white" />
              </div>
              {userPlan !== PlanTier.ULTIMATE && <LockKeyhole size={20} className="text-white/50" />}
            </div>
            <h3 className="text-2xl font-black mb-2">Live Tutor</h3>
            <p className="text-indigo-100 text-sm">Real-time video & voice interaction.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;