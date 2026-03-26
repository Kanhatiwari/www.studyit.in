import React, { useState } from 'react';
import { Zap, ChevronLeft, ChevronRight, Copy, Sparkles, BrainCircuit, Shuffle } from 'lucide-react';
import { generateFlashcards } from '../services/gemini';
import { Flashcard } from '../types';

const FlashcardGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const generatedCards = await generateFlashcards(topic);
      setCards(generatedCards);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 300);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 300);
  };

  const shuffleCards = () => {
    setCards(prevCards => {
      const shuffled = [...prevCards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full p-6 flex flex-col h-full">
        
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-3 shadow-sm">
            <Zap className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Flashcard Blitz</h1>
          <p className="text-slate-500 text-sm mt-1">Instant study aids powered by Gemini Flash Lite</p>
        </div>

        <form onSubmit={handleGenerate} className="flex gap-2 mb-10 relative z-10">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic (e.g. 'Photosynthesis', 'Calculus')"
            className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all shadow-sm text-lg"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? <Sparkles className="animate-spin" /> : "Go"}
          </button>
        </form>

        {cards.length > 0 && (
          <div className="flex-1 flex flex-col items-center justify-start min-h-[400px]">
            {/* 3D Card Container */}
            <div 
              className="relative w-full max-w-xl aspect-[3/2] perspective-1000 group cursor-pointer" 
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Hover Lift Wrapper - Separated to avoid transform conflicts */}
              <div className="w-full h-full transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02]">
                
                {/* Flipping Wrapper */}
                <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''} shadow-xl group-hover:shadow-2xl rounded-3xl`}>
                  
                  {/* Front Face */}
                  <div className="absolute inset-0 backface-hidden bg-white rounded-3xl flex flex-col overflow-hidden border border-slate-200">
                    <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative">
                      <div className="absolute top-6 left-6 opacity-10">
                         <BrainCircuit size={64} className="text-slate-900" />
                      </div>
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-6 bg-amber-50 px-3 py-1 rounded-full">
                        Question
                      </span>
                      <p className="text-2xl md:text-3xl font-serif text-slate-800 leading-relaxed">
                        {cards[currentIndex].front}
                      </p>
                      <p className="absolute bottom-6 text-slate-400 text-xs font-medium animate-pulse">
                        Click to flip
                      </p>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl flex flex-col overflow-hidden text-white border border-slate-700">
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative">
                      {/* Decorative Ring */}
                      <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none" />
                      
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-6 bg-indigo-900/50 px-3 py-1 rounded-full border border-indigo-500/30">
                        Answer
                      </span>
                      <p className="text-xl md:text-2xl font-medium text-slate-100 leading-relaxed">
                        {cards[currentIndex].back}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-6 mt-10">
              <button 
                onClick={(e) => { e.stopPropagation(); prevCard(); }}
                className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md transition-all active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex flex-col items-center">
                <span className="font-mono text-lg font-bold text-slate-800">
                  {currentIndex + 1} <span className="text-slate-300">/</span> {cards.length}
                </span>
                <span className="text-xs text-slate-400 mt-1">Cards</span>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); nextCard(); }}
                className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md transition-all active:scale-95"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <button
              onClick={shuffleCards}
              className="mt-8 flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Shuffle size={18} /> Shuffle Cards
            </button>
          </div>
        )}

        {!isLoading && cards.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Copy size={40} className="opacity-40" />
            </div>
            <p className="text-lg font-medium text-slate-400">Enter a topic above to generate cards</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardGenerator;