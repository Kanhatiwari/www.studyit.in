import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, Star, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { findStudySpots } from '../services/gemini';

const StudySpots: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string, places: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError("Permission needed to find places near you.");
          console.error(error);
        }
      );
    } else {
      setLocationError("Geolocation not supported.");
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!location) {
      alert("We need your location to find places nearby.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const data = await findStudySpots(query, location.lat, location.lng);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-6 space-y-6">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="text-red-500" />
              Study Spots
            </h1>
            <p className="text-slate-500 text-sm mt-1">Find the best libraries, cafes, and quiet corners.</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <Navigation size={14} className={location ? "text-green-500" : "text-slate-400"} />
            {location ? <span className="text-slate-700">Location Active</span> : <span className="text-slate-400">Locating...</span>}
          </div>
        </header>

        {locationError && (
           <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
             {locationError}
           </div>
        )}

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Quiet cafes with wifi' or 'Public libraries open late'"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !location}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Find"}
          </button>
        </form>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="md:col-span-2 space-y-4">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                 <div className="prose prose-red max-w-none">
                    <ReactMarkdown>{result.text}</ReactMarkdown>
                 </div>
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700">Recommended Places</h3>
              {result.places.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Check the text for details.</p>
              ) : (
                result.places.map((place, idx) => (
                  <a
                    key={idx}
                    href={place.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md hover:border-red-300 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-slate-900 group-hover:text-red-600 transition-colors">
                        {place.title}
                      </h4>
                      <ExternalLink size={14} className="text-slate-300 group-hover:text-red-500" />
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                       <MapPin size={12} />
                       <span>View on Maps</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySpots;