import React from 'react';

// This component is deprecated as Deep Thinking is now part of ChatInterface.
// It is kept as a placeholder to prevent build errors from file system checks.

const DeepThinker: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-8 text-center">
      <h2 className="text-xl font-bold mb-2">Deep Thinker has moved!</h2>
      <p>This feature is now integrated directly into the AI Tutor chat.</p>
    </div>
  );
};

export default DeepThinker;