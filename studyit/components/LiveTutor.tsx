import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Video, Loader2, Volume2, Play, AlertTriangle, Activity } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface LiveTutorProps {
  onEnd: () => void;
}

const LiveTutor: React.FC<LiveTutorProps> = ({ onEnd }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'disconnected'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioSupported, setAudioSupported] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio Contexts & Processing
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Playback Queue
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for browser support
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass || !navigator.mediaDevices?.getUserMedia) {
      setAudioSupported(false);
      setError("Audio/Video features not supported in this browser.");
    }
    return () => cleanup();
  }, []);

  const cleanup = () => {
    setStatus('disconnected');
    
    // Stop Media Stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    // Stop Video Loop
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    // Close Audio Contexts
    if (inputContextRef.current) inputContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();

    // Close Session
    sessionPromiseRef.current?.then(session => {
        try { session.close(); } catch(e) {}
    });
  };

  const getApiKey = (): string => {
    try {
      // Priority 1: Check window polyfill
      if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
        return (window as any).process.env.API_KEY;
      }
      // Priority 2: Check standard process.env
      if (typeof process !== 'undefined' && process.env?.API_KEY) {
        return process.env.API_KEY;
      }
    } catch (e) {
      console.warn("Error accessing environment variables:", e);
    }
    return '';
  };

  const startSession = async () => {
    setStatus('connecting');
    setError(null);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error("API Key not found. Please check your configuration.");
      }

      // 1. Setup Audio/Video Stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: { width: 640, height: 360 } // Low res for performance
      });
      streamRef.current = stream;

      // Display Local Video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {}); // Ignore play errors
      }

      // 2. Setup Audio Contexts
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 }); // Higher quality output
      
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;

      // 3. Connect to Gemini
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025', // Updated to latest preview model
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are an encouraging and helpful academic tutor. Keep answers concise.",
        },
        callbacks: {
          onopen: () => {
            setStatus('listening');
            startAudioCapture(stream, inputCtx, sessionPromise);
            startVideoCapture(sessionPromise);
          },
          onmessage: async (msg: LiveServerMessage) => {
             // Handle Audio Output
             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData) {
               setStatus('speaking');
               queueAudioChunk(audioData, outputCtx);
             }

             // Handle Interruption
             if (msg.serverContent?.interrupted) {
               stopPlayback();
               setStatus('listening');
             }

             // Handle Turn Complete
             if (msg.serverContent?.turnComplete) {
               // We stay in 'speaking' until the audio queue drains, handled by onended
             }
          },
          onclose: () => {
            setStatus('disconnected');
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            // Don't kill session on minor errors, but log them
            // If it is a 403, we might want to alert
            if (e.toString().includes("403")) {
                setError("Permission denied (403). Check API Key or Model access.");
                setStatus('idle');
            }
          }
        }
      });
      sessionPromiseRef.current = sessionPromise;

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Connection failed.");
      setStatus('idle');
    }
  };

  const startAudioCapture = (stream: MediaStream, ctx: AudioContext, sessionPromise: Promise<any>) => {
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (isMuted) return;

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate Volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
      setVolumeLevel(Math.sqrt(sum / inputData.length));

      // Convert to PCM Int16
      const pcmData = convertFloat32ToInt16(inputData);
      const base64 = arrayBufferToBase64(pcmData);

      sessionPromise.then(session => {
         session.sendRealtimeInput({ 
           media: { mimeType: 'audio/pcm;rate=16000', data: base64 } 
         });
      });
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  };

  const startVideoCapture = (sessionPromise: Promise<any>) => {
    // Send frames less frequently to save bandwidth (2 FPS)
    frameIntervalRef.current = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      // Draw video frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        
        sessionPromise.then(session => {
          session.sendRealtimeInput({
            media: { mimeType: 'image/jpeg', data: base64 }
          });
        });
      }
    }, 500); 
  };

  const queueAudioChunk = async (base64: string, ctx: AudioContext) => {
    try {
      const arrayBuffer = base64ToArrayBuffer(base64);
      const audioBuffer = await decodeAudioData(arrayBuffer, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      // Schedule playback
      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }
      
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      
      sourceNodesRef.current.add(source);
      source.onended = () => {
        sourceNodesRef.current.delete(source);
        if (sourceNodesRef.current.size === 0) {
           setStatus('listening');
        }
      };

    } catch (e) {
      console.error("Audio decoding failed", e);
    }
  };

  const stopPlayback = () => {
    sourceNodesRef.current.forEach(node => {
      try { node.stop(); } catch(e) {}
    });
    sourceNodesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  // --- Utilities ---
  
  const convertFloat32ToInt16 = (float32: Float32Array) => {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      let s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const decodeAudioData = async (arrayBuffer: ArrayBuffer, ctx: AudioContext) => {
    // Manually decode raw PCM because AudioContext.decodeAudioData expects headers (wav/mp3)
    const int16 = new Int16Array(arrayBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    
    const buffer = ctx.createBuffer(1, float32.length, 24000); // 24kHz output sample rate
    buffer.getChannelData(0).set(float32);
    return buffer;
  };

  // --- Render ---

  if (status === 'idle') {
    return (
      <div className="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="z-10 text-center max-w-md p-6">
           <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 animate-pulse">
             <Video size={40} />
           </div>
           <h2 className="text-3xl font-bold mb-3">Live Tutor</h2>
           <p className="text-slate-400 mb-8">
             Interactive video & voice session. Speak naturally to ask for help with math, science, or any topic.
           </p>
           
           <button 
             onClick={startSession}
             disabled={!audioSupported}
             className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center gap-3 mx-auto
               ${audioSupported 
                 ? 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 text-white' 
                 : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
           >
             <Play size={24} fill="currentColor" /> {audioSupported ? "Start Session" : "Not Supported"}
           </button>
           
           {error && (
             <div className="mt-6 p-4 bg-red-900/50 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-start gap-2 text-left animate-in fade-in">
               <AlertTriangle size={18} className="shrink-0 mt-0.5" />
               <div>
                 <p className="font-bold">Connection Error</p>
                 <p className="opacity-80">{error}</p>
               </div>
             </div>
           )}
           <button onClick={onEnd} className="mt-8 text-slate-500 hover:text-white transition-colors">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Hidden canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Video Feed */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" muted playsInline />
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      
      {/* Status Pill */}
      <div className="absolute top-8 left-0 w-full flex flex-col items-center z-10">
        <div className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all ${
          status === 'speaking' ? 'bg-indigo-500 text-white border-indigo-400' : 
          status === 'listening' ? 'bg-black/60 text-emerald-400 border-emerald-500/30' :
          'bg-black/60 text-white'
        }`}>
          {status === 'connecting' && <Loader2 className="w-5 h-5 animate-spin" />}
          {status === 'speaking' && <Volume2 className="w-5 h-5 animate-bounce" />}
          {status === 'listening' && <Activity className="w-5 h-5" />}
          
          <span className="font-bold text-sm tracking-wide uppercase">
            {status === 'connecting' ? 'Connecting...' : 
             status === 'speaking' ? 'Tutor Speaking' : 
             status === 'listening' ? 'Listening...' : status}
          </span>
        </div>
      </div>

      {/* Audio Visualizer (Simple) */}
      {status === 'listening' && !isMuted && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-1 items-end h-10">
           {[...Array(5)].map((_, i) => (
             <div 
               key={i} 
               className="w-1.5 bg-emerald-500 rounded-full transition-all duration-75"
               style={{ 
                 height: `${Math.max(4, Math.min(40, volumeLevel * 200 * (Math.random() + 0.5)))}px`,
                 opacity: 0.8
               }}
             />
           ))}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-10 flex items-center gap-8 z-20">
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className={`p-6 rounded-full transition-all shadow-lg transform hover:scale-105 active:scale-95 ${
            isMuted ? 'bg-red-500 text-white' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
          }`}
        >
          {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
        </button>

        <button 
          onClick={onEnd} 
          className="p-6 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl transform hover:scale-105 active:scale-95 border-4 border-red-700/50"
        >
          <PhoneOff size={32} />
        </button>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-6 rounded-2xl z-50 shadow-2xl max-w-sm text-center">
          <AlertTriangle size={32} className="mx-auto mb-2" />
          <p className="font-bold">{error}</p>
          <button onClick={() => setStatus('idle')} className="mt-4 px-6 py-2 bg-white text-red-600 rounded-lg font-bold text-sm hover:bg-red-50">Close</button>
        </div>
      )}
    </div>
  );
};

export default LiveTutor;