import React from 'react';
import { Check, X, Shield, Zap, Crown, Star } from 'lucide-react';
import { PlanTier } from '../types';

interface SubscriptionPlansProps {
  currentPlan: PlanTier;
  onSelectPlan: (plan: PlanTier) => void;
}

export default function SubscriptionPlans({ currentPlan, onSelectPlan }: SubscriptionPlansProps) {
  
  const plans = [
    {
      id: PlanTier.FREE,
      name: 'Free',
      price: '0rs',
      period: '/month',
      icon: Shield,
      theme: 'slate',
      description: 'Essential study tools',
      features: [
        { name: 'Dashboard Access', included: true },
        { name: 'AI Tutor (Standard)', included: true },
        { name: 'Study Spots (Maps)', included: true },
        { name: 'Task Manager', included: false },
        { name: 'PYP Archives', included: false },
        { name: 'Research Assistant', included: false },
        { name: 'Flashcard Generator', included: false },
        { name: 'Live Tutor (Video)', included: false },
      ]
    },
    {
      id: PlanTier.PLUS,
      name: 'Plus',
      price: '100rs',
      period: '/month',
      icon: Zap,
      theme: 'blue',
      description: 'Unlock local discovery',
      features: [
        { name: 'Dashboard Access', included: true },
        { name: 'AI Tutor (Standard)', included: true },
        { name: 'Study Spots (Maps)', included: true, highlight: true },
        { name: 'Task Manager', included: true, highlight: true },
        { name: 'PYP Archives', included: true, highlight: true },
        { name: 'Research Assistant', included: true, highlight: true },
        { name: 'Flashcard Generator', included: false },
        { name: 'Live Tutor (Video)', included: false },
      ]
    },
    {
      id: PlanTier.PRO,
      name: 'Pro',
      price: '150rs',
      period: '/month',
      icon: Star,
      theme: 'indigo',
      popular: true,
      description: 'Deep research power',
      features: [
        { name: 'Dashboard Access', included: true },
        { name: 'AI Tutor (Deep Think)', included: true },
        { name: 'Study Spots (Maps)', included: true },
        { name: 'Task Manager', included: true },
        { name: 'PYP Archives', included: true },
        { name: 'Research Assistant', included: true },
        { name: 'Flashcard Generator', included: true, highlight: true },
        { name: 'Live Tutor (Video)', included: false },
      ]
    },
    {
      id: PlanTier.ULTIMATE,
      name: 'Ultimate',
      price: '200rs',
      period: '/month',
      icon: Crown,
      theme: 'amber',
      description: 'Maximum productivity',
      features: [
        { name: 'Dashboard Access', included: true },
        { name: 'AI Tutor (Deep Think)', included: true },
        { name: 'Study Spots (Maps)', included: true },
        { name: 'Task Manager', included: true },
        { name: 'PYP Archives', included: true },
        { name: 'Research Assistant', included: true },
        { name: 'Flashcard Generator', included: true, highlight: true },
        { name: 'Live Tutor (Video)', included: true, highlight: true },
      ]
    }
  ];

  const getThemeColor = (theme: string, type: 'bg' | 'text' | 'border' | 'ring' | 'lightBg') => {
    const colors: any = {
      slate: { bg: 'bg-slate-900', text: 'text-slate-900', border: 'border-slate-200', ring: 'ring-slate-900', lightBg: 'bg-slate-100' },
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', ring: 'ring-blue-600', lightBg: 'bg-blue-50' },
      indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', ring: 'ring-indigo-600', lightBg: 'bg-indigo-50' },
      amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', ring: 'ring-amber-500', lightBg: 'bg-amber-50' },
    };
    return colors[theme][type];
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6 md:p-8 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 pt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Unlock the full potential of your AI study companion. Upgrade anytime as your learning needs grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const Icon = plan.icon;
            
            return (
              <div 
                key={plan.id}
                className={`relative flex flex-col p-6 rounded-3xl bg-white transition-all duration-300 ${
                  isCurrent 
                    ? `ring-4 ${getThemeColor(plan.theme, 'ring')} shadow-xl scale-[1.02] z-10` 
                    : `border ${getThemeColor(plan.theme, 'border')} hover:shadow-xl hover:-translate-y-1`
                }`}
              >
                {/* Badges */}
                <div className="absolute -top-3 left-0 w-full flex justify-center gap-2">
                    {plan.popular && !isCurrent && (
                    <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Most Popular
                    </div>
                    )}
                    {isCurrent && (
                    <div className={`text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1 ${getThemeColor(plan.theme, 'bg')}`}>
                        <Check size={12} strokeWidth={4} /> Current Plan
                    </div>
                    )}
                </div>

                {/* Header */}
                <div className="mb-6 mt-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${getThemeColor(plan.theme, 'lightBg')}`}>
                        <Icon size={24} className={getThemeColor(plan.theme, 'text')} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-400 font-medium ml-1">{plan.period}</span>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.included ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                        {feature.included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </div>
                      <span className={`text-sm ${
                          feature.included 
                            ? feature.highlight ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium' 
                            : 'text-slate-400'
                        }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2
                    ${isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : `${getThemeColor(plan.theme, 'bg')} text-white shadow-lg hover:brightness-110 active:scale-95`
                    }`}
                >
                  {isCurrent ? 'Active' : 'Choose Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }