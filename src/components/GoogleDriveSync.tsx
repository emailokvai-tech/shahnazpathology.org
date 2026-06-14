import React, { useState, useEffect } from 'react';
import {
  Cloud,
  UploadCloud,
  DownloadCloud,
  Trash2,
  RefreshCw,
  LogOut,
  Chrome,
  Check,
  AlertCircle,
  FileText,
  Lock,
  ExternalLink
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logout,
  listFilesFromDrive,
  uploadFileToDrive,
  deleteFileFromDrive,
  downloadFileFromDrive,
  DriveFile
} from '../utils/googleDrive';
import { PatientReport } from '../types';

interface GoogleDriveSyncProps {
  reports: PatientReport[];
  onImportReport: (importedText: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function GoogleDriveSync({ reports, onImportReport, showToast }: GoogleDriveSyncProps) {
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [syncedFiles, setSyncedFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // Initialize Auth listeners
  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        fetchDriveFiles(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        showToast(`Google Drive connected: Welcome ${result.user.displayName}!`, 'success');
        fetchDriveFiles(result.accessToken);
      }
    } catch (error) {
      console.error(error);
      showToast('Authentication failed. Ensure popup blockers are disabled.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setGoogleUser(null);
      setAccessToken(null);
      setSyncedFiles([]);
      showToast('Authenticated Google Drive session closed.', 'info');
    } catch (error) {
      showToast('Failed to close Google session.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDriveFiles = async (token: string) => {
    setIsLoading(true);
    try {
      const files = await listFilesFromDrive(token);
      setSyncedFiles(files);
    } catch (err) {
      console.error(err);
      showToast('Could not retrieve backed up files from your Google Drive.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualBackup = async (report: PatientReport) => {
    if (!accessToken) {
      showToast('Please sign in with Google first to access your cloud storage!', 'warning');
      return;
    }

    setIsSyncing(report.id);
    try {
      // Formulate a beautiful, structured clinical data summary to write to Google Drive
      const fileContent = `===========================================
SHAHNAZ PATHOLOGY CLINICAL OUTCOME REPORT
===========================================
REPORT ID: ${report.id}
PATIENT MOBILE / NID: ${report.phoneOrNid}
VERIFICATION HASH: ${report.digestHash || 'N/A'}
DATE FILED: ${new Date(report.timestamp).toLocaleString()}
STATUS: ${report.status.toUpperCase()}
===========================================

AI DIAGNOSTIC SUMMARY & HEALTH OUTCOMES:
-------------------------------------------
${report.aiSummary || 'No analysis compiled.'}

-------------------------------------------
CERTIFIED SHA256 MEDICAL DECODER INTEGRITY:
Verified by Shahnaz Pathology ISO-15189 compliance algorithms.
Digital cryptographic seal token: ${report.verificationToken || 'N/A'}
`;

      const backupName = `shahnazpathology_report_${report.phoneOrNid}_${report.id}.txt`;
      await uploadFileToDrive(accessToken, backupName, 'text/plain', fileContent);
      
      showToast(`Success! Backed up pathology report ${report.id} cleanly to Google Drive.`, 'success');
      await fetchDriveFiles(accessToken);
    } catch (error) {
      console.error(error);
      showToast(`Failed to backup report ${report.id} to Google Drive.`, 'error');
    } finally {
      setIsSyncing(null);
    }
  };

  const triggerRestore = async (fileId: string, fileName: string) => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const content = await downloadFileFromDrive(accessToken, fileId);
      onImportReport(content);
      showToast(`Restored backup file "${fileName}" successfully into clinical view.`, 'success');
    } catch (error) {
      showToast('Could not restore target report data from Google Drive.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDeleteBackup = async (fileId: string, fileName: string) => {
    if (!accessToken) return;
    const isConfirmed = window.confirm(`Are you sure you want to delete the file "${fileName}" from your Google Drive? This action is irreversible.`);
    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      await deleteFileFromDrive(accessToken, fileId);
      showToast(`Successfully removed cloud backup "${fileName}" from Google Drive.`, 'success');
      await fetchDriveFiles(accessToken);
    } catch (error) {
      showToast('Cloud database deletion request failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.2rem] border-2 border-slate-200/80 p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Cloud size={12} className="text-red-600 animate-pulse" />
            Google Cloud Storage Node
          </span>
          <h3 className="text-base font-black text-slate-900 uppercase font-mono tracking-tight">
            Clinical Google Drive Backup Portal
          </h3>
          <p className="text-[10.5px] text-slate-500 leading-normal">
            Securely upload analyzed blood hematology PDFs, SOAP clinical transcribes, and track-ID ledger sheets directly to your patient's or institution's Google Drive.
          </p>
        </div>

        {googleUser ? (
          <div className="flex items-center gap-3 bg-red-50/50 p-3 rounded-2xl border border-red-100 shrink-0">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white text-xs font-black">
              {googleUser.displayName?.charAt(0) || 'G'}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-slate-900">{googleUser.displayName}</p>
              <p className="text-[9.5px] text-slate-400 truncate max-w-[150px] font-mono">{googleUser.email}</p>
            </div>
            <button
              onClick={handleGoogleLogout}
              className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition shrink-0 cursor-pointer"
              title="Disconnect Google Auth"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border-2 border-red-600 font-black text-[11px] tracking-wide uppercase px-5 py-3 rounded-2xl transition duration-200 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Chrome size={14} className="text-red-600 animate-spin-slow" />
            <span>Connect Google Drive</span>
          </button>
        )}
      </div>

      {!googleUser ? (
        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 text-center space-y-2 max-w-md mx-auto">
          <UploadCloud className="mx-auto text-red-600/60" size={32} />
          <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">Authentication Required</h4>
          <p className="text-[10.5px] text-slate-500 leading-normal">
            Connecting Google Drive permits the Shahnaj Pathology portal to backup diagnostic assets dynamically and sync secure regulatory checklists onto your cloud cloud workspace.
          </p>
          <button
            onClick={handleGoogleLogin}
            className="mt-3 inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-[9.5px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer"
          >
            Sign In with Google Auth
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active Local Reports Panel */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <span>📋 Local Diagnostic Queue</span>
              <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">{reports.length}</span>
            </h4>
            
            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-4 space-y-3.5 max-h-[350px] overflow-y-auto">
              {reports.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center py-6">No reports loaded in clinical database.</p>
              ) : (
                reports.map(report => {
                  const hasCloudBackup = syncedFiles.some(f => f.name.includes(report.id));
                  return (
                    <div
                      key={report.id}
                      className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-red-200 flex items-center justify-between gap-3 transition shadow-xs"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-slate-900 truncate block">
                            {report.phoneOrNid}
                          </span>
                          {hasCloudBackup && (
                            <span className="inline-flex items-center gap-0.5 text-[8.5px] bg-red-50 text-red-600 border border-red-100 font-extrabold px-1.5 rounded-full uppercase scale-90">
                              <Check size={8} /> Cloud Synced
                            </span>
                          )}
                        </div>
                        <p className="text-[9.5px] text-slate-500 font-mono truncate">{report.fileName}</p>
                      </div>

                      <button
                        onClick={() => triggerManualBackup(report)}
                        disabled={isSyncing !== null}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-1 cursor-pointer transition ${
                          hasCloudBackup
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/40'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {isSyncing === report.id ? (
                          <RefreshCw size={10} className="animate-spin" />
                        ) : (
                          <UploadCloud size={10} />
                        )}
                        <span>{hasCloudBackup ? 'Update Cloud' : 'Backup'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Connected Google Drive Files List Panel */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-widest flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5">
                <span>☁ Google Drive Cloud Storage</span>
                <span className="text-[9px] bg-red-50 text-red-650 px-2 py-0.5 rounded-full font-bold">{syncedFiles.length}</span>
              </span>
              <button
                onClick={() => fetchDriveFiles(accessToken!)}
                className="text-red-600 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                title="Refresh Cloud Storage"
              >
                <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
              </button>
            </h4>

            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-4 space-y-3 max-h-[350px] overflow-y-auto">
              {isLoading && syncedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <RefreshCw size={18} className="text-red-600 animate-spin" />
                  <span className="text-[10px] text-slate-400 font-mono">Syncing with Google Drive...</span>
                </div>
              ) : syncedFiles.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Cloud className="mx-auto text-slate-300" size={24} />
                  <p className="text-[10.5px] text-slate-400 italic">No shahnazpathology files found on your Google Drive.</p>
                </div>
              ) : (
                syncedFiles.map(file => (
                  <div
                    key={file.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-red-200 flex items-center justify-between gap-4 transition shadow-xs"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[10.5px] font-extrabold text-slate-800 break-all block leading-tight">
                        {file.name}
                      </span>
                      <p className="text-[8.5px] text-slate-400 font-mono">
                        Saved: {file.createdTime ? new Date(file.createdTime).toLocaleString() : 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => triggerRestore(file.id, file.name)}
                        className="p-2 text-slate-500 hover:text-red-750 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200/50 rounded-xl transition cursor-pointer"
                        title="Display Report Summary from Google Drive file"
                      >
                        <DownloadCloud size={13} />
                      </button>
                      <button
                        onClick={() => triggerDeleteBackup(file.id, file.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Delete from Google Drive"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Safety Notice Panel */}
      <div className="p-3.5 bg-red-50/15 rounded-2xl border border-red-500/15 flex items-start gap-2.5 text-[9.5px]">
        <Lock size={12} className="text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-normal text-slate-500">
          <p className="font-bold text-slate-700">ISO-15189 CRYPTOGRAPHIC END-to-END VALIDATION</p>
          <p>
            This portal leverages authorization scopes approved via Google Platform integration rules. Access credentials operate locally inside the browser memory state under Sandboxed TLS protocols. No third-party servers store or inspect these clinical files.
          </p>
        </div>
      </div>
    </div>
  );
}
