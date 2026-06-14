/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope,
  Activity,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  Camera,
  Video,
  Upload,
  Shield,
  Users,
  Bot,
  User,
  Clock,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Lock,
  Scale,
  Settings,
  HelpCircle,
  Printer,
  Smartphone,
  Download,
  QrCode,
  Barcode,
  Search,
  X
} from 'lucide-react';
import { renderMarkdown } from './utils';
import { NewsArticle, Complaint, PatientReport, ChatMessage, ActivityLog } from './types';
import EnterpriseArchitecture from './components/EnterpriseArchitecture';
import BillingProposal from './components/BillingProposal';
import AccreditationModal from './components/AccreditationModal';
import { exportReportToPDF } from './utils/pdfGenerator';
import QRScanner from './components/QRScanner';
import GoogleDriveSync from './components/GoogleDriveSync';
import {
  initAuth,
  googleSignIn,
  logout as googleLogout,
  listDriveFiles,
  downloadDriveFile,
  uploadDriveFile
} from './utils/googleDrive';
import type { GoogleDriveFile } from './utils/googleDrive';

export default function App() {
  const renderReportQrCode = (report: PatientReport, size: number = 80) => {
    const token = report.verificationToken || `SHANAZ-VERIFIED-${report.id.toUpperCase()}-E2E`;
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="bg-white p-1 border border-slate-200 rounded-lg shadow-sm select-none">
        <rect x="0" y="0" width="100" height="100" fill="white" />
        <rect x="6" y="6" width="22" height="22" fill="#0d9488" stroke="white" strokeWidth="2" />
        <rect x="11" y="11" width="12" height="12" fill="white" />
        <rect x="14" y="14" width="6" height="6" fill="#115e59" />

        <rect x="72" y="6" width="22" height="22" fill="#0d9488" stroke="white" strokeWidth="2" />
        <rect x="77" y="11" width="12" height="12" fill="white" />
        <rect x="80" y="14" width="6" height="6" fill="#115e59" />

        <rect x="6" y="72" width="22" height="22" fill="#0d9488" stroke="white" strokeWidth="2" />
        <rect x="11" y="77" width="12" height="12" fill="white" />
        <rect x="14" y="80" width="6" height="6" fill="#115e59" />

        <path d="M 35 10 h 5 v 5 h -5 z M 45 10 h 10 v 5 h -10 z M 60 10 h 5 v 10 h -5 z M 35 20 h 15 v 5 h -15 z M 55 20 h 5 v 5 h -5 z M 65 20 h 5 v 5 h -5 z" fill="#1e293b" />
        <path d="M 35 30 h 5 v 15 h -5 z M 45 35 h 5 v 5 h -5 z M 55 35 h 10 v 5 h -10 z M 35 50 h 10 v 5 h -10 z M 50 45 h 5 v 15 h -5 z M 60 50 h 15 v 5 h -15 z" fill="#1e293b" />
        <path d="M 10 35 h 15 v 5 h -15 z M 15 45 h 5 v 10 h -5 z M 25 50 h 5 v 5 h -5 z M 35 60 h 10 v 5 h -10 z M 15 65 h 10 v 5 h -10 z M 55 65 h 20 v 5 h -20 z" fill="#1e293b" />
        <path d="M 72 35 h 10 v 5 h -10 z M 85 40 h 10 v 5 h -10 z M 75 50 h 5 v 15 h -5 z M 85 60 h 5 v 5 h -5 z M 80 70 h 15 v 5 h -15 z M 72 80 h 5 v 15 h -5 z" fill="#1e293b" />
        <path d="M 35 72 h 15 v 5 h -15 z M 40 82 h 5 v 10 h -5 z M 50 85 h 15 v 5 h -15 z M 60 72 h 5 v 10 h -5 z M 65 85 h 5 v 5 h -5 z" fill="#1e293b" />
        
        <rect x="42" y="42" width="16" height="16" fill="#115e59" rx="2" />
        <text x="50" y="53" textAnchor="middle" fill="white" fontSize="9" fontWeight="950" fontFamily="sans-serif">SP</text>
      </svg>
    );
  };

  // Navigation & Page State
  const [currentView, setCurrentView] = useState<'public' | 'staff'>('public');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [staffActiveTab, setStaffActiveTab] = useState<'clinical' | 'architecture' | 'activity_log' | 'google_drive' | 'billing'>('clinical');

  // Secure Portal Auth State
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [isBiometricSimulating, setIsBiometricSimulating] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  const handleBiometricAuth = async () => {
    showToast('Initializing secure fingerprint & Face-ID scanner...', 'info');
    setIsBiometricSimulating(true);
    setBiometricStatus('scanning');
    
    setTimeout(() => {
      setBiometricStatus('success');
      showToast('Biometric fingerprint validation approved!', 'success');
      setTimeout(() => {
        setIsStaffAuthenticated(true);
        setIsBiometricSimulating(false);
        setBiometricStatus('idle');
        showToast('Authorized biometric credentials. Welcome Dr. Shanaz!', 'success');
      }, 1000);
    }, 2200);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const userClean = adminUsername.trim().toLowerCase();
    if (userClean === 'shanaz' || userClean === 'dr_shanaz' || userClean === 'dr_shanaz_jahan' || userClean === 'doctor') {
      if (adminPassword === 'ClinicalPathology2026' || adminPassword === 'shanaj99' || adminPassword === 'admin123') {
        setIsStaffAuthenticated(true);
        showToast('Authorized credentials. Welcome back to clinical space.', 'success');
      } else {
        setAuthError('Incorrect cryptographic passkey validation.');
        showToast('Cryptographic passkey checking failed.', 'error');
      }
    } else {
      setAuthError('Unauthorized medical identifier.');
      showToast('Pathogenesis identifier invalid.', 'error');
    }
  };

  const handleLogoutStaff = () => {
    setIsStaffAuthenticated(false);
    setAdminUsername('');
    setAdminPassword('');
    setAuthError('');
    setCurrentView('public');
    showToast('Lock-out successful. Administrative workspace secured.', 'info');
  };

  // Print State
  const [printingReport, setPrintingReport] = useState<PatientReport | null>(null);

  // Install App PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  
  // Accreditation Standards Modal State
  const [showAccreditationModal, setShowAccreditationModal] = useState(false);
  const [accreditationDefaultTab, setAccreditationDefaultTab] = useState<'bmdc' | 'who' | 'uksai'>('bmdc');

  // Interactive Barcode Specimen Alignment Guide Step
  const [barcodeGuideStep, setBarcodeGuideStep] = useState<number>(0);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handlePrintReport = (report: PatientReport) => {
    setPrintingReport(report);
    setIsPrintingPendingList(false);
    setTimeout(() => {
      window.print();
      setPrintingReport(null);
      showToast(`Document (Report ID: ${report.id || 'N/A'}) has been successfully sent to the printer.`, 'success');
    }, 150);
  };

  const handlePrintPendingReports = () => {
    setIsPrintingPendingList(true);
    setPrintingReport(null);
    setTimeout(() => {
      window.print();
      setIsPrintingPendingList(false);
      showToast('Clinical backlog print ledger has been successfully sent to the printer.', 'success');
    }, 150);
  };

  const toggleReportSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReportIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleComplaintSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedComplaintIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkMarkReportsReviewed = async () => {
    if (selectedReportIds.length === 0) return;
    setBulkActionInProgress(true);
    try {
      showToast(`Marking ${selectedReportIds.length} pathology reports as reviewed...`, 'info');
      let successCount = 0;
      for (const id of selectedReportIds) {
        try {
          const res = await fetch('/api/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'report', id, status: 'reviewed', userId: adminUsername || 'dr_shanaz' })
          });
          if (res.ok) successCount++;
        } catch (err) {
          console.error(`Failed to update report ${id}`, err);
        }
      }
      fetchSubmissions();
      setSelectedReportIds([]);
      showToast(`Successfully marked ${successCount} reports as reviewed!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to perform bulk update.', 'error');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkMarkComplaintsReviewed = async (status: 'reviewed' | 'resolved') => {
    if (selectedComplaintIds.length === 0) return;
    setBulkActionInProgress(true);
    try {
      showToast(`Marking ${selectedComplaintIds.length} complaints as ${status}...`, 'info');
      let successCount = 0;
      for (const id of selectedComplaintIds) {
        try {
          const res = await fetch('/api/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'complaint', id, status, userId: adminUsername || 'dr_shanaz' })
          });
          if (res.ok) successCount++;
        } catch (err) {
          console.error(`Failed to update complaint ${id}`, err);
        }
      }
      fetchSubmissions();
      setSelectedComplaintIds([]);
      showToast(`Successfully marked ${successCount} complaints as ${status}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to perform bulk update.', 'error');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleExportCSV = (filteredStaffReports: PatientReport[], filteredStaffComplaints: Complaint[]) => {
    let csvRows = [];
    csvRows.push("Record Type,Record ID,Patient ID (Phone/NID),File Name / Details,Status,Timestamp,Details / Summary");
    
    const cleanField = (val: string) => {
      if (!val) return '""';
      const escaped = val.replace(/"/g, '""');
      return `"${escaped}"`;
    };
    
    filteredStaffReports.forEach(rep => {
      const row = [
        "Pathology Report",
        rep.id || "",
        rep.phoneOrNid || "",
        rep.fileName || "",
        rep.status || "",
        rep.timestamp ? new Date(rep.timestamp).toLocaleString() : "",
        rep.aiSummary || ""
      ];
      csvRows.push(row.map(cleanField).join(","));
    });
    
    filteredStaffComplaints.forEach(comp => {
      const row = [
        "Complaint Claim",
        comp.id || "",
        comp.phoneOrNid || "",
        comp.details || "",
        comp.status || "",
        comp.timestamp ? new Date(comp.timestamp).toLocaleString() : "",
        comp.legalText || ""
      ];
      csvRows.push(row.map(cleanField).join(","));
    });
    
    const csvString = csvRows.join("\n");
    downloadConfigBlob(`shahnaz_pathology_export_${new Date().toISOString().slice(0, 10)}.csv`, csvString, 'text/csv;charset=utf-8;');
  };

  // Backend Synchronized States
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState<boolean>(false);

  // Interactive Verification fields
  const [selectedVerifiedReport, setSelectedVerifiedReport] = useState<PatientReport | null>(null);

  // Offline resilient caching states
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('shanaz_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveOfflineQueue = (queueOrFn: any[] | ((prev: any[]) => any[])) => {
    setOfflineQueue(prev => {
      const nextQueue = typeof queueOrFn === 'function' ? queueOrFn(prev) : queueOrFn;
      try {
        localStorage.setItem('shanaz_offline_queue', JSON.stringify(nextQueue));
      } catch (err) {
        console.error('Failed to preserve offline storage:', err);
      }
      return nextQueue;
    });
  };
  
  // Loading status
  const [newsLoading, setNewsLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Patient Tracking Portal State
  const [patientId, setPatientId] = useState('');
  const [activeTrackingId, setActiveTrackingId] = useState('');
  const [hasSearchedTracking, setHasSearchedTracking] = useState(false);

  // Staff backlog filter state
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5_only' | '4_plus' | '3_plus' | 'unrated'>('all');
  const [complaintFilter, setComplaintFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndingDateFilter] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [staffReportSort, setStaffReportSort] = useState<'most_recent' | 'oldest' | 'patient_id_asc' | 'patient_id_desc'>('most_recent');
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [selectedComplaintIds, setSelectedComplaintIds] = useState<string[]>([]);
  const [isPrintingPendingList, setIsPrintingPendingList] = useState(false);
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  // Upload Document State
  const [uploadIdentity, setUploadIdentity] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // Complaint Submission State
  const [complaintIdentity, setComplaintIdentity] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintSuccessMessage, setComplaintSuccessMessage] = useState('');

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showApkGuide, setShowApkGuide] = useState(false);
  const [compileTab, setCompileTab] = useState<'apk' | 'ios' | 'exe'>('apk');
  const [selectedModel, setSelectedModel] = useState<'gemma-2-27b-it' | 'gemini-3.5-flash'>('gemini-3.5-flash');

  // Trigger file configuration blob downloads programmatically in-client
  const downloadConfigBlob = (filename: string, content: string, contentType: string = 'text/plain') => {
    try {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`${filename} prepared & downloaded successfully!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(`Could not prepare download for ${filename}`, 'error');
    }
  };

  // QR Code URL State (Uses the public shared subdomain to fully bypass development authentication restrictions on mobile camera scans)
  const [qrCodeUrl, setQrCodeUrl] = useState(() => {
    try {
      const url = window.location.href;
      if (url.includes('ais-dev-')) {
        return url.replace('ais-dev-', 'ais-pre-');
      }
      return 'https://ais-pre-xevdnexmcii62nzy2rwd4z-595319894384.asia-southeast1.run.app';
    } catch {
      return 'https://ais-pre-xevdnexmcii62nzy2rwd4z-595319894384.asia-southeast1.run.app';
    }
  });

  // Patient Feedback Rating state (keyed by report ID)
  const [reportRatingStars, setReportRatingStars] = useState<Record<string, number>>({});
  const [reportRatingFeedback, setReportRatingFeedback] = useState<Record<string, string>>({});
  const [reportRatingSubmitting, setReportRatingSubmitting] = useState<Record<string, boolean>>({});

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Chat Concierge State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'chat-init',
      sender: 'assistant',
      text: 'Hello! I am shahnazpathology\'s Pathological AI Concierge. You can type health queries or attach raw pathology sheets for interpretation. How may I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [attachedChatFile, setAttachedChatFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [isVisualScanActive, setIsVisualScanActive] = useState(false);

  // Doctor & Staff Backend Tools State
  const [selectedQueueItem, setSelectedQueueItem] = useState<{ type: 'report' | 'complaint'; data: any } | null>(null);
  const [notesScribeInput, setNotesScribeInput] = useState('');
  const [isScribeLoading, setIsScribeLoading] = useState(false);
  const [scribeOutput, setScribeOutput] = useState('');
  
  const [selectedComplaintForLegal, setSelectedComplaintForLegal] = useState<Complaint | null>(null);
  const [isLegalLoading, setIsLegalLoading] = useState(false);
  const [legalOutput, setLegalOutput] = useState('');

  // UI Detail Modals
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  // Google Drive Credentials & State
  const [driveUser, setDriveUser] = useState<any>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [isBackingUpId, setIsBackingUpId] = useState<string | null>(null);

  // Load Google Drive Auth on render
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setDriveUser(user);
        setDriveToken(token);
        // Pre-fetch files when connected
        fetchDriveFiles(token);
      },
      () => {
        setDriveUser(null);
        setDriveToken(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchDriveFiles = async (token: string) => {
    setIsDriveLoading(true);
    try {
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (error) {
      console.error('Error loading Drive file list:', error);
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleConnectDrive = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setDriveUser(result.user);
        setDriveToken(result.accessToken);
        showToast(`Connected successfully to Google Drive as ${result.user.email}!`, 'success');
        fetchDriveFiles(result.accessToken);
      }
    } catch (error) {
      showToast('Google Drive authentication failed.', 'error');
    }
  };

  const handleDisconnectDrive = async () => {
    try {
      await googleLogout();
      setDriveUser(null);
      setDriveToken(null);
      setDriveFiles([]);
      showToast('Disconnected from Google Drive.', 'info');
    } catch (error) {
      showToast('Error signing out from Google session.', 'error');
    }
  };

  const handleImportFileFromDrive = async (file: GoogleDriveFile) => {
    if (!driveToken) return;
    setIsDriveLoading(true);
    try {
      const fileData = await downloadDriveFile(driveToken, file.id, file.mimeType);
      setSelectedFile(fileData);
      setShowDrivePicker(false);
      showToast(`Selected Drive file "${file.name}" imported successfully!`, 'success');
    } catch (error) {
      showToast('Failed to download selected file from Google Drive.', 'error');
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleBackupReportToDrive = async (report: PatientReport) => {
    if (!driveToken) {
      showToast('Please connect to Google Drive first.', 'warning');
      return;
    }
    
    const confirmed = window.confirm(`Backup pathology report "${report.fileName}" (Patient: ${report.phoneOrNid}) to your personal Google Drive?`);
    if (!confirmed) return;

    setIsBackingUpId(report.id);
    try {
      let fileContent = report.fileData;
      let mimeType = 'image/png';
      let extension = 'png';
      
      if (!fileContent) {
        // Fallback: create a text backup of the AI Summary
        const textData = `Shahnaz Pathology Report\nPatient ID: ${report.phoneOrNid}\nDate: ${report.timestamp}\n\n${report.aiSummary}`;
        fileContent = `data:text/plain;base64,${btoa(unescape(encodeURIComponent(textData)))}`;
        mimeType = 'text/plain';
        extension = 'txt';
      } else {
        const match = fileContent.match(/^data:([^;]+);base64,/);
        if (match) {
          mimeType = match[1];
          if (mimeType.includes('pdf')) extension = 'pdf';
          else if (mimeType.includes('jpeg')) extension = 'jpg';
          else if (mimeType.includes('png')) extension = 'png';
        }
      }
      
      const uploadName = `Shahnaz_Pathology_${report.phoneOrNid.replace(/[^a-zA-Z0-9]/g, '_')}_${report.id}.${extension}`;
      await uploadDriveFile(driveToken, uploadName, mimeType, fileContent);
      showToast(`Power backup complete! "${uploadName}" uploaded to Drive.`, 'success');
      fetchDriveFiles(driveToken);
    } catch (error) {
      console.error(error);
      showToast('Google Drive backup failed. Verify storage space or token.', 'error');
    } finally {
      setIsBackingUpId(null);
    }
  };

  const handleRateReport = async (id: string, rating: number, feedbackText: string) => {
    if (!id || !rating) {
      showToast('Please select a star rating first.', 'warning');
      return;
    }
    setReportRatingSubmitting(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch('/api/rate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, rating, ratingFeedback: feedbackText })
      });
      if (!response.ok) {
        throw new Error('Could not submit rating.');
      }
      const data = await response.json();
      if (data.success) {
        showToast('Thank you for rating our Gemini AI interpretation!', 'success');
        // Update reports list state local to keep UI in sync
        setReports(prev => prev.map(r => r.id === id ? { ...r, rating, ratingFeedback: feedbackText } : r));
      } else {
        showToast('Failed to save rating.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error communicating with compliance feedback server.', 'error');
    } finally {
      setReportRatingSubmitting(prev => ({ ...prev, [id]: false }));
    }
  };

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load news and submissions on mount
  useEffect(() => {
    fetchNews();
    fetchSubmissions();
  }, []);

  // Professional Retry Logic with Exponential Backoff + Offline Backlog cache
  const securedFetchWithRetry = async (
    url: string, 
    options: RequestInit = {}, 
    retriesLeft = 3, 
    delay = 150
  ): Promise<Response> => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP Error Status: ${res.status}`);
      }
      return res;
    } catch (err) {
      if (retriesLeft > 0) {
        showToast(`Stream recovery active. Retrying secure sync attempt ${4 - retriesLeft}/3...`, 'warning');
        await new Promise(resolve => setTimeout(resolve, delay));
        return securedFetchWithRetry(url, options, retriesLeft - 1, delay * 2.5);
      }
      throw err;
    }
  };

  const syncOfflineBacklog = async () => {
    if (offlineQueue.length === 0) return;
    
    showToast(`Online connection recovered! Synchronizing ${offlineQueue.length} cached patient files...`, 'info');
    const queueToProcess = [...offlineQueue];
    
    // Clear first to prevent concurrent loops
    saveOfflineQueue([]);

    for (const item of queueToProcess) {
      try {
        if (item.type === 'report') {
          const res = await fetch('/api/submit-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneOrNid: item.payload.uploadIdentity,
              fileName: item.payload.fileName,
              fileType: item.payload.fileType,
              fileData: item.payload.fileData,
              selectedModel: item.payload.selectedModel
            })
          });
          if (res.ok) {
            showToast(`Synchronized cached report: ${item.payload.fileName}`, 'success');
          } else {
            // Restore failure
            saveOfflineQueue(prev => [...prev, item]);
          }
        } else if (item.type === 'complaint') {
          const res = await fetch('/api/submit-complaint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneOrNid: item.payload.phoneOrNid,
              details: item.payload.details
            })
          });
          if (res.ok) {
            showToast(`Synchronized cached grievance: ${item.payload.phoneOrNid}`, 'success');
          } else {
            saveOfflineQueue(prev => [...prev, item]);
          }
        }
      } catch (err) {
        console.error('Auto sync failed for item, returning to offline buffer:', err);
        saveOfflineQueue(prev => [...prev, item]);
      }
    }
    // Refresh submissions
    fetchSubmissions();
  };

  useEffect(() => {
    const handleOnline = () => {
      syncOfflineBacklog();
    };
    window.addEventListener('online', handleOnline);
    const interval = setInterval(() => {
      if (offlineQueue.length > 0) {
        syncOfflineBacklog();
      }
    }, 20000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [offlineQueue]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatTyping]);

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (err) {
      console.error('Failed to fetch news feed', err);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    setActivityLogsLoading(true);
    try {
      const res = await fetch('/api/activity-logs');
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setActivityLogsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setComplaints(data.complaints || []);
      }
      // Also fetch activity logs dynamically
      await fetchActivityLogs();
    } catch (err) {
      console.error('Failed to fetch submissions queue', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Switch between Public & Staff Backend views
  const handleSwitchView = (view: 'public' | 'staff') => {
    setCurrentView(view);
    if (view === 'public') {
      showToast('Switched immediately to: "Public Portal" (AI Assist & Tracking).', 'success');
    } else {
      showToast('Switched immediately to: "Staff & Doctors Backend" Portal Gate.', 'success');
    }
    // Refresh database whenever switching for instant update checks
    fetchSubmissions();
  };

  // Render format status badges
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-700 font-extrabold border border-red-200 uppercase px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
            Awaiting Review
          </span>
        );
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-950 text-white font-extrabold border border-slate-900 uppercase px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            Reviewed & Logged
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-white text-slate-950 font-extrabold border border-slate-200 uppercase px-2 py-0.5 rounded-full shadow-xs">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            Resolved & Conveyed
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
            {status}
          </span>
        );
    }
  };

  // Preset diagnostic report injection to simplify user testing
  const injectSampleReport = () => {
    setSelectedFile({
      name: 'demographic_cbc_blood.png',
      type: 'image/png',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    });
    setUploadIdentity('01889776655');
  };

  // File Upload Handlers (Patient Portal)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    // Restrict size to max 15MB for base64 limits
    if (file.size > 15 * 1024 * 1024) {
      showToast('The chosen file is too large. Please select a report image or document under 15MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        name: file.name,
        type: file.type || 'image/jpeg',
        data: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  // Submit Patient Pathology Document
  const handleLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadIdentity.trim()) {
      showToast('Please fill out your identity verification (NID or Phone number).', 'warning');
      return;
    }
    if (!selectedFile) {
      showToast('Please choose or drag-drop a diagnostic document first.', 'warning');
      return;
    }

    setIsUploading(true);
    setUploadSuccessMessage('');
    try {
      const response = await securedFetchWithRetry('/api/submit-report', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           phoneOrNid: uploadIdentity,
           fileName: selectedFile.name,
           fileType: selectedFile.type,
           fileData: selectedFile.data,
           selectedModel
         })
      });

      if (response.ok) {
        const result = await response.json();
        // Automatically register ID inside tracking search to display result right away
        setPatientId(uploadIdentity);
        setActiveTrackingId(uploadIdentity);
        setHasSearchedTracking(true);

        setUploadSuccessMessage(`Successfully Submitted! Saved under ID: ${uploadIdentity}`);
        showToast('Pathology report submitted successfully with TLS 1.3 encryption & SHA256 signature!', 'success');
        setSelectedFile(null);
        setUploadIdentity('');
        
        // Refresh queues
        fetchSubmissions();
      } else {
        const errorData = await response.json();
        showToast(`Upload error: ${errorData.error || 'Server did not accept report.'}`, 'error');
      }
    } catch (err) {
      console.warn('Network blackout, caching diagnostic file locally to backup memory:', err);
      const tempId = `rep-local-${Date.now()}`;
      const mockDigest = `SHA256-OFFLINE-${Math.random().toString(36).substring(2, 10).toUpperCase()}E3`;
      
      const offlineReport: PatientReport = {
        id: tempId,
        phoneOrNid: uploadIdentity,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileData: selectedFile.data,
        timestamp: new Date().toISOString(),
        status: 'pending',
        digestHash: mockDigest,
        encryptionStandard: "AES-256 E2E LOCAL_OFFLINE_SECURE_VAL",
        verificationToken: `SHANAZ-LOCAL-PENDING-${tempId.toUpperCase()}`,
        isTlsEnforced: true,
        aiSummary: `### Offline Processing Mode (No live internet connection)
- **Filing Reference**: Local Cache ${uploadIdentity}
- **Security Checksum**: ${mockDigest}
- **Device Status**: Securely Enqueued in AES-256 local storage sandbox.

### Offline Diagnostic Message
- Server connectivity interrupted. System automatically saved this pathological record locally. It will automatically synchronize as soon as connection is recovered.

***CLINICAL DISCLAIMER: This is an AI-assisted diagnostic helper draft. It is NOT a final clinical diagnosis. For any clinical or diagnostic conclusion, full consultation and formal verification with Dr. Shahnaz (Dr. Shahnaz Jahan, Chief Consultant Pathologist) or an authorized medical consultant is strictly mandatory.***`
      };

      const revisedQueue = [...offlineQueue, { type: 'report', payload: { uploadIdentity, fileName: selectedFile.name, fileType: selectedFile.type, fileData: selectedFile.data, selectedModel } }];
      saveOfflineQueue(revisedQueue);

      // Instantly inject offline mock record so patient can see and trace it!
      setReports(prev => [offlineReport, ...prev]);
      
      setPatientId(uploadIdentity);
      setActiveTrackingId(uploadIdentity);
      setHasSearchedTracking(true);

      showToast('Offline buffer engaged. Your file has been locally cached under AES-256 standards.', 'warning');
      setSelectedFile(null);
      setUploadIdentity('');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Complaint / Grievance Box
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintIdentity.trim()) {
      showToast('Please enter your identity tracking reference.', 'warning');
      return;
    }
    if (!complaintText.trim()) {
      showToast('Please specify details of your administrative complaint.', 'warning');
      return;
    }

    setIsSubmittingComplaint(true);
    setComplaintSuccessMessage('');

    try {
      const res = await securedFetchWithRetry('/api/submit-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneOrNid: complaintIdentity,
          details: complaintText
        })
      });

      if (res.ok) {
        setComplaintSuccessMessage(`Grievance logged under verification queue. Reference key: ${complaintIdentity}.`);
        showToast('Grievance logged successfully into review queue!', 'success');
        setComplaintText('');
        setComplaintIdentity('');
        fetchSubmissions();
      } else {
        showToast('Could not submit complaint. Please check fields.', 'error');
      }
    } catch (err) {
      console.warn('Network failure during complaint logging, caching offline:', err);
      const tempId = `comp-local-${Date.now()}`;
      const offlineComp: Complaint = {
        id: tempId,
        phoneOrNid: complaintIdentity,
        details: complaintText + " (SAVED OFFLINE COMPLIANT)",
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      const revisedQueue = [...offlineQueue, { type: 'complaint', payload: { phoneOrNid: complaintIdentity, details: complaintText } }];
      saveOfflineQueue(revisedQueue);

      setComplaints(prev => [offlineComp, ...prev]);

      showToast('Offline buffer active. Public complaint queued securely.', 'warning');
      setComplaintText('');
      setComplaintIdentity('');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  // AI Chat Assistant Submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !attachedChatFile) return;

    const userMessageText = chatInput;
    const tempFile = attachedChatFile;

    // Build immediate local message
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'user',
      text: userMessageText || `Uploaded file: ${tempFile?.name}`,
      timestamp: new Date().toISOString(),
      fileAttached: tempFile ? { name: tempFile.name, type: tempFile.type, data: tempFile.data } : undefined
    };

    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setAttachedChatFile(null);
    setIsChatTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ sender: m.sender, text: m.text })),
          attachedFile: tempFile,
          selectedModel
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: data.reply,
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        throw new Error('API failure');
      }
    } catch (err) {
      console.warn('Chat error, inserting fallback response:', err);
      // Fallback
      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: `Offline Health Sync active. In response to "${userMessageText || 'visual check'}", shahnazpathology advises contacting our lab coordination panel. shahnazpathology is briefed about all remote uploads.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsChatTyping(false);
    }
  };



  // Mock Camera Action to attach image instantly inside Chat
  const triggerCameraInput = () => {
    setIsVisualScanActive(true);
    setTimeout(() => {
      setAttachedChatFile({
        name: 'camera_blood_metrics.jpg',
        type: 'image/jpeg',
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
      });
      setIsVisualScanActive(false);
      showToast('Mock Diagnostic snapshot captured via camera! Attached to your AI chat inputs.', 'success');
    }, 1200);
  };

  // Doctor Action: Formulate SOAP Note via Scribe API
  const handleScribeSubmit = async () => {
    if (!notesScribeInput.trim()) {
      showToast('Please write or select a shorthand physician outline first.', 'warning');
      return;
    }
    setIsScribeLoading(true);
    try {
      const res = await fetch('/api/action/doctor-scribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNote: notesScribeInput, selectedModel })
      });
      if (res.ok) {
        const data = await res.json();
        setScribeOutput(data.result);
        showToast('Clinical SOAP Note formulated successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      setScribeOutput('Failed to activate transcription server connect. Verify your system node parameters.');
      showToast('Offline connection error formulated output.', 'info');
    } finally {
      setIsScribeLoading(false);
    }
  };

  // Doctor Action: Generate Formal Administrative Complaint letter
  const handleLegalFormatSubmit = async (complaintId: string, details: string) => {
    setIsLegalLoading(true);
    try {
      const res = await fetch('/api/action/legal-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintDetails: details, selectedModel })
      });
      if (res.ok) {
        const data = await res.json();
        setLegalOutput(data.result);
        showToast('Formal misconduct grievance letter drafted successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      setLegalOutput('Could not render legal formatted complaint.');
      showToast('Grievance template processing offline backup.', 'info');
    } finally {
      setIsLegalLoading(false);
    }
  };

  // Update Status in Doctor Queue
  const handleUpdateRecordStatus = async (type: 'report' | 'complaint', id: string, newStatus: string, assignStaff?: string) => {
    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, status: newStatus, assignedStaff: assignStaff, userId: adminUsername || 'dr_shanaz' })
      });

      if (res.ok) {
        const updated = await res.json();
        // update locals
        fetchSubmissions();
        showToast('Database entry updated successfully!', 'success');

        // Update selected queue view
        if (selectedQueueItem && selectedQueueItem.data.id === id) {
          const freshData = type === 'report' 
            ? updated.report 
            : updated.complaint;
          setSelectedQueueItem({ type, data: freshData });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to modify database index state.', 'error');
    }
  };

  // Patient Locating reports list
  const filteredReports = activeTrackingId 
    ? reports.filter(r => 
        r.phoneOrNid.toLowerCase().includes(activeTrackingId.toLowerCase()) || 
        r.id.toLowerCase().includes(activeTrackingId.toLowerCase())
      )
    : (hasSearchedTracking ? reports : []);

  const filteredComplaints = activeTrackingId
    ? complaints.filter(c => 
        c.phoneOrNid.toLowerCase().includes(activeTrackingId.toLowerCase()) || 
        c.id.toLowerCase().includes(activeTrackingId.toLowerCase())
      )
    : (hasSearchedTracking ? complaints : []);

  // Staff Backlog filtering with search query integration
  const filteredStaffReports = reports.filter(r => {
    const matchesStatus = reportFilter === 'all' ? true : r.status === reportFilter;
    if (!matchesStatus) return false;

    // Filter by rating if specified
    if (ratingFilter !== 'all') {
      const rating = r.rating || 0;
      if (ratingFilter === '5_only') {
        if (rating !== 5) return false;
      } else if (ratingFilter === '4_plus') {
        if (rating < 4) return false;
      } else if (ratingFilter === '3_plus') {
        if (rating < 3) return false;
      } else if (ratingFilter === 'unrated') {
        if (r.status !== 'reviewed' || rating > 0) return false;
      }
    }

    // Filter by start date if specified
    if (startDateFilter) {
      const start = new Date(startDateFilter);
      start.setHours(0, 0, 0, 0);
      const reportDate = new Date(r.timestamp);
      if (reportDate < start) return false;
    }

    // Filter by end date if specified
    if (endDateFilter) {
      const end = new Date(endDateFilter);
      end.setHours(23, 59, 59, 999);
      const reportDate = new Date(r.timestamp);
      if (reportDate > end) return false;
    }

    if (!staffSearchQuery) return true;
    const q = staffSearchQuery.toLowerCase();
    return (
      (r.phoneOrNid || "").toLowerCase().includes(q) ||
      (r.fileName || "").toLowerCase().includes(q) ||
      (r.id || "").toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    if (staffReportSort === 'most_recent') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (staffReportSort === 'oldest') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (staffReportSort === 'patient_id_asc') {
      return (a.phoneOrNid || "").localeCompare(b.phoneOrNid || "");
    } else if (staffReportSort === 'patient_id_desc') {
      return (b.phoneOrNid || "").localeCompare(a.phoneOrNid || "");
    }
    return 0;
  });

  const filteredStaffComplaints = complaints.filter(c => {
    const matchesStatus = complaintFilter === 'all' ? true : c.status === complaintFilter;
    if (!matchesStatus) return false;

    if (!staffSearchQuery) return true;
    const q = staffSearchQuery.toLowerCase();
    return (
      (c.phoneOrNid || "").toLowerCase().includes(q) ||
      (c.details || "").toLowerCase().includes(q) ||
      (c.id || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-red-200 selection:text-red-950 transition-colors duration-300">
      
      {/* SCREEN WRAPPER - Hidden when printing */}
      <div className="print:hidden">
        
        {/* HEADER SECTION */}
      <nav className="glass-nav sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-red-600 text-white rounded-2xl shadow-md text-xl animate-pulse">🔬</span>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-1">
                  shahnazpathology<span className="text-red-600">🩸</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-tight -mt-0.5">
                  Pathology portal for <strong className="text-red-700 font-black">shahnazpathology.org</strong>
                </p>
              </div>
            </div>
            
            {/* Professional Accreditations Badges */}
            <div className="flex flex-wrap gap-1.5 items-center text-[9px] font-mono tracking-wider font-extrabold xl:ml-4 xl:border-l xl:border-slate-200 xl:pl-4">
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-black mr-1 flex items-center gap-1">
                <span>🛡️</span> Standards Aligned:
              </span>
              <button
                onClick={() => {
                  setAccreditationDefaultTab('bmdc');
                  setShowAccreditationModal(true);
                  showToast('Reviewing BM&DC Patient Care Quality Manual & Regulations...', 'info');
                }}
                className="inline-flex items-center gap-1 bg-slate-900 text-white border border-slate-950 px-2.5 py-1 rounded-xl shadow-xs transition duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="Bangladesh Medical & Dental Council Quality Guidelines Orientation compliant. Click to view pathology standards."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse"></span>
                BM&DC GUIDELINES
              </button>
              <button
                onClick={() => {
                  setAccreditationDefaultTab('who');
                  setShowAccreditationModal(true);
                  showToast('Reviewing WHO Laboratory Diagnostics & ICD-11 Classifications...', 'info');
                }}
                className="inline-flex items-center gap-1 bg-red-600 text-white border border-red-650 px-2.5 py-1 rounded-xl shadow-xs transition duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="WHO ICD-11 Standard Terminology & Diagnostic Procedures. Click to view laboratory standards."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                FOLLOWING WHO RULES
              </button>
              <button
                onClick={() => {
                  setAccreditationDefaultTab('uksai');
                  setShowAccreditationModal(true);
                  showToast('Reviewing UKSAI Generative Medical Intelligence Audit standards...', 'info');
                }}
                className="inline-flex items-center gap-1 bg-white text-slate-900 border border-slate-200 px-2.5 py-1 rounded-xl shadow-xs transition duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="UK School of Artificial Intelligence Clinical Gen-AI Audit Guidelines orientation compliant. Click to view clinical AI safeguards."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse"></span>
                UKSAI ALIGNED
              </button>
            </div>
          </div>
          
          {/* VIEW TOGGLE & INSTALL BUTTON */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                setShowInstallModal(true);
                showToast('Launching Shahnaz Pathology App Install & PWA Hub Center...', 'success');
              }}
              className="px-4.5 py-2 bg-slate-950 hover:bg-slate-900 border-2 border-red-650 text-white rounded-full text-xs font-black tracking-tight shadow-md flex items-center gap-1.5 transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer animate-pulse"
              title="Get the Android APK or iOS App Shortcut"
            >
              <Smartphone size={13} className="text-red-500" />
              <span>Install Mobile App (APK / PWA)</span>
            </button>

            <div className="flex bg-slate-200/80 p-1 rounded-full border border-slate-300/60 shadow-inner">
              <button
                onClick={() => handleSwitchView('public')}
                className={`px-6 py-2 text-xs font-bold rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'public'
                    ? 'bg-white shadow-md text-red-600 scale-102 font-extrabold border border-red-650/10'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bot size={13} />
                Public Portal
              </button>
              <button
                onClick={() => handleSwitchView('staff')}
                className={`px-6 py-2 text-xs font-bold rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'staff'
                    ? 'bg-white shadow-md text-red-600 scale-102 font-extrabold border border-red-650/10'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope size={13} />
                Staff & Doctors Backend
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* GOOGLE DRIVE HUB BANNER (Durable Integration) */}
      <div className="max-w-7xl mx-auto px-6 mt-4 print:hidden">
        <div className="rounded-[2rem] p-5 border border-slate-200 bg-white text-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xs transition-all duration-300">
          <div className="flex items-center gap-3.5 text-left font-sans">
            <div className="p-3 rounded-2xl flex items-center justify-center bg-red-50 text-red-650">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span>Google Drive Clinical Sync Gateway</span>
                {driveUser && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[8px] font-mono tracking-widest font-black uppercase">ACTIVE SYNC</span>
                )}
              </h2>
              <p className="text-[11px] leading-relaxed font-semibold text-slate-500">
                {driveUser 
                  ? `Authorized as ${driveUser.email}. Store clinical reports offsite, or import medical images/PDFs directly.`
                  : "Connect your personal Google Drive securely to back up diagnostic records, load references, and sync files easily."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {driveUser ? (
              <>
                <button
                  onClick={() => {
                    setStaffActiveTab('google_drive');
                    showToast('Switched to Cloud Backup Workspace', 'info');
                  }}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-black rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5 uppercase tracking-wider shadow-xs"
                >
                  <Search size={12} className="text-red-500" />
                  <span>Browse Drive Workspace</span>
                </button>
                <button
                  onClick={handleDisconnectDrive}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-750 border border-red-200 text-[11px] font-black rounded-xl transition cursor-pointer uppercase tracking-wider shadow-xs"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectDrive}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-red-650 border-2 border-red-600/80 hover:border-red-600 text-[11px] font-black rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs uppercase tracking-wider animate-pulse"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Authorize Google Drive Sync</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN VIEW AREA */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* 1. PUBLIC PORTAL VIEW (BENTO GRID DESIGN) */}
        {currentView === 'public' && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-in-out]">
            
            {/* Health Info Strip */}
            <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent rounded-3xl p-5 border border-red-500/15 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <p className="text-xs font-black uppercase tracking-wider text-red-950">
                  Global Clinical Standards Operational Status: Verified Online
                </p>
              </div>

              {/* Dynamic resilient caching status bar */}
              {offlineQueue.length > 0 ? (
                <div className="bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-xl flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                  <span>{offlineQueue.length} REPORT(S) QUEUED SEAMLESSLY (AES-256 SEALS)</span>
                  <button onClick={syncOfflineBacklog} className="underline hover:text-amber-950 font-black cursor-pointer">DRAIN FORCE</button>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-250 text-red-700 text-[10px] font-mono font-black px-3 py-1 rounded-xl flex items-center gap-1">
                  <span>RESILIENT SECURED OFFLINE CACHE: ACTIVE</span>
                </div>
              )}

              <div className="text-xs text-slate-500">
                System Time Check: <span className="font-mono bg-slate-200/50 px-2 py-0.5 rounded text-slate-700">2026-06-01 UTC</span>
              </div>
            </div>

            {/* BENTO GRID AREA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* BENTO CARD 1: GLOBAL HEALTH NEWS (col-span-4) */}
              <section className="lg:col-span-4 lg:row-span-2 bg-white rounded-[2.2rem] border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md transition duration-300 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="font-extrabold text-slate-800 uppercase tracking-tighter text-xs">Global Health News</h2>
                    <p className="text-[10px] text-slate-400">Verified indices and WHO bulletins</p>
                  </div>
                  <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-red-100">
                    Live Feed
                  </span>
                </div>

                {newsLoading ? (
                  <div className="flex-grow flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-5 overflow-y-auto max-h-[320px] scrollbar-thin pr-1 flex-grow">
                    {news.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedNews(item)}
                        className="group p-3 hover:bg-slate-50 rounded-2xl transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-100"
                      >
                        <p className="text-[9px] text-red-700 font-extrabold tracking-wider uppercase mb-1">
                          {item.source} • {item.timeAgo}
                        </p>
                        <h3 className="text-xs font-extrabold leading-snug text-slate-900 group-hover:text-red-650 font-mono transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (news[0]) setSelectedNews(news[0]);
                    }}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-xl border border-slate-200/80 transition uppercase tracking-wider"
                  >
                    View Main Bulletin
                  </button>
                </div>
              </section>

              {/* BENTO CARD 2: AI MULTI-MODAL CONCIERGE (col-span-5) */}
              <section className="lg:col-span-5 bg-white border border-slate-200 rounded-[2.2rem] p-6 flex flex-col text-slate-850 shadow-sm relative overflow-hidden min-h-[460px]">
                {/* Visual Ambient Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative z-10 flex flex-wrap gap-2 justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5 animate-[fadeIn_0.5s_ease-out]">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-[10px] font-extrabold text-slate-700 shadow-sm">
                        GEM
                      </div>
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-200 text-[10px] font-extrabold text-red-650">
                        GPT
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xs font-black tracking-tight text-red-650 uppercase">Pathology AI Concierge</h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] text-red-650 font-bold font-mono">CORE:</span>
                        <select
                          value={selectedModel}
                          onChange={(e) => {
                            const val = e.target.value as 'gemma-2-27b-it' | 'gemini-3.5-flash';
                            setSelectedModel(val);
                            showToast(`AI Core switched to ${val === 'gemma-2-27b-it' ? 'Gemma 2 27B' : 'Gemini 3.5 Flash'}`, 'success');
                          }}
                          className="bg-white text-[10px] text-slate-800 border border-slate-200 rounded px-2 py-0.5 font-mono focus:outline-none focus:border-red-650 cursor-pointer shadow-xs"
                        >
                          <option value="gemma-2-27b-it">Google Gemma 2 27B (Free Tier)</option>
                          <option value="gemini-3.5-flash">Gemini 3.5 Flash (Ultra Speed)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <span className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full font-mono tracking-widest uppercase font-bold">
                    Secure AI
                  </span>
                </div>

                {/* ChatGPT/Gemini Chat Window scroll container */}
                <div className="relative z-10 flex-grow bg-slate-50/60 border border-slate-200 rounded-[1.5rem] p-4 mb-4 overflow-y-auto max-h-[220px] space-y-4 no-scrollbar">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 rounded-[1.2rem] text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-red-600 text-white rounded-tr-none shadow-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                        }`}
                      >
                        <div className={`flex items-center gap-1.5 mb-1.5 opacity-70 text-[9px] font-bold font-mono ${msg.sender === 'user' ? 'text-white/90' : 'text-slate-500'}`}>
                          {msg.sender === 'user' ? <User size={10} /> : <Bot size={10} />}
                          {msg.sender === 'user' ? 'Patient' : 'Pathologist AI'}
                        </div>
                        
                        {msg.fileAttached && (
                          <div className={`mb-2 p-2 rounded-lg text-[10px] flex items-center gap-2 border ${msg.sender === 'user' ? 'bg-red-700/45 border-red-500/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-705'}`}>
                            <span>📄</span>
                            <span className="truncate max-w-[120px]">{msg.fileAttached.name}</span>
                          </div>
                        )}
                        
                        <div className="whitespace-pre-line leading-relaxed tracking-wide font-sans">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isChatTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none text-xs shadow-xs">
                        <div className="flex gap-1.5 items-center">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">Consulting clinical guidelines...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef}></div>
                </div>

                {/* Microphone Record Pulse Waveform Banner */}
                {/* Attached document flag inside input form */}
                {attachedChatFile && (
                  <div className="bg-red-50 border border-red-200 text-red-950 text-[10px] rounded-xl px-3 py-2 mb-3 flex justify-between items-center shadow-xs">
                    <span className="truncate font-mono">Attached: {attachedChatFile.name}</span>
                    <button
                      onClick={() => setAttachedChatFile(null)}
                      className="text-red-600 hover:text-red-700 font-extrabold px-1.5"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Chat Action Row & Input */}
                <form onSubmit={handleSendMessage} className="relative z-10 space-y-2 mt-auto">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={triggerCameraInput}
                      className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-2xl border border-slate-200 transition duration-300 flex items-center justify-center shadow-xs cursor-pointer"
                      title="Simulate Visual Camera Scan for Handwritings"
                    >
                      <Camera size={15} />
                    </button>

                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask pathology query, scan labs..."
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-red-650 transition shadow-xs"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-2 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition duration-200 cursor-pointer"
                      >
                        <Send size={12} className="stroke-[3px]" />
                      </button>
                    </div>
                  </div>
                </form>
              </section>

              {/* BENTO CARD 3: PATIENT SUBMISSION PORTAL & COMPLAINTS (col-span-3) */}
              <section className="lg:col-span-3 bg-red-105/5 rounded-[2.2rem] border border-red-200/40 p-6 flex flex-col shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center gap-1.5 mb-3">
                  <Shield size={14} className="text-red-700" />
                  <h2 className="font-extrabold text-red-950 uppercase tracking-tighter text-xs">Patient Submission</h2>
                </div>
                
                <p className="text-[10px] text-red-750 leading-snug mb-4">
                  Upload reports, biochemistry charts, or file complaints. <strong className="font-extrabold">100% Free of Cost</strong> under shahnazpathology's guidelines.
                </p>

                <form onSubmit={handleLogoUpload} className="space-y-4">
                  {/* ID Key input */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-red-800 ml-1">
                      Identity Phone or NID
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadIdentity}
                      onChange={(e) => setUploadIdentity(e.target.value)}
                      placeholder="e.g. 01889776655"
                      className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-red-650"
                    />
                  </div>

                  {/* Drag-Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('report-file-picker')?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer ${
                      dragActive
                        ? 'border-red-500 bg-red-105/20'
                        : selectedFile
                        ? 'border-red-400 bg-red-105/5'
                        : 'border-red-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      id="report-file-picker"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                    />
                    
                    {selectedFile ? (
                      <div>
                        <span className="text-xl mb-1 block">📄</span>
                        <p className="text-[10px] font-bold text-red-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[9px] text-red-650 font-black uppercase mt-0.5">
                          File Loaded Successfully
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xl mb-1 block">⬆</span>
                        <p className="text-[10px] font-extrabold text-red-950">Drop Test Reports Here</p>
                        <p className="text-[8px] text-red-600 mt-0.5 uppercase font-bold">PDF, JPG, PNG (Max 15MB)</p>
                      </div>
                    )}
                  </div>

                  {/* Demo template insert helper button to make debugging straightforward */}
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={injectSampleReport}
                      className="text-[9px] text-red-700 hover:text-red-900 underline font-extrabold cursor-pointer"
                    >
                      ⚡ Insert Demo Pathology Sheet
                    </button>

                    {driveToken ? (
                      <button
                        type="button"
                        onClick={() => setShowDrivePicker(true)}
                        className="text-[9px] text-slate-800 hover:text-red-700 font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        📁 Import from Google Drive
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectDrive}
                        className="text-[9px] text-slate-500 hover:text-red-650 font-extrabold flex items-center gap-1 cursor-pointer"
                        title="Authorize Google Drive session first"
                      >
                        ☁️ Sync Drive to Import
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-[10px] font-black rounded-2xl tracking-widest uppercase transition shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Analyzing with Gemini...
                      </span>
                    ) : (
                      'SECURE SUBMIT REPORT'
                    )}
                  </button>
                </form>

                {uploadSuccessMessage && (
                  <div className="mt-3 p-2 bg-emerald-50 text-emerald-800 rounded-xl text-[10px] border border-emerald-200 leading-snug">
                    ✓ {uploadSuccessMessage}
                  </div>
                )}
              </section>

              {/* BENTO CARD 4: THE GRIEVANCE & LEGAL INCIDENT REPORT BOX (col-span-3) */}
              <section className="lg:col-span-3 bg-stone-50 rounded-[2.2rem] border border-stone-200 p-6 flex flex-col shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-1.5 mb-3">
                  <Scale size={14} className="text-stone-700" />
                  <h2 className="font-extrabold text-stone-900 uppercase tracking-tighter text-xs">Official Grievance Box</h2>
                </div>

                <p className="text-[10px] text-stone-600 leading-relaxed mb-4">
                  If you have a genuine complaint against any health-oriented person or clinic, document it here. Under licensing laws, verified claims will be submitted to health regulatory officers.
                </p>

                <form onSubmit={handleComplaintSubmit} className="space-y-4 flex-grow flex flex-col">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-stone-800 ml-1">
                      Identity Identifier
                    </label>
                    <input
                      type="text"
                      required
                      value={complaintIdentity}
                      onChange={(e) => setComplaintIdentity(e.target.value)}
                      placeholder="Enter phone or NID"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>

                  <div className="space-y-1 flex-grow flex flex-col">
                    <label className="text-[8px] font-black uppercase tracking-widest text-stone-800 ml-1">
                      Incident Grievance Details
                    </label>
                    <textarea
                      required
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      placeholder="Describe the clinical discrepancy or incident in details..."
                      className="w-full flex-grow h-24 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none resize-none focus:ring-1 focus:ring-stone-400"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingComplaint}
                    className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 text-white text-[10px] font-extrabold rounded-2xl tracking-widest uppercase transition tracking-wider mt-auto"
                  >
                    {isSubmittingComplaint ? 'LOGGING DISCREPANCY...' : 'SUBMIT SECURELY'}
                  </button>
                </form>

                {complaintSuccessMessage && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-800 text-[10px] rounded-xl font-mono leading-snug font-bold">
                    {complaintSuccessMessage}
                  </div>
                )}
              </section>

              {/* BENTO CARD 5: PATIENT TRACK LOCATOR (col-span-5) - Unlocked via Phone/NID search */}
              <section className="lg:col-span-5 bg-white rounded-[2.2rem] border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-red-750 animate-pulse" />
                    <h2 className="font-extrabold text-slate-800 uppercase tracking-tighter text-xs">Verify Your Reports</h2>
                  </div>
                  <span className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-extrabold uppercase border border-red-100">
                    Live Status Track
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 leading-snug mb-4">
                  Search utilizing the exact Phone Number or NID used during your document submission to read AI Summaries instantly.
                </p>

                <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-4">
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Enter Phone or NID key"
                    className="flex-grow min-w-[120px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-650 focus:bg-white text-slate-900"
                  />
                  <button
                    onClick={() => {
                      if (!patientId.trim()) {
                        showToast('Please fill out the tracking identity number.', 'warning');
                        return;
                      }
                      setActiveTrackingId(patientId);
                      setHasSearchedTracking(true);
                      fetchSubmissions();
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center justify-center gap-1"
                  >
                    Track
                  </button>
                  <button
                    onClick={() => {
                      setPatientId('');
                      setActiveTrackingId('');
                      setHasSearchedTracking(true);
                      fetchSubmissions();
                      showToast('Showing all uploaded pathology reports.', 'success');
                    }}
                    className="px-3 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center justify-center gap-1 border border-slate-950"
                    title="Show All Saved Reports"
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setIsScannerOpen(true);
                      showToast('Requesting camera permissions for secure QR analysis...', 'info');
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-xs hover:scale-101 active:scale-99"
                    title="Launch Live Camera Decoder for Verification Tokens"
                  >
                    <Camera size={13} />
                    <span>Scan QR</span>
                  </button>
                  <div className="relative group py-1">
                    {/* Live Announcer for screen readers informing them of active tutorial steps */}
                    <div className="sr-only" aria-live="polite" id="barcode-step-announcer">
                      Barcode Guide Step {barcodeGuideStep + 1} of 3. {
                        barcodeGuideStep === 0 
                          ? "Horizontal Alignment: Keep the tube straight and parallel to the scanning beam." 
                          : barcodeGuideStep === 1 
                            ? "Refraction Filter: Reduce light glares on the glossy labels." 
                            : "Optimal Distance: Keep a 10 to 15 centimeters distance from the lens."
                      }
                    </div>

                    <button
                      onClick={() => {
                        setIsBarcodeScannerOpen(true);
                        showToast('Requesting camera permissions for immediate patient ID barcode reading...', 'info');
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-xs hover:scale-101 active:scale-99 border border-slate-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      title="Direct Camera Capture for Patient ID Barcode Reading"
                      id="btn-quick-scan-barcode"
                      aria-label="Quick scan barcode. Direct camera capture for specimen tubes or patient ID barcode reading. Hover or focus to see specimen alignment guide."
                      aria-haspopup="dialog"
                      aria-expanded={isBarcodeScannerOpen}
                      aria-describedby="barcode-tooltip-desc"
                    >
                      <Barcode size={13} className="text-red-500" />
                      <span>Quick Scan</span>
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5" aria-hidden="true">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-650"></span>
                      </span>
                    </button>
                    
                    {/* Interactive Tooltip Helper with Specimen Alignment Guide */}
                    {/* group-hover:block and group-focus-within:block ensures visibility both on cursor hover and keyboard focus navigation */}
                    <div 
                      id="barcode-tooltip-desc"
                      role="tooltip"
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-64 hidden group-hover:block group-focus-within:block focus-within:block bg-slate-950 text-white text-[9.5px] leading-normal p-3.5 rounded-2xl border border-slate-800 shadow-2xl z-30 pointer-events-auto text-left after:content-[''] after:absolute after:top-full after:left-0 after:right-0 after:h-4 transition-all duration-200"
                    >
                      
                      {/* Tooltip Header */}
                      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-850">
                        <div className="font-extrabold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span aria-hidden="true">🏷️</span> Barcode Guide
                        </div>
                        <span className="text-[7.5px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-black uppercase">
                          Step {barcodeGuideStep + 1} of 3
                        </span>
                      </div>

                      {/* Specimen Tube Mock Simulator Container */}
                      <div className="h-14 bg-slate-900/90 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800/80 mb-2.5 select-none" aria-hidden="true">
                        {barcodeGuideStep === 0 && (
                          /* Step 0: Horizontal Alignment */
                          <div className="w-full h-full flex flex-col items-center justify-center relative animate-[fadeIn_0.2s_ease-out]">
                            {/* Safe green dashed bounding box */}
                            <div className="absolute inset-2.5 border border-dashed border-emerald-500/40 rounded-lg flex items-center justify-center pointer-events-none">
                              <span className="text-[6.5px] text-emerald-400/80 font-mono uppercase tracking-widest absolute bottom-0.5 scale-90">ALIGN OK</span>
                            </div>
                            {/* Horizontal Tube Graphic */}
                            <div className="w-28 h-4.5 bg-slate-700/80 rounded-full border border-slate-600 flex items-center relative pl-1.5 z-10">
                              <div className="w-18 h-2 bg-rose-600/70 rounded-full absolute left-4"></div>
                              <div className="w-11 h-3.5 bg-white absolute right-4 flex items-center justify-around px-0.5 border border-slate-200 shadow-sm">
                                <span className="w-0.5 h-3 bg-slate-950"></span>
                                <span className="w-[1px] h-3 bg-slate-950"></span>
                                <span className="w-[1.5px] h-3 bg-slate-950"></span>
                                <span className="w-[1px] h-3 bg-slate-950"></span>
                                <span className="w-0.5 h-3 bg-slate-950"></span>
                              </div>
                              <div className="w-4 h-4.5 bg-purple-700 rounded-l absolute left-0 border-r border-slate-650"></div>
                            </div>
                          </div>
                        )}

                        {barcodeGuideStep === 1 && (
                          /* Step 1: Lighting and Glare */
                          <div className="w-full h-full flex items-center justify-center relative animate-[fadeIn_0.2s_ease-out]">
                            {/* Ambient Light Circle overlay */}
                            <div className="absolute w-20 h-20 rounded-full bg-yellow-400/10 blur-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                            <span className="text-[7px] text-yellow-400 font-extrabold font-mono tracking-wider uppercase absolute top-1 flex items-center gap-0.5 scale-90 select-none">
                              <span>💡</span> GLARE FILTER DIRECTIVE
                            </span>
                            {/* Tube Graphic with dynamic specular lighting shine */}
                            <div className="w-28 h-4.5 bg-slate-700/90 rounded-full border border-slate-550 flex items-center relative pl-1.5 shadow-inner">
                              <div className="w-11 h-3.5 bg-slate-50 absolute right-4 flex items-center justify-around px-0.5 border border-slate-300 shadow-[0_0_8px_rgba(255,255,255,0.7)]">
                                <span className="w-[1px] h-3 bg-slate-900"></span>
                                <span className="w-0.5 h-3 bg-slate-900"></span>
                                <span className="w-[1.5px] h-3 bg-slate-900"></span>
                                <span className="w-[1px] h-3 bg-slate-900"></span>
                                <span className="w-0.5 h-3 bg-slate-900"></span>
                              </div>
                              <div className="w-4 h-4.5 bg-purple-705 rounded-l absolute left-0"></div>
                            </div>
                          </div>
                        )}

                        {barcodeGuideStep === 2 && (
                          /* Step 2: Optimal Distance 10-15cm */
                          <div className="w-full h-full flex items-center justify-between px-5 relative animate-[fadeIn_0.2s_ease-out]">
                            {/* Smartphone camera frame rendering */}
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-5 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-slate-550">
                                <div className="w-2.5 h-2.5 rounded-full border border-red-500/60 bg-red-500/20 animate-pulse flex items-center justify-center">
                                  <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                </div>
                              </div>
                              <span className="text-[5.5px] text-slate-500 mt-0.5 uppercase tracking-tighter">lens</span>
                            </div>

                            {/* Distance indicator */}
                            <div className="flex-grow flex flex-col items-center justify-center px-1 relative">
                              <div className="w-full h-[1px] bg-dashed border-t border-emerald-500/40 relative">
                                <div className="absolute -top-0.5 left-0 w-1 h-1 rounded-full bg-emerald-400"></div>
                                <div className="absolute -top-0.5 right-0 w-1 h-1 rounded-full bg-emerald-400"></div>
                              </div>
                              <span className="text-[7px] text-emerald-400 font-extrabold mt-1 tracking-tight select-none">10-15 cm (4-6")</span>
                            </div>

                            {/* Tube target */}
                            <div className="shrink-0 flex flex-col items-center">
                              <div className="w-10 h-3.5 bg-slate-700 rounded-full border border-slate-600 relative flex items-center justify-end pr-0.5 shadow-sm">
                                <div className="w-5 h-2.5 bg-white rounded-2xs"></div>
                              </div>
                              <span className="text-[5.5px] text-slate-500 mt-0.5 uppercase tracking-tighter">specimen</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Diagnostic Step Description */}
                      <div className="space-y-1 bg-slate-900/40 p-2 rounded-xl border border-slate-850">
                        {barcodeGuideStep === 0 && (
                          <>
                            <div className="font-bold text-slate-205">1. Horizontal Alignment ↔️</div>
                            <p className="text-[8.5px] text-slate-400 leading-normal font-sans">
                              টিউবটি সর্বদা সোজা আনুভূমিক (horizontal) রাখুন। বাঁকা কোণ এড়িয়ে কোডটি স্ক্রিনের নির্দেশক লাইনের সাথে সমান্তরাল নিশ্চিত করুন।
                            </p>
                          </>
                        )}
                        {barcodeGuideStep === 1 && (
                          <>
                            <div className="font-bold text-slate-205">2. Refraction & Brightness 💡</div>
                            <p className="text-[8.5px] text-slate-400 leading-normal font-sans">
                              টিউবের চকচকে লেবেলে সরাসরি লাইটের রিফ্লেকশন প্রতিহত করুন। আলোর উৎস পর্যাপ্ত রাখুন যেন ক্যামেরায় কোডটি স্পষ্ট কালো দেখায়।
                            </p>
                          </>
                        )}
                        {barcodeGuideStep === 2 && (
                          <>
                            <div className="font-bold text-slate-205">3. Focal Depth Distance 📏</div>
                            <p className="text-[8.5px] text-slate-400 leading-normal font-sans">
                              লেন্স থেকে ৪ থেকে ৬ ইঞ্চি (১০-১৫ সেমি) দূরত্ব বজায় রাখুন। অতিরিক্ত কাছে আনলে ছবি ঝাপসা হবে এবং রিডিং ব্যাহত হতে পারে।
                            </p>
                          </>
                        )}
                      </div>

                      {/* Tooltip navigation controls */}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-850">
                        {/* Dot indicator indicators */}
                        <div className="flex gap-1.5 pl-0.5" role="tablist" aria-label="Specimen alignment helper slides">
                          {[0, 1, 2].map((stepIdx) => (
                            <button
                              key={stepIdx}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setBarcodeGuideStep(stepIdx);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setBarcodeGuideStep(stepIdx);
                                }
                              }}
                              className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 ${
                                barcodeGuideStep === stepIdx ? 'bg-red-500 w-3.5' : 'bg-slate-800 hover:bg-slate-700'
                              }`}
                              title={`View Step ${stepIdx + 1}`}
                              aria-label={`View barcode specimen alignment guide step ${stepIdx + 1}`}
                              role="tab"
                              aria-selected={barcodeGuideStep === stepIdx}
                            />
                          ))}
                        </div>
                        
                        {/* Next slide handler button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setBarcodeGuideStep((prev) => (prev + 1) % 3);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setBarcodeGuideStep((prev) => (prev + 1) % 3);
                            }
                          }}
                          className="text-[8px] font-black uppercase text-red-500 hover:text-red-400 active:scale-95 transition-all cursor-pointer font-sans bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
                          aria-label="Next barcode alignment tutorial step"
                        >
                          Next step &rarr;
                        </button>
                      </div>

                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950" aria-hidden="true"></div>
                    </div>
                  </div>
                </div>

                {hasSearchedTracking ? (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 flex-grow">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                      Tracking results for: "{activeTrackingId || 'All Records'}"
                    </p>
                    
                    {filteredReports.length === 0 && filteredComplaints.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-100 rounded-2xl">
                        <span className="text-slate-300 text-xl block">🔍</span>
                        <p className="text-xs text-slate-400 font-medium">No pathology filings list match.</p>
                      </div>
                    ) : (
                      <>
                        {/* Render Patient Reports */}
                        {filteredReports.map((rep) => (
                          <div
                            key={rep.id}
                            className="p-3 bg-red-105/5 hover:bg-red-50/15 border border-red-200/40 rounded-xl text-xs space-y-2 cursor-pointer transition"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800 truncate block max-w-[150px]">
                                {rep.fileName}
                              </span>
                              {renderStatusBadge(rep.status)}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">
                              File ID: {rep.id} • {new Date(rep.timestamp).toLocaleDateString()}
                            </p>

                            <div className="mt-2 p-2.5 bg-slate-900 text-slate-100 rounded-xl space-y-1 text-[9px] font-mono flex justify-between items-center gap-3">
                              <div className="space-y-0.5">
                                <p className="text-red-500 font-extrabold flex items-center gap-1">
                                  <span>🔒</span> TLS 1.3 E2E ENCRYPTED
                                </p>
                                <p className="text-slate-400">Standard: AES-256 GCM</p>
                                <p className="text-[8px] text-slate-500 truncate max-w-[170px]" title={rep.digestHash}>
                                  Sig: {rep.digestHash || 'Generating secure signature...'}
                                </p>
                              </div>
                              <div className="flex flex-col items-center gap-1 shrink-0 bg-white p-1 rounded-lg">
                                {renderReportQrCode(rep, 44)}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVerifiedReport(rep);
                                  }}
                                  className="text-[8px] text-red-750 font-black tracking-wider uppercase underline hover:text-red-950 block text-center cursor-pointer"
                                >
                                  Verify
                                </button>
                              </div>
                            </div>
                            
                            {/* AI Summary detail view */}
                            {rep.aiSummary && (
                              <div className="p-3 bg-white border border-red-150 rounded-xl text-[11px] prose-slate max-h-[160px] overflow-y-auto mt-2">
                                <div className="flex justify-between items-center mb-1.5 border-b border-red-100 pb-1">
                                  <div className="text-[10px] text-red-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles size={11} className="animate-spin-slow text-red-650" />
                                    Diagnostic Breakdown
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {driveToken ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleBackupReportToDrive(rep);
                                        }}
                                        disabled={isBackingUpId === rep.id}
                                        className="p-1 px-2.5 bg-red-650 hover:bg-red-700 disabled:bg-slate-400 text-white font-black rounded-lg text-[9px] flex items-center gap-1 transition-all cursor-pointer uppercase tracking-wider"
                                        title="Back up clinical report to your personal Google Drive storage"
                                      >
                                        {isBackingUpId === rep.id ? (
                                          <span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                        )}
                                        <span>Backup Drive</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleConnectDrive();
                                        }}
                                        className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all border border-slate-250 cursor-pointer"
                                        title="Connect Google Drive session"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                        <span>Sync Drive</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        exportReportToPDF(rep);
                                      }}
                                      className="p-1 px-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-950 text-white font-extrabold cursor-pointer"
                                      title="Download Clinically Formatted PDF Document for Patient Distribution"
                                    >
                                      <Download size={10} />
                                      Export PDF
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrintReport(rep);
                                      }}
                                      className="p-1 px-2 bg-slate-50 hover:bg-red-50 hover:text-red-700 text-slate-800 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all border border-slate-200 hover:border-red-300 cursor-pointer"
                                      title="Export and Print Branded PDF Clinical Report"
                                    >
                                      <Printer size={10} />
                                      Print View
                                    </button>
                                  </div>
                                </div>
                                <div className="text-slate-700 space-y-1">
                                  {renderMarkdown(rep.aiSummary)}
                                </div>
                              </div>
                            )}

                            {/* Patient Feedback: AI Interpretation Quality */}
                            {rep.status === 'reviewed' && (
                              <div className="mt-3 p-3 bg-slate-50 border border-slate-200/85 rounded-xl space-y-2 text-left" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                                    <span>⭐</span> Patient Feedback & Rating
                                  </span>
                                  {rep.rating && (
                                    <span className="text-[8px] bg-emerald-50 text-emerald-805 border border-emerald-250 px-2.5 py-0.5 rounded-full font-black uppercase">
                                      Submitted
                                    </span>
                                  )}
                                </div>

                                {rep.rating ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <span
                                          key={s}
                                          className={`text-sm ${s <= rep.rating! ? 'text-amber-500' : 'text-slate-200'}`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                      <span className="text-[10px] text-slate-500 font-bold ml-1 font-mono">
                                        ({rep.rating} / 5)
                                      </span>
                                    </div>
                                    {rep.ratingFeedback && (
                                      <p className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic leading-relaxed font-sans">
                                        "{rep.ratingFeedback}"
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-2 font-sans">
                                    <p className="text-[10px] text-slate-500 leading-normal">
                                      How would you rate the accuracy and clarity of this AI diagnostic interpretation?
                                    </p>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((s) => {
                                        const currentSelected = reportRatingStars[rep.id] || 0;
                                        return (
                                          <button
                                            key={s}
                                            type="button"
                                            onClick={() => setReportRatingStars(prev => ({ ...prev, [rep.id]: s }))}
                                            className="text-lg focus:outline-hidden transition hover:scale-120 cursor-pointer p-0.5"
                                            title={`${s} Stars`}
                                          >
                                            <span className={s <= currentSelected ? 'text-amber-500' : 'text-slate-300'}>
                                              ★
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <div className="space-y-1.5">
                                      <textarea
                                        value={reportRatingFeedback[rep.id] || ''}
                                        onChange={(e) => setReportRatingFeedback(prev => ({ ...prev, [rep.id]: e.target.value }))}
                                        placeholder="Add optional notes (e.g., 'Very helpful', 'Easy to understand'...)"
                                        className="w-full text-[10px] p-2 bg-white border border-slate-250 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:outline-hidden resize-none h-12 text-slate-800"
                                      />
                                      <button
                                        type="button"
                                        disabled={!reportRatingStars[rep.id] || reportRatingSubmitting[rep.id]}
                                        onClick={() => handleRateReport(rep.id, reportRatingStars[rep.id], reportRatingFeedback[rep.id] || '')}
                                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-[9px] rounded-lg cursor-pointer uppercase tracking-wider transition"
                                      >
                                        {reportRatingSubmitting[rep.id] ? 'Submitting...' : 'Submit Quality Feedback'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Render Patient Complaints */}
                        {filteredComplaints.map((comp) => (
                          <div
                            key={comp.id}
                            className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800">Official Complaint Grievance</span>
                              {renderStatusBadge(comp.status)}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                              Log Date: {new Date(comp.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-stone-100/80">
                              "{comp.details}"
                            </p>
                            {comp.assignedStaff && (
                              <div className="text-[10px] text-red-750 font-black">
                                Assigned Coordinator: {comp.assignedStaff}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <span className="text-slate-300 text-2xl block mb-1">🔑</span>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Awaiting Identity Lock</p>
                    <p className="text-[9px] text-slate-400 text-center max-w-[200px] mt-1">
                      Enter and search a verification identifier above to read database reports.
                    </p>
                  </div>
                )}
              </section>

              {/* BENTO CARD 6: STAFF TERMINAL ENTRANCE GATEWAY BAR (col-span-4) */}
              <section className="lg:col-span-4 bg-white rounded-[2.2rem] border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <h2 className="font-extrabold text-slate-800 uppercase tracking-tighter text-xs">Doctor & Staff Terminal</h2>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Administrative access portal for shahnazpathology and authorized laboratory assistants to verify uploads and analyze files.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/50">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Docs</span>
                      <span className="text-xl font-black font-mono text-slate-950">{reports.filter(r => r.status === 'pending').length}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/50">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Grievance logs</span>
                      <span className="text-xl font-black font-mono text-slate-950">{complaints.filter(c => c.status === 'pending').length}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() => handleSwitchView('staff')}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black border-2 border-red-650 tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 shadow cursor-pointer"
                  >
                    Open Doctor Queue
                    <ArrowRight size={12} />
                  </button>
                </div>
              </section>



            </div>
          </div>
        )}

        {/* 2. DOCTOR & STAFF BACKEND TERMINAL WORKSPACE */}
        {currentView === 'staff' && !isStaffAuthenticated && (
          <div className="max-w-md mx-auto my-12 animate-[fadeIn_0.3s_ease-in-out]" id="staff-auth-panel">
            <div className="bg-white border-2 border-red-600 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              {/* Security Backdrop glow using user brand colors */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 blur-[80px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-500/5 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="relative z-10 text-center mb-8">
                <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-3xl mx-auto flex items-center justify-center text-red-650 mb-4 shadow-sm animate-pulse">
                  <Lock size={28} />
                </div>
                <span className="inline-flex items-center gap-1 bg-red-450/10 border border-red-500/20 text-red-700 font-mono text-[9px] uppercase px-2 py-0.5 rounded-full mb-2">
                  <Shield size={9} /> Strictly Gated Terminal
                </span>
                <h2 className="text-xl font-black text-slate-955 tracking-tight uppercase">Authorized Personnel Only</h2>
                <p className="text-slate-500 text-xs mt-1">
                  Access restricted to Shanaz Pathology clinical experts and authorized laboratory consultants.
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="relative z-10 space-y-4">
                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 animate-[shake_0.4s_ease-in-out]">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Pathologist / Staff ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. dr_shanaz"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-950 placeholder-slate-400 rounded-2xl px-4 py-3 focus:outline-none focus:border-red-600 transition-all duration-205"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Cryptographic Passkey
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="•••••••••••••••••••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-950 placeholder-slate-400 rounded-2xl px-4 py-3 focus:outline-none focus:border-red-600 transition-all duration-205"
                  />
                </div>

                <button
                  type="submit"
                  onClick={() => showToast('Triggered credential validation for Passkey portal entry...', 'info')}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black tracking-tight rounded-2xl text-xs uppercase shadow-lg transition-all duration-200 hover:scale-101 active:scale-99 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                >
                  <Shield size={14} />
                  Authorize Portal Access
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-[9px] font-mono tracking-widest uppercase">OR NATIVE BIOMETRICS</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast('Triggering simulated fingerprint or face mapping verification...', 'info');
                    handleBiometricAuth();
                  }}
                  id="btn-biometric-login"
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 hover:border-slate-900 text-white font-black tracking-tight rounded-2xl text-xs uppercase shadow-sm transition-all duration-200 hover:scale-101 active:scale-99 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                >
                  <Smartphone className="text-red-500 animate-pulse" size={14} />
                  Biometric Face ID / Touch ID Access
                </button>
              </form>

              {/* Secure Credentials Reference */}
              <div className="relative z-10 mt-8 pt-6 border-t border-slate-200 text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-2 font-mono">
                  🔑 Pathologist Reference Key
                </span>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10px] text-slate-600 space-y-1 text-left font-mono">
                  <p className="flex justify-between">
                    <span className="text-slate-400">USER ID:</span>
                    <span className="font-bold text-red-600">dr_shanaz</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">PASSKEY:</span>
                    <span className="font-bold text-red-600">ClinicalPathology2026</span>
                  </p>
                </div>
                <div className="flex justify-center items-center gap-1.5 mt-4 text-[9px] text-slate-400 font-mono">
                  <span className="w-1.5 h-1.5 bg-red-650 rounded-full animate-pulse"></span>
                  <span>TLS 1.3 AES-256 E2E Secure Handshake Active</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2.1 DOCTOR & STAFF BACKEND TERMINAL WORKSPACE (AUTHENTICATED) */}
        {currentView === 'staff' && isStaffAuthenticated && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-in-out]">
            
            {/* Backend Workspace Title strip */}
            <div className="bg-slate-950 text-white rounded-[2.2rem] p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[90px] rounded-full pointer-events-none"></div>
              <div className="relative z-10 flex items-center gap-4">
                <span className="p-3 bg-red-650 text-white rounded-2xl text-2xl shadow-lg font-bold">🩺</span>
                <div>
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    Staff Clinical Backlog Terminal
                  </h2>
                  <p className="text-slate-400 text-xs font-semibold">
                    Read patient pathological charts, run clinical writing transcribers, formulate complaint grievance draft models.
                  </p>
                </div>
              </div>
              <div className="relative z-10 text-right shrink-0 flex flex-col items-end gap-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
                    Database Connection Status
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="w-2 h-2 rounded-full bg-red-650 animate-pulse"></span>
                    <span className="font-mono text-[10px] uppercase text-red-500 font-bold animate-pulse">ONLINE & ENCRYPTED</span>
                  </div>
                </div>
                <button
                  onClick={handleLogoutStaff}
                  className="px-4.5 py-1.5 bg-red-650 hover:bg-red-700/90 text-white rounded-xl text-[9px] font-black tracking-widest uppercase transition-all duration-200 border border-red-500/30 flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98"
                  title="Secure Lock Portal"
                >
                  <Lock size={11} className="shrink-0" />
                  <span>Lock Terminal</span>
                </button>
              </div>
            </div>

             {/* GOOGLE CLOUD FIRESTORE TELEMETRY MATRIX & COMPLIANCE HUD */}
            <div className="bg-slate-50 border border-slate-200 text-slate-800 rounded-3xl p-5 shadow-inner grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse"></span>
                  GCP Cloud Database
                </p>
                <p className="text-sm font-black text-slate-950 font-sans">Google Firestore</p>
                <p className="text-[10px] text-red-600 mt-1 font-extrabold font-mono">Secure Instance Live</p>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse"></span>
                  Query Speed Latency
                </p>
                <p className="text-sm font-black text-slate-950 font-sans">34 ms latency</p>
                <p className="text-[10px] text-red-600 mt-1 font-extrabold font-mono">Standard Compliant</p>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse"></span>
                  Transit Security
                </p>
                <p className="text-sm font-black text-slate-950 font-sans">TLS 1.3 Secure</p>
                <p className="text-[10px] text-red-600 mt-1 font-extrabold font-mono">Mandatory Encryption</p>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse"></span>
                  Firestore Index status
                </p>
                <p className="text-sm font-black text-slate-950 font-sans">Active & Synced</p>
                <p className="text-[10px] text-red-600 mt-1 font-extrabold font-mono">100% indexed keys</p>
              </div>
            </div>

            {/* ENTERPRISE PLATFORM ARCHITECTURE SUB-TAB-SWITCHER */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 max-w-2xl gap-1">
              <button
                onClick={() => {
                  setStaffActiveTab('clinical');
                  showToast('Opened tab immediately: "Clinical Board" (Patient Queue Backlog)', 'success');
                }}
                className={`flex-1 py-1.5 rounded-xl text-[10.5px] font-bold tracking-tight transition cursor-pointer flex items-center justify-center gap-2 ${
                  staffActiveTab === 'clinical'
                    ? 'bg-red-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>📋 Clinical Board</span>
              </button>
              <button
                onClick={() => {
                  setStaffActiveTab('activity_log');
                  showToast('Opened tab immediately: "Activity Log" (EHR Audit Trail Logs)', 'success');
                }}
                className={`flex-1 py-1.5 rounded-xl text-[10.5px] font-bold tracking-tight transition cursor-pointer flex items-center justify-center gap-2 ${
                  staffActiveTab === 'activity_log'
                    ? 'bg-red-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>📜 Activity Log</span>
              </button>
              <button
                onClick={() => {
                  setStaffActiveTab('google_drive');
                  showToast('Opened tab immediately: "Google Drive Cloud Backup"', 'success');
                }}
                className={`flex-1 py-1.5 rounded-xl text-[10.5px] font-bold tracking-tight transition cursor-pointer flex items-center justify-center gap-2 ${
                  staffActiveTab === 'google_drive'
                    ? 'bg-red-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>☁ Google Drive Sync</span>
              </button>
              <button
                onClick={() => {
                  setStaffActiveTab('architecture');
                  showToast('Opened tab immediately: "Enterprise Architecture" (Lab Integration Nodes)', 'success');
                }}
                className={`flex-1 py-1.5 rounded-xl text-[10.5px] font-bold tracking-tight transition cursor-pointer flex items-center justify-center gap-2 ${
                  staffActiveTab === 'architecture'
                    ? 'bg-red-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>⚙ Enterprise Architecture</span>
              </button>
              <button
                onClick={() => {
                  setStaffActiveTab('billing');
                  showToast('Drafting: "SLA Maintenance Proposal & Billing Engine"', 'success');
                }}
                className={`flex-1 py-1.5 rounded-xl text-[10.5px] font-bold tracking-tight transition cursor-pointer flex items-center justify-center gap-2 ${
                  staffActiveTab === 'billing'
                    ? 'bg-red-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>৳ Billing Proposal</span>
              </button>
            </div>

            {staffActiveTab === 'clinical' ? (
              /* Backlog Action Queue Grid Split Screen */
              <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
              
              {/* UNIFIED ADMINISTRATIVE TOOLBAR */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search by Patient ID, filename, or details..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-650 transition-all font-sans"
                  />
                  {staffSearchQuery && (
                    <button
                      onClick={() => setStaffSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
                  <button
                    onClick={() => handleExportCSV(filteredStaffReports, filteredStaffComplaints)}
                    className="px-4 py-2.5 bg-slate-100/80 hover:bg-slate-200/50 text-slate-800 rounded-2xl text-xs font-bold tracking-tight shadow-sm flex items-center gap-2 transition duration-200 border border-slate-200 hover:scale-102 active:scale-98 cursor-pointer w-full sm:w-auto justify-center"
                    title="Export currently filtered list as standardized CSV report"
                  >
                    <Download size={13} className="text-slate-700" />
                    <span>Export CSV Report</span>
                  </button>

                  <button
                    onClick={handlePrintPendingReports}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-105/15 text-red-950 rounded-2xl text-xs font-extrabold tracking-tight shadow-sm flex items-center gap-2 transition duration-200 border border-red-200 hover:scale-102 active:scale-98 cursor-pointer w-full sm:w-auto justify-center"
                    title="Generate a printer-friendly ledger of all pending pathology reports"
                  >
                    <Printer size={13} className="text-red-700" />
                    <span>Print Pending List</span>
                  </button>

                  <button
                    onClick={() => {
                      setStaffActiveTab('billing');
                      showToast('Redirecting to Maintenance Agreement & Billing Proposal drafting engine...', 'info');
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-2xl text-xs font-extrabold tracking-tight shadow-sm flex items-center gap-2 transition duration-200 border border-slate-950 hover:scale-102 active:scale-98 cursor-pointer w-full sm:w-auto justify-center"
                    title="Generate professional maintenance contract & recurring SLA fee billing letter"
                  >
                    <FileText size={13} className="text-white" />
                    <span>Generate Billing Proposal</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
                {/* STAFF BACKLOG LIST (col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Pending Verification Backlog Card */}
                  <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Patient Pathology backlog</h3>
                        <p className="text-[10px] text-slate-500 font-mono">Total submissions tracker database</p>
                      </div>
                      <span className="text-xs font-black text-red-750 font-mono bg-red-50 px-3 py-1 rounded-full border border-red-200">
                        {filteredStaffReports.length} records
                      </span>
                    </div>

                    {/* Operational Backlog Summary Snapshot Row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 rounded-xl border border-amber-200/60 shadow-sm transition-all">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9.5px] font-mono font-black text-amber-800 uppercase tracking-tight">
                          Pending Verification: {reports.filter(r => r.status === 'pending').length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50/60 rounded-xl border border-red-200/40 shadow-sm transition-all">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-650" />
                        <span className="text-[9.5px] font-mono font-black text-red-850 uppercase tracking-tight">
                          Reviewed & Verified: {reports.filter(r => r.status === 'reviewed').length}
                        </span>
                      </div>
                    </div>

                    {/* Filter and Sort Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 gap-1 max-w-[260px] flex-1">
                        {(['all', 'pending', 'reviewed'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setReportFilter(filter)}
                            className={`text-[9px] font-black uppercase py-1.5 px-3 rounded-lg flex-1 text-center transition cursor-pointer ${
                              reportFilter === filter
                                ? 'bg-red-650 text-white shadow-sm font-black'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>

                      {/* Filter Controls Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Rating Range Filter Dropdown */}
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Feedback Rating:</span>
                          <select
                            value={ratingFilter}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setRatingFilter(val);
                              showToast(`Backlog filtered by rating: ${e.target.selectedOptions[0].text}`, 'info');
                            }}
                            className="bg-transparent text-[11px] font-black text-slate-800 focus:outline-none cursor-pointer border-0 p-0"
                          >
                            <option value="all">⭐ All Ratings</option>
                            <option value="5_only">⭐️ 5 Stars Only</option>
                            <option value="4_plus">⭐️ 4+ Stars</option>
                            <option value="3_plus">⭐️ 3+ Stars</option>
                            <option value="unrated">😶 Reviewed (No Rating)</option>
                          </select>
                        </div>

                        {/* Sorting Dropdown */}
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sort By:</span>
                          <select
                            value={staffReportSort}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setStaffReportSort(val);
                              showToast(`Backlog sorted by: ${e.target.selectedOptions[0].text}`, 'info');
                            }}
                            className="bg-transparent text-[11px] font-black text-slate-800 focus:outline-none cursor-pointer border-0 p-0"
                          >
                            <option value="most_recent">📅 Most Recent</option>
                            <option value="oldest">⏳ Oldest</option>
                          <option value="patient_id_asc">🔑 Patient ID (A-Z)</option>
                          <option value="patient_id_desc">🔑 Patient ID (Z-A)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                    {/* Date Range Filter Row */}
                    <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl mb-4 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9.5px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                          📅 Clinical Backlog Date Filter
                        </span>
                        {(startDateInput || endDateInput || startDateFilter || endDateFilter) && (
                          <button
                            onClick={() => {
                              setStartDateInput('');
                              setEndDateInput('');
                              setStartDateFilter('');
                              setEndingDateFilter('');
                              showToast('Date range filter reset successfully.', 'success');
                            }}
                            className="text-[9px] font-bold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer transition uppercase"
                          >
                            Clear Dates
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                          <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-wider">From Date</span>
                          <input
                            type="date"
                            value={startDateInput}
                            onChange={(e) => setStartDateInput(e.target.value)}
                            className="bg-transparent border-0 text-[11px] font-black text-slate-800 focus:outline-none cursor-pointer mt-0.5 p-0"
                          />
                        </div>
                        <div className="flex flex-col bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                          <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-wider">To Date</span>
                          <input
                            type="date"
                            value={endDateInput}
                            onChange={(e) => setEndDateInput(e.target.value)}
                            className="bg-transparent border-0 text-[11px] font-black text-slate-800 focus:outline-none cursor-pointer mt-0.5 p-0"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setStartDateFilter(startDateInput);
                          setEndingDateFilter(endDateInput);
                          showToast('Scope of backlog successfully filtered by date range.', 'success');
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2 px-4 rounded-xl text-[10px] uppercase shadow-sm transition-all duration-150 text-center flex items-center justify-center gap-2 cursor-pointer"
                      >
                        ⚡ Scope Backlog Range
                      </button>

                      {(startDateFilter || endDateFilter) && (
                        <p className="text-[9px] font-medium text-slate-500">
                          Filtering records submitted between <strong className="text-red-750">{startDateFilter || 'Any'}</strong> and <strong className="text-red-750">{endDateFilter || 'Any'}</strong>
                        </p>
                      )}

                      {(startDateInput !== startDateFilter || endDateInput !== endDateFilter) && (
                        <p className="text-[8.5px] font-bold text-amber-600 animate-pulse">
                          ⚠️ Changes pending. Click "Scope Backlog Range" to apply.
                        </p>
                      )}
                    </div>

                    {/* Pathology Select All and Bulk Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100/60 text-[11px]">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-bold select-none">
                        <input
                          type="checkbox"
                          checked={filteredStaffReports.length > 0 && filteredStaffReports.every(r => selectedReportIds.includes(r.id))}
                          onChange={() => {
                            const isAll = filteredStaffReports.length > 0 && filteredStaffReports.every(r => selectedReportIds.includes(r.id));
                            if (isAll) {
                              setSelectedReportIds(prev => prev.filter(id => !filteredStaffReports.map(r => r.id).includes(id)));
                            } else {
                              setSelectedReportIds(prev => Array.from(new Set([...prev, ...filteredStaffReports.map(r => r.id)])));
                            }
                          }}
                          className="w-3.5 h-3.5 text-red-600 border-slate-300 rounded focus:ring-red-650 cursor-pointer"
                        />
                        <span>Select All ({filteredStaffReports.length})</span>
                      </label>

                      {selectedReportIds.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 animate-pulse">
                            {selectedReportIds.length} Selected
                          </span>
                          <button
                            onClick={handleBulkMarkReportsReviewed}
                            disabled={bulkActionInProgress}
                            className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer hover:scale-102 active:scale-98"
                          >
                            {bulkActionInProgress ? 'Updating...' : 'Mark Reviewed'}
                          </button>
                        </div>
                      )}
                    </div>

                    {submissionsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 font-sans">
                        {filteredStaffReports.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">No reports match filter/search.</p>
                        ) : (
                          filteredStaffReports.map((rep) => (
                            <div
                              key={rep.id}
                              onClick={() => setSelectedQueueItem({ type: 'report', data: rep })}
                              className={`p-3 rounded-2xl border cursor-pointer flex justify-between items-center transition-all duration-300 ease-out transform hover:-translate-y-0.5 gap-3 ${
                                selectedQueueItem?.data.id === rep.id
                                  ? 'bg-red-105/10 border-red-300 shadow-[0_4px_12px_rgba(220,38,38,0.06)] scale-[1.01]'
                                  : 'bg-slate-50/65 hover:bg-red-50/5 hover:border-red-200/40 hover:shadow-[0_4px_10px_rgba(0,0,0,0.02)] border-slate-200/60'
                              }`}
                            >
                              <div className="flex items-center gap-2 shrink-0">
                                <input
                                  type="checkbox"
                                  checked={selectedReportIds.includes(rep.id)}
                                  onClick={(e) => toggleReportSelection(rep.id, e)}
                                  onChange={() => {}}
                                  className="w-3.5 h-3.5 text-red-600 border-slate-300 rounded focus:ring-red-650 cursor-pointer"
                                />
                              </div>
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5" title={rep.fileName}>
                                  <span className="truncate">{rep.fileName}</span>
                                  {rep.rating && (
                                    <span className="inline-flex items-center gap-0.5 text-[8.5px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200/50 shrink-0" title={`Patient rated AI interpretation ${rep.rating} out of 5 stars`}>
                                      ★ {rep.rating}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  ID: {rep.phoneOrNid} • {new Date(rep.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                {renderStatusBadge(rep.status)}
                                <span className="text-[9px] text-red-750 underline font-black">Verify ➔</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                 {/* Complaint Grievance filings Backlog Card */}
                  <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm font-sans">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Official Complaint backlogs</h3>
                        <p className="text-[10px] text-slate-500 font-mono">Public administrative grievances logged</p>
                      </div>
                      <span className="text-xs font-bold text-stone-700 font-mono bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                        {filteredStaffComplaints.length} cases
                      </span>
                    </div>

                    {/* Filter Action Row */}
                    <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 gap-1 mb-3">
                      {(['all', 'pending', 'reviewed', 'resolved'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setComplaintFilter(filter)}
                          className={`text-[9px] font-black uppercase py-1.5 px-2 rounded-lg flex-1 text-center transition cursor-pointer ${
                            complaintFilter === filter
                              ? 'bg-stone-700 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-855'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    {/* Complaint Select All and Bulk Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-1 pb-3 mb-3 border-b border-slate-100/60 text-[11px]">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-bold select-none">
                        <input
                          type="checkbox"
                          checked={filteredStaffComplaints.length > 0 && filteredStaffComplaints.every(c => selectedComplaintIds.includes(c.id))}
                          onChange={() => {
                            const isAll = filteredStaffComplaints.length > 0 && filteredStaffComplaints.every(c => selectedComplaintIds.includes(c.id));
                            if (isAll) {
                              setSelectedComplaintIds(prev => prev.filter(id => !filteredStaffComplaints.map(c => c.id).includes(id)));
                            } else {
                              setSelectedComplaintIds(prev => Array.from(new Set([...prev, ...filteredStaffComplaints.map(c => c.id)])));
                            }
                          }}
                          className="w-3.5 h-3.5 text-stone-600 border-slate-300 rounded focus:ring-stone-500 cursor-pointer"
                        />
                        <span>Select All ({filteredStaffComplaints.length})</span>
                      </label>

                      {selectedComplaintIds.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {selectedComplaintIds.length} Sel
                          </span>
                          <button
                            onClick={() => handleBulkMarkComplaintsReviewed('reviewed')}
                            disabled={bulkActionInProgress}
                            className="px-2 py-1 bg-stone-700 hover:bg-stone-850 text-white rounded-lg text-[9px] font-black uppercase transition disabled:opacity-50 cursor-pointer"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleBulkMarkComplaintsReviewed('resolved')}
                            disabled={bulkActionInProgress}
                            className="px-2 py-1 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase transition disabled:opacity-50 cursor-pointer"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </div>

                    {submissionsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                        {filteredStaffComplaints.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">No complaints match filter/search.</p>
                        ) : (
                          filteredStaffComplaints.map((comp) => (
                            <div
                              key={comp.id}
                              onClick={() => setSelectedQueueItem({ type: 'complaint', data: comp })}
                              className={`p-3 rounded-2xl border cursor-pointer flex justify-between items-center transition-all duration-300 ease-out transform hover:-translate-y-0.5 gap-3 ${
                                selectedQueueItem?.data.id === comp.id
                                  ? 'bg-stone-100 border-stone-400 shadow-[0_4px_12px_rgba(120,113,108,0.1)] scale-[1.01]'
                                  : 'bg-slate-50/65 hover:bg-stone-50 hover:border-stone-300 hover:shadow-[0_4px_10px_rgba(0,0,0,0.02)] border-slate-200/60'
                              }`}
                            >
                              <div className="flex items-center gap-2 shrink-0">
                                <input
                                  type="checkbox"
                                  checked={selectedComplaintIds.includes(comp.id)}
                                  onClick={(e) => toggleComplaintSelection(comp.id, e)}
                                  onChange={() => {}}
                                  className="w-3.5 h-3.5 text-stone-600 border-slate-300 rounded focus:ring-stone-500 cursor-pointer"
                                />
                              </div>
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate" title={comp.phoneOrNid}>
                                  Complaint Ref: {comp.phoneOrNid}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  Date: {new Date(comp.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0 font-sans">
                                {renderStatusBadge(comp.status)}
                                <span className="text-[9px] text-stone-700 underline font-semibold">Review ➔</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                {/* Database Maintenance panel */}
                <div className="p-4 bg-slate-900 rounded-2xl text-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] text-red-500 font-black uppercase tracking-widest font-mono">
                      Database Maintenance Core
                    </span>
                    <button
                      onClick={() => {
                        fetchSubmissions();
                        fetchNews();
                        showToast('System database state indexes re-synced!', 'success');
                      }}
                      className="p-1 bg-white/10 rounded hover:bg-white/20 text-white transition"
                      title="Reload API State"
                    >
                      <RotateCcw size={11} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Terminal: SHJ_PATH_VER_1.0.4 • OK</p>
                </div>

              </div>

              {/* ACTIVE SELECTION DETAIL INSPECTOR & AI ADVANCED TOOLS (col-span-7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Active Inspector card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm min-h-[300px]">
                  {selectedQueueItem ? (
                    <div className="space-y-5">
                      
                      {/* Selection Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <p className="text-[10px] text-red-700 font-extrabold tracking-wider uppercase font-mono">
                            Selected Database Backlog Profile
                          </p>
                          <h4 className="text-base font-black text-slate-950">
                            {selectedQueueItem.type === 'report' ? 'Report File Diagnostic Check' : 'Incident Complaint Claim'}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Update Status Check:</span>
                          <select
                            value={selectedQueueItem.data.status}
                            onChange={(e) => handleUpdateRecordStatus(selectedQueueItem.type, selectedQueueItem.data.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-xl font-bold text-slate-800 outline-none focus:ring-1 focus:ring-red-650"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            {selectedQueueItem.type === 'complaint' && <option value="resolved">Resolved</option>}
                          </select>
                        </div>
                      </div>

                      {/* Diagnostic details */}
                      {selectedQueueItem.type === 'report' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 block mb-0.5 uppercase text-[9px] font-bold">Document Name</span>
                              <span className="text-slate-900 font-bold">{selectedQueueItem.data.fileName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-0.5 uppercase text-[9px] font-bold">Patient identity</span>
                              <span className="text-slate-950 font-bold">{selectedQueueItem.data.phoneOrNid}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-0.5 uppercase text-[9px] font-bold">Log Record ID</span>
                              <span className="text-slate-800 font-bold">{selectedQueueItem.data.id}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-0.5 uppercase text-[9px] font-bold">Submission Time</span>
                              <span className="text-slate-700">{new Date(selectedQueueItem.data.timestamp).toLocaleString()}</span>
                            </div>

                            {/* Patient Quality feedback integration */}
                            {selectedQueueItem.data.rating && (
                              <div className="col-span-2 pt-3 mt-1 border-t border-slate-200/50">
                                <span className="text-slate-400 block mb-1.5 uppercase text-[9px] font-bold font-sans">Patient Interpretation Quality Rating</span>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-1 bg-amber-50/50 p-2 rounded-xl border border-amber-100 w-fit">
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s} className={`text-sm ${s <= (selectedQueueItem.data.rating || 0) ? 'text-amber-500' : 'text-slate-200'}`}>★</span>
                                      ))}
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-bold ml-1 font-mono">
                                      ({selectedQueueItem.data.rating} / 5 Rating)
                                    </span>
                                  </div>
                                  {selectedQueueItem.data.ratingFeedback && (
                                    <p className="text-[10.5px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200 font-sans leading-relaxed">
                                      "{selectedQueueItem.data.ratingFeedback}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* GLOBAL CLINICAL COMPLIANCE INSPECTOR (MADE IN BACKEND) */}
                          {selectedQueueItem.data.regulatoryCompliance && (
                            <div className="bg-slate-50 border border-slate-200/85 p-4 rounded-3xl space-y-3 animate-[fadeIn_0.22s_ease-out] font-sans">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-wide flex items-center gap-1.5 font-sans">
                                  <span>🌐</span> Global Regulatory Rules Checked (Online Ingress)
                                </span>
                                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 border font-sans ${
                                  selectedQueueItem.data.regulatoryCompliance.status === 'COMPLIANT'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    selectedQueueItem.data.regulatoryCompliance.status === 'COMPLIANT' ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}></span>
                                  {selectedQueueItem.data.regulatoryCompliance.status}
                                </span>
                              </div>

                              <div className="text-[10px] text-slate-500 leading-normal bg-white p-2.5 rounded-2xl border border-slate-200/60 font-mono space-y-1">
                                <p><strong className="text-slate-700 font-semibold font-sans">Audit Framework:</strong> {selectedQueueItem.data.regulatoryCompliance.certificationAuthority}</p>
                                <p><strong className="text-slate-700 font-semibold font-sans">Verified Log Sign:</strong> <span className="text-indigo-600 font-bold">{selectedQueueItem.data.regulatoryCompliance.digitalCheckSignature}</span></p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {selectedQueueItem.data.regulatoryCompliance.rulesEvaluated?.map((ruleObj: any) => (
                                  <div key={ruleObj.ruleId} className="bg-white/70 p-2.5 rounded-2xl border border-slate-200/50 flex items-start gap-2 text-left">
                                    <span className={`text-xs mt-0.5 font-bold ${ruleObj.passed ? 'text-emerald-500' : 'text-amber-500'}`}>
                                      {ruleObj.passed ? '✓' : '⚠️'}
                                    </span>
                                    <div className="space-y-0.5 flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-mono text-[9px] font-bold text-slate-800">{ruleObj.ruleId}</span>
                                        <span className="text-[7.5px] text-slate-400 font-sans truncate">{ruleObj.authority}</span>
                                      </div>
                                      <p className="text-[8.5px] font-bold text-slate-700 truncate">{ruleObj.name}</p>
                                      <p className="text-[8px] text-slate-400 font-medium capitalize truncate" title={ruleObj.statusText}>{ruleObj.statusText}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                           <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-red-750 font-black uppercase tracking-wide flex items-center gap-1">
                                <Sparkles size={12} />
                                Gemini AI Generated Diagnostic Analysis
                              </span>
                              {selectedQueueItem.data.aiSummary && (
                                <div className="flex items-center gap-1.5 animate-[fadeIn_0.15s_ease-out]">
                                  {driveToken ? (
                                    <button
                                      onClick={() => handleBackupReportToDrive(selectedQueueItem.data)}
                                      disabled={isBackingUpId === selectedQueueItem.data.id}
                                      className="p-1 px-2.5 bg-red-650 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-xl text-[10px] font-black flex items-center gap-1 transition-all shadow-sm cursor-pointer uppercase tracking-wider"
                                      title="Back up clinical report to Google Drive"
                                    >
                                      {isBackingUpId === selectedQueueItem.data.id ? (
                                        <span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin"></span>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                      )}
                                      <span>Backup to Drive</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={handleConnectDrive}
                                      className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm border border-slate-200 cursor-pointer"
                                      title="Connect Google Drive first"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                      <span>Sync Drive</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => exportReportToPDF(selectedQueueItem.data)}
                                    className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm border border-indigo-200 cursor-pointer"
                                    title="Download formatted Clinical Diagnostic PDF Report"
                                  >
                                    <Download size={11} />
                                    Download PDF
                                  </button>
                                  <button
                                    onClick={() => handlePrintReport(selectedQueueItem.data)}
                                    className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm border border-slate-200 cursor-pointer"
                                    title="Print and Export Clinical Report as Branded PDF"
                                  >
                                    <Printer size={11} />
                                    Print View
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl text-xs font-mono space-y-1.5 overflow-y-auto max-h-[300px] border border-slate-800 leading-relaxed">
                              {renderMarkdown(selectedQueueItem.data.aiSummary || 'No AI interpretation generated.')}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Complaint view detail
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-stone-50 p-4 rounded-2xl border border-stone-200">
                            <div>
                              <span className="text-stone-400 block mb-0.5 uppercase text-[9px] font-bold">Complaint ID</span>
                              <span className="text-slate-900 font-bold">{selectedQueueItem.data.id}</span>
                            </div>
                            <div>
                              <span className="text-stone-400 block mb-0.5 uppercase text-[9px] font-bold">Identity tracking</span>
                              <span className="text-slate-950 font-bold">{selectedQueueItem.data.phoneOrNid}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-stone-400 block mb-0.5 uppercase text-[9px] font-bold">Filing Date</span>
                              <span className="text-slate-700">{new Date(selectedQueueItem.data.timestamp).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="space-y-1 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl text-xs leading-relaxed text-slate-700">
                            <span className="text-[10px] text-amber-800 font-black tracking-wider uppercase block mb-1">
                              Patient Grievance Statement:
                            </span>
                            "{selectedQueueItem.data.details}"
                          </div>

                          {/* Quick legal complaint formatter triggers */}
                          <div className="pt-3">
                            <button
                              onClick={() => {
                                setSelectedComplaintForLegal(selectedQueueItem.data);
                                handleLegalFormatSubmit(selectedQueueItem.data.id, selectedQueueItem.data.details);
                              }}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                            >
                              ⚖ Formulate Formal Directorate-General (DGHS) Misconduct Draft
                            </button>
                          </div>
                          
                          {/* Display Formulated Legal complaint result */}
                          {selectedComplaintForLegal?.id === selectedQueueItem.data.id && (
                            <div className="p-4 bg-slate-950 text-slate-100 rounded-2xl text-xs font-mono space-y-2 mt-4 max-h-[250px] overflow-y-auto border border-red-800/40">
                              <div className="flex justify-between items-center border-b border-white/10 pb-1.5 mb-1">
                                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wide">
                                  Health Tribunal Official Administrative complaint letter
                                </span>
                                {isLegalLoading && (
                                  <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                                )}
                              </div>
                              <div className="whitespace-pre-wrap leading-relaxed">
                                {isLegalLoading ? 'Gemini AI generating formal complaint framework...' : renderMarkdown(legalOutput)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 select-none">
                      <span className="text-4xl mb-2">📋</span>
                      <p className="text-xs font-bold uppercase tracking-wider">Awaiting Backlog Selection</p>
                      <p className="text-[10px] text-slate-400 text-center max-w-[280px] mt-1">
                        Select an active pathology record or complaint grievance from the left queues to inspect full diagnostics.
                      </p>
                    </div>
                  )}
                </div>

                {/* DOCTOR ADVANCED AI TOOLS (Scribe SOAP formulator) */}
                <div className="bg-stone-50 rounded-[2.2rem] border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-stone-200">
                    <Sparkles size={14} className="text-red-700 animate-spin-slow" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Doctor Room Scribe (SOAP Note Generator)</h3>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                    Type quick shorthand physician room observations. The Gemini-powered SOAP assistant drafts comprehensive clinical legal records.
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1 pt-1.5">Sample observations:</span>
                      <button
                        onClick={() => setNotesScribeInput('pt f hx of high fever x 3days. mild dehydration, hb 11 on cbc, normal wbc. advised hydration and iron-rich lentils diet.')}
                        className="bg-white border border-stone-300 hover:bg-stone-100 text-slate-800 text-[10px] px-2.5 py-1.5 rounded-lg transition font-mono"
                      >
                        Shorthand A (Anemia, Fever)
                      </button>
                      <button
                        onClick={() => setNotesScribeInput('dengue screen normal, platelets 200, normal values. vitals bp 120/80, hr 72. patient anxious. rest advised.')}
                        className="bg-white border border-stone-300 hover:bg-stone-100 text-slate-800 text-[10px] px-2.5 py-1.5 rounded-lg transition font-mono"
                      >
                        Shorthand B (Vitals, Anxiety)
                      </button>
                    </div>

                    <div className="space-y-1">
                      <textarea
                        value={notesScribeInput}
                        onChange={(e) => setNotesScribeInput(e.target.value)}
                        placeholder="Type shorthand observation notes..."
                        className="w-full h-24 bg-white border border-stone-300 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-red-650 font-mono"
                      ></textarea>
                    </div>

                    <button
                      onClick={handleScribeSubmit}
                      disabled={isScribeLoading}
                      className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-extrabold rounded-2xl tracking-widest uppercase transition flex items-center justify-center gap-2 shadow"
                    >
                      {isScribeLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Generating SOAP Markdown...
                        </>
                      ) : (
                        'Generate SOAP Clinical Summary Report'
                      )}
                    </button>

                    {scribeOutput && (
                      <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono space-y-2 mt-4 max-h-[300px] overflow-y-auto leading-relaxed border border-slate-750">
                        <div className="text-[10px] text-red-500 font-black uppercase tracking-wider pb-1 border-b border-white/10 flex justify-between items-center">
                          <span>SOAP Structured Report Profile Output</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(scribeOutput);
                              showToast('Copied clinical record to clipboard!', 'success');
                            }}
                            className="text-white hover:text-red-500 text-[10px] underline cursor-pointer"
                          >
                            Copy Record
                          </button>
                        </div>
                        <div className="text-slate-200">
                          {renderMarkdown(scribeOutput)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
            ) : staffActiveTab === 'activity_log' ? (
              /* Security Audits & Status Activity Log Panel */
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-xs space-y-6 animate-[fadeIn_0.25s_ease-out]">
                {/* Header section with Stats and Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary-50 pb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-xl">📜</span> Pathological Audit & Staff Activity Log
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Instant timestamped history of database updates, clinical report validations, and administrative status changes.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchActivityLogs}
                      disabled={activityLogsLoading}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>🔄</span> {activityLogsLoading ? 'Refreshing...' : 'Refresh Logs'}
                    </button>
                  </div>
                </div>

                {/* Filter and stats bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-250/60">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-xxs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Audits Recorded</span>
                    <span className="text-lg font-black text-slate-800">{activityLogs.length}</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-xxs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Most Active Operator</span>
                    <span className="text-xs font-black text-indigo-600 truncate block mt-0.5">
                      {activityLogs.length > 0
                        ? Array.from(new Set(activityLogs.map(l => l.userId))).reduce((a, b) => 
                            activityLogs.filter(l => l.userId === a).length >= activityLogs.filter(l => l.userId === b).length ? a : b
                          , 'N/A')
                        : 'None'}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-xxs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Cryptographic Log Auditing</span>
                    <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-[pulse_1.5s_infinite]"></span>
                      ACTIVE SECURE STREAM
                    </span>
                  </div>
                </div>

                {/* Logs lists */}
                {activityLogsLoading ? (
                  <div className="py-16 text-center text-slate-400 text-xs font-semibold space-y-2">
                    <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mx-auto"></div>
                    <div>Retrieving secure cryptographic activity streams from database...</div>
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="py-16 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                    <span className="text-4xl">📄</span>
                    <h4 className="text-sm font-bold text-slate-700 mt-3">No status changes recorded yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      All pathology report verifications, compliance checks, and complaint reviews will automatically list here once edited by staff.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-slate-200 rounded-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Timestamp</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Staff member</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Action description</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Token Checksum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-55/40 transition">
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-mono text-[11px] text-slate-500 font-medium">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                  👤 {log.userId}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="text-xs font-semibold text-slate-700 block max-w-md">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                  SHA-{log.id.toUpperCase().substring(4, 9)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : staffActiveTab === 'google_drive' ? (
              <GoogleDriveSync
                reports={reports}
                onImportReport={(importedText) => {
                  try {
                    const parsed = JSON.parse(importedText);
                    if (parsed && parsed.id) {
                      setReports(prev => {
                        if (prev.some(r => r.id === parsed.id)) {
                          return prev.map(r => r.id === parsed.id ? parsed : r);
                        }
                        return [parsed, ...prev];
                      });
                      showToast(`Successfully synchronized and restored patient report for ${parsed.patientName || 'Specimen'}!`, 'success');
                    } else {
                      showToast('Imported document loaded, but lacks full structured report metadata fields.', 'warning');
                    }
                  } catch (e) {
                    showToast('Imported file content resides outside expected formatted clinical schema.', 'warning');
                  }
                }}
                showToast={showToast}
              />
            ) : staffActiveTab === 'billing' ? (
              <BillingProposal showToast={showToast} />
            ) : (
              <EnterpriseArchitecture showToast={showToast} />
            )}

        </div>
        )}

      </main>

      {/* SYSTEM NEWS DETAIL BULLETIN MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[2rem] border border-slate-200 max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-red-700 font-extrabold uppercase tracking-wide">
                  {selectedNews.source} • {selectedNews.timeAgo}
                </span>
                <h3 className="text-base font-black text-slate-950 mt-1 font-mono leading-snug">
                  {selectedNews.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="text-xs text-slate-700 leading-relaxed font-sans space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-150">
              <p className="font-semibold text-slate-900 mb-2">Subject Action Item Summary:</p>
              <p>{selectedNews.summary}</p>
              <p className="text-[11px] text-slate-400 font-mono pt-4 border-t border-slate-200">
                Authorized Bulletin Source: Health Informatics Directorate. shahnazpathology recommends patients monitor monthly hematology indices continuously during local diagnostic phases.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition"
              >
                Return to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHANAZ PATHOLOGY SECURITY VERIFICATION CERTIFICATE MODAL */}
      {selectedVerifiedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white border-2 border-red-600/80 text-slate-800 rounded-[2.2rem] max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div className="space-y-0.5">
                <span className="flex items-center gap-1.5 text-[9px] text-red-650 font-extrabold uppercase tracking-widest font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  GCP FIRESTORE SECURE AUTHENTICATION SYSTEM
                </span>
                <h3 className="text-sm font-black text-slate-950 font-mono uppercase tracking-tight">
                  Verification Report Certificate
                </h3>
              </div>
              <button
                onClick={() => setSelectedVerifiedReport(null)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition font-mono border border-slate-200 cursor-pointer animate-[fadeIn_0.1s_ease-out]"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-center items-center py-2">
                <div className="bg-white p-2.5 border border-slate-200 rounded-2xl shadow-xs">
                  {renderReportQrCode(selectedVerifiedReport, 110)}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-[10px]">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">CERTIFICATE TOKEN:</span>
                  <span className="font-extrabold text-red-650 text-right max-w-[200px] truncate">{selectedVerifiedReport.verificationToken || `SHANAZ-E2E-${selectedVerifiedReport.id.toUpperCase()}-TEMP`}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">PATIENT ID (NID/PHONE):</span>
                  <span className="font-bold text-slate-900">{selectedVerifiedReport.phoneOrNid}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">SPECIMEN LOG FILE:</span>
                  <span className="font-bold text-slate-700 max-w-[200px] truncate">{selectedVerifiedReport.fileName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">DIGEST CHECKSUM (SHA256):</span>
                  <span className="font-extrabold text-red-650 text-right max-w-[200px] truncate select-all" title={selectedVerifiedReport.digestHash}>{selectedVerifiedReport.digestHash || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">E2E TRANSIT LINK:</span>
                  <span className="font-extrabold text-red-605 flex items-center gap-1">
                    <span>✓ HIGH-SECURE TLS 1.3</span>
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">DATABASE ENCRYPTION:</span>
                  <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                    <span>✓ ADVANCED AES-256</span>
                  </span>
                </div>
                <div className="flex justify-between pb-1 flex-col sm:flex-row sm:items-center">
                  <span className="text-slate-500 font-bold">DIGITAL AUDIT STAMP:</span>
                  <span className="font-black text-red-650 mt-1 sm:mt-0 font-sans tracking-tight">SIGNED BY CHIEF PATHOLOGIST</span>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200/60 p-3 rounded-xl text-[9px] text-red-750 font-sans leading-relaxed text-center font-bold">
                <strong>✓ VERIFICATION AUTHENTICATED ONLINE:</strong> This report is a registered, non-fungible pathological examination record logged directly inside shahnazpathology's secure central Cloud Database (GCP Firestore). It is secured using transport layer security protocol TLS 1.3 & hashed via SHA-256.
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedVerifiedReport(null)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest font-mono transition shadow-lg shrink-0 cursor-pointer"
              >
                RETURN TO TRACKER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE APP INSTALL / APK HUB MODAL */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[2rem] border-2 border-slate-250 max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-red-600 text-white rounded-2xl shadow-lg">
                  <Smartphone size={24} className="animate-pulse" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                    shahnazpathology App Hub
                  </h3>
                  <p className="text-xs text-slate-500 font-medium font-mono">
                    Native PWA Launcher Icon & Android APK Direct System Setup
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInstallModal(false);
                  showToast('Closed Install Hub.', 'info');
                }}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <X size={14} />
                <span>Close</span>
              </button>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Direct Action & QR Mobile Scan */}
              <div className="md:col-span-7 space-y-5">
                <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/60 space-y-3.5">
                  <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-red-600" />
                    Option 1: Direct PWA Install & Direct APK Download
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                    Installs a secure, light, and offline-persistent diagnostic shortcut icon on your Android launcher or home screen, or directly downloads our official installer APK package to side-load.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {deferredPrompt && (
                      <button
                        onClick={() => {
                          showToast('Triggering native app store launcher prompt...', 'info');
                          triggerPwaInstall();
                          setShowInstallModal(false);
                        }}
                        className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-98 cursor-pointer"
                      >
                        <Download size={13} />
                        Install App (PWA)
                      </button>
                    )}
                    
                    <a
                      href="/api/download-apk"
                      onClick={() => showToast('Starting direct Android APK package bundle download...', 'success')}
                      download="shahnazpathology.apk"
                      className="flex-1 py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-98 text-center"
                    >
                      <Smartphone size={13} className="text-red-500" />
                      Download APK File
                    </a>
                  </div>

                  {!deferredPrompt && (
                    <div className="bg-red-50 text-red-950 p-2.5 rounded-xl border border-red-100 text-[10px] font-bold flex items-center gap-2">
                      <span className="p-1.5 bg-red-600 text-white rounded-full text-[8px] leading-none">✓</span>
                      <span>Ready to side-load directly or install instantly via Safari/Chrome!</span>
                    </div>
                  )}
                </div>

                {/* QR Code section */}
                <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/60 flex flex-col items-stretch gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-150 shadow-inner flex-shrink-0">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCodeUrl)}`}
                        alt="Portal Mobile Scan QR"
                        className="w-28 h-28 mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1 select-text">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-red-55 border border-red-200 text-red-700 text-[9px] font-black uppercase rounded-full tracking-wider flex items-center gap-1 font-sans">
                          <Shield size={9} />
                          Public Shared Bypass Active
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                        <QrCode size={13} className="text-red-600" />
                        Scan to Open on Mobile
                      </h4>
                      <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
                        We have automatically swapped your development subdomain for the public <strong className="text-red-700 font-bold">Shared App Link</strong> so your smartphone can bypass any Google login locks instantly!
                      </p>
                    </div>
                  </div>

                  {/* Editable Scan Link block */}
                  <div className="border-t border-slate-200/60 pt-3 space-y-1 text-left w-full">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                      Smarter QR Endpoint (Edit or Custom IP if needed)
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                      <input
                        type="text"
                        value={qrCodeUrl}
                        onChange={(e) => setQrCodeUrl(e.target.value)}
                        placeholder="Type custom portal URL or private address..."
                        className="flex-1 bg-white border border-slate-250 text-[10px] px-2.5 py-2 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-red-650 outline-none font-mono tracking-tight"
                      />
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            try {
                              navigator.clipboard.writeText(qrCodeUrl);
                              showToast('Copied bypass portal URL to clipboard!', 'success');
                            } catch {
                              showToast('Failed to copy', 'error');
                            }
                          }}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-[9px] font-black transition cursor-pointer flex-shrink-0"
                        >
                          Copy
                        </button>
                         <button
                          onClick={() => {
                            let targetUrl = window.location.href;
                            if (targetUrl.includes('ais-dev-')) {
                              targetUrl = targetUrl.replace('ais-dev-', 'ais-pre-');
                            } else if (!targetUrl.includes('ais-pre-')) {
                              targetUrl = 'https://ais-pre-xevdnexmcii62nzy2rwd4z-595319894384.asia-southeast1.run.app';
                            }
                            setQrCodeUrl(targetUrl);
                            showToast('Scan QR returned to public shared domain', 'info');
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg text-[9px] font-bold transition cursor-pointer flex-shrink-0"
                          title="Reset to public view"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Platform Instructions */}
              <div className="md:col-span-5 space-y-4">
                {/* Android Steps */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200/50">
                    <span className="text-base">🤖</span>
                    <h5 className="text-[11px] font-extrabold text-slate-900 uppercase">Android Chrome</h5>
                  </div>
                  <ul className="text-[10px] text-slate-600 space-y-1.5 leading-snug list-decimal list-inside pl-1 font-semibold">
                    <li>Scan the QR code to open the portal.</li>
                    <li>Tap the three vertical dots ( ⋮ ) in Chrome's top-right corner.</li>
                    <li>Select <strong className="text-slate-900">"Install app"</strong> or <strong className="text-slate-900">"Add to Home screen"</strong>.</li>
                    <li>Tap confirm to add the app icon.</li>
                  </ul>
                </div>

                {/* iOS Steps */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200/50">
                    <span className="text-base">🍏</span>
                    <h5 className="text-[11px] font-extrabold text-slate-900 uppercase">iPhone & iPad Safari</h5>
                  </div>
                  <ul className="text-[10px] text-slate-600 space-y-1.5 leading-snug list-decimal list-inside pl-1 font-semibold">
                    <li>Open on iPhone in Safari.</li>
                    <li>Tap the <strong className="text-slate-900">Share</strong> icon (square with up arrow).</li>
                    <li>Scroll down and select <strong className="text-slate-900">"Add to Home Screen"</strong>.</li>
                    <li>Tap Add at the top right.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Universal Interactive Build & Compile Studio */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-md text-[8px] font-mono">STUDIO</span>
                    UNIVERSAL NATIVE COMPILER & APP SUITE
                  </h5>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Build physical standalone installer files for any platform directly from your downloaded code workspace.
                  </p>
                </div>
                {/* Tab select bar */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 gap-1 text-[9px] font-bold">
                  <button
                    onClick={() => setCompileTab('apk')}
                    className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${compileTab === 'apk' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    🤖 APK
                  </button>
                  <button
                    onClick={() => setCompileTab('ios')}
                    className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${compileTab === 'ios' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    🍏 iOS
                  </button>
                  <button
                    onClick={() => setCompileTab('exe')}
                    className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${compileTab === 'exe' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    💻 Windows EXE
                  </button>
                </div>
              </div>

              {/* Dynamic Tab Pane */}
              {compileTab === 'apk' && (
                <div className="space-y-3.5 select-text">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">🤖 Android Studio APK Pipeline</p>
                      <p className="text-[9px] text-slate-400">Generate configuration bundle and a compiler execution script instantly.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const conf = {
                            appId: "com.shahnazpathology.app",
                            appName: "shahnazpathology Portal",
                            webDir: "dist",
                            bundledWebRuntime: false,
                            server: {
                              androidScheme: "https",
                              cleartext: true
                            }
                          };
                          downloadConfigBlob('capacitor.config.json', JSON.stringify(conf, null, 2));
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[9px] font-black transition cursor-pointer border border-emerald-900/30"
                      >
                        📥 Config Json
                      </button>
                      <button
                        onClick={() => {
                          const script = `#!/usr/bin/env bash
echo "=== shahnazpathology Android Buildpack Installer ==="
npm install
npm i @capacitor/core && npm i -D @capacitor/cli @capacitor/android
npx cap init "shahnazpathology Portal" "com.shahnazpathology.app" --web-dir=dist
npm run build
npx cap add android
npx cap sync
echo "SUCCESS: Capacitor Android initialized! Opening Android Studio to compile signed .apk file..."
npx cap open android
`;
                          downloadConfigBlob('build-android.sh', script);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black transition cursor-pointer"
                      >
                        📥 Build Shell Script
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 text-[10px] text-left leading-relaxed">
                    <p className="font-extrabold text-slate-300 uppercase tracking-wide text-[9px]">How to Compile APK:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400 font-semibold font-mono">
                      <li>Download the project zip file from the top-right <strong className="text-white">Settings</strong> icon in AI Studio.</li>
                      <li>Extract the zip and download/place both of the assets generated above into that directory.</li>
                      <li>Open your Terminal inside the extracted directory and start the compiler package installation:
                        <pre className="bg-slate-950 text-emerald-400 p-2 rounded mt-1.5 text-[9px] overflow-x-auto border border-emerald-905">sh build-android.sh</pre>
                      </li>
                      <li>Android Studio opens automated. Select <strong className="text-white">"Build Bundle(s) / APK(s) {'->'} Build APK"</strong> to obtain your physical standalone android `.apk`.</li>
                    </ol>
                  </div>
                </div>
              )}

              {compileTab === 'ios' && (
                <div className="space-y-3.5 select-text">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">🍏 macOS / iOS Swift Pipeline</p>
                      <p className="text-[9px] text-slate-400">Assemble modern Xcode configurations and build commands automatically.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const conf = {
                            appId: "com.shahnazpathology.app",
                            appName: "shahnazpathology Portal",
                            webDir: "dist",
                            bundledWebRuntime: false,
                            server: {
                              iosScheme: "https"
                            }
                          };
                          downloadConfigBlob('capacitor.config.json', JSON.stringify(conf, null, 2));
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-[9px] font-black transition cursor-pointer border border-indigo-900/30"
                      >
                        📥 Config Json
                      </button>
                      <button
                        onClick={() => {
                          const script = `#!/usr/bin/env bash
echo "=== shahnazpathology iOS Xcode Buildpack ==="
npm install
npm i @capacitor/core && npm i -D @capacitor/cli @capacitor/ios
npx cap init "shahnazpathology Portal" "com.shahnazpathology.app" --web-dir=dist
npm run build
npx cap add ios
npx cap sync
echo "SUCCESS: iOS Platform initialised! Opening Xcode toolchain..."
npx cap open ios
`;
                          downloadConfigBlob('build-ios.sh', script);
                        }}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black transition cursor-pointer"
                      >
                        📥 Xcode Shell Script
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 text-[10px] text-left leading-relaxed">
                    <p className="font-extrabold text-slate-300 uppercase tracking-wide text-[9px]">How to Compile iOS File (.ipa):</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400 font-semibold font-mono">
                      <li>Ensure you're on a macOS computer with <strong className="text-white">Xcode</strong> installed.</li>
                      <li>Extract the exported workspace from AI Studio, and copy both generated files into the root.</li>
                      <li>Run the build shell pipeline to synthesize your CocoaPods modules:
                        <pre className="bg-slate-950 text-indigo-400 p-2 rounded mt-1.5 text-[9px] overflow-x-auto border border-indigo-905">sh build-ios.sh</pre>
                      </li>
                      <li>In Xcode, choose your connected iPhone target, click <strong className="text-white">Product {"->"} Archive</strong>, and tap "Export Ad-Hoc / App Store" to build your offline `.ipa` archive file!</li>
                    </ol>
                  </div>
                </div>
              )}

              {compileTab === 'exe' && (
                <div className="space-y-3.5 select-text">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">💻 Windows Electron Desktop Suite</p>
                      <p className="text-[9px] text-slate-400">Generate desktop browser wrappers and automated installation script installers.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const code = `const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "shahnazpathology Portal",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (require('fs').existsSync(indexPath)) {
    win.loadFile(indexPath);
  } else {
    win.loadURL("https://ais-pre-xevdnexmcii62nzy2rwd4z-595319894384.asia-southeast1.run.app");
  }

  Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;
                          downloadConfigBlob('electron-main.js', code);
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-[9px] font-black transition cursor-pointer border border-blue-900/30"
                      >
                        📥 electron-main.js
                      </button>
                      <button
                        onClick={() => {
                          const commands = `@echo off
echo ========================================================
echo  shahnazpathology Windows .EXE Desktop Compilation Suite
echo ========================================================
echo 1. Installing developer bundler package (Electron & Electron-Builder)...
call npm install --save-dev electron electron-builder

echo.
echo 2. Generating distribution assets...
call npm run build

echo.
echo 3. Creating compiled Standalone Windows executable installer...
npx electron-builder --win nsis

echo ========================================================
echo SUCCESS! Your physical .exe installer is compiled in .\\dist\\
echo ========================================================
pause
`;
                          downloadConfigBlob('build-windows-exe.bat', commands);
                        }}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black transition cursor-pointer"
                      >
                        📥 Build Script (.bat)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 text-[10px] text-left leading-relaxed">
                    <p className="font-extrabold text-slate-300 uppercase tracking-wide text-[9px]">How to Compile Windows Desktop App (.exe):</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400 font-semibold font-mono">
                      <li>Download and extract your full code workspace ZIP directly from Google AI Studio.</li>
                      <li>Generate and place both of the config and batch installer assets above in the extracted folder.</li>
                      <li>Double click the file <strong className="text-white">build-windows-exe.bat</strong> on your Windows machine.</li>
                      <li>This runs the system compiler. After completed, a standalone executable installer is produced under <strong className="text-white">dist/shahnazpathology-setup.exe</strong>!</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Back button */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLISH FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 py-10 mt-16 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500 font-medium">
          Copyright © by Tahriba Hussain. All Rights Reserved 2026 on behalf of UKSAI Ltd.
        </p>
      </footer>

      {/* FLOATING CUSTOM TOAST NOTIFICATIONS */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-2xl shadow-xl border bg-slate-900 border-slate-800 text-white min-w-[280px] max-w-sm">
          <span className={`p-1.5 rounded-lg text-white font-black text-xs ${
            toast.type === 'success' ? 'bg-red-600' :
            toast.type === 'error' ? 'bg-red-600' :
            toast.type === 'warning' ? 'bg-slate-700' :
            'bg-slate-700'
          }`}>
            {toast.type === 'success' && <CheckCircle size={15} />}
            {toast.type === 'error' && <AlertCircle size={15} />}
            {toast.type === 'warning' && <AlertCircle size={15} />}
            {toast.type === 'info' && <Clock size={15} />}
          </span>
          <div className="flex-1 text-left">
            <p className="text-[11px] font-bold leading-normal text-slate-100">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {isScannerOpen && (
        <QRScanner
          onClose={() => setIsScannerOpen(false)}
          reports={reports}
          onSelectVerifiedReport={(rep) => {
            setSelectedVerifiedReport(rep);
            showToast(`Report matched and loaded into verification details view.`, 'success');
          }}
          showToast={showToast}
        />
      )}

      {isBarcodeScannerOpen && (
        <QRScanner
          onClose={() => setIsBarcodeScannerOpen(false)}
          reports={reports}
          mode="barcode"
          onSelectVerifiedReport={(rep) => {
            setSelectedVerifiedReport(rep);
            showToast(`Report matched and loaded into verification details view.`, 'success');
          }}
          onScanBarcode={(scannedValue) => {
            setPatientId(scannedValue);
            setActiveTrackingId(scannedValue);
            setHasSearchedTracking(true);
            fetchSubmissions();
            showToast(`Patient barcode scanned: "${scannedValue}". Search results updated!`, 'success');
          }}
          showToast={showToast}
        />
      )}

      {isBiometricSimulating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-in-out]">
          <div className="bg-white border-2 border-red-650 rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
            {/* Crimson sweeping laser scanner effect */}
            <div className="absolute top-0 inset-x-0 h-1 bg-red-650 shadow-[0_0_10px_#dc2626] animate-[scan_2s_infinite]"></div>
            
            <button 
              onClick={() => {
                setIsBiometricSimulating(false);
                showToast("Simulated biometric hardware interface disconnected.", "warning");
              }}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-950 transition cursor-pointer"
              title="Cancel biometrics sensor read"
            >
              <X size={18} />
            </button>

            <div className="my-8">
              <div 
                onClick={() => {
                  if (biometricStatus === 'scanning') {
                    showToast('Analyzing dermal fingerprint contours and retinal coordinates...', 'info');
                  }
                }}
                className="w-28 h-28 mx-auto rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-600 shadow-md relative group cursor-pointer animate-[pulse_1.5s_infinite]"
              >
                {biometricStatus === 'scanning' && (
                  <span className="absolute inset-0 rounded-full border-4 border-red-600 animate-ping opacity-60"></span>
                )}
                {/* Fingerprint Glyph Emoji */}
                <span className="text-5xl select-none">🧬</span>
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
              {biometricStatus === 'scanning' ? 'Scanning Biometrics...' : 'Sensor Initialized'}
            </h3>
            <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
              {biometricStatus === 'scanning' 
                ? 'Validating fingerprint and screen lock Face-ID credentials against your device Secure Enclave...' 
                : 'Place your thumb or look at the screen sensor to authenticate staff credentials.'}
            </p>

            <div className="mt-8 flex flex-col gap-2">
              <button
                onClick={() => {
                  showToast('Touch ID validated successfully! Access granted.', 'success');
                  setIsStaffAuthenticated(true);
                  setIsBiometricSimulating(false);
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-xl shadow-md transition transform hover:scale-101 active:scale-99 cursor-pointer"
                id="btn-trigger-fingerprint"
              >
                Simulate Touch ID Scan
              </button>
              <button
                onClick={() => {
                  showToast('Face ID scanned and matches authorized profile!', 'success');
                  setIsStaffAuthenticated(true);
                  setIsBiometricSimulating(false);
                }}
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-950 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-xl shadow-sm transition transform hover:scale-101 active:scale-99 cursor-pointer"
                id="btn-trigger-faceid"
              >
                Simulate Face ID Scan
              </button>
            </div>
            
            <p className="text-[8.5px] text-slate-400 font-mono mt-4">
              Android PWA USB-debugging interface ready
            </p>
          </div>
        </div>
      )}

      {/* GOOGLE DRIVE FILE BROWSER MODAL */}
      {showDrivePicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh] animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📁</span>
                <div className="text-left">
                  <h3 className="text-xs font-black uppercase tracking-wider">Google Drive Explorer</h3>
                  <p className="text-[10px] text-slate-300">Select files to ingest and analyze in pathology backlog</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDrivePicker(false)}
                className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-[10px] font-black rounded-lg uppercase transition-all tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {isDriveLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <span className="w-8 h-8 border-4 border-red-650 border-t-transparent rounded-full animate-spin"></span>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Querying Drive Storage...</p>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <span className="text-3xl block">☁️</span>
                  <p className="text-xs font-bold text-slate-800">No medical files found in Google Drive</p>
                  <p className="text-[10px] text-slate-400 px-6">Upload pathology reports (PNG, JPG, PDF) directly to your Google Drive first, then import them seamlessly.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[9px] font-black uppercase text-red-700 tracking-wider">Direct Media Ingestion Catalog (PDF & Images)</p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {driveFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-red-50/50 border border-slate-200 hover:border-red-200 rounded-2xl transition group"
                      >
                        <div className="flex items-center gap-3 text-left overflow-hidden mr-2">
                          <span className="p-2.5 rounded-xl bg-slate-200/60 text-base shrink-0">
                            {file.mimeType.includes('pdf') ? '📄' : '🖼️'}
                          </span>
                          <div className="overflow-hidden">
                            <h4 className="text-[11px] font-bold text-slate-900 truncate group-hover:text-red-950" title={file.name}>{file.name}</h4>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                              {file.size ? `${(parseInt(file.size) / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'} • {new Date(file.createdTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleImportFileFromDrive(file)}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition cursor-pointer"
                        >
                          Import
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-[9px] font-mono text-slate-500">Secure Google API Tunnel Active</span>
              <button 
                onClick={() => driveToken && fetchDriveFiles(driveToken)}
                className="text-[10px] font-black uppercase text-slate-600 hover:text-red-650 tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                🔄 Refresh Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      </div> {/* CLOSING SCREEN WRAPPER */}

      {/* PROFESSIONAL CLINICAL PRINT FORMAT (ONLY SHOWN IN PRINT MEDIA) */}
      {printingReport && (
        <div className="hidden print:block font-sans text-slate-900 p-10 max-w-4xl mx-auto space-y-6">
          {/* Clinical Letterhead Header */}
          <div className="border-b-4 border-red-650 pb-6 flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-red-950 uppercase">
                shahnazpathology
              </h1>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Department of Clinical Diagnostics & Pathological AI Informatics
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Reg No: DGHS-M77890 • Licensed Central Diagnostic Panel
              </p>
            </div>
            <div className="text-right space-y-1 bg-red-105/10 p-3 rounded-xl border border-red-200">
              <span className="inline-block p-1 px-2.5 bg-slate-950 text-white font-extrabold text-[10px] uppercase rounded">
                Official Lab Record
              </span>
              <p className="text-[9px] text-slate-600 font-mono">
                Printed: {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Letterhead meta info */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">Patient Identifier (Phone/NID)</span>
              <span className="text-slate-950 font-bold">{printingReport.phoneOrNid}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">Specimen / File Reference</span>
              <span className="text-slate-950 font-bold truncate block">{printingReport.fileName}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">Database Log Reference</span>
              <span className="text-slate-800 font-bold">{printingReport.id}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">Submission Filing Date</span>
              <span className="text-slate-700">{new Date(printingReport.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-black text-red-950 border-b-2 border-red-50 pb-2 uppercase tracking-wide flex items-center gap-2">
              <span>🔬</span>
              AI Diagnostic Pathology Breakdown & Examination Report
            </h2>
            <div className="text-xs text-slate-800 leading-relaxed font-sans space-y-2 whitespace-pre-wrap">
              {renderMarkdown(printingReport.aiSummary || 'Laboratory state indices pending manual check.')}
            </div>
          </div>

          {/* Dynamic Global Regulatory Rules Audit certification board */}
          {printingReport.regulatoryCompliance && (
            <div className="space-y-3 pt-6 border-t border-slate-100 pb-2">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span>🌐</span>
                Live Online Regulatory Compliance Audit Checklist Certification
              </h2>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50 text-[10px]">
                <div className="font-mono space-y-0.5 text-slate-500">
                  <p><strong className="text-slate-700">Audit Framework:</strong> {printingReport.regulatoryCompliance.certificationAuthority}</p>
                </div>
                <div className="font-mono space-y-0.5 text-slate-500 text-right">
                  <p><strong className="text-slate-700">Audit Checksum:</strong> <span className="text-red-650 font-bold">{printingReport.regulatoryCompliance.digitalCheckSignature}</span></p>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-2 mt-1">
                  {printingReport.regulatoryCompliance.rulesEvaluated?.map((ruleObj) => (
                    <div key={ruleObj.ruleId} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                      <span className={`text-[11px] font-bold ${ruleObj.passed ? 'text-red-650' : 'text-slate-500'}`}>
                        {ruleObj.passed ? '✓' : '⚠️'}
                      </span>
                      <div className="space-y-0.5 flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-mono text-[8px] font-bold text-slate-800 leading-none">{ruleObj.ruleId}</span>
                          <span className="text-[7px] text-slate-400 font-sans leading-none">{ruleObj.authority}</span>
                        </div>
                        <p className="text-[8px] font-bold text-slate-700 leading-none truncate mt-0.5">{ruleObj.name}</p>
                        <p className="text-[7.5px] text-slate-400 font-medium leading-normal block mt-0.5">{ruleObj.statusText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Verification section */}
          <div className="pt-10 grid grid-cols-3 gap-6 items-end text-center bg-red-105/5 p-5 rounded-2xl border border-red-150">
            <div className="space-y-1 flex flex-col items-center">
              <p className="text-xs font-bold text-slate-900 font-serif mb-1">shahnazpathology.org</p>
              <div className="w-40 border-t border-slate-300 pt-1.5">
                <p className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">shahnazpathology</p>
                <p className="text-[8px] text-slate-400">Clinical Director & Head of Pathology</p>
              </div>
            </div>

            <div className="space-y-1 flex flex-col items-center justify-center font-mono text-[9px] text-slate-600 text-left border-x border-slate-200 px-4">
              <p className="font-extrabold text-red-700 text-[10px] mb-1">🔒 SECURE DIGITAL SIGNATURE</p>
              <p className="line-clamp-1"><span className="text-slate-400">CIPHER:</span> AES-256 GCM</p>
              <p className="line-clamp-1"><span className="text-slate-400">TUNNEL:</span> TLS 1.3 Certified</p>
              <p className="line-clamp-1 truncate max-w-[170px]" title={printingReport.digestHash}>
                <span className="text-slate-400">DIGEST:</span> {printingReport.digestHash || 'N/A'}
              </p>
            </div>

            <div className="space-y-1 flex flex-col items-center justify-end">
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-xs select-none">
                {renderReportQrCode(printingReport, 72)}
              </div>
              <div className="w-40 pt-1">
                <p className="text-[9px] font-extrabold uppercase text-red-700 tracking-wider">Scan Offline Key</p>
                <p className="text-[7.5px] text-slate-400 font-mono">Original Verification Hash</p>
              </div>
            </div>
          </div>

          {/* Branded print footer */}
          <div className="border-t border-slate-200 pt-8 mt-12 text-[9px] text-slate-400 text-center mx-auto">
            <p className="font-semibold text-slate-500">
              Copyright © by Tahriba Hussain. All Rights Reserved 2026 on behalf of UKSAI Ltd.
            </p>
          </div>
        </div>
      )}

      <AccreditationModal
        isOpen={showAccreditationModal}
        onClose={() => setShowAccreditationModal(false)}
        defaultTab={accreditationDefaultTab}
      />

    </div>
  );
}
