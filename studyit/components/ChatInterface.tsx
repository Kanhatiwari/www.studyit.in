import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, BrainCircuit, Globe, ExternalLink, Sparkles, Image as ImageIcon, MapPin, Upload, X, Wand2, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { sendMessageToTutor, generateProImage, editImage } from '../services/gemini';
import { sounds } from '../services/sound';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello! I'm your Super Tutor. I have **Deep Thinking**, **Google Search**, and **Maps** permanently enabled to give you the best answers possible.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Modes
  const [mode, setMode] = useState<'CHAT' | 'IMAGE'>('CHAT');
  
  // Image Config
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('2K');
  const [uploadImage, setUploadImage] = useState<string | null>(null); // Base64 for editing

  // Location for Maps (Always fetched now)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Always try to get location for the "Super Tutor" capabilities
  useEffect(() => {
    if (!userLocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.warn("Location denied", err)
        );
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Strip prefix for API usage, keep full for display if needed
        const rawBase64 = base64.split(',')[1];
        setUploadImage(rawBase64);
        setMode('IMAGE'); // Switch to image mode implicitly
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sounds.playClick();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      isThinking: mode === 'CHAT' // Implicitly always thinking in chat mode
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (mode === 'IMAGE') {
        // Image Generation or Editing
        let imageBase64 = '';
        
        if (uploadImage) {
            // Edit existing image
            const result = await editImage(userMessage.content, uploadImage);
            imageBase64 = result.imageBase64;
            setUploadImage(null); // Clear upload after use
        } else {
            // Generate new image
            const result = await generateProImage(userMessage.content, { aspectRatio, resolution });
            imageBase64 = result.imageBase64;
        }

        const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: uploadImage ? `Here is your edited image based on: "${userMessage.content}"` : `Here is a **${resolution}** image of "${userMessage.content}" in **${aspectRatio}** aspect ratio.`,
            image: imageBase64,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);

      } else {
        // Text Chat (With ALL capabilities enabled)
        const response = await sendMessageToTutor(
            messages, 
            userMessage.content, 
            { 
                location: userLocation
            }
        );

        const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: response.text,
            sources: response.sources,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error: any) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Sorry, I encountered an error: ${error.message || "Unknown error"}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex justify-between items-center">
             <div className="flex flex-col">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Bot className="text-indigo-600" /> Super Tutor 
                </h2>
                {mode === 'CHAT' && (
                  <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wide border border-indigo-100">
                        <BrainCircuit size={10} /> Deep Thinking
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide border border-blue-100">
                        <Globe size={10} /> Search
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide border border-emerald-100">
                        <MapPin size={10} /> Maps
                      </span>
                  </div>
                )}
             </div>
             
            <div className="flex gap-2">
                <button 
                    onClick={() => setMode(mode === 'CHAT' ? 'IMAGE' : 'CHAT')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        mode === 'IMAGE' 
                        ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {mode === 'IMAGE' ? <Wand2 size={14} /> : <ImageIcon size={14} />}
                    {mode === 'IMAGE' ? 'Image Mode' : 'Image Mode'}
                </button>
            </div>
        </div>

        {/* Toolbar - Only visible for Image Mode now, as Chat mode has everything auto-enabled */}
        {mode === 'IMAGE' && (
            <div className="mt-3 flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <select 
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-700 outline-none px-1"
                        >
                            <option value="1:1">1:1 Square</option>
                            <option value="16:9">16:9 Landscape</option>
                            <option value="9:16">9:16 Portrait</option>
                            <option value="4:3">4:3 Standard</option>
                            <option value="3:4">3:4 Portrait</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <select 
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-700 outline-none px-1"
                        >
                            <option value="1K">1K Res</option>
                            <option value="2K">2K Res</option>
                            <option value="4K">4K UHD</option>
                        </select>
                    </div>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        uploadImage
                            ? 'bg-amber-100 text-amber-700 border-amber-300' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <Upload size={12} /> {uploadImage ? 'Image Loaded' : 'Upload to Edit'}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                     {uploadImage && (
                        <button onClick={() => setUploadImage(null)} className="p-1 hover:bg-red-100 text-red-500 rounded-full">
                            <X size={14} />
                        </button>
                    )}
            </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] md:max-w-[80%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div
                className={`flex flex-col rounded-2xl shadow-sm overflow-hidden
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}
              >
                {/* Badge for User Message Mode */}
                {msg.role === 'user' && msg.isThinking && (
                  <div className="px-4 py-1 bg-indigo-700/50 text-indigo-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} /> Super Mode Active
                  </div>
                )}

                <div className={`p-4 prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Image Display */}
                {msg.image && (
                    <div className="p-2 bg-slate-900">
                        <img 
                            src={`data:image/png;base64,${msg.image}`} 
                            alt="Generated Content" 
                            className="rounded-lg w-full h-auto shadow-2xl"
                        />
                        <div className="mt-2 flex justify-end">
                            <a 
                                href={`data:image/png;base64,${msg.image}`} 
                                download={`studyit-gen-${Date.now()}.png`}
                                className="text-xs text-white/70 hover:text-white flex items-center gap-1"
                            >
                                <Upload size={12} className="rotate-180" /> Download
                            </a>
                        </div>
                    </div>
                )}

                {/* Sources Section for Model Responses */}
                {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                  <div className="bg-slate-50 border-t border-slate-100 p-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe size={12} /> Verified Sources
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.sources.slice(0, 3).map((source, idx) => (
                        <a 
                          key={idx} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group text-xs"
                        >
                          <span className="truncate text-slate-700 font-medium flex-1 pr-2">{source.title}</span>
                          <ExternalLink size={12} className="text-slate-400 group-hover:text-indigo-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-emerald-600" />
                <span className="text-sm text-slate-500">
                  {mode === 'IMAGE' ? "Rendering High-Fidelity Visuals..." : "Thinking deeply & searching..."}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex flex-col gap-2">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'IMAGE' ? (uploadImage ? "Describe how to edit this image..." : "Describe the image you want to generate...") : "Ask anything (I'll check Google & Maps if needed)..."}
                className={`w-full pl-6 pr-14 py-4 rounded-full border-none focus:ring-2 transition-all outline-none text-slate-800 placeholder:text-slate-400 ${
                    mode === 'IMAGE' 
                    ? 'bg-purple-50 focus:ring-purple-500 focus:bg-white' 
                    : 'bg-indigo-50 focus:ring-indigo-500 focus:bg-white'
                }`}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`absolute right-2 top-2 p-2 text-white rounded-full transition-colors disabled:opacity-50 ${
                    mode === 'IMAGE' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {mode === 'IMAGE' ? <Wand2 size={20} /> : <Send size={20} />}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;