import React, { useState, useEffect } from 'react';
import { Shield, Phone, Heart, ChevronRight, X, Camera, Mic, MapPin, Star, Check } from 'lucide-react';
import Logo from './Logo';

const AboutApp: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    try {
      const storedRating = localStorage.getItem('studyit_app_rated');
      if (storedRating === 'true') {
        setHasRated(true);
      }
    } catch (e) {
      console.warn("Local storage not available");
    }
  }, []);

  const getRatingLabel = (r: number) => {
    switch(r) {
      case 1: return "Very Bad";
      case 2: return "Bad";
      case 3: return "Ok";
      case 4: return "Good";
      case 5: return "Very Good";
      default: return "Tap a star to rate";
    }
  };

  const submitRating = () => {
    if (rating > 0) {
      try {
        localStorage.setItem('studyit_app_rated', 'true');
      } catch (e) {}
      
      setRatingSubmitted(true);
      setHasRated(true);
      
      setTimeout(() => {
        setShowRating(false);
        setRatingSubmitted(false);
        setRating(0);
      }, 2000);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6 md:p-8">
      <div className="max-w-2xl mx-auto w-full flex flex-col items-center pt-8">
        
        <div className="mb-10">
           <Logo size="xl" hoverReveal={true} />
        </div>
        
        <p className="text-slate-500 mb-10 text-center max-w-sm text-lg leading-relaxed">
          Your all-in-one <span className="text-indigo-600 font-bold">AI Companion</span> for academic excellence and personalized learning.
        </p>

        <div className="w-full bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm space-y-4">
            {/* Privacy Policy */}
            <button 
              onClick={() => setShowPrivacy(true)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                   <Shield size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 text-lg">Privacy Policy</h3>
                  <p className="text-xs text-slate-500 font-medium">Data usage & permissions</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-indigo-500" />
            </button>

            {/* Contact Us */}
            <a 
              href="tel:+918576860802"
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-green-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                   <Phone size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 text-lg">Contact Us</h3>
                  <p className="text-xs text-slate-500 font-medium">Call Support</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-green-500" />
            </a>

            {/* Rate Us */}
            <button 
              onClick={() => {
                if (!hasRated) {
                  setShowRating(true);
                }
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors group ${
                hasRated 
                  ? 'bg-amber-50 cursor-default' 
                  : 'bg-slate-50 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform ${
                  hasRated ? 'bg-amber-100 text-amber-600' : 'bg-white text-amber-500 group-hover:scale-110'
                }`}>
                   {hasRated ? <Check size={24} /> : <Heart size={24} />}
                </div>
                <div className="text-left">
                  <h3 className={`font-bold text-lg ${hasRated ? 'text-amber-700' : 'text-slate-800'}`}>
                    {hasRated ? "You've Rated Us!" : "Rate Us"}
                  </h3>
                  <p className={`text-xs font-medium ${hasRated ? 'text-amber-600/70' : 'text-slate-500'}`}>
                    {hasRated ? "Thanks for the feedback" : "Share your feedback"}
                  </p>
                </div>
              </div>
              {!hasRated && <ChevronRight size={20} className="text-slate-400 group-hover:text-amber-500" />}
            </button>
        </div>

        <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">STUDYIT App Version 1.3.0</p>
            <p className="text-[10px] text-slate-300 mt-1">Made with ❤️ for Students</p>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
             <button 
               onClick={() => setShowPrivacy(false)}
               className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
             >
               <X size={20} />
             </button>
             
             <div className="mb-6 flex items-center gap-3">
               <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                 <Shield size={28} />
               </div>
               <h2 className="text-2xl font-bold text-slate-900">Privacy Policy</h2>
             </div>

             <div className="space-y-6">
               <p className="text-slate-600 text-sm leading-relaxed">
                 We value your privacy. Here is how and why we access specific features on your device:
               </p>

               <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Camera size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Camera Access</h3>
                    <p className="text-xs text-slate-500 mt-1">Used exclusively for the <strong>Live Tutor</strong> feature to analyze visual problems in real-time. We do not store video recordings.</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                    <Mic size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Microphone Access</h3>
                    <p className="text-xs text-slate-500 mt-1">Required for <strong>Voice Chat</strong> and <strong>Live Tutor</strong> sessions to enable spoken communication with the AI.</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Location Access</h3>
                    <p className="text-xs text-slate-500 mt-1">Used in <strong>Study Spots</strong> to find libraries and cafes near your current location. Location data is processed locally.</p>
                  </div>
               </div>
             </div>

             <button 
               onClick={() => setShowPrivacy(false)}
               className="w-full mt-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
             >
               Understood
             </button>
           </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200 text-center">
             
             {!ratingSubmitted ? (
               <>
                <button 
                  onClick={() => setShowRating(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-black text-slate-900 mb-2">Rate Us</h2>
                <p className="text-slate-500 text-sm mb-8">How is your experience with STUDYIT?</p>

                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="transition-transform hover:scale-110 focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star 
                        size={36} 
                        fill={(hoverRating || rating) >= star ? "#F59E0B" : "transparent"} 
                        className={(hoverRating || rating) >= star ? "text-amber-500" : "text-slate-300"} 
                      />
                    </button>
                  ))}
                </div>

                <div className="h-8 mb-6">
                  {(rating > 0 || hoverRating > 0) && (
                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      (hoverRating || rating) <= 2 ? 'bg-red-100 text-red-600' :
                      (hoverRating || rating) === 3 ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {getRatingLabel(hoverRating || rating)}
                    </span>
                  )}
                </div>

                <textarea 
                  placeholder="Tell us what you think (optional)..."
                  className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 mb-6 resize-none h-24"
                />

                <button 
                  onClick={submitRating}
                  disabled={rating === 0}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
               </>
             ) : (
               <div className="py-8 animate-in zoom-in duration-300">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Heart size={40} fill="currentColor" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 mb-2">Thank You!</h2>
                 <p className="text-slate-500 text-sm">We appreciate your feedback.</p>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default AboutApp;