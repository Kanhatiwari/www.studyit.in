import React, { useState, useEffect } from 'react';
import { Gift, Clock, Tag, Sparkles, ArrowRight, X, CreditCard, CheckCircle2, Lock } from 'lucide-react';
import { AppMode, PlanTier } from '../types';

interface OffersProps {
  onNavigate: (mode: AppMode) => void;
  onUpdatePlan: (plan: PlanTier) => void;
}

interface OfferItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  discountBadge: string;
  deadline: Date; // For the countdown timer
  isSpecial: boolean;
  theme: 'pink' | 'indigo' | 'blue' | 'amber' | 'emerald';
  priceAmount: number; // 0 for free, >0 for paid
  targetPlan: PlanTier; // The plan this offer unlocks
}

const Offers: React.FC<OffersProps> = ({ onNavigate, onUpdatePlan }) => {
  
  // -- STATE --
  const [timers, setTimers] = useState<{[key: string]: string}>({});
  const [paymentModal, setPaymentModal] = useState<{isOpen: boolean, offer: OfferItem | null}>({ isOpen: false, offer: null });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // -- DATA --
  // We initialize dates relative to "now" to simulate the rules mentioned.
  const [activeOffers] = useState<OfferItem[]>(() => {
    const now = new Date();
    return [
      {
        id: 'pyp-lifetime',
        title: 'PYP Lifetime Access',
        subtitle: 'Forever Access',
        description: 'Get PYPs access for 100rs for always. One-time payment, lifetime archive access.',
        discountBadge: '₹100 LIFETIME',
        deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours as requested
        isSpecial: true,
        theme: 'emerald',
        priceAmount: 100,
        targetPlan: PlanTier.PLUS // Unlocks PYPs
      },
      {
        id: 'special-1',
        title: 'Ultimate Access Deal',
        subtitle: 'Ultimate Plan',
        description: 'Get a massive 50% discount on the Ultimate plan. Unlock Live Tutor and Deep Thinking for half the price.',
        discountBadge: '50% OFF',
        deadline: new Date(now.getTime() + 48 * 60 * 60 * 1000), 
        isSpecial: true,
        theme: 'amber',
        priceAmount: 100, // Discounted from 200 to 100
        targetPlan: PlanTier.ULTIMATE
      },
      {
        id: 'regular-1',
        title: 'Pro Monthly Starter',
        subtitle: 'Pro Plan',
        description: 'Get a 1-month Pro subscription for only 50/-.',
        discountBadge: 'ONLY 50/-',
        deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        isSpecial: false,
        theme: 'indigo',
        priceAmount: 50,
        targetPlan: PlanTier.PRO
      },
      {
        id: 'regular-3',
        title: '5 Days Free Plus',
        subtitle: 'Plus Plan',
        description: 'Try all Plus features for free for 5 days. No commitment.',
        discountBadge: 'FREE TRIAL',
        deadline: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        isSpecial: false,
        theme: 'blue',
        priceAmount: 0, // Free
        targetPlan: PlanTier.PLUS
      }
    ];
  });

  // -- TIMER LOGIC --
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: {[key: string]: string} = {};
      const now = new Date().getTime();

      activeOffers.forEach(offer => {
        const distance = offer.deadline.getTime() - now;
        
        if (distance < 0) {
          newTimers[offer.id] = "EXPIRED";
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          newTimers[offer.id] = `${hours}h ${minutes}m ${seconds}s`;
        }
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOffers]);

  // -- HANDLERS --

  const handleOfferClick = (offer: OfferItem) => {
    if (offer.priceAmount === 0) {
      // Free: Simply apply and update plan
      onUpdatePlan(offer.targetPlan);
      setSuccessMsg(`Coupon Applied! You've activated ${offer.title}.`);
      setTimeout(() => {
        setSuccessMsg(null);
        onNavigate(AppMode.DASHBOARD);
      }, 2000);
    } else {
      // Paid: Open Payment Modal
      setPaymentModal({ isOpen: true, offer });
    }
  };

  const processPayment = () => {
    if (!paymentModal.offer) return;
    
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      // Update plan upon successful payment
      onUpdatePlan(paymentModal.offer!.targetPlan);
      
      setIsProcessing(false);
      const title = paymentModal.offer?.title;
      setPaymentModal({ isOpen: false, offer: null });
      setSuccessMsg(`Payment Successful! ${title} is now active.`);
      
      setTimeout(() => {
        setSuccessMsg(null);
        onNavigate(AppMode.DASHBOARD);
      }, 2000);
    }, 2000);
  };

  const specialOffers = activeOffers.filter(o => o.isSpecial);
  const otherOffers = activeOffers.filter(o => !o.isSpecial);
  const hasOffers = activeOffers.length > 0;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto relative">
      <div className="max-w-4xl mx-auto w-full p-6 flex flex-col min-h-full">
        
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-full mb-3 shadow-sm">
            <Gift className="w-6 h-6 text-pink-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Special Offers</h1>
          <p className="text-slate-500 text-sm mt-1">Exclusive deals and limited-time discounts.</p>
        </div>

        {hasOffers ? (
          <div className="flex-1 flex flex-col pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* === SPECIAL OFFERS === */}
            {specialOffers.map(specialOffer => (
              <div key={specialOffer.id} className="mb-10 w-full">
                <div className={`relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br ${
                    specialOffer.theme === 'emerald' ? 'from-emerald-600 via-teal-500 to-cyan-500' :
                    'from-pink-600 via-rose-500 to-orange-500'
                  } text-white transform hover:scale-[1.01] transition-transform duration-300`}>
                  
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

                  <div className="relative p-8 md:p-10 z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30 text-xs font-bold tracking-wider uppercase mb-4 md:mb-0 flex items-center gap-2">
                        <Sparkles size={14} className="text-yellow-300" />
                        Special Offer
                      </div>
                      <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                         <Clock size={16} className="text-pink-100" />
                         <span className="text-sm font-mono font-medium text-pink-50 min-w-[80px]">
                           {timers[specialOffer.id] || "Loading..."}
                         </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
                        {specialOffer.discountBadge}
                      </h2>
                      <h3 className="text-xl md:text-2xl font-bold text-pink-50 mb-4">
                        {specialOffer.title}
                      </h3>
                      <p className="text-pink-100 max-w-xl text-lg leading-relaxed">
                        {specialOffer.description}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                       <button 
                         onClick={() => handleOfferClick(specialOffer)}
                         className={`flex-1 bg-white ${specialOffer.theme === 'emerald' ? 'text-emerald-700' : 'text-pink-600'} font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-2`}
                       >
                         {specialOffer.priceAmount === 0 ? "Apply Coupon" : "Claim Offer"} 
                         <ArrowRight size={20} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* === OTHER OFFERS === */}
            {otherOffers.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Tag size={18} className="text-slate-400" />
                  Other Offers
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherOffers.map((offer) => (
                    <div key={offer.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                          offer.theme === 'indigo' ? 'bg-indigo-100 text-indigo-700' : 
                          offer.theme === 'blue' ? 'bg-blue-100 text-blue-700' : 
                          offer.theme === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                          offer.theme === 'amber' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {offer.subtitle}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                           <Clock size={12} />
                           {timers[offer.id] || "..."}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-2">
                           <h4 className="text-xl font-bold text-slate-900">{offer.discountBadge}</h4>
                           <span className="text-sm text-slate-500 font-medium">on {offer.title}</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-6">
                          {offer.description}
                        </p>
                      </div>

                      <button 
                        onClick={() => handleOfferClick(offer)}
                        className={`w-full py-3 rounded-xl border-2 font-bold transition-all
                          ${offer.priceAmount === 0 
                            ? 'border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200' 
                            : 'border-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        {offer.priceAmount === 0 ? "Apply Coupon" : "Claim Offer"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 text-center">
               <button 
                onClick={() => onNavigate(AppMode.PLANS)}
                className="text-indigo-600 font-medium text-sm hover:underline hover:text-indigo-700 transition-colors"
              >
                View regular pricing plans
              </button>
            </div>

          </div>
        ) : (
            // === EMPTY STATE ===
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] pb-20 animate-in fade-in zoom-in duration-500">
               <p>No active offers.</p>
            </div>
        )}
      </div>

      {/* === PAYMENT MODAL === */}
      {paymentModal.isOpen && paymentModal.offer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 relative">
             <button 
               onClick={() => setPaymentModal({ isOpen: false, offer: null })}
               className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
             >
               <X size={20} />
             </button>

             <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="text-indigo-600 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Complete Purchase</h3>
                <p className="text-slate-500 text-sm mt-1">Simulated Payment Gateway (For Fun)</p>
             </div>

             <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                   <span className="font-medium text-slate-700">{paymentModal.offer.title}</span>
                   {/* Displaying the discounted price directly as requested */}
                   <span className="font-bold text-slate-900">₹{paymentModal.offer.priceAmount}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500">
                   <span>Tax (18%)</span>
                   <span>₹0 (Included)</span>
                </div>
                <div className="border-t border-slate-200 my-3" />
                <div className="flex justify-between items-center font-bold text-lg text-indigo-700">
                   <span>Total</span>
                   <span>₹{paymentModal.offer.priceAmount}</span>
                </div>
             </div>

             <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); processPayment(); }}>
                <div>
                   <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Card Number</label>
                   <div className="relative">
                      <CreditCard className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" disabled />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" disabled />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">CVC</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                        <input type="text" placeholder="123" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" disabled />
                      </div>
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${paymentModal.offer.priceAmount}`}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* === SUCCESS MESSAGE === */}
      {successMsg && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-green-500 rounded-full p-1">
            <CheckCircle2 size={16} className="text-white" />
          </div>
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

    </div>
  );
};

export default Offers;