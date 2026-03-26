import React from 'react';
import { GraduationCap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  className?: string;
  showText?: boolean;
  hoverReveal?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'dark', className = '', showText = true, hoverReveal = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 48,
    xl: 64
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-5xl',
    xl: 'text-6xl'
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';
  const subTextColor = variant === 'light' ? 'text-indigo-200' : 'text-slate-500';

  // If hoverReveal is enabled, we remove the fixed gap and handle spacing via transitions
  const containerGap = hoverReveal ? '' : 'gap-3';

  return (
    <div className={`flex items-center ${containerGap} select-none group ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-indigo-600 rounded-xl md:rounded-2xl rotate-6 opacity-0 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-500"></div>
        <div className="absolute inset-0 bg-purple-600 rounded-xl md:rounded-2xl -rotate-6 opacity-0 group-hover:opacity-20 group-hover:-rotate-12 transition-all duration-500 delay-75"></div>

        {/* Main Logo Container */}
        <div className="relative h-full w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/30">
            
            {/* Glossy Sheen Animation */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] skew-x-12 group-hover:animate-shine"></div>

            {/* Icon */}
            <div className="relative z-10 text-white drop-shadow-md">
               <GraduationCap 
                 size={iconSizes[size]} 
                 strokeWidth={2.5}
                 className="transform transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-6"
               />
            </div>
        </div>

        {/* Orbiting Elements for larger sizes */}
        {['lg', 'xl'].includes(size) && (
          <>
            <div className="absolute -right-3 top-1/2 w-4 h-4 bg-cyan-400 rounded-full animate-bounce delay-100 shadow-lg border-2 border-white"></div>
            <div className="absolute -left-2 bottom-0 w-3 h-3 bg-amber-400 rounded-full animate-bounce delay-300 shadow-lg border-2 border-white"></div>
          </>
        )}
      </div>

      {showText && (
        <div className={`flex flex-col justify-center ${
            hoverReveal 
              ? 'max-w-0 opacity-0 -translate-x-4 group-hover:max-w-[400px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700 ease-out overflow-hidden whitespace-nowrap' 
              : ''
          }`}>
          <div className={hoverReveal ? "pl-4" : ""}>
            <h1 className={`font-black tracking-tighter ${textSizes[size]} ${textColor} leading-none flex items-center group-hover:tracking-normal transition-all duration-300`}>
                STUDY<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">IT</span>
                <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-indigo-600 ml-1 animate-pulse"></div>
            </h1>
            {['lg', 'xl'].includes(size) && (
                <span className={`text-xs md:text-sm font-bold uppercase tracking-[0.3em] ${subTextColor} mt-3 ml-1 animate-in slide-in-from-left-2`}>
                AI Learning Hub
                </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;