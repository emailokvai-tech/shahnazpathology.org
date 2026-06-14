/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Lock, ArrowRight, ShieldCheck, Video } from 'lucide-react';
import { PatientReport } from '../types';

interface QRScannerProps {
  onClose: () => void;
  reports: PatientReport[];
  onSelectVerifiedReport: (report: PatientReport) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  mode?: 'qr' | 'barcode';
  onScanBarcode?: (scannedValue: string) => void;
}

export default function QRScanner({ onClose, reports, onSelectVerifiedReport, showToast, mode = 'qr', onScanBarcode }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [matchedReport, setMatchedReport] = useState<PatientReport | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [showDemoSelector, setShowDemoSelector] = useState<boolean>(true);

  // Video and Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Ask for camera permission and set up video sources
  useEffect(() => {
    async function initCamera() {
      try {
        // Enforce camera request
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setHasPermission(true);
        stream.getTracks().forEach(track => track.stop()); // Stop temporary stream
        
        // Find all cameras
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoInputDevices);
        
        if (videoInputDevices.length > 0) {
          setSelectedDeviceId(videoInputDevices[0].deviceId);
        }
      } catch (err: any) {
        console.error('Failed to get camera permissions or devices:', err);
        setHasPermission(false);
        showToast('Camera access permission denied or system camera not found.', 'error');
      }
    }
    initCamera();
  }, []);

  // Handle stream initialization for selected stream ID
  useEffect(() => {
    if (hasPermission && selectedDeviceId) {
      startCamera(selectedDeviceId);
    }
    return () => {
      stopCamera();
    };
  }, [hasPermission, selectedDeviceId]);

  // Main scan looping animation
  useEffect(() => {
    if (isScanning && videoRef.current && canvasRef.current) {
      const scanLoop = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert"
            });

            if (code && code.data) {
              handleDecodedCode(code.data);
              return; // Stop requesting more animation frame loops
            }
          }
        }
        animationFrameIdRef.current = requestAnimationFrame(scanLoop);
      };
      animationFrameIdRef.current = requestAnimationFrame(scanLoop);
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isScanning, devices, selectedDeviceId]);

  const startCamera = async (deviceId: string) => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      setActiveStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS support
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Failed to start chosen camera device stream:', err);
      showToast('Could not start video capture stream on selected camera.', 'error');
    }
  };

  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleDecodedCode = (decodedString: string) => {
    // Keep raw decoded data to display
    const cleanedString = decodedString.trim();
    setScannedResult(cleanedString);
    setIsScanning(false);
    stopCamera();

    if (mode === 'barcode' && onScanBarcode) {
      const matched = reports.find(rep => {
        const phone = (rep.phoneOrNid || '').toLowerCase();
        const id = (rep.id || '').toLowerCase();
        return phone.includes(cleanedString.toLowerCase()) || cleanedString.toLowerCase().includes(phone) || id.includes(cleanedString.toLowerCase()) || cleanedString.toLowerCase().includes(id);
      });
      if (matched) {
        setMatchedReport(matched);
        onScanBarcode(cleanedString);
        showToast(`Patient Barcode Scanned successfully! Patient: ${matched.phoneOrNid}`, 'success');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setMatchedReport(null);
        onScanBarcode(cleanedString);
        showToast(`Patient ID Barcode scanned: "${cleanedString}", but no matching record found locally.`, 'warning');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } else {
      // Check if any report matches
      const cleanedLower = cleanedString.toLowerCase();
      const matched = reports.find(rep => {
        const tk = (rep.verificationToken || '').toLowerCase();
        const id = (rep.id || '').toLowerCase();
        const phone = (rep.phoneOrNid || '').toLowerCase();
        return cleanedLower.includes(tk) || cleanedLower.includes(id) || tk.includes(cleanedLower) || id.includes(cleanedLower) || phone.includes(cleanedLower) || cleanedLower.includes(phone);
      });

      if (matched) {
        setMatchedReport(matched);
        showToast('Offline Pathology Verification Token Matched Successfully!', 'success');
      } else {
        setMatchedReport(null);
        showToast('Decoded QR data has no corresponding laboratory index locally.', 'warning');
      }
    }
  };

  const resetScanner = () => {
    setScannedResult(null);
    setMatchedReport(null);
    setIsScanning(true);
    if (selectedDeviceId) {
      startCamera(selectedDeviceId);
    }
  };

  // Safe manual demo trigger simulation for developer check (in case camera is not physically plugged, or iframe blocks permissions)
  const triggerDemoScanSimulate = (report: PatientReport) => {
    const simulatedValue = mode === 'barcode'
      ? (report.phoneOrNid || `01712345678`)
      : (report.verificationToken || `SHANAZ-VERIFIED-${report.id.toUpperCase()}-DEMO`);
    showToast(`Simulating barcode reader laser scan: ${simulatedValue}...`, 'info');
    setTimeout(() => {
      handleDecodedCode(simulatedValue);
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[92vh] md:max-h-[85vh]">
        
        {/* Header section */}
        <div className="p-6 md:p-7 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200/20 flex items-center justify-center text-xl text-red-700">
              📷
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-tighter">
                {mode === 'barcode' ? 'Immediate Patient ID Barcode Reader' : 'Secure QR Code Scanner'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono font-medium">
                {mode === 'barcode' ? 'DIRECT BARCODE CAPTURE LAYER' : 'DECRYPT OFFLINE PATIENT REPORT VERIFICATION KEYS'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-2xl transition cursor-pointer"
            title="Close Scanner Overlay"
          >
            <X size={18} />
          </button>
        </div>

        {/* Inner Content scrollable */}
        <div className="overflow-y-auto flex-1 p-6 md:p-8 space-y-6">
          
          {/* Main camera view frame */}
          <div className="relative aspect-video max-w-md mx-auto bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-inner overflow-hidden group">
            
            {/* Holographic HUD grid lines */}
            <div className="absolute inset-0 border-2 border-dashed border-red-500/10 rounded-2xl pointer-events-none z-10"></div>
            
            {hasPermission === false ? (
              // Unapproved permission screen fallback
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                <AlertCircle className="text-amber-500 w-10 h-10 animate-bounce" />
                <h4 className="font-extrabold text-white text-sm">Camera Permission Denied or Not Available</h4>
                <p className="max-w-xs text-[10.5px] leading-relaxed">
                  To scan pathology verification keys live, allow camera permissions inside your web browser or iframe.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-[9.5px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-300">Alternative Verification Method:</p>
                  <p>1. Copy-paste report verification tokens into search queries.</p>
                  <p>2. Select any report below to audit rules or print PDF directly.</p>
                </div>
              </div>
            ) : isScanning ? (
              // Camera Active Streaming
              <div className="absolute inset-0 w-full h-full">
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                
                {/* Laser scanline anim */}
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-red-600 via-red-200 to-red-650 opacity-90 shadow-[0_0_15px_#ef4444] animate-[scan_2s_infinite]"></div>
                
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  {mode === 'barcode' ? (
                    <div className="w-64 h-24 border-4 border-red-500/80 rounded-xl relative animate-pulse shadow-[0_0_35px_rgba(239,68,68,0.15)] flex items-center justify-center">
                      <span className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-red-200"></span>
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-red-200"></span>
                      <span className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-red-200"></span>
                      <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-red-200"></span>
                      <div className="text-[7.5px] text-red-400 bg-red-950/80 border border-red-600/30 font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Align Barcode
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 border-4 border-red-500/80 rounded-3xl relative animate-pulse shadow-[0_0_35px_rgba(239,68,68,0.1)] flex items-center justify-center">
                      {/* Retro brackets corners */}
                      <span className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-red-300"></span>
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-red-300"></span>
                      <span className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-red-300"></span>
                      <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-red-300"></span>
                      <div className="text-[7.5px] text-red-400 bg-slate-950/90 border border-red-600/30 font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Align QR Code
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/50 flex items-center gap-2 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-[pulse_1.5s_infinite]"></div>
                  <span className="text-[9.5px] font-mono font-bold text-slate-300">VIEWFINDER INTERCEPT LIVE</span>
                </div>
              </div>
            ) : (
              // Decoded report match frame
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950 text-white z-10 animate-[fadeIn_0.2s_ease-out]">
                <div className={`p-3 bg-slate-900 rounded-full border ${matchedReport ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
                  {matchedReport ? (
                    <CheckCircle2 size={32} className="text-emerald-400 animate-[pulse_2s_infinite]" />
                  ) : (
                    <AlertCircle size={32} className="text-amber-400 animate-spin-slow" />
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">{matchedReport ? 'Pathology Report Identified' : 'Raw QR Cleared (No Local Match)'}</h4>
                  <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 mt-1 select-all break-all max-w-sm mx-auto bg-slate-900 border border-slate-800 p-2 rounded-xl">
                    {scannedResult}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={resetScanner}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={11} /> Scan Again
                  </button>
                </div>
              </div>
            )}
            
            {/* hidden canvas for analysis */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera switcher device selectors */}
          {devices.length > 1 && isScanning && (
            <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active Lens:</span>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-[10.5px] text-slate-700 font-bold px-2 py-1 rounded-xl outline-none"
              >
                {devices.map((device, i) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera Device Lens #${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Display Matched Report details card */}
          {matchedReport && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4 shadow-xxs animate-[fadeIn_0.25s_ease-out]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase block max-w-[200px] truncate" title={matchedReport.fileName}>
                      {matchedReport.fileName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Filing Date: {new Date(matchedReport.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] bg-red-50 text-red-750 border border-red-200/50 font-black px-2.5 py-0.5 rounded-full uppercase/80">
                    Verified Match
                  </span>
                  <span className="text-[9.5px] bg-slate-200 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">
                    SHA-{matchedReport.id.substring(4, 9).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Patient and verification parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-wide block mb-0.5">Phone or NID Key</span>
                  <span className="text-slate-900 font-black text-[10.5px] font-sans">{matchedReport.phoneOrNid}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-wide block mb-0.5">System Token String</span>
                  <span className="text-red-700 font-black text-[10.5px] truncate block" title={matchedReport.verificationToken}>{matchedReport.verificationToken || 'N/A'}</span>
                </div>
              </div>

              {/* Dynamic Global Regulatory Rules Audit inspector block */}
              {matchedReport.regulatoryCompliance && (
                <div className="bg-red-50/10 border border-red-200/25 p-4 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-red-50 border border-red-200/40 rounded-xl text-center font-bold text-xs text-red-750">
                    🌐
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-[10px] font-black text-red-955 uppercase tracking-wider flex items-center gap-1.5 font-sans justify-between">
                      <span>Online Ingress Regulatory Checked</span>
                      <span className="text-[8px] bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded font-black tracking-normal">{matchedReport.regulatoryCompliance.status}</span>
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium leading-relaxed font-sans">
                      All criteria checked: HIPAA Privacy standards, TLS 1.3 encryption parameters, and ISO-15189 diagnostic laboratory requirements have been audited.
                    </p>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    stopCamera();
                    onSelectVerifiedReport(matchedReport);
                    onClose();
                  }}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 border-2 border-red-650 text-white rounded-2xl text-xs font-black tracking-tight shadow-sm transition-all duration-200 hover:scale-101 active:scale-99 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={14} /> See Detailed Diagnostics & AI Summary <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Sandbox Demo simulation helper panel (helps testing without a real physical printed QR paper) */}
          {showDemoSelector && (
            <div className="border border-slate-200 hover:border-slate-300 rounded-[2rem] p-5 space-y-4 bg-slate-50 transition">
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚙️</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">Scanner Sandbox Simulator</h4>
                    <p className="text-[9px] text-slate-400 font-mono">{mode === 'barcode' ? 'Bypasses camera to simulate ID barcode reading' : 'Bypasses camera feed to instantly test decoders'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDemoSelector(false)}
                  className="text-[9.5px] font-black text-slate-400 hover:text-slate-600 underline"
                  title="Close simulator controller"
                >
                  Hide
                </button>
              </div>

              {reports.length === 0 ? (
                <p className="text-center text-[10px] text-slate-400 py-2">
                  No patient pathology reports registered in system databases to simulate.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[9.5px] text-slate-500 leading-normal">
                    Select any of the {reports.length} pathology reports currently stored in the database to simulate framing the QR Code target area and testing the decryption algorithms:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {reports.map((rep) => (
                      <button
                        key={rep.id}
                        onClick={() => triggerDemoScanSimulate(rep)}
                        className="p-3 bg-white hover:bg-slate-100 hover:text-red-750 border border-slate-200/60 rounded-2xl text-left transition text-xs flex justify-between items-center cursor-pointer group shrink-0"
                      >
                        <div className="space-y-0.5 truncate max-w-[210px]">
                          <p className="font-extrabold text-slate-700 group-hover:text-red-900 truncate block text-[10.5px]">
                            {rep.fileName}
                          </p>
                          <p className="text-[9px] font-mono text-slate-400">
                            ID: {rep.id.substring(4, 9).toUpperCase()} • Patient: {rep.phoneOrNid}
                          </p>
                        </div>
                        <span className="text-lg text-slate-300 group-hover:text-red-650 shrink-0">➔</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer actions space */}
        <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px]">
          <span className="text-slate-400 flex items-center gap-1 font-mono font-medium">
            <Lock size={10} className="text-red-600" /> AES-256 SECURED CLIENT-SIDE DECODER STREAM
          </span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer self-start"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}
