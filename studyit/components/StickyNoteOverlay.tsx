import React from 'react';
import { X, Check, Pin } from 'lucide-react';
import { Task } from '../types';
import { sounds } from '../services/sound';

interface StickyNoteOverlayProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

const StickyNoteOverlay: React.FC<StickyNoteOverlayProps> = ({ tasks, onToggleTask }) => {
  // Filter for tasks that are type 'STICKY' and NOT completed
  const stickyTasks = tasks.filter(t => t.type === 'STICKY' && !t.isCompleted);

  if (stickyTasks.length === 0) return null;

  const handleComplete = (id: string) => {
    sounds.playSuccess();
    onToggleTask(id);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
      {stickyTasks.map((task) => (
        <div 
          key={task.id}
          className="pointer-events-auto bg-amber-200 text-amber-900 w-64 p-4 rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm shadow-[4px_4px_0px_rgba(0,0,0,0.1)] border border-amber-300 animate-in slide-in-from-right-10 duration-300 relative group transition-transform hover:-translate-y-1"
        >
          {/* Decorative Pin */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-red-500 drop-shadow-sm">
            <Pin size={20} fill="currentColor" className="transform -rotate-45" />
          </div>

          <div className="mt-2 text-sm font-medium font-sans leading-snug break-words">
            {task.text}
          </div>

          <div className="mt-3 flex justify-end border-t border-amber-300/50 pt-2">
            <button
              onClick={() => handleComplete(task.id)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-950 bg-amber-100/50 hover:bg-white/40 px-2 py-1 rounded transition-colors"
            >
              <Check size={12} strokeWidth={3} /> Done
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StickyNoteOverlay;