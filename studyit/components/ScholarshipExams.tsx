import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, Trophy, ArrowRight, Clock, LayoutGrid, RotateCcw, Loader2, FileText, Award, XCircle, CheckCircle2, Star, Zap, Info } from 'lucide-react';
import { sounds } from '../services/sound';

interface UserProfile {
  studentClass: string;
  mobile: string;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMins: number;
  prize?: string;
  isScholarship: boolean;
  questions: Question[];
}

interface ExamResultPayload {
  score: number;
  total: number;
  isScholarship: boolean;
  performance: string;
  status: string;
  rank: string;
  winScholarship: boolean;
}

interface ScholarshipExamsProps {
  onNotifyResult: (title: string, message: string, scoreData: ExamResultPayload) => void;
  externalResult?: ExamResultPayload | null;
  onClearExternalResult?: () => void;
}

const STORAGE_KEY = 'studyit_scholar_profile';

const ScholarshipExams: React.FC<ScholarshipExamsProps> = ({ onNotifyResult, externalResult, onClearExternalResult }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examStatus, setExamStatus] = useState<'idle' | 'taking' | 'pending' | 'finished'>('idle');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [finalScoreData, setFinalScoreData] = useState<ExamResultPayload | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (externalResult) {
      setFinalScoreData(externalResult);
      setExamStatus('finished');
    }
  }, [externalResult]);

  const getPerformance = (score: number) => {
    if (score <= 30) return "Very Bad";
    if (score <= 50) return "Bad";
    if (score <= 70) return "Ok";
    if (score <= 90) return "Good";
    if (score <= 120) return "Very Good";
    return "Excellent";
  };

  const getRankInfo = (score: number) => {
    if (score < 71) return { status: "Failed", rank: "No Rank" };
    if (score <= 120) return { status: "Passed", rank: "Participant" };
    if (score <= 130) return { status: "Passed", rank: "3rd Rank" };
    if (score <= 140) return { status: "Passed", rank: "2nd Rank" };
    return { status: "Passed", rank: "1st Rank" };
  };

  const generateQuestions = (count: number): Question[] => {
    const templates = [
      { text: "What is 15% of 200?", options: ["20", "30", "40", "50"], correct: 1 },
      { text: "Which gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2 },
      { text: "Smallest prime number?", options: ["0", "1", "2", "3"], correct: 2 }
    ];
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      text: `${templates[i % templates.length].text} (Q#${i + 1})`,
      options: [...templates[i % templates.length].options],
      correct: templates[i % templates.length].correct
    }));
  };

  const startExam = (isScholarship: boolean) => {
    if (!profile) return;
    const questions = generateQuestions(150);
    setActiveExam({
      id: `${isScholarship ? 'scholar' : 'practice'}-${Date.now()}`,
      title: isScholarship ? `VIDYAKUL SCHOLARSHIP BY STUDYIT` : `Standard Practice Test`,
      subject: 'Academic Excellence',
      durationMins: 180,
      prize: isScholarship ? '₹25,000' : undefined,
      isScholarship,
      questions
    });
    setExamStatus('taking');
    setTimeLeft(180 * 60);
    setCurrentQuestionIdx(0);
    setAnswers({});
  };

  useEffect(() => {
    if (examStatus === 'taking' && timeLeft > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [examStatus]);

  const finishExam = () => {
    if (!activeExam) return;
    const score = Object.entries(answers).reduce((acc, [idx, ans]) => {
      const q = activeExam.questions[parseInt(idx)];
      return acc + (ans === q?.correct ? 1 : 0);
    }, 0);
    
    const performance = getPerformance(score);
    const { status, rank } = getRankInfo(score);
    const winScholarship = activeExam.isScholarship && score >= 141;

    const payload: ExamResultPayload = {
      score,
      total: 150,
      isScholarship: activeExam.isScholarship,
      performance,
      status,
      rank,
      winScholarship
    };

    setFinalScoreData(payload);
    setExamStatus('pending');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (activeExam.isScholarship) {
      // Scholarship Logic: 2-3 minutes delay, then notification
      const minDelay = 2 * 60 * 1000; // 2 minutes
      const maxDelay = 3 * 60 * 1000; // 3 minutes
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);

      setTimeout(() => {
        onNotifyResult(
          "Exam Results Ready!",
          `Your result for VIDYAKUL SCHOLARSHIP has been calculated. Tap to view your rank.`,
          payload
        );
      }, delay);
    } else {
      // Standard Practice Logic: 10 seconds delay, then show immediately
      setTimeout(() => {
        sounds.playSuccess();
        setExamStatus('finished');
      }, 10000);
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const returnToIdle = () => {
    setExamStatus('idle');
    setFinalScoreData(null);
    if (onClearExternalResult) onClearExternalResult();
  };

  if (!profile) {
    return (
      <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Student Portal</h1>
            <p className="text-slate-500 mt-2">Registration for official assessments.</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.currentTarget));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setProfile(data as any);
          }}>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <select name="studentClass" className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
                {['6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(c => <option key={c} value={c}>{c} Standard</option>)}
              </select>
              <input name="mobile" required placeholder="Mobile Number" className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50" />
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">Complete Profile</button>
          </form>
        </div>
      </div>
    );
  }

  if (examStatus === 'idle') {
    return (
      <div className="h-full bg-slate-50 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Assessments</h1>
              <p className="text-slate-500">Official Exams Hub</p>
            </div>
            <button onClick={() => {localStorage.removeItem(STORAGE_KEY); setProfile(null);}} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
              <RotateCcw size={14} /> LOGOUT
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Standard Practice</h3>
              <p className="text-slate-500 text-sm mb-8 flex-1">Improve your skills with a timed practice assessment. Results shown instantly.</p>
              <button onClick={() => startExam(false)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all">Start Practice</button>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-[32px] p-8 shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                 <div className="bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter animate-pulse">Live Event</div>
              </div>
              <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Vidyakul Scholarship</h3>
              <p className="text-indigo-100 text-sm mb-4">Official assessment for the ₹25,000 grant.</p>
              
              <div className="flex gap-2 items-center bg-white/10 p-3 rounded-xl mb-6 border border-white/10">
                 <Info size={16} className="text-amber-400" />
                 <p className="text-[10px] font-medium leading-tight text-indigo-50">
                    Pro-Tip: 10-30 questions are selected directly from our <strong>PYP Archives</strong>. Review them before starting!
                 </p>
              </div>

              <button onClick={() => startExam(true)} className="w-full py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                Take Exam <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examStatus === 'taking' && activeExam) {
    const q = activeExam.questions[currentQuestionIdx];
    return (
      <div className="h-full bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${activeExam.isScholarship ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
              {activeExam.isScholarship ? <Trophy size={18} /> : <Zap size={18} />}
            </div>
            <span className="font-bold text-slate-800 text-sm md:text-base truncate max-w-[200px]">{activeExam.title}</span>
          </div>
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl font-mono font-bold text-slate-700">
            <Clock size={18} className="text-slate-400" /> {formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowQuestionGrid(!showQuestionGrid)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><LayoutGrid size={20} /></button>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-12">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 Question {currentQuestionIdx + 1} of 150
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-relaxed">{q.text}</h3>
              <div className="space-y-4">
                {q.options.map((o, idx) => (
                  <button key={idx} onClick={() => setAnswers({...answers, [currentQuestionIdx]: idx})} className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${answers[currentQuestionIdx] === idx ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${answers[currentQuestionIdx] === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {String.fromCharCode(65+idx)}
                    </span> 
                    <span className="font-medium">{o}</span>
                  </button>
                ))}
              </div>
              <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center">
                <button disabled={currentQuestionIdx === 0} onClick={() => setCurrentQuestionIdx(i => i - 1)} className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30">Previous</button>
                <div className="flex gap-4">
                  <button onClick={() => currentQuestionIdx < 149 ? setCurrentQuestionIdx(i => i + 1) : finishExam()} className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    {currentQuestionIdx === 149 ? 'Review & Submit' : 'Next Question'}
                  </button>
                </div>
              </div>
            </div>
          </main>
          {showQuestionGrid && (
            <aside className="w-80 bg-white border-l p-4 overflow-y-auto grid grid-cols-5 gap-2 content-start animate-in slide-in-from-right duration-300">
               {Array.from({length: 150}, (_, i) => (
                 <button key={i} onClick={() => setCurrentQuestionIdx(i)} className={`h-8 rounded text-[10px] font-bold border transition-all ${currentQuestionIdx === i ? 'ring-2 ring-indigo-500' : ''} ${answers[i] !== undefined ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>{i+1}</button>
               ))}
            </aside>
          )}
        </div>
      </div>
    );
  }

  if (examStatus === 'pending') {
    const isScholarship = activeExam?.isScholarship;

    return (
      <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-xl bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 animate-in zoom-in-95">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <FileText size={48} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Assessment Submitted</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            {isScholarship 
              ? "We are verifying your Vidyakul Scholarship responses against our archive."
              : "Calculating your practice score and generating performance insights."}
            <span className="block mt-4 text-slate-400 text-sm font-medium italic">
              {isScholarship 
                 ? '"Verification takes 2-3 minutes. You will receive a notification."' 
                 : '"Please wait approx. 10 seconds..."'}
            </span>
          </p>
          <div className="flex items-center justify-center gap-3 text-indigo-600 font-bold bg-indigo-50 py-4 px-8 rounded-2xl">
            <Loader2 className="animate-spin" size={20} />
            {isScholarship ? "Checking Archive Consistency..." : "Finalizing Score..."}
          </div>
          {isScholarship && (
             <button onClick={returnToIdle} className="mt-8 text-slate-400 font-bold hover:text-slate-600">Return to Dashboard</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 flex items-center justify-center p-8 overflow-y-auto">
       <div className="max-w-2xl w-full bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-10 duration-700">
          
          <div className="flex flex-col items-center text-center mb-10">
            {finalScoreData?.winScholarship ? (
              <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
                <Award size={48} />
              </div>
            ) : (
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner ${finalScoreData?.status === 'Failed' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
                {finalScoreData?.status === 'Failed' ? <XCircle size={48} /> : <CheckCircle2 size={48} />}
              </div>
            )}
            
            <h2 className="text-4xl font-black text-slate-900 mb-2">
              {finalScoreData?.winScholarship ? "Scholarship Winner!" : "Result Verified"}
            </h2>
            <p className="text-slate-500">{finalScoreData?.isScholarship ? "Vidyakul Scholarship Assessment Report" : "Practice Test Report"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance Level</p>
               <p className={`text-xl font-bold ${
                 finalScoreData?.performance === 'Excellent' ? 'text-indigo-600' :
                 finalScoreData?.performance === 'Very Good' ? 'text-blue-600' :
                 finalScoreData?.performance === 'Good' ? 'text-emerald-600' :
                 finalScoreData?.performance === 'Ok' ? 'text-amber-600' : 'text-red-500'
               }`}>{finalScoreData?.performance}</p>
            </div>
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Official Rank</p>
               <p className="text-xl font-bold text-slate-800">{finalScoreData?.rank}</p>
            </div>
          </div>

          <div className="bg-indigo-600 text-white rounded-3xl p-10 flex flex-col items-center text-center shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Final Score Verified</p>
            <div className="text-7xl font-black mb-2">{finalScoreData?.score}</div>
            <p className="text-indigo-100 font-medium">Out of {finalScoreData?.total} total points</p>
            
            <div className="mt-8 flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full border border-white/20">
              <span className="text-sm font-bold">{finalScoreData?.status}</span>
              <div className={`w-2 h-2 rounded-full ${finalScoreData?.status === 'Failed' ? 'bg-red-400' : 'bg-emerald-400'}`} />
            </div>
          </div>

          {finalScoreData?.winScholarship && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-center gap-4 animate-in fade-in zoom-in delay-500">
               <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                 <Star size={24} fill="white" />
               </div>
               <div>
                 <p className="font-black text-amber-900 leading-tight">Scholarship Unlocked</p>
                 <p className="text-amber-700 text-sm">Congratulations! You are eligible for the ₹25,000 grant.</p>
               </div>
            </div>
          )}

          <button onClick={returnToIdle} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg text-lg uppercase tracking-tight">Return to Hub</button>
       </div>
    </div>
  );
};

export default ScholarshipExams;