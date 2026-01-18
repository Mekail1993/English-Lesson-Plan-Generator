
import React, { useState, useRef, useEffect } from 'react';
import { GenerationParams, LessonPlan, LessonActivities } from '../types';

interface LessonFormProps {
  onGenerate: (params: GenerationParams) => void;
  onLiveUpdate: (plan: Partial<LessonPlan>) => void;
  isLoading: boolean;
  initialData?: Partial<LessonPlan>;
}

const RichEditor: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label: string;
}> = ({ value, onChange, placeholder, label }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  // Sync internal HTML with value prop only when it changes from an external source (like AI)
  // or when the editor is not the active element to prevent cursor jumping/vibration.
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // If the editor is focused, we only update if the change is significant (not just typing)
      // Otherwise, we update it if it's not focused.
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
        lastValueRef.current = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const currentHTML = editorRef.current.innerHTML;
      if (currentHTML !== lastValueRef.current) {
        lastValueRef.current = currentHTML;
        onChange(currentHTML);
      }
    }
  };

  const exec = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  // Improved empty check to handle various empty tags browser might insert
  const isEmpty = !value || value === '<br>' || value === '<div><br></div>' || value === '';

  return (
    <div className="group space-y-1 relative">
      <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-wider group-focus-within:text-emerald-600 transition-colors">
        {label}
      </label>
      <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-2 py-1 flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}
            className="w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded text-xs font-bold transition-all text-slate-700"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
            className="w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded text-xs italic transition-all text-slate-700"
            title="Italic"
          >
            I
          </button>
          <div className="w-px h-3 bg-slate-300 mx-1" />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}
            className="w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded text-xs transition-all text-slate-700"
            title="Bullets"
          >
            <i className="fas fa-list-ul"></i>
          </button>
        </div>
        <div className="relative bg-white">
          {isEmpty && (
            <div className="absolute top-3 left-3 pointer-events-none text-slate-400 text-xs italic">
              {placeholder || 'Start typing...'}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="p-3 text-[13px] leading-relaxed min-h-[100px] outline-none whitespace-pre-wrap prose prose-sm max-w-none"
          />
        </div>
      </div>
    </div>
  );
};

const LessonForm: React.FC<LessonFormProps> = ({ onGenerate, onLiveUpdate, isLoading, initialData }) => {
  const [params, setParams] = useState<GenerationParams & { learningOutcomes: string; teachingAids: string }>({
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
    textbookText: '',
    learningOutcomes: '',
    teachingAids: '',
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

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with initialData (like AI generated results)
  useEffect(() => {
    if (initialData) {
      setParams(prev => {
        // Only update if data is actually different to avoid redundant re-renders
        const newData = {
          ...prev,
          ...initialData,
          activities: {
            ...prev.activities,
            ...(initialData.activities || {})
          }
        };
        if (JSON.stringify(prev) === JSON.stringify(newData)) return prev;
        return newData as any;
      });
    }
  }, [initialData]);

  // Push updates to parent
  useEffect(() => {
    onLiveUpdate(params);
  }, [params, onLiveUpdate]);

  const handleInputChange = (field: string, value: string) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleActivityChange = (field: keyof LessonActivities, value: string) => {
    setParams(prev => ({
      ...prev,
      activities: { ...prev.activities, [field]: value }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setParams(prev => ({ 
          ...prev, 
          imageBase64: base64, 
          imageMimeType: file.type 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(params);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-emerald-800 tracking-widest border-b pb-2">Institutional Info</h3>
          <input
            placeholder="School Name"
            className="w-full px-3 py-2 text-sm rounded border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
            value={params.schoolName}
            onChange={(e) => handleInputChange('schoolName', e.target.value)}
          />
          <input
            placeholder="School Address"
            className="w-full px-3 py-2 text-sm rounded border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
            value={params.schoolAddress}
            onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-emerald-800 tracking-widest border-b pb-2">Teacher Info</h3>
          <input
            placeholder="Teacher's Name"
            className="w-full px-3 py-2 text-sm rounded border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
            value={params.teacherName}
            onChange={(e) => handleInputChange('teacherName', e.target.value)}
          />
          <select
            className="w-full px-3 py-2 text-sm rounded border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
            value={params.teacherDesignation}
            onChange={(e) => handleInputChange('teacherDesignation', e.target.value as any)}
          >
            <option value="Assistant Teacher">Assistant Teacher</option>
            <option value="Head Teacher">Head Teacher</option>
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-emerald-800 tracking-widest border-b pb-2">Lesson Details</h3>
          <div className="grid grid-cols-2 gap-3">
             <input
              placeholder="Topic/Title"
              className="col-span-2 w-full px-3 py-2 text-sm rounded border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
              value={params.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
            />
            <select
              className="w-full px-3 py-2 text-sm rounded border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
              value={params.gradeLevel}
              onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
            >
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="Unit" className="w-full px-3 py-2 text-sm rounded border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500" value={params.unit} onChange={(e) => handleInputChange('unit', e.target.value)} />
            <input placeholder="Lesson" className="w-full px-3 py-2 text-sm rounded border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500" value={params.lessonNo} onChange={(e) => handleInputChange('lessonNo', e.target.value)} />
            <input placeholder="Session" className="w-full px-3 py-2 text-sm rounded border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500" value={params.sessionNo} onChange={(e) => handleInputChange('sessionNo', e.target.value)} />
            <input placeholder="Page No" className="w-full px-3 py-2 text-sm rounded border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500" value={params.pageNo} onChange={(e) => handleInputChange('pageNo', e.target.value)} />
            <input placeholder="Duration" className="w-full px-3 py-2 text-sm rounded border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500" value={params.duration} onChange={(e) => handleInputChange('duration', e.target.value)} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-emerald-800 tracking-widest border-b pb-2">Instructional Plan</h3>
          <RichEditor label="Learning Outcomes" value={params.learningOutcomes} onChange={(v) => handleInputChange('learningOutcomes', v)} placeholder="Students will be able to..." />
          <RichEditor label="Teaching Aids" value={params.teachingAids} onChange={(v) => handleInputChange('teachingAids', v)} placeholder="Textbook, Flashcards, Posters..." />
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase text-emerald-800 tracking-widest border-b pb-2">Teaching Learning Activities</h3>
          <RichEditor label="Introduction" value={params.activities.introduction} onChange={(v) => handleActivityChange('introduction', v)} placeholder="Greeting, Warming up..." />
          <RichEditor label="Review of Prior Knowledge" value={params.activities.reviewPriorKnowledge || ''} onChange={(v) => handleActivityChange('reviewPriorKnowledge', v)} placeholder="(Optional) Ask questions about previous learning..." />
          <RichEditor label="Review of previous Session" value={params.activities.reviewPreviousSession || ''} onChange={(v) => handleActivityChange('reviewPreviousSession', v)} placeholder="(Optional) Brief recap of last class..." />
          <RichEditor label="Presentation of the class" value={params.activities.presentation} onChange={(v) => handleActivityChange('presentation', v)} placeholder="Core lesson delivery..." />
          <RichEditor label="Practice Activities" value={params.activities.practice} onChange={(v) => handleActivityChange('practice', v)} placeholder="Individual or Group work..." />
          <RichEditor label="Assessment Learning" value={params.activities.assessment} onChange={(v) => handleActivityChange('assessment', v)} placeholder="Check understanding..." />
          <RichEditor label="Homework" value={params.activities.homework || ''} onChange={(v) => handleActivityChange('homework', v)} placeholder="(Optional) Follow up task..." />
          <RichEditor label="Feedback" value={params.activities.feedback} onChange={(v) => handleActivityChange('feedback', v)} placeholder="Corrective feedback..." />
          <RichEditor label="Summary of the session" value={params.activities.summary} onChange={(v) => handleActivityChange('summary', v)} placeholder="Wrap up..." />
          <RichEditor label="Concluding the session" value={params.activities.concluding} onChange={(v) => handleActivityChange('concluding', v)} placeholder="Goodbye routine..." />
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-emerald-800 tracking-widest border-b pb-2">AI Textbook Context</h3>
          <textarea
            placeholder="Paste raw textbook text here to help AI generate content..."
            className="w-full h-20 px-3 py-2 text-xs rounded border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
            value={params.textbookText}
            onChange={(e) => handleInputChange('textbookText', e.target.value)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors"
          >
            {imagePreview ? '✓ Textbook Image Attached' : '+ Upload Textbook Photo (AI Vision)'}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-800 disabled:bg-emerald-300 transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
          <span>{isLoading ? 'Generating Content...' : 'Generate with AI'}</span>
        </button>
      </form>
    </div>
  );
};

export default LessonForm;
