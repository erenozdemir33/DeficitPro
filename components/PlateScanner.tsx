
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AIScanResult, LoggedFood } from '../types';
import { Camera, RefreshCw, Zap, Check, X, ShieldCheck, Sparkles } from 'lucide-react';

interface PlateScannerProps {
  onLog: (food: LoggedFood) => void;
  onClose?: () => void;
}

export const PlateScanner: React.FC<PlateScannerProps> = ({ onLog, onClose }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<AIScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setError("Camera permission denied or not available.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    setError(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this meal photo. You are a high-precision dietitian AI specialized in Turkish cuisine. 
      Identify the main dish, estimate the portion size in grams, and calculate total calories.
      Respond ONLY in JSON format: 
      {
        "dishName": "string",
        "estimatedGrams": number,
        "estimatedKcal": number,
        "confidence": number (0-1),
        "ingredients": ["string"]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      });

      const text = response.text || "";
      const jsonStr = text.replace(/```json|```/g, "").trim();
      const data: AIScanResult = JSON.parse(jsonStr);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("AI analysis failed. Please try again with better lighting.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleLog = () => {
    if (!result) return;
    onLog({
      id: Math.random().toString(36).substr(2, 9),
      name: `AI: ${result.dishName}`,
      kcal: result.estimatedKcal,
      grams: result.estimatedGrams,
      mealType: 'Lunch', // Default to Lunch for AI logs
      timestamp: Date.now()
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-0 transition-all">
      {!result ? (
        <div className="relative w-full h-full flex flex-col">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {/* Overlay UI */}
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <Sparkles size={16} className="text-indigo-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">VisionAI Scanner</span>
              </div>
              {onClose && (
                <button onClick={onClose} className="p-3 bg-black/40 backdrop-blur-md rounded-2xl text-white">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Target Frame */}
            <div className="flex-1 flex items-center justify-center pointer-events-none">
               <div className="w-64 h-64 border-2 border-dashed border-white/20 rounded-[40px] relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
               </div>
            </div>

            <div className="space-y-6 flex flex-col items-center">
              {error && <div className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">{error}</div>}
              
              <div className="w-full flex justify-center items-center gap-8 mb-4">
                <button 
                  onClick={captureAndScan}
                  disabled={isScanning}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isScanning ? 'bg-indigo-600 scale-90 opacity-50' : 'bg-white scale-100'}`}
                >
                  {isScanning ? <RefreshCw className="animate-spin text-white" size={32} /> : <div className="w-16 h-16 rounded-full border-4 border-slate-900" />}
                </button>
              </div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] text-center">Center your plate in the frame</p>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="w-full max-w-lg h-full bg-slate-50 dark:bg-slate-950 p-8 flex flex-col animate-in fade-in duration-500">
           <div className="flex-1 flex flex-col items-center justify-center space-y-10">
              <div className="w-32 h-32 bg-indigo-600 rounded-[44px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
                <Zap size={56} fill="currentColor" />
              </div>

              <div className="text-center space-y-3">
                 <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">{result.dishName}</h2>
                 <div className="flex justify-center gap-3">
                   <div className="px-3 py-1 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                     <ShieldCheck size={12}/> {Math.round(result.confidence * 100)}% Conf.
                   </div>
                   <div className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                     {result.estimatedGrams}g
                   </div>
                 </div>
              </div>

              <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-[48px] shadow-2xl space-y-8 border border-slate-100 dark:border-slate-800">
                 <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Energy Est.</h4>
                      <div className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">{result.estimatedKcal}</div>
                      <div className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Calories Identified</div>
                    </div>
                    <FlameIcon className="text-indigo-100 dark:text-indigo-900/20" size={100} />
                 </div>

                 <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Ingredient Mapping</h4>
                    <div className="flex flex-wrap gap-2">
                       {result.ingredients.map((ing, i) => (
                         <span key={i} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 capitalize">{ing}</span>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex gap-4 pt-8 pb-10">
              <button 
                onClick={() => setResult(null)}
                className="flex-1 py-6 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-[32px] uppercase tracking-widest text-[10px]"
              >
                Retake
              </button>
              <button 
                onClick={handleLog}
                className="flex-[2] bg-indigo-600 text-white font-black rounded-[32px] shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all"
              >
                Log to My Day <Check size={20} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

const FlameIcon = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.204 1.1-3.1" />
  </svg>
);
