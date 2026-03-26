import React, { useState, useRef } from 'react';
import { FileText, Download, ChevronLeft, Printer, BookOpen, Layers, CheckCircle2, Award, Calendar, GraduationCap } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  marks: number;
  answer: string;
}

interface SubjectSection {
  title: string;
  code: string;
  maxMarks: number;
  questions: Question[];
}

interface CombinedPaper {
  grade: string;
  year: number;
  totalMarks: number;
  duration: string;
  sections: SubjectSection[];
}

const GRADES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

const PYPViewer: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState('6th');
  const [viewMode, setViewMode] = useState<'browsing' | 'viewing'>('browsing');
  const [activePaper, setActivePaper] = useState<CombinedPaper | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const generatePaper = (grade: string, year: number): CombinedPaper => {
    // Helper to generate realistic-looking questions
    const getQuestions = (subject: string): Question[] => {
      const questionsData = [
        { 
          text: `Section A: Multiple Choice. What is the primary concept of ${subject} introduced in the ${year} curriculum?`, 
          marks: 1, 
          answer: `(b) The foundational theory of ${subject} basics.` 
        },
        { 
          text: `Define the term 'Variable' in the context of ${subject}.`, 
          marks: 2, 
          answer: `A variable represents a value that can change, depending on conditions or on information passed to the program/equation.` 
        },
        { 
          text: `Explain the difference between Method A and Method B as discussed in Chapter 3.`, 
          marks: 3, 
          answer: `Method A focuses on speed, while Method B ensures accuracy through iterative checking.` 
        },
        { 
          text: `Solve the following problem: If a train travels at 60km/h... (Context: ${subject})`, 
          marks: 4, 
          answer: `Distance = Speed x Time. Therefore, 60 * 2.5 = 150km.` 
        },
        { 
          text: `Long Answer: Describe the impact of ${subject} on modern technology over the last decade.`, 
          marks: 5, 
          answer: `The impact is significant, driving automation, efficiency, and new discoveries in related fields.` 
        }
      ];
      return questionsData.map((q, i) => ({ ...q, id: i + 1 }));
    };

    const subjects = [
      { name: "Mathematics", code: "MATH", marks: 40 },
      { name: "General Science", code: "SCI", marks: 35 },
      { name: "Social Studies", code: "SST", marks: 35 },
      { name: "English Literature", code: "ENG", marks: 30 },
      { name: "Computer Basics", code: "CS", marks: 20 }
    ];

    const sections = subjects.map(s => ({
      title: s.name,
      code: s.code,
      maxMarks: s.marks,
      questions: getQuestions(s.name)
    }));

    const totalMarks = sections.reduce((acc, curr) => acc + curr.maxMarks, 0);

    return {
      grade,
      year,
      totalMarks,
      duration: "3 Hours",
      sections
    };
  };

  const handleOpenPaper = (year: number) => {
    const paper = generatePaper(selectedGrade, year);
    setActivePaper(paper);
    setViewMode('viewing');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full bg-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10 print:hidden">
        <div className="flex items-center gap-3">
          {viewMode === 'viewing' && (
            <button 
              onClick={() => setViewMode('browsing')}
              className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="text-blue-600" size={24} />
              PYP Archives
            </h1>
            <p className="text-xs text-slate-500 font-medium">Previous Year Papers & Answer Keys</p>
          </div>
        </div>

        {viewMode === 'viewing' && (
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
            >
              <Printer size={16} /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm">
              <Download size={16} /> Download PDF
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {viewMode === 'browsing' ? (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Grade Selector */}
            <div className="mb-8 overflow-x-auto pb-2">
              <div className="flex gap-3">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all shadow-sm
                      ${selectedGrade === grade 
                        ? 'bg-blue-600 text-white shadow-blue-200 scale-105' 
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                  >
                    Class {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Years Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {YEARS.map((year) => (
                <div 
                  key={year}
                  onClick={() => handleOpenPaper(year)}
                  className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Calendar size={24} />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 group-hover:bg-white/80">
                        All Subjects
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{year} Session</h3>
                    <p className="text-slate-500 text-sm mb-6">Combined Question Paper</p>
                    
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1"><Layers size={14} /> 5 Subjects</span>
                      <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Answer Key</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
              <Award className="text-indigo-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-indigo-900">Study Tip</h4>
                <p className="text-sm text-indigo-700 mt-1">
                  Practicing with combined papers simulates the real exam environment. Try to solve the entire {selectedGrade} paper within 3 hours before checking the answer key below.
                </p>
              </div>
            </div>
          </div>
        ) : activePaper ? (
          <div className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm] print:shadow-none print:w-full">
            {/* PDF Content Container */}
            <div ref={pdfContainerRef} className="p-12 md:p-16 text-slate-900">
              
              {/* Paper Header */}
              <div className="border-b-2 border-slate-900 pb-8 mb-8 text-center">
                <div className="flex justify-center items-center gap-3 mb-4 text-slate-400">
                  <GraduationCap size={32} />
                  <span className="text-xl font-bold tracking-widest uppercase">STUDYIT ARCHIVES</span>
                </div>
                <h1 className="text-4xl font-black mb-2 uppercase">Annual Examination {activePaper.year}</h1>
                <h2 className="text-2xl font-bold text-slate-600 mb-6">Class {activePaper.grade} &mdash; Combined Subjects</h2>
                
                <div className="flex justify-between items-center text-sm font-bold border-t border-slate-200 pt-4 px-8">
                  <span>Time Allowed: {activePaper.duration}</span>
                  <span>Maximum Marks: {activePaper.totalMarks}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-10 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                <h3 className="font-bold mb-2">General Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>This question paper contains {activePaper.sections.length} sections representing different subjects.</li>
                  <li>All questions are compulsory.</li>
                  <li>Write your answers clearly in the provided answer sheet.</li>
                  <li>Marks are indicated against each question.</li>
                  <li>The Answer Key is provided at the end of this document.</li>
                </ol>
              </div>

              {/* Subjects Loop */}
              <div className="space-y-12">
                {activePaper.sections.map((section, idx) => (
                  <div key={idx} className="break-inside-avoid">
                    <div className="flex items-center justify-between bg-slate-900 text-white p-3 mb-6 rounded-sm print:bg-slate-200 print:text-black">
                      <span className="font-bold uppercase tracking-wider">Part {String.fromCharCode(65 + idx)}: {section.title}</span>
                      <span className="text-sm font-mono">Max Marks: {section.maxMarks}</span>
                    </div>

                    <div className="space-y-6">
                      {section.questions.map((q) => (
                        <div key={q.id} className="flex gap-4">
                          <span className="font-bold text-slate-500 w-6 shrink-0">{q.id}.</span>
                          <div className="flex-1">
                            <p className="font-medium mb-1">{q.text}</p>
                          </div>
                          <span className="text-xs font-bold text-slate-400 align-top pt-1">[{q.marks}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Page Break for Answer Key */}
              <div className="my-16 border-t-4 border-dashed border-slate-300 print:break-before-page relative">
                 <span className="absolute left-1/2 -top-3.5 -translate-x-1/2 bg-white px-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                   End of Questions
                 </span>
              </div>

              {/* Answer Key Section */}
              <div className="break-inside-avoid">
                <div className="text-center mb-8">
                  <div className="inline-block px-6 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
                    Confidential
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">ANSWER KEY</h2>
                  <p className="text-slate-500">Session {activePaper.year} • Class {activePaper.grade}</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {activePaper.sections.map((section, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-200 break-inside-avoid">
                      <h3 className="font-bold text-lg text-slate-900 border-b border-slate-200 pb-3 mb-4 flex justify-between">
                        <span>{section.title}</span>
                        <span className="text-slate-400 text-sm font-normal">Part {String.fromCharCode(65 + idx)}</span>
                      </h3>
                      <div className="space-y-3">
                        {section.questions.map((q) => (
                          <div key={q.id} className="text-sm">
                            <span className="font-bold text-slate-700 mr-2">Q{q.id}.</span>
                            <span className="text-slate-600">{q.answer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center">
                <p>Generated by STUDYIT AI • Educational Purpose Only</p>
                <p className="mt-1">© {new Date().getFullYear()} StudyIt Inc.</p>
              </div>

            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PYPViewer;