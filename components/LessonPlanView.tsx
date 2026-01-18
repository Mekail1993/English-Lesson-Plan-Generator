
import React, { useState, useRef } from 'react';
import { LessonPlan } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface LessonPlanViewProps {
  plan: Partial<LessonPlan>;
}

const LessonPlanView: React.FC<LessonPlanViewProps> = ({ plan }) => {
  const [showPreview, setShowPreview] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!printableRef.current) return;
    
    const element = printableRef.current;
    const opt = {
      margin: 10,
      filename: `Lesson_Plan_${plan.topic || 'Export'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  const isEmptyHtml = (html?: string) => {
    if (!html) return true;
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent?.trim();
    return text === '' || text === null;
  };

  const renderRow = (label: string, value?: string, isOptional = false) => {
    if (isOptional && isEmptyHtml(value)) return null;
    if (!isOptional && isEmptyHtml(value)) {
        return (
            <tr className="border-b border-slate-300">
                <td className="p-3 border-r border-slate-300 font-bold bg-slate-50 w-1/3 align-top text-[11px] uppercase tracking-tight text-slate-700">{label}</td>
                <td className="p-3 italic text-slate-300 text-xs">[Empty]</td>
            </tr>
        );
    }
    return (
      <tr className="border-b border-slate-300 break-inside-avoid">
        <td className="p-3 border-r border-slate-300 font-bold bg-slate-50 w-1/3 align-top text-[11px] uppercase tracking-tight text-slate-700">
          {label}
        </td>
        <td className="p-3 bg-white align-top">
          <div className="rich-text-content prose prose-sm max-w-none text-slate-900 leading-relaxed text-[13px]" dangerouslySetInnerHTML={{ __html: value || '' }} />
        </td>
      </tr>
    );
  };

  const renderHeaderRow = (title: string) => (
    <tr className="break-inside-avoid">
      <td colSpan={2} className="p-2 bg-emerald-800 text-white font-black text-center uppercase tracking-widest text-[10px] border-b border-emerald-900 print-bg-emerald">
        {title}
      </td>
    </tr>
  );

  const DocumentContent = () => (
    <div ref={printableRef} id="printable-area" className="bg-white p-8 md:p-12 shadow-2xl border border-slate-100 min-h-[1056px] w-full max-w-[800px] mx-auto print:shadow-none print:border-none print:p-0 print:w-full transition-all duration-300">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-slate-900 uppercase leading-tight">{plan.schoolName || "Name of School"}</h1>
        <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest mt-1">{plan.schoolAddress || "School Address"}</p>
        <div className="mt-6 inline-block px-8 py-1.5 border-2 border-slate-900 text-slate-900 font-black rounded-lg uppercase tracking-[0.2em] text-[10px]">
          Daily Lesson Plan
        </div>
      </div>

      {/* Table Structure */}
      <table className="w-full border-2 border-slate-900 text-[13px] border-collapse bg-white">
        <tbody>
          {renderHeaderRow("Teacher Introduction")}
          {renderRow("Teacher’s Name", plan.teacherName)}
          {renderRow("Designation", plan.teacherDesignation)}

          {renderHeaderRow("Lesson Introduction")}
          <tr className="border-b border-slate-300 break-inside-avoid">
            <td className="p-3 border-r border-slate-300 font-bold bg-slate-50 w-1/3 text-[11px] uppercase text-slate-700 align-top">
              Lesson Details
            </td>
            <td className="p-3 bg-white">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                <div className="space-y-1.5">
                  <div><span className="font-bold">Class:</span> {plan.gradeLevel || 'N/A'}</div>
                  <div><span className="font-bold">Session:</span> {plan.sessionNo || 'N/A'}</div>
                  <div><span className="font-bold">Session Duration:</span> {plan.duration || 'N/A'}</div>
                </div>
                <div className="space-y-1.5">
                  <div><span className="font-bold">Unit:</span> {plan.unit || 'N/A'}</div>
                  <div><span className="font-bold">Lesson:</span> {plan.lessonNo || 'N/A'}</div>
                  <div><span className="font-bold">Page:</span> {plan.pageNo || 'N/A'}</div>
                </div>
              </div>
            </td>
          </tr>

          {renderHeaderRow("Instructional Design")}
          {renderRow("Learning Outcomes", plan.learningOutcomes)}
          {renderRow("Teaching Aids", plan.teachingAids)}

          {renderHeaderRow("Teaching Learning Activity")}
          {renderRow("Introduction", plan.activities?.introduction)}
          {renderRow("Prior Knowledge", plan.activities?.reviewPriorKnowledge, true)}
          {renderRow("Previous Session", plan.activities?.reviewPreviousSession, true)}
          {renderRow("Presentation", plan.activities?.presentation)}
          {renderRow("Practice Activities", plan.activities?.practice)}
          {renderRow("Assessment", plan.activities?.assessment)}
          {renderRow("Homework", plan.activities?.homework, true)}
          {renderRow("Feedback", plan.activities?.feedback)}
          {renderRow("Summary", plan.activities?.summary)}
          {renderRow("Concluding", plan.activities?.concluding)}
        </tbody>
      </table>

      {/* Professional Footer */}
      <div className="mt-20 flex justify-between items-end px-4 print:mt-16 break-inside-avoid">
        <div className="text-center w-40">
          <div className="border-t-2 border-slate-900 pt-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-800">Teacher's Signature</p>
          </div>
        </div>
        <div className="text-center w-40">
          <div className="border-t-2 border-slate-900 pt-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-800">Headteacher's Signature</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!showPreview ? (
        <div className="flex flex-col sm:flex-row justify-between items-center no-print gap-4">
          <div className="text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 flex items-center">
            <i className="fas fa-eye mr-2"></i>
            Live Editor View
          </div>
          <button 
            onClick={() => setShowPreview(true)}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 shadow-lg group"
          >
            <span>Review & Export</span>
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      ) : null}

      {/* Print Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md overflow-y-auto p-4 md:p-8 no-print flex flex-col items-center">
          {/* Preview Controls */}
          <div className="sticky top-0 z-[110] w-full max-w-4xl bg-white rounded-xl shadow-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4 border-b-4 border-emerald-600">
            <button 
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold flex items-center transition-colors"
            >
              <i className="fas fa-chevron-left mr-2"></i>
              Back to Editor
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center"
              >
                <i className="fas fa-print mr-2"></i>
                Print
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all flex items-center"
              >
                <i className="fas fa-file-pdf mr-2"></i>
                Download PDF
              </button>
            </div>
          </div>

          {/* The Paper Simulation */}
          <div className="w-full flex justify-center pb-20">
            <DocumentContent />
          </div>
        </div>
      )}

      {/* Normal View Inline Preview */}
      {!showPreview && (
        <div className="opacity-70 scale-[0.98] origin-top transition-all pointer-events-none select-none grayscale-[0.5]">
          <DocumentContent />
        </div>
      )}

      <style>{`
        .rich-text-content ul { list-style-type: disc; margin-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .rich-text-content li { margin-bottom: 0.25rem; }
        .rich-text-content b { font-weight: 800; }
        .rich-text-content i { font-style: italic; }
        
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-area {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-bg-emerald {
            background-color: #065f46 !important; /* emerald-800 */
            color: white !important;
          }
          tr {
            page-break-inside: avoid;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          td {
            border-color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LessonPlanView;
