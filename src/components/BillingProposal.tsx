import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Clipboard,
  Printer,
  Check,
  Building,
  User,
  Sparkles,
  ShieldAlert,
  Clock,
  Briefcase,
  HelpCircle,
  Eye,
  RotateCcw
} from 'lucide-react';

interface BillingProposalProps {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function BillingProposal({ showToast }: BillingProposalProps) {
  // Lang state
  const [lang, setLang] = useState<'bn' | 'en' | 'bilingual'>('bilingual');

  // Interactive proposal form states
  const [drName, setDrName] = useState('ডাক্তার শাহানাজ জাহান');
  const [drNameEn, setDrNameEn] = useState('Dr. Shahnaz Jahan');
  const [clinicName, setClinicName] = useState('শাহানাজ ক্লিনিক্যাল ল্যাবরেটরি ও ডায়াগনস্টিক');
  const [clinicNameEn, setClinicNameEn] = useState('Shahnaz Clinical Laboratory & Diagnostics');
  const [devName, setDevName] = useState('EHR Elite Software Architect');
  const [basePrice, setBasePrice] = useState(250000); // Base simple setup BDT
  const [useEnterprisePricing, setUseEnterprisePricing] = useState(true); // Default true for complete enterprise automation
  const [monthlyFee, setMonthlyFee] = useState(15000);   // 15,000 BDT
  const [cloudFee, setCloudFee] = useState(3000);       // 3,000 BDT
  const [warrantyMonths, setWarrantyMonths] = useState(3);
  const [proposalNo, setProposalNo] = useState(`SL/EHR/2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [proposalDate, setProposalDate] = useState(new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }));
  const [proposalDateEn, setProposalDateEn] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

  // High-Value Premium Enterprise Automation Modules
  const [enterpriseScopes, setEnterpriseScopes] = useState([
    { id: 'analyzer_interfacing', labelEn: 'Bi-directional Lab Machine Interfacing (HL7/Roche/Sysmex/Abbott)', labelBn: 'দ্বিমুখী ল্যাব অ্যানালাইজার মেশিন ইন্টারফেসিং (আমদানিকৃত টেস্টিং ডিভাইস থেকে অটোমেটেড ডেটা রিডিং)', cost: 550000, checked: true },
    { id: 'pacs_dicom', labelEn: 'HL7 DICOM Cloud Server & PACS Web Viewer Integration', labelBn: 'ডাইকম (DICOM) ইমেজ ক্লাউড সার্ভার এবং ল্যাবরেটরি PACS ওয়েব ভিউয়ার', cost: 450000, checked: true },
    { id: 'hybrid_failover', labelEn: 'Local Hybrid Redundant Server Rack (Offline Operations Failover Hub)', labelBn: 'লোকাল হাইব্রিড অন-প্রিমিস ব্যাকআপ সার্ভার ও অফলাইন অপারেশন নোড', cost: 350000, checked: true },
    { id: 'smartcard_nfc', labelEn: 'Biometric NFC Patient Smartcard Issuance & Physical Hardware Link', labelBn: 'বায়োমেট্রিক পেশেন্ট এনএফসি স্মার্টকার্ড প্রিন্টিং ও রিডার ডিভাইস সংযোজন', cost: 200000, checked: false },
    { id: 'mobile_bundle', labelEn: 'Dedicated iOS & Android Mobile Apps with Push Diagnostic Dispatching', labelBn: 'আইওএস এবং অ্যান্ড্রয়েড ডেডিকেটেড মোবাইল অ্যাপ্লিকেশন (অ্যাপ স্টোর ও গুগল প্লে স্টোর পাবলিশিং)', cost: 550000, checked: true },
    { id: 'cancer_predictive', labelEn: 'Tumor Prognosis & Oncology Multi-Modal AI Image Diagnostics Model (Predictive Pre-Scanner)', labelBn: 'ক্যান্সার টিস্যু রোগ নির্ণয় ও অঙ্কোলজি মাল্টি-মোডাল প্রেডিক্টিভ এআই মডেল ইন্টিগ্রেশন', cost: 400000, checked: true },
    { id: 'telepathology_room', labelEn: 'End-to-End Encrypted WebRTC Telepathology Live Consultant Board & Video-Scribe Hub', labelBn: 'রিয়েল-টাইম অডিও-ভিডিও টেলি-প্যাথলজি ডিজিটাল চেম্বার মডিউল (E2E এনক্রিপশনে সুরক্ষিত)', cost: 350000, checked: true },
    { id: 'fhir_hub', labelEn: 'National Health Grid FHIR Registry Node & Inter-hospital Exchange API', labelBn: 'জাতীয় হেলথ গ্রিড এবং এফএইচআইআর (FHIR) কমপ্লায়েন্ট এপিআই হাব ইন্টিগ্রেশন', cost: 150000, checked: false },
    { id: 'smart_icd11', labelEn: 'Automatic ICD-11 SNOMED-CT Pathology Coding & Health Board Interoperability Router', labelBn: 'স্বয়ংক্রিয় ICD-11 ও SNOMED-CT আন্তর্জাতিক প্যাথলজি কোডিং এবং ডায়াগনস্টিক ডেটা রাউটার', cost: 250000, checked: true }
  ]);

  // Scopes checkbox configuration
  const [scopes, setScopes] = useState([
    { id: 'intake', labelEn: 'EHR Intelligent System Intake (Report Uploader)', labelBn: 'ইএইচআর ইন্টেলিজেন্ট সিস্টেম ইনটেক (রিপোর্ট আপলোডার)', checked: true },
    { id: 'gemini', labelEn: 'Multi-Modal AI Clinical Summary Agent (Gemini Flash integration)', labelBn: 'মাল্টি-মোডাল এআই ক্লিনিক্যাল সামারি এজেন্ট (Gemini Flash যুক্ত)', checked: true },
    { id: 'badges', labelEn: 'Encrypted QR-Code Digital Badges & Verification Nodes', labelBn: 'এনক্রিপ্টেড কিউআর-কোড ডিজিটাল ব্যাজ এবং ভেরিফিকেশন নোড', checked: true },
    { id: 'google_drive', labelEn: 'Automated Diagnostic Backup Engine (Google Drive Auto-Sync)', labelBn: 'স্বয়ংক্রিয় ডায়াগনস্টিক ব্যাকআপ ইঞ্জিন (Google Drive Auto-Sync)', checked: true },
    { id: 'patient_tracker', labelEn: 'Encrypted Patient Queue & Real-time Tracking Panel', labelBn: 'এনক্রিপ্টেড পেশেন্ট কিউ এবং রিয়েল-টাইম ট্র্যাকিং প্যানেল', checked: true },
    { id: 'grievance', labelEn: 'Grievance Redressal Legal Box (EHR Audit Logging & Audit Trails)', labelBn: 'আইনি অভিযোগ বক্স (EHR অডিট লগিং এবং অডিট ট্রেইল)', checked: true },
  ]);

  // System optimization duties checkbox
  const [duties, setDuties] = useState([
    { id: 'db_cleaning', labelEn: 'Database Optimization (Weekly cleanup, integrity checks & secure vacuuming)', labelBn: 'ডেটাবেস অপ্টিমাইজেশন (সাপ্তাহিক ক্লিনআপ, ইন্টিগ্রিটি চেক এবং সিকিউর ভ্যাকুয়ামিং)', checked: true },
    { id: 'prompt_tweak', labelEn: 'AI Prompt Engineering tweaks, model fine-tuning & latencies mitigation', labelBn: 'এআই প্রম্পট ইঞ্জিনিয়ারিং টিউনিং এবং মডেল ল্যাটেন্সি হ্রাস নিশ্চিতকরণ', checked: true },
    { id: 'gdrive_assurance', labelEn: 'Backup assurance (Continuous surveillance of remote Google Drive backups)', labelBn: 'ব্যাকআপ অ্যাসুরেন্স (রিমোট গুগল ড্রাইভ ব্যাকআপ সার্ভেইল্যান্স)', checked: true },
    { id: 'security_audit', labelEn: 'SLA Uptime & security patches targeting BM&DC and UKSAI standards', labelBn: 'BM&DC এবং UKSAI স্ট্যান্ডার্ড অনুযায়ী সিকিউরিটি প্যাচ ও এসএলএ আপটাইম মনিটরিং', checked: true },
    { id: 'telemetry', labelEn: 'Real-time telemetry reports reflecting Patient portal interaction counters', labelBn: 'পেশেন্ট পোর্টাল ইন্টারেকশন কাউন্টারের রিয়েল-টাইম টেলিমেট্রি রিপোর্ট প্রদান', checked: true },
  ]);

  const handleScopeToggle = (id: string) => {
    setScopes(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  const handleEnterpriseScopeToggle = (id: string) => {
    setEnterpriseScopes(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  const handleDutyToggle = (id: string) => {
    setDuties(prev => prev.map(d => d.id === id ? { ...d, checked: !d.checked } : d));
  };

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);
  };

  const formatBDTEn = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);
  };

  // Dynamically calculate the final setup bill
  const finalBasePrice = useEnterprisePricing
    ? basePrice + enterpriseScopes.reduce((sum, s) => s.checked ? sum + s.cost : sum, 0)
    : basePrice;

  const resetToDefault = () => {
    setDrName('ডাক্তার শাহানাজ জাহান');
    setDrNameEn('Dr. Shahnaz Jahan');
    setClinicName('শাহানাজ ক্লিনিক্যাল ল্যাবরেটরি ও ডায়াগনস্টিক');
    setClinicNameEn('Shahnaz Clinical Laboratory & Diagnostics');
    setDevName('EHR Elite Software Architect');
    setBasePrice(250000);
    setUseEnterprisePricing(true);
    setEnterpriseScopes(prev => prev.map(s => ({ ...s, checked: true })));
    setMonthlyFee(15000);
    setCloudFee(3000);
    setWarrantyMonths(3);
    setScopes(prev => prev.map(s => ({ ...s, checked: true })));
    setDuties(prev => prev.map(d => ({ ...d, checked: true })));
    showToast('Proposal builder variables reset to defaults.', 'info');
  };

  const getCopyText = () => {
    let text = '';
    const dateStr = `${proposalDate} / ${proposalDateEn}`;
    
    text += `=======================================================\n`;
    text += `MEMORANDUM OF AGREEMENT & BILLING PROPOSAL\n`;
    text += `রক্ষণাবেক্ষণ চুক্তি এবং বিলিং প্রস্তাবনা\n`;
    text += `Proposal No: ${proposalNo} | Date: ${dateStr}\n`;
    text += `=======================================================\n\n`;

    text += `CLIENT DETAILS / ক্লায়েন্টের বিবরণ:\n`;
    text += `- Client: ${drName} (${drNameEn})\n`;
    text += `- Institution: ${clinicName} (${clinicNameEn})\n\n`;

    text += `DEVELOPER / আর্কিটেক্ট:\n`;
    text += `- Software Architect: ${devName}\n\n`;

    text += `1. FINANCIAL AGREEMENT / আর্থিক চুক্তি:\n`;
    text += `- Base Platform Implementation Cost (এককালীন সেটআপ বিল): ${formatBDT(finalBasePrice)} (or BDT ${finalBasePrice.toLocaleString()})\n`;
    text += `- Monthly Maintenance Fee (মাসিক রক্ষণাবেক্ষণ ফি): ${formatBDT(monthlyFee)} / Month\n`;
    text += `- Cloud Hosting & Google Drive Integration Fee (ক্লাউড রিসোর্স ফি): ${formatBDT(cloudFee)} / Month\n`;
    text += `- Project Warranty Period (ওয়ারেন্টি সময়সীমা): ${warrantyMonths} Months / মাস (Free SLA)\n\n`;

    text += `2. SERVICE SCOPE COVERED / সার্ভিস স্কোপের আওতাভুক্ত:\n`;
    scopes.filter(s => s.checked).forEach((s, idx) => {
      text += `  [${idx + 1}] ${s.labelEn} (${s.labelBn})\n`;
    });
    if (useEnterprisePricing) {
      enterpriseScopes.filter(s => s.checked).forEach((s, idx) => {
        text += `  [Enterprise - ${idx + 1}] ${s.labelEn} (${s.labelBn}) [Cost Add-on: BDT ${s.cost.toLocaleString()}]\n`;
      });
    }
    text += `\n`;

    text += `3. SYSTEM OPTIMIZATION DUTIES / সিস্টেম অপ্টিমাইজেশন দায়িত্ব:\n`;
    duties.filter(d => d.checked).forEach((d, idx) => {
      text += `  [${idx + 1}] ${d.labelEn} (${d.labelBn})\n`;
    });
    text += `\n`;

    text += `4. REGULATORY ALIGNMENT / নিয়ন্ত্রক সম্মতি:\n`;
    text += `- All operations comply fully with British Medical & Dental Council (BM&DC) clinical audit and Patient Portal compliance.\n`;
    text += `- Data backups structured under UKSAI secure validation protocols.\n\n`;

    text += `-------------------------------------------------------\n`;
    text += `Authorized Signatures / স্বাক্ষরসমূহ:\n\n`;
    text += `___________________________             ___________________________\n`;
    text += `Developer: ${devName}                  Client: ${drNameEn}\n`;

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCopyText());
    showToast('Billing proposal copied to clipboard successfully!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] print:space-y-0 print:p-0">
      
      {/* HEADER CONTROLS (HIDDEN DURING PRINT) */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xs space-y-6 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 bg-red-50 text-red-650 rounded-lg">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">
                Billing Proposal & Maintenance Agreement Drafting Engine
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Draft an elegant, bilingual Service Level Agreement (SLA) proposing costs and scope variables for <strong>ডাক্তার শাহানাজ জাহান</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={resetToDefault}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-[11px] font-bold text-slate-600 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Variables
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-950 active:bg-black text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Copy Raw Agreement
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-red-100"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* INTERACTIVE VARIABLES FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
          
          {/* CLIENT & COST SETTINGS */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-red-550" />
              Proposal Parameters
            </h3>

            {/* Doc & Clinic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase">Doctor Name (Bengali)</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={drName}
                    onChange={(e) => setDrName(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 font-sans focus:outline-none focus:border-red-500 bg-slate-50/50"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase">Doctor Name (English)</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={drNameEn}
                    onChange={(e) => setDrNameEn(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 font-sans focus:outline-none focus:border-red-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase">Laboratory / Clinic</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={clinicNameEn}
                  onChange={(e) => setClinicNameEn(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 font-sans focus:outline-none focus:border-red-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase">Developer Name</label>
                <input
                  type="text"
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-red-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase">Proposal ID</label>
                <input
                  type="text"
                  value={proposalNo}
                  onChange={(e) => setProposalNo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-red-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-600 font-extrabold uppercase flex justify-between">
                  <span>Base Setup Bill</span>
                  <span className="text-red-650 font-mono">BDT</span>
                </label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold font-mono bg-white text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-600 font-extrabold uppercase flex justify-between">
                  <span>Monthly Maintenance</span>
                  <span className="text-red-650 font-mono">BDT/mo</span>
                </label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold font-mono bg-white text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-600 font-extrabold uppercase flex justify-between">
                  <span>Monthly API Allocation</span>
                  <span className="text-red-650 font-mono">BDT/mo</span>
                </label>
                <input
                  type="number"
                  value={cloudFee}
                  onChange={(e) => setCloudFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold font-mono bg-white text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-600 font-extrabold uppercase flex justify-between">
                  <span>Free SLA Warranty</span>
                  <span className="text-red-650 font-mono">Months</span>
                </label>
                <input
                  type="number"
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold font-mono bg-white text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* ADVISORY CARD */}
            <div className="bg-red-50/50 border border-red-200/50 p-4 rounded-2xl space-y-2">
              <p className="text-[10px] text-red-700 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Developer Guideline for Dr. Shahnaz's Project
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                The setup includes multi-modal clinical summary tools driven by Gemini AI and secure Google Drive Sync backups. For medical-grade laboratories in Bangladesh:
              </p>
              <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-1 font-sans">
                <li><strong>Base Build Price:</strong> BDT 2,00,000 to 3,00,000 is highly justified given the dynamic end-to-end QR validation & BM&DC diagnostic template rendering.</li>
                <li><strong>Monthly SLA Fee:</strong> BDT 15,000 ensures guaranteed emergency patches and continuous prompt tuning support.</li>
                <li><strong>Cloud APIs Costs:</strong> Keeping cloud/API fees separate (e.g. BDT 3,000) prevents unexpected server depletion.</li>
              </ul>
            </div>
          </div>

          {/* CHECKLISTS (SCOPE & OPTIMIATIONS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* ENTERPRISE OPTIONS HEADER AND SWITCH */}
            <div className="bg-red-955/5 border border-red-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-red-600 animate-pulse" />
                  Advanced Diagnostics Enterprise Suite (উন্নত ডায়াগনস্টিক অটোমেশন ও প্রিমিয়াম এন্টারপ্রাইজ মডিউল)
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useEnterprisePricing}
                    onChange={(e) => setUseEnterprisePricing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-650"></div>
                </label>
              </div>
              <p className="text-[10px] text-slate-550 leading-relaxed font-sans">
                নিচে উল্লিখিত অত্যাধুনিক এন্টারপ্রাইজ মডিউলগুলো আপনার ডায়াগনস্টিক সার্ভিসের মান, নির্ভরযোগ্যতা ও গতি বহুগুণ বাড়িয়ে দেবে। এই বাস্তবসম্মত সার্ভিসসমূহ যুক্ত করার মাধ্যমে আপনি চিকিৎসকদের আস্থা অর্জন করতে পারবেন এবং বাজারের শীর্ষস্থানে সুপ্রতিষ্ঠিত হতে পারবেন:
              </p>

              {useEnterprisePricing && (
                <div className="space-y-2 mt-2 max-h-[220px] overflow-y-auto pr-1">
                  {enterpriseScopes.map(es => (
                    <label key={es.id} className="flex items-start gap-2.5 p-2.5 bg-white border border-red-100 hover:border-red-200 rounded-xl cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={es.checked}
                        onChange={() => handleEnterpriseScopeToggle(es.id)}
                        className="mt-0.5 rounded text-red-650 focus:ring-red-500"
                      />
                      <div className="text-[11px]">
                        <div className="flex justify-between items-center gap-2">
                          <p className="font-extrabold text-slate-900 leading-tight">{es.labelEn}</p>
                          <span className="text-[9.5px] font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                            +{es.cost.toLocaleString('bn-BD')} BDT
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-sans font-medium">{es.labelBn}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Service Scope (What gets maintained & supported)
              </h3>
              <p className="text-[10.5px] text-slate-400 mb-3 font-sans">Select systems to commit within the maintenance agreement contract.</p>
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {scopes.map(s => (
                  <label key={s.id} className="flex items-start gap-2.5 p-2 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={s.checked}
                      onChange={() => handleScopeToggle(s.id)}
                      className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                    />
                    <div className="text-[11px]">
                      <p className="font-bold text-slate-800 leading-tight">{s.labelEn}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-sans font-medium">{s.labelBn}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Optimization Duties (Our routine system optimizations)
              </h3>
              <p className="text-[10.5px] text-slate-400 mb-3 font-sans">Daily, weekly, or monthly scheduled duties ensuring uptime and regulatory adherence.</p>
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {duties.map(d => (
                  <label key={d.id} className="flex items-start gap-2.5 p-2 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={d.checked}
                      onChange={() => handleDutyToggle(d.id)}
                      className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                    />
                    <div className="text-[11px]">
                      <p className="font-bold text-slate-800 leading-tight">{d.labelEn}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-sans font-medium">{d.labelBn}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* PRINTING LANGUAGE SELECTOR */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-red-600" />
            Proposal Presentation Style:
          </div>
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex gap-1">
            <button
              onClick={() => { setLang(' bn'); setLang('bn'); }}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition ${lang === 'bn' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Bengali Only
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition ${lang === 'en' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              English Only
            </button>
            <button
              onClick={() => setLang('bilingual')}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition ${lang === 'bilingual' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Bilingual (Bengali + English)
            </button>
          </div>
        </div>
      </div>

      {/* RENDERED PROPOSAL LETTER (STYLISH LETTERHEAD - VISIBLE IN PRINT AND SCREEN) */}
      <div id="proposal-print-area" className="bg-white border md:border-2 border-slate-200/80 rounded-[2.5rem] p-8 md:p-12 shadow-md relative overflow-hidden font-sans max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        
        {/* Subtle decorative security grid overlay on background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none"></div>

        {/* LETTERHEAD TOP */}
        <div className="relative border-b-4 border-red-600 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <p className="text-red-600 font-extrabold tracking-widest text-[10px] uppercase font-mono">Software SLA Agreement Letter</p>
            <h1 className="text-2xl font-black text-slate-950 font-sans tracking-tight">
              EHR ELITE DIAGNOSTICS ARCHITECTURE
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              BM&DC Registered & UKSAI Cryptographic Audit Compliant Modules
            </p>
          </div>
          <div className="text-left md:text-right text-[10px] text-slate-400 font-mono space-y-0.5">
            <p><strong>Proposal Ref:</strong> <span className="text-slate-800 font-bold">{proposalNo}</span></p>
            <p><strong>Bengali Date:</strong> {proposalDate}</p>
            <p><strong>English Date:</strong> {proposalDateEn}</p>
          </div>
        </div>

        {/* LETTER PREVIEW CONTAINER */}
        <div className="relative pt-8 space-y-6 text-slate-800 text-xs leading-relaxed">
          
          {/* CLIENT RECIPIENT CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200/65 rounded-2xl p-4">
            <div>
              <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wide">Agreement Recipient (client)</p>
              <h4 className="text-sm font-black text-slate-950 mt-1 font-sans">{drNameEn}</h4>
              <p className="text-xs font-bold text-red-650 mt-0.5">{drName}</p>
              <p className="text-[11px] text-slate-600 mt-1">{clinicNameEn}</p>
              <p className="text-[10px] text-slate-500 font-medium">{clinicName}</p>
            </div>
            <div className="md:border-l md:border-slate-200 md:pl-4 space-y-1 text-[11px]">
              <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wide">Developer Architect</p>
              <h4 className="text-sm font-black text-slate-950 mt-1 font-mono">{devName}</h4>
              <p className="text-slate-500">Emergency Response SLA: <span className="text-emerald-600 font-bold">2 Hours Guarantee</span></p>
              <p className="text-slate-500">API Gateway Version: <span className="text-slate-800 font-bold">Gemini-2.5-Flash Active</span></p>
            </div>
          </div>

          {/* LETTER SALUTATION */}
          <div className="space-y-3 font-sans">
            {(lang === 'bn' || lang === 'bilingual') && (
              <p className="font-bold text-slate-900 leading-normal">
                শ্রদ্ধেয় {drName},
                <br />
                আপনার দ্বৈত ল্যাব পরিচালনা এবং স্বয়ংক্রিয় Patient Summary Reporting পোর্টালের সফল বাস্তবায়নের উপর ভিত্তি করে আমরা একটি সামগ্রিক মাসিক রক্ষণাবেক্ষণ চুক্তি (SLA) এবং অপ্টিমাইজেশন বিলিং প্রস্তাবনা তৈরি করেছি। এই চুক্তির মূল লক্ষ্য হল সিস্টেমটির সার্বক্ষণিক স্থায়িত্ব, আইনি নিরাপত্তা (BM&DC নির্দেশনা অনুযায়ী) এবং এআই মডিউলগুলোর সঠিক প্রম্পট অপ্টিমাইজেশন রক্ষা করা।
              </p>
            )}
            {(lang === 'en' || lang === 'bilingual') && (
              <p className="text-slate-700 italic leading-relaxed">
                Dear {drNameEn},
                <br />
                Following the successful implementation of the secure EHR Patient Portal and lab diagnostic system at your clinic, we present this technical Maintenance Agreement and SLA Billing Proposal. This agreement guarantees uninterrupted healthcare portal uptime, continuous AI summaries prompt calibration, and absolute regulatory compliance alignment.
              </p>
            )}
          </div>

          {/* SECTION 1: DETAILED SCOPE WITH THE CHECKED OPTIONS */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase text-red-650 tracking-wider flex items-center justify-between border-b border-rose-100 pb-1.5">
              <span>1. SOFTWARE MAINTENANCE SERVICE SCOPE / চুক্তির আওতাভুক্ত সার্ভিসসমূহ</span>
              <span className="text-[9px] font-mono text-slate-400 capitalize">Active Coverage</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {scopes.filter(s => s.checked).map((s, idx) => (
                <div key={s.id} className="flex gap-2 items-start text-[11px] leading-relaxed">
                  <span className="w-5 h-5 bg-red-50 text-red-650 flex items-center justify-center rounded-full font-bold font-mono text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    {(lang === 'en' || lang === 'bilingual') && (
                      <p className="font-bold text-slate-950 font-sans">{s.labelEn}</p>
                    )}
                    {(lang === 'bn' || lang === 'bilingual') && (
                      <p className="text-slate-600 font-medium">{s.labelBn}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: SCHEDULED MAINTENANCE DUTIES */}
          <div className="space-y-2 mt-4">
            <h4 className="text-[11px] font-black uppercase text-red-650 tracking-wider flex items-center justify-between border-b border-rose-100 pb-1.5">
              <span>2. ROUTINE SYSTEM OPTIMIZATION DUTIES / রুটিন প্রকৌশল দায়িত্বসমূহ</span>
              <span className="text-[9px] font-mono text-slate-400">Scheduled Actions</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {duties.filter(d => d.checked).map((d, idx) => (
                <div key={d.id} className="flex gap-2 items-start bg-slate-50/50 p-2 border border-slate-100 rounded-xl text-[11px]">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <div>
                    {(lang === 'en' || lang === 'bilingual') && (
                      <p className="font-bold text-slate-950">{d.labelEn}</p>
                    )}
                    {(lang === 'bn' || lang === 'bilingual') && (
                      <p className="text-slate-500 text-[10px] mt-0.5">{d.labelBn}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: FINANCIAL SCHEDULING (PRECISE PRICING TERMS IN TABLE) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[11px] font-black uppercase text-red-650 tracking-wider border-b border-rose-100 pb-1.5 flex items-center gap-1.5">
              <span>3. FINANCIAL COMMITTALS & RECURRING SLA FEE / আর্থিক বাজেট বিবরণী</span>
            </h4>
            
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-[11.5px]">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 font-mono uppercase text-[9.5px] text-slate-600">
                    <th className="p-3">Cost Item (সার্ভিস আইটেম)</th>
                    <th className="p-3 text-center">Billing Cycle (বিলিং সাইকেল)</th>
                    <th className="p-3 text-right">Unit Price (মূল্যহার)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/55">
                    <td className="p-3">
                      <p className="font-bold text-slate-950">EHR Core Platform Installation & Setup Bill</p>
                      <p className="text-[10px] text-slate-500 font-medium">এককালীন সিস্টেম বাস্তবায়ন এবং ডিজিটাইজেশন সেটআপ বিল</p>
                    </td>
                    <td className="p-3 text-center font-mono">One-Time Base</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      {lang === 'bn' ? formatBDT(basePrice) : formatBDTEn(basePrice)}
                    </td>
                  </tr>

                  {useEnterprisePricing && enterpriseScopes.filter(s => s.checked).map(es => (
                    <tr key={es.id} className="hover:bg-rose-50/30 bg-red-50/10">
                      <td className="p-3 pl-6">
                        <p className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                          <span className="text-red-650 text-xs">★</span> {es.labelEn}
                        </p>
                        <p className="text-[10px] text-slate-550 font-normal italic">{es.labelBn}</p>
                      </td>
                      <td className="p-3 text-center font-mono text-red-700 text-[9px] uppercase font-extrabold">Enterprise Upgrade</td>
                      <td className="p-3 text-right font-bold text-slate-800 font-mono">
                        {lang === 'bn' ? formatBDT(es.cost) : formatBDTEn(es.cost)}
                      </td>
                    </tr>
                  ))}

                  {useEnterprisePricing && enterpriseScopes.some(s => s.checked) && (
                    <tr className="bg-red-50/25 font-black border-t border-red-350">
                      <td className="p-3">
                        <p className="text-red-750 uppercase tracking-wider text-[10px] font-black">Total Initial Implementation Budget</p>
                        <p className="text-[10.5px] text-slate-700 font-extrabold">সর্বমোট প্রাথমিক সিস্টেম স্থাপন বাজেট (রেডি টু ইউজ)</p>
                      </td>
                      <td className="p-3 text-center font-mono text-red-700 font-extrabold uppercase text-[10px]">One-Time Cumulative</td>
                      <td className="p-3 text-right text-red-700 font-black font-mono text-[13px] bg-red-50/10">
                        {lang === 'bn' ? formatBDT(finalBasePrice) : formatBDTEn(finalBasePrice)}
                      </td>
                    </tr>
                  )}

                  {!useEnterprisePricing && (
                    <tr className="bg-slate-50/80 font-black border-t border-slate-200">
                      <td className="p-3">
                        <p className="text-slate-850 uppercase tracking-wider text-[10px] font-black">Total Initial Implementation Budget</p>
                        <p className="text-[10.5px] text-slate-700">সর্বমোট প্রাথমিক সিস্টেম স্থাপন বাজেট</p>
                      </td>
                      <td className="p-3 text-center font-mono text-[10px]">One-Time Total</td>
                      <td className="p-3 text-right text-slate-950 font-black font-mono text-[13px]">
                        {lang === 'bn' ? formatBDT(finalBasePrice) : formatBDTEn(finalBasePrice)}
                      </td>
                    </tr>
                  )}

                  <tr className="hover:bg-slate-50/55">
                    <td className="p-3">
                      <p className="font-bold text-slate-950">Developer Retainer SLA & Technical Security Support</p>
                      <p className="text-[10px] text-slate-500 font-medium">মাসিক রক্ষণাবেক্ষণ ফি, এআই টিউনিং এবং নিরাপত্তা সাপোর্ট</p>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-650">Monthly Recurring</td>
                    <td className="p-3 text-right font-bold text-red-650 font-mono">
                      {lang === 'bn' ? formatBDT(monthlyFee) : formatBDTEn(monthlyFee)} / mo
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/55">
                    <td className="p-3">
                      <p className="font-bold text-slate-950">Cloud Backend Host & Secure API Pipeline Allocation</p>
                      <p className="text-[10px] text-slate-500 font-medium">গুগল ক্লাউড ডেটাবেস এবং জেমিনি এআই এপিআই ব্যবহারের ট্র্যাফিক বরাদ্দ</p>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-650">Monthly Recurring</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      {lang === 'bn' ? formatBDT(cloudFee) : formatBDTEn(cloudFee)} / mo
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70 font-bold">
                    <td className="p-3 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">Free SLA Support Period / ওয়ারেন্টি সময়সীমা</td>
                    <td className="p-3 text-center text-emerald-600 font-extrabold">{warrantyMonths} Months / মাস</td>
                    <td className="p-3 text-right text-emerald-600 font-extrabold font-mono">৳ 0.00 (No Setup SLA Charge)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[10px] text-slate-500 space-y-1.5 font-sans leading-relaxed">
              <p>
                <strong>Terms of Cloud Deployment:</strong> Cloud and API Pipeline allocations are dynamically adjusted based on lab throughput throughput. Rates assume normal query logs of up to 5,000 multi-modal uploads per month. Beyond that, scale charges apply.
              </p>
              <p>
                <strong>পেমেন্ট রুলস:</strong> ক্লাউড ও এআই এপিআই বিল প্রতি মাসের ১০ তারিখের মধ্যে পরিশোধযোগ্য। এককালীন ওয়ান-টাইম ডেভেলপমেন্ট খরচ ল্যাব লাইভ করার পূর্বে ৫০% এবং লাইভ হওয়ার পর অবশিষ্ট ৫০% পরিশোধযোগ্য।
              </p>
            </div>
          </div>

          {/* SECTION 4: REGULATORY COMPLIANCE BANNER */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-950">
            <p className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              CRITICAL PRIVACY & SECURITY ADHERENCE WARRANTY
            </p>
            <p className="text-[11px] text-slate-300 font-sans leading-normal">
              This digital medical records software complies rigorously with security protocols. Patient summaries are compiled on-device or securely proxy-sent to authorized endpoints before validation and storage. Database nodes feature standard encryption (TLS v1.3 / AES-256 equivalent) with cryptographically autogenerated diagnostic hashes, matching modern <strong className="text-white">BM&DC Clinical Audits</strong> and <strong className="text-white">UKSAI rules</strong>.
            </p>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="pt-12 grid grid-cols-2 gap-8">
            <div className="text-center space-y-12">
              <div className="border-b border-slate-300 mx-auto max-w-[200px] h-10 flex items-end justify-center">
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">{devName}</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-950">Authorized Soft-Architect Signature</p>
                <p className="text-[10px] text-slate-400 font-mono">Developer Executive (SLA Provider)</p>
              </div>
            </div>
            <div className="text-center space-y-12">
              <div className="border-b border-slate-300 mx-auto max-w-[200px] h-10 flex items-end justify-center">
                <span className="font-sans font-extrabold text-[10px] text-red-650 tracking-wider">ডাক্তার শাহানাজ জাহান</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-950">Dr. Shahnaz Jahan</p>
                <p className="text-[10px] text-slate-400 font-sans font-medium">Proprietor, Shahnaz Lab (Client)</p>
              </div>
            </div>
          </div>

        </div>

        {/* PRINT ELEMENT ONLY FOOTER */}
        <div className="hidden print:block text-center text-[9px] text-slate-400 font-mono mt-16 pt-4 border-t border-slate-200">
          Proposal generated via EHR Elite Lab Systems • Digitized on 2026-06-14 • Certified secure encryption.
        </div>

      </div>

    </div>
  );
}
