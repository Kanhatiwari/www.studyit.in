import React, { useState } from 'react';
import { CheckSquare, StickyNote, Timer, Plus, Trash2, CheckCircle2, Lock } from 'lucide-react';
import { Task, TaskType, PlanTier } from '../types';
import { sounds } from '../services/sound';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (text: string, type: TaskType, timerMinutes?: number) => void;
  onRemoveTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  userPlan: PlanTier;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onAddTask, onRemoveTask, onToggleTask, userPlan }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedType, setSelectedType] = useState<TaskType>('STANDARD');
  const [timerMinutes, setTimerMinutes] = useState('2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    // Double check lock restriction logic before submitting
    if (userPlan === PlanTier.FREE && (selectedType === 'STICKY' || selectedType === 'TIMER')) {
        return; 
    }

    let minutes = 0;
    if (selectedType === 'TIMER') {
      minutes = parseFloat(timerMinutes);
      if (isNaN(minutes) || minutes <= 0) return;
    }

    sounds.playClick();
    onAddTask(newTaskText, selectedType, minutes);
    setNewTaskText('');
    // Don't reset type, user might want to add multiple of same type
  };

  const handleToggle = (id: string) => {
      sounds.playSuccess();
      onToggleTask(id);
  };

  const getIcon = (type: TaskType) => {
    switch (type) {
      case 'STICKY': return <StickyNote size={16} className="text-indigo-500" />;
      case 'TIMER': return <Timer size={16} className="text-amber-500" />;
      default: return <CheckSquare size={16} className="text-slate-400" />;
    }
  };

  const getTypeLabel = (type: TaskType) => {
    switch (type) {
      case 'STICKY': return 'Sticky Task (Always visible)';
      case 'TIMER': return 'Timer Task (Alerts later)';
      default: return 'Standard Task';
    }
  };

  // Helper to check if a type is locked
  const isTypeLocked = (type: TaskType) => {
     if (userPlan === PlanTier.FREE) {
         return type === 'STICKY' || type === 'TIMER';
     }
     return false;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-6 flex flex-col h-full">
        
        <div className="text-center mb-8 pt-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-3 shadow-sm">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Task Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Organize your study session.</p>
        </div>

        {/* Create Task Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">New Task</label>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="What do you need to do?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Task Type</label>
                <div className="flex gap-2">
                  {(['STANDARD', 'STICKY', 'TIMER'] as TaskType[]).map((type) => {
                    const locked = isTypeLocked(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => !locked && setSelectedType(type)}
                        disabled={locked}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2
                          ${locked 
                            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' 
                            : selectedType === type 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        {locked ? <Lock size={14} /> : getIcon(type)}
                        <span className="hidden sm:inline">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-2 ml-1">
                    <p className="text-xs text-slate-400">
                    {getTypeLabel(selectedType)}
                    </p>
                    {isTypeLocked('STICKY') && (
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">
                            Upgrade for Sticky & Timer Tasks
                        </p>
                    )}
                </div>
              </div>

              {selectedType === 'TIMER' && (
                <div className="w-full md:w-32 animate-in fade-in slide-in-from-left-2">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Delay (Mins)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all self-end h-[42px] flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </form>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            Your Tasks <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{tasks.length}</span>
          </h3>
          
          {tasks.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
              No tasks yet. Create one to get started!
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center p-4 rounded-xl border transition-all group ${
                  task.isCompleted 
                    ? 'bg-slate-50 border-slate-100 opacity-60' 
                    : 'bg-white border-slate-200 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => handleToggle(task.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors
                    ${task.isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-300 text-transparent hover:border-green-500'
                    }`}
                >
                  <CheckCircle2 size={14} />
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex items-center gap-1
                      ${task.type === 'STICKY' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                        task.type === 'TIMER' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                      {getIcon(task.type)}
                      {task.type}
                    </span>
                    {task.type === 'TIMER' && task.triggerTime && (
                       <span className="text-xs text-slate-400">
                         Alerts at {new Date(task.triggerTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => { sounds.playClick(); onRemoveTask(task.id); }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;