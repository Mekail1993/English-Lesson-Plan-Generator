
import React, { useState, useCallback, useRef } from 'react';
import LessonForm from './components/LessonForm';
import LessonPlanView from './components/LessonPlanView';
import { generateLessonPlan } from './services/geminiService';
import { GenerationParams, LessonPlan } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Partial<LessonPlan>>({
    schoolName: '',
    schoolAddress: '',
    teacherName: '',
    teacherDesignation: 'Assistant Teacher',
    topic: '',
    gradeLevel: 'Class 3',
    unit: '',
    lessonNo: '',
    sessionNo: '',
    pageNo: '',
    duration: '40 minutes',
    activities: {
      introduction: '',
      reviewPriorKnowledge: '',
      reviewPreviousSession: '',
      presentation: '',
      practice: '',
      assessment: '',
      homework: '',
      feedback: '',
      summary: '',
      concluding: '',
    }
  });

  const timerRef = useRef<number | null>(null);

  const handleGenerate = useCallback(async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateLessonPlan(params);
      setCurrentPlan(plan);
    } catch (err: any) {
      console.error(err);
      setError("AI Generation failed. Check textbook info or image clarity.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced live update to prevent layout thrashing and "vibration" while typing
  const handleLiveUpdate = useCallback((updatedPlan: Partial<LessonPlan>) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentPlan(prev => {
        const newData = {
          ...prev,
          ...updatedPlan,
          activities: {
            ...prev.activities,
            ...(updatedPlan.activities || {})
          }
        };
        // Deep compare to avoid redundant updates
        if (JSON.stringify(prev) === JSON.stringify(newData)) return prev;
        return newData;
      });
    }, 150); // Small debounce window
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter overflow-y-scroll scroll-smooth">
      {/* Navbar (No Print) */}
      <header className="no-print bg-emerald-900 text-white py-4 px-8 border-b-4 border-red-600 sticky top-0 z-50 shadow-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <i className="fas fa-book-open text-2xl text-emerald-400"></i>
             <h1 className="text-xl font-black uppercase tracking-tighter">NCTB English Pro</h1>
          </div>
          <div className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-emerald-200 opacity-50">
            Primary Daily Lesson Plan Generator
          </div>
        </div>
      </header>

      {/* Content Area - 33/67 Split enforced via grid */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_2fr]">
        
        {/* LEFT: FORM (Approx 33%) */}
        <aside className="no-print p-6 lg:p-8 bg-white border-r border-slate-200 h-full">
           <div className="mb-6">
             <h2 className="text-sm font-black uppercase text-slate-800 mb-2 flex items-center">
               <i className="fas fa-edit mr-2 text-emerald-600"></i>
               Data Entry Form
             </h2>
             <p className="text-xs text-slate-500 italic">Enter lesson info below. The preview updates live.</p>
           </div>
           {error && (
             <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg animate-pulse">
               {error}
             </div>
           )}
           <LessonForm 
             onGenerate={handleGenerate} 
             onLiveUpdate={handleLiveUpdate} 
             isLoading={isLoading} 
             initialData={currentPlan}
           />
        </aside>

        {/* RIGHT: PREVIEW (Approx 67%) */}
        <main className="bg-slate-50 p-6 lg:p-12 min-h-full">
          <div className="max-w-4xl mx-auto">
            <div className="no-print mb-8 border-l-4 border-emerald-500 pl-4">
              <h2 className="text-sm font-black uppercase text-slate-800">Live Preview Area</h2>
              <p className="text-xs text-slate-500">Professional layout for printing.</p>
            </div>
            <LessonPlanView plan={currentPlan} />
          </div>
        </main>
      </div>

      {/* Footer (No Print) */}
      <footer className="no-print py-8 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white">
        © 2026 Bangladesh Primary Education Support Tool • Daily Lesson Planner
      </footer>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          main { width: 100% !important; padding: 0 !important; grid-column: span 2 !important; }
          body { background: white !important; }
        }
        /* Disable separate scrollbars - main page scroll handles everything */
        aside, main {
          overflow: visible !important;
        }
      `}</style>
    </div>
  );
};

export default App;