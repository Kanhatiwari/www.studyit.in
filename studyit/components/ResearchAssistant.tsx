import React, { useState } from 'react';
import { Search, ExternalLink, BookOpen, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { researchTopic } from '../services/gemini';
import { SearchResult } from '../types';

const ResearchAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);
    try {
      const data = await researchTopic(query);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-6 space-y-8">
        
        <div className="text-center space-y-4 pt-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Research Assistant</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Powered by Gemini 3 Flash and Google Search. Get up-to-date information with verified sources.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to research?"
            className="w-full pl-5 pr-14 py-4 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg transition-all"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </form>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown>{result.text}</ReactMarkdown>
              </div>
            </div>

            {result.sources.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider ml-1">Sources & Citations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {source.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 truncate">{source.uri}</p>
                      </div>
                      <ExternalLink size={16} className="text-slate-400 group-hover:text-blue-500 ml-3 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchAssistant;