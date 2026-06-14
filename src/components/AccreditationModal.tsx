import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  FileLock2, 
  Activity, 
  HeartHandshake, 
  Building, 
  Globe2, 
  Cpu,
  BadgeAlert
} from 'lucide-react';

interface AccreditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'bmdc' | 'who' | 'uksai';
}

export default function AccreditationModal({ isOpen, onClose, defaultTab = 'bmdc' }: AccreditationModalProps) {
  const [activeTab, setActiveTab] = useState<'bmdc' | 'who' | 'uksai'>(defaultTab);

  if (!isOpen) return null;

  const tabs = [
    {
      id: 'bmdc' as const,
      label: 'BM&DC Guidelines',
      subtitle: 'National Quality Standards',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      activeColor: 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-100'
    },
    {
      id: 'who' as const,
      label: 'WHO ISO Standards',
      subtitle: 'Global Reference Rules',
      icon: Globe2,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      activeColor: 'bg-blue-600 border-blue-700 text-white shadow-blue-100'
    },
    {
      id: 'uksai' as const,
      label: 'UKSAI AI Governance',
      subtitle: 'Clinical AI Audits',
      icon: Cpu,
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      activeColor: 'bg-red-650 border-red-700 text-white shadow-red-100'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-55 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 font-sans">
        
        {/* Absolute Ribbon Icon */}
        <div className="absolute -top-6 left-8 bg-red-600 text-white shadow-lg shadow-red-100/70 p-3 rounded-2xl border-2 border-white hidden sm:block">
          <Award className="w-6 h-6 animate-pulse" />
        </div>

        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-150 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Head Intro */}
        <div className="pt-2 sm:pt-4 space-y-1.5">
          <p className="text-red-750 font-black text-[10px] tracking-wider uppercase font-mono">
            Clinical Quality Assurance Framework
          </p>
          <h2 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight font-sans">
            Diagnostic Standards & Regulatory Compliance
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Shahnaz Pathology operates under rigorous medical supervision. Every patient specimen is analyzed, audited, and processed in absolute compliance with national statutes and international laboratory pathology guidelines.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                  isActive 
                    ? `${tab.activeColor} border-2` 
                    : `${tab.color} border-slate-200/60`
                }`}
              >
                <span className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/10 text-white' : 'bg-white/80'}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-black tracking-tight">{tab.label}</h4>
                  <p className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-500'} font-medium`}>{tab.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN BODY CONTENTS */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-[1.8rem] p-5 sm:p-6 min-h-[300px]">
          {activeTab === 'bmdc' && (
            <div className="space-y-4 animate-[fadeIn0.15s_ease-out]">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-950 font-sans">
                    Bangladesh Medical & Dental Council (BM&DC) Alignment
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">National Regulatory Standards Compliance</p>
                </div>
              </div>

              <p className="text-xs text-slate-650 leading-relaxed">
                As a premier diagnostic facility operating under DGHS (Directorate General of Health Services) and BM&DC frameworks, Shahnaz pathology guarantees that medical testing is handled purely by certified medical practitioners and certified medical technologists.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-650 shrink-0" />
                    <span>Registered Pathologist Verification</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    Under Article 24 of the BM&DC Act, every diagnostics report represents a validated legal medical paper. Dr. Shahnaz Jahan personally oversees calibration parameters and signs off on complex clinical outputs.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-650 shrink-0" />
                    <span>Validated Reference Intervals</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    Patient biological reference intervals are dynamically scaled to reflect appropriate regional demographic factors in Bangladesh corresponding to physiological baselines validated under national audits.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-650 shrink-0" />
                    <span>Strict Chemical Biosafety</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    We maintain stringent sterilization, safe chemical processing, and reagent validation protocols. Reagents undergo cold-chain integrity auditing logs back up automatically.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-650 shrink-0" />
                    <span>Patient Grievance Redressal</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    Aligning with Patient Charter rules, we have deployed the staff auditing and grievance redressing engine. Patients have a direct legal report channel to guarantee transparent accountability.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'who' && (
            <div className="space-y-4 animate-[fadeIn0.15s_ease-out]">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                  <Globe2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-950 font-sans">
                    WHO Pathology & ICD-11 Diagnostic Guidelines
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">International Laboratory Quality Assurance</p>
                </div>
              </div>

              <p className="text-xs text-slate-650 leading-relaxed">
                We align with World Health Organization guidelines, translating diagnostic terminologies to standard ICD-11 (International Classification of Diseases, 11th Revision) keys. This ensures diagnostic codes are recognized anywhere globally.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-650 shrink-0" />
                    <span>WHO Laboratory Biosafety manual</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    Our laboratory is configured following standard BSL-2 (Biosafety Level 2) requirements to prevent contamination and protect sample integrity during processing.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-650 shrink-0" />
                    <span>ISO 15189 Quality Management</span>
                    <span className="bg-blue-50 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 rounded-sm">Global</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    We maintain structured processes for pre-analytical (sample collection & tracking), analytical (actual automated testing), and post-analytical (validated reports release) phases.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-650 shrink-0" />
                    <span>Critical Reporting Alert Protocols</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    Strict thresholds are programmed for hypercritical indicators (such as profound anemia or acute sepsis hematology markers). Alert panels light up instantly to trigger emergency notification pathways.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-650 shrink-0" />
                    <span>Continuous External Assessment</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    We routinely baseline our testing machines using verified control samples, maintaining minimal variance coefficient records conforming to modern WHO internal diagnostics benchmarking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'uksai' && (
            <div className="space-y-4 animate-[fadeIn0.15s_ease-out]">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <span className="p-1.5 bg-red-100 text-red-800 rounded-lg">
                  <Cpu className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-950 font-sans">
                    UKSAI Clinical Generative AI Audit Compliance
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Ethical Patient Safety & AI Hallucination Mitigation</p>
                </div>
              </div>

              <p className="text-xs text-slate-650 leading-relaxed">
                As diagnostics transition towards AI-assisted analysis, our integrated clinical summaries (powered by server-side Gemini Flash) are governed by the UK School of Artificial Intelligence Clinical Auditing framework. This maintains the ultimate integrity of our patients' digital records.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Physician-in-the-Loop Safeguard</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    Under UKSAI guidelines, neural logic cannot autonomously write patient medical summaries. The AI serves as an assistant only, and doctor verification is mandated before final release.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Strict Cryptographic Anonymization</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    Any information processed by the multi-modal clinical intelligence is stripped of unessential biographical data, protecting patient secret identities during cloud processing.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Hallucination Filter Benchmarks</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    AI summaries are rigorously bound by ground-truth diagnostic values from specific lab metrics. The system blocks open-ended speculation to guarantee factual correctness.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Tamper-proof Cryptographic QR Seal</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed">
                    Once checked and signed, each diagnostic record compiles into a cryptographic signature represented on QR codes. If modified, validation checks immediately trigger failure reports.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM REASSURANCE BANNER */}
        <div className="p-4 bg-slate-900 text-white rounded-[1.8rem] flex flex-col sm:flex-row items-center gap-4 justify-between border border-slate-950">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-red-600 text-white rounded-xl">
              <FileLock2 className="w-4 h-4 shrink-0" />
            </span>
            <div className="text-left">
              <p className="text-[11px] font-black tracking-tight text-white leading-tight">Patient Information Protection Covenant</p>
              <p className="text-[9.5px] text-slate-400 font-sans mt-0.5">Protected health datasets are stored on isolated nodes.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider shrink-0 transition cursor-pointer"
          >
            I Acknowledge & Verify Compliance
          </button>
        </div>

      </div>
    </div>
  );
}
