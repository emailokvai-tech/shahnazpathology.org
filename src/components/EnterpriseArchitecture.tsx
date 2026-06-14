/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  Lock,
  Unlock,
  Server,
  Cpu,
  Shield,
  Activity,
  CheckCircle,
  TrendingUp,
  Terminal,
  Sliders,
  FileText,
  Wifi,
  Settings,
  Play,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Download,
  Check,
  Code
} from 'lucide-react';
import { renderMarkdown } from '../utils';

// Core interface definitions for specs
interface Microservice {
  id: number;
  name: string;
  plane: 'Mechanical' | 'Cognitive' | 'Lifecycle' | 'Audit';
  responsibility: string;
  protocol: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  threads: number;
  latency: number;
}

interface DBTable {
  name: string;
  description: string;
  columns: { name: string; type: string; key?: string; crypto?: string; desc: string }[];
}

export default function EnterpriseArchitecture({ showToast }: { showToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  // 1. Navigation / Sub-tabs inside Spec Panel
  const [subTab, setSubTab] = useState<'topology' | 'db' | 'crypto' | 'stack' | 'compliance'>('topology');

  // --- 1. MICROSERVICES STATE ---
  const [services, setServices] = useState<Microservice[]>([
    { id: 1, name: 'Accessioning Service', plane: 'Mechanical', responsibility: 'Patient intake, specimen registration, clinical case creation', protocol: 'gRPC + REST', status: 'ACTIVE', threads: 12, latency: 15 },
    { id: 2, name: 'Barcode Service', plane: 'Mechanical', responsibility: 'Generate/validate GS1 DataMatrix barcodes, bind to specimen IDs', protocol: 'gRPC', status: 'ACTIVE', threads: 8, latency: 6 },
    { id: 3, name: 'POS / Financial Gate', plane: 'Mechanical', responsibility: 'Payment processing, invoice generation, payment-status ledger', protocol: 'REST + Webhooks', status: 'ACTIVE', threads: 16, latency: 110 },
    { id: 4, name: 'Hardware Lock Controller', plane: 'Mechanical', responsibility: 'Cryptographic hardware enable/disable signals to physical scanners & printers', protocol: 'gRPC + MQTT', status: 'ACTIVE', threads: 24, latency: 8 },
    { id: 5, name: 'WSI Scanner Controller', plane: 'Mechanical', responsibility: 'Orchestrate scan jobs, ingest raw .SVS/.NDPI tiling slices, DICOMize', protocol: 'gRPC + DICOM DIMSE', status: 'ACTIVE', threads: 32, latency: 45 },
    { id: 6, name: 'QC Engine', plane: 'Cognitive', responsibility: 'Focus quality scoring, tissue edge detection, stain normalization assessment', protocol: 'gRPC (internal)', status: 'ACTIVE', threads: 16, latency: 180 },
    { id: 7, name: 'AI Inference & Triage', plane: 'Cognitive', responsibility: 'Primary biomarker heatmaps, ROI bounding boxes, tumor quantification', protocol: 'gRPC + Async Tasks', status: 'ACTIVE', threads: 48, latency: 320 },
    { id: 8, name: 'Diagnostics Dashboard', plane: 'Cognitive', responsibility: 'Zero-footprint DICOM viewer, case worklist, multi-stain overlay engine', protocol: 'WebSocket + REST', status: 'ACTIVE', threads: 40, latency: 24 },
    { id: 9, name: 'Crypto Sign-out Service', plane: 'Cognitive', responsibility: 'ECDSA/EdDSA digital signature, tamper-proof synoptic PDF report sealer', protocol: 'gRPC', status: 'ACTIVE', threads: 12, latency: 14 },
    { id: 10, name: 'Tiered Storage Orchestrator', plane: 'Lifecycle', responsibility: 'Policy-driven data migration across Hot, Warm, Cold and Glacier tiers', protocol: 'Async Workers', status: 'ACTIVE', threads: 10, latency: 85 },
    { id: 11, name: 'Patient Portal', plane: 'Lifecycle', responsibility: 'Secure patient medical record sharing, report download, consent management', protocol: 'REST + OAuth2', status: 'ACTIVE', threads: 20, latency: 42 },
    { id: 12, name: 'Audit & Compliance Ledger', plane: 'Lifecycle', responsibility: 'Immutable append-only unified audit logs, HIPAA access tracking', protocol: 'Event-sourced', status: 'ACTIVE', threads: 8, latency: 5 },
  ]);

  const [selectedService, setSelectedService] = useState<Microservice | null>(services[3]);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([
    `[INFO] ${new Date().toISOString()} - Kong Gateway authenticated.`,
    `[INFO] ${new Date().toISOString()} - mTLS channel verified for all planes.`,
    `[OK] ${new Date().toISOString()} - Heartbeat received from all 12 microservices.`
  ]);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  const triggerServicePing = (serviceName: string) => {
    setIsDiagnosticRunning(true);
    setDiagnosticsLogs((prev) => [...prev, `[CMD] Pinging ${serviceName}...`]);
    
    setTimeout(() => {
      const updateServices = services.map(s => {
        if (s.name === serviceName) {
          return { ...s, latency: Math.floor(Math.random() * s.latency * 0.4) + Math.floor(s.latency * 0.8), threads: s.threads + (Math.random() > 0.5 ? 1 : -1) };
        }
        return s;
      });
      setServices(updateServices);
      setDiagnosticsLogs((prev) => [
        ...prev,
        `[OK] ${serviceName} responded in ${updateServices.find(s => s.name === serviceName)?.latency}ms. Threads active: ${updateServices.find(s => s.name === serviceName)?.threads}.`,
        `[HEALTH] Cryptographic security status for ${serviceName}: SECURE.`
      ]);
      setIsDiagnosticRunning(false);
      showToast(`${serviceName} diagnostic completed successfully!`, 'success');
    }, 600);
  };

  const reRangeAllDiagnosticPings = () => {
    setIsDiagnosticRunning(true);
    setDiagnosticsLogs((prev) => [...prev, `[MGMT] Initializing complete cluster diagnostic suite...`]);
    setTimeout(() => {
      const newServices = services.map(s => ({
        ...s,
        latency: Math.max(2, Math.floor(s.latency * (0.8 + Math.random() * 0.4))),
        status: Math.random() > 0.98 ? 'MAINTENANCE' as const : 'ACTIVE' as const
      }));
      setServices(newServices);
      setDiagnosticsLogs((prev) => [
        ...prev,
        `[OK] Cluster telemetry recheck done. Citus DB state: ACTIVE.`,
        `[AUDIT] Integrity hash check passed: SHA-256 matches architecture v1.0 spec.`
      ]);
      setIsDiagnosticRunning(false);
      showToast('Enterprise cluster mesh diagnostic synced.', 'success');
    }, 1200);
  };


  // --- 2. DATABASE ERD STATE ---
  const dbTables: DBTable[] = [
    {
      name: 'patient',
      description: 'Stores medical profile identifiers. Columns containing PII identifiers are cryptographically encrypted via AES-256-GCM prior to storage to guarantee HIPAA compliance.',
      columns: [
        { name: 'patient_id', type: 'uuid', key: 'PK', desc: 'Secure random primary record key' },
        { name: 'encrypted_name', type: 'bytea', crypto: 'AES-256-GCM', desc: 'Patient name cipher text' },
        { name: 'encrypted_dob', type: 'bytea', crypto: 'AES-256-GCM', desc: 'Patient date of birth cipher text' },
        { name: 'mrn', type: 'varchar', key: 'UK', desc: 'Unique Medical Record Identifier' },
        { name: 'encrypted_phone', type: 'bytea', crypto: 'AES-256-GCM', desc: 'Phone contact cipher text' },
        { name: 'encrypted_email', type: 'bytea', crypto: 'AES-256-GCM', desc: 'Email identifier cipher text' },
        { name: 'gender', type: 'varchar', desc: 'Clinical gender designation' },
        { name: 'demographics_ext', type: 'jsonb', desc: 'Unstructured auxiliary demographic variables' },
        { name: 'created_at', type: 'timestamptz', desc: 'DateTime of system accession record genesis' },
        { name: 'valid_range', type: 'tsrange', desc: 'Bi-temporal temporal validity constraint range' }
      ]
    },
    {
      name: 'clinical_order',
      description: 'Central clinical requisition ledger matching medical specimens to pathology workflows, tracking prioritized diagnostic progress.',
      columns: [
        { name: 'order_id', type: 'uuid', key: 'PK', desc: 'Requisition primary key' },
        { name: 'patient_id', type: 'uuid', key: 'FK', desc: 'Reference to patient table' },
        { name: 'accession_number', type: 'varchar', key: 'UK', desc: 'Format: SPL-YYYYMMDD-NNNN' },
        { name: 'order_status', type: 'varchar', desc: 'REGISTERED | PAID | SCANNING | QC | AI_TRIAGE | REVIEW | SIGNED_OUT' },
        { name: 'clinical_indication', type: 'varchar', desc: 'Physician shorthand diagnosis objective' },
        { name: 'ordering_physician', type: 'varchar', desc: 'Requester clinician name and license ID' },
        { name: 'specimen_type', type: 'varchar', desc: 'Biopsy, Cytology, or Surgical classification' },
        { name: 'priority', type: 'smallint', desc: '1=STAT, 2=Rush, 3=Routine' },
        { name: 'ordered_at', type: 'timestamptz', desc: 'Ordering requisition timestamp' }
      ]
    },
    {
      name: 'specimen',
      description: 'Physical organic glass slides or blocks tracking fixative preservation timeline and processing, sectioning, or staining phases.',
      columns: [
        { name: 'specimen_id', type: 'uuid', key: 'PK', desc: 'Physical specimen index key' },
        { name: 'order_id', type: 'uuid', key: 'FK', desc: 'Associated requisition order relationship' },
        { name: 'specimen_label', type: 'varchar', desc: 'Glass slide reference nomenclature label' },
        { name: 'tissue_site', type: 'varchar', desc: 'Anatomical site coded with SNOMED CT terminology' },
        { name: 'fixation_type', type: 'varchar', desc: 'Formalin, Fresh fluid, or Frozen section' },
        { name: 'collection_time', type: 'timestamptz', desc: 'DateTime of operational extraction' },
        { name: 'status', type: 'varchar', desc: 'ACCESSIONED | PROCESSING | EMBEDDED | SECTIONED | STAINED | SCANNED' }
      ]
    },
    {
      name: 'barcode',
      description: 'Stores GS1 compliant DataMatrix binary label images linking physically printed clinical labels to internal database assets.',
      columns: [
        { name: 'barcode_id', type: 'uuid', key: 'PK', desc: 'Barcode record key' },
        { name: 'specimen_id', type: 'uuid', key: 'UK/FK', desc: '1:1 Specimen link mapping constraint' },
        { name: 'barcode_value', type: 'varchar', key: 'UK', desc: 'Payload text matching GS1 standards' },
        { name: 'barcode_image', type: 'bytea', desc: 'PNG byte array of printed barcode marker matrix' },
        { name: 'is_printed', type: 'boolean', desc: 'Flag indicating successful Zebra thermal dispatch' }
      ]
    },
    {
      name: 'payment',
      description: 'Core financial database for the POS system. Direct transactional state controls the cryptographic hardware unlock pipeline.',
      columns: [
        { name: 'payment_id', type: 'uuid', key: 'PK', desc: 'Payment receipt unique hash' },
        { name: 'order_id', type: 'uuid', key: 'UK/FK', desc: '1:1 Requisition mapping validator' },
        { name: 'amount_due', type: 'numeric(12,2)', desc: 'Requisition balance invoice ledger' },
        { name: 'amount_paid', type: 'numeric(12,2)', desc: 'POS direct collected currency volume' },
        { name: 'payment_status', type: 'varchar', desc: 'PENDING | PARTIAL | PAID | REFUNDED | WAIVED' },
        { name: 'transaction_ref', type: 'varchar', key: 'UK', desc: 'External gate ref (bKash/Nagad/Card)' },
        { name: 'pos_receipt_hash', type: 'bytea', desc: 'SHA-256 integrity seal for accounting audits' }
      ]
    },
    {
      name: 'hardware_lock_state',
      description: 'Physical lock control mechanism tracking live unlock status, HMAC token lifecycle, and scan constraints.',
      columns: [
        { name: 'lock_id', type: 'uuid', key: 'PK', desc: 'Hardware lock instance key' },
        { name: 'payment_id', type: 'uuid', key: 'UK/FK', desc: 'Reference linking POS payment' },
        { name: 'order_id', type: 'uuid', key: 'FK', desc: 'Associated clinical case identifier' },
        { name: 'scanner_unlocked', type: 'boolean', desc: 'Active hardware relay state override flag' },
        { name: 'printer_unlocked', type: 'boolean', desc: 'Physical printer queue block status' },
        { name: 'lock_reason', type: 'varchar', desc: 'UNPAID | MAINTENANCE | FRAUD_HOLD' },
        { name: 'lock_token', type: 'bytea', desc: 'HMAC-SHA256 authenticated unlock key' },
        { name: 'token_expires_at', type: 'timestamptz', desc: 'Strict TTL (default: 300 seconds)' }
      ]
    },
    {
      name: 'wsi_image',
      description: 'Large gigapixel Whole Slide Imaging metadata tracking files sizes, resolution tiles, stain types and S3 cloud storage paths.',
      columns: [
        { name: 'image_id', type: 'uuid', key: 'PK', desc: 'WSI image record key' },
        { name: 'specimen_id', type: 'uuid', key: 'FK', desc: 'Source slide index relation' },
        { name: 'dicom_study_uid', type: 'varchar', key: 'UK', desc: 'International standard study UID' },
        { name: 'original_format', type: 'varchar', desc: 'Leica SVS, Hamamatsu NDPI, or DICOM structure' },
        { name: 'file_size_bytes', type: 'bigint', desc: 'Tiled file volume index (typically 2GB - 15GB)' },
        { name: 'max_magnification', type: 'smallint', desc: 'Optical magnification index: 20 | 40 | 60' },
        { name: 'stain_type', type: 'varchar', desc: 'Examples: H&E, IHC_KI67, IHC_HER2, PAS, Trichrome' },
        { name: 'storage_path', type: 'varchar', desc: 'Enterprise S3 secure storage cluster path' }
      ]
    }
  ];

  const [selectedDBTable, setSelectedDBTable] = useState<DBTable>(dbTables[5]);
  const [dbQueryText, setDbQueryText] = useState<string>(
    `SELECT h.lock_id, h.scanner_unlocked, p.payment_status, p.amount_paid 
FROM hardware_lock_state h 
JOIN payment p ON h.payment_id = p.payment_id 
LIMIT 3;`
  );
  const [queryOutput, setQueryOutput] = useState<any[]>([
    { lock_id: 'a8b12f6c-829d-4be9-9833-28eff75b6a7a', scanner_unlocked: true, payment_status: 'PAID', amount_paid: '4,500.00 BDT' },
    { lock_id: 'cf669bda-fc78-4309-8809-5431ad2bde35', scanner_unlocked: false, payment_status: 'PENDING', amount_paid: '0.00 BDT' },
    { lock_id: '81ef93ad-e56d-49ff-bd3a-e95e8eb9fcc3', scanner_unlocked: true, payment_status: 'WAIVED', amount_paid: '0.00 BDT' }
  ]);
  const [isQueryExecuting, setIsQueryExecuting] = useState(false);

  const executeSimulatedQuery = () => {
    setIsQueryExecuting(true);
    setTimeout(() => {
      // Simulate direct PostgreSQL query outputs based on what table is selected
      const table = selectedDBTable.name;
      let mockResults: any[] = [];
      
      if (table === 'patient') {
        mockResults = [
          { patient_id: 'p7a12b3e', encrypted_name0: '\\x78f2aa9d0e12...', encrypted_dob: '\\x039bcda8821...', mrn: 'MRN-2026-90432', gender: 'F' },
          { patient_id: 'p90bfde3', encrypted_name0: '\\x09923aacd872...', encrypted_dob: '\\xf812cc0a12e...', mrn: 'MRN-2026-11843', gender: 'M' }
        ];
      } else if (table === 'clinical_order') {
        mockResults = [
          { order_id: 'o12bca09', patient_id: 'p7a12b3e', accession_number: 'SPL-20260526-0034', order_status: 'PAID', priority: 1 },
          { order_id: 'o99efdc2', patient_id: 'p90bfde3', accession_number: 'SPL-20260526-0035', order_status: 'REVIEW', priority: 3 }
        ];
      } else if (table === 'specimen') {
        mockResults = [
          { specimen_id: 's091bca7', specimen_label: 'SPL-0034_SLIDE_1', tissue_site: 'SNOMED-60423 (Breast)', fixation_type: 'Formalin' },
          { specimen_id: 's412bc99', specimen_label: 'SPL-0035_SLIDE_1', tissue_site: 'SNOMED-11802 (Lymph)', fixation_type: 'Frozen' }
        ];
      } else if (table === 'payment') {
        mockResults = [
          { payment_id: 'pay-001', amount_due: '3,800.00 BDT', amount_paid: '3,800.00 BDT', payment_status: 'PAID', transaction_ref: 'BKASH-924823' },
          { payment_id: 'pay-002', amount_due: '7,500.00 BDT', amount_paid: '0.00 BDT', payment_status: 'PENDING', transaction_ref: 'null' }
        ];
      } else if (table === 'hardware_lock_state') {
        mockResults = [
          { lock_id: 'l-04123a', scanner_unlocked: true, printer_unlocked: true, lock_reason: 'PAID', token_expires_at: '2026-06-06 12:44:02' },
          { lock_id: 'l-90412e', scanner_unlocked: false, printer_unlocked: false, lock_reason: 'UNPAID', token_expires_at: 'null' }
        ];
      } else {
        mockResults = [
          { id: 'rec-001', query_status: 'OK', records_scanned: 142, index_utilization: '100% (idx_payment_order)' }
        ];
      }
      
      setQueryOutput(mockResults);
      setIsQueryExecuting(false);
      showToast(`Query completed in 14ms! Indexes utilized: TRUE.`, 'success');
    }, 450);
  };


  // --- 3. CRYPTOGRAPHIC HARDWARE LOCK SIMULATION ---
  const [simSpecimens] = useState([
    { barcode: 'SPL-20260526-0034', patientId: 'Patient 904321', testType: 'Breast Biopsy Core', payment: 'PAID', cost: 4500 },
    { barcode: 'SPL-20260526-0035', patientId: 'Patient 118432', testType: 'Lymph Node IHC', payment: 'PENDING', cost: 7500 },
    { barcode: 'SPL-20260601-0001', patientId: 'Patient 502842', testType: 'Thyroid Aspiration', payment: 'PAID', cost: 3800 },
    { barcode: 'SPL-20260601-0002', patientId: 'Patient 339482', testType: 'Skin Shave Biopsy H&E', payment: 'PENDING', cost: 2400 },
  ]);

  const [activeSimSpecimen, setActiveSimSpecimen] = useState(simSpecimens[1]); // DEFAULT PENDING to showcase lock first
  const [deviceRotatingSecret, setDeviceRotatingSecret] = useState('PATHOLOGY_KEY_595319894384_ROTATING');
  const [hardwareLockLogs, setHardwareLockLogs] = useState<string[]>([
    `[SYS-HW] Hardware lock controller initializes on Leica Aperio GT 450 (Device: GT450_BD_01)`,
    `[SYS-HW] Current mechanical status: SECURED & ENFORCED 🔴`,
    `[SYS-HW] Ready for specimen DataMatrix barcode trigger...`
  ]);

  const [scannerRelayState, setScannerRelayState] = useState<'LOCKED' | 'UNLOCKED'>('LOCKED');
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [generatedHmacToken, setGeneratedHmacToken] = useState<string>('');

  const handleSetSimSpecimenPayment = (status: 'PAID' | 'PENDING') => {
    setActiveSimSpecimen(prev => ({ ...prev, payment: status }));
    showToast(`Specimen ${activeSimSpecimen.barcode} payment status adjusted manually to ${status}`, 'info');
  };

  const executeCryptographicLockSimulationReceipt = () => {
    setHardwareLockLogs(prev => [
      ...prev,
      `--- START TRANSACTION RELAY PIPELINE ---`,
      `[STEP 1] Barcode scanned from glass slide: "${activeSimSpecimen.barcode}"`,
      `[STEP 2] Accessioning database lookup binding order. Associated specimen record tied.`,
      `[STEP 3] POS Server relational integrity inquiry... querying table "payment" where order_id matching...`
    ]);

    setTimeout(() => {
      if (activeSimSpecimen.payment === 'PENDING') {
        setScannerRelayState('LOCKED');
        setHardwareLockLogs(prev => [
          ...prev,
          `[STEP 4] INVOICE DETECTED UNPAID. Balance core outstanding: ${activeSimSpecimen.cost}.00 BDT`,
          `[LOCK-ENFORCED 🔴] Relational trigger rejected! Lock relational mapping state remains FALSE.`,
          `[SYS-CRIT] Leica Scanner Device blocked! Terminal response sent: "⚠ UNPAID REQUISITION DETECTED. SCANNER MOUNT TERMINATED. CONTACT CASHIER."`,
          `[AUDIT] Action logged to change_log. Security violation counter: 0.`
        ]);
        showToast('Scanning Denied: Specimen Invoice remains unpaid!', 'error');
      } else {
        // Generate simulated true HMAC
        const nonce = Math.random().toString(16).substring(3, 19).toUpperCase();
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const msg = `${activeSimSpecimen.barcode}|GT450_BD_01|${timestamp}|${nonce}`;
        const mockHmacTag = 'HMAC-SHA256:' + btoa(msg + deviceRotatingSecret).substring(0, 32).toUpperCase();
        setGeneratedHmacToken(mockHmacTag);

        setHardwareLockLogs(prev => [
          ...prev,
          `[STEP 4] PAYMENT VERIFIED. Ledger confirmed fully paid. Transaction: BKASH-TX-${Math.floor(Math.random() * 900000 + 100000)}`,
          `[STEP 5] Generating single-use cryptographic verification unlock token:`,
          `         - Nonce: 0x${nonce}`,
          `         - Device Rotating Secret Key: "${deviceRotatingSecret.substring(0, 16)}..."`,
          `         - Computed tag: ${mockHmacTag}`,
          `[STEP 6] Saving HMAC token payload constraint into state: "hardware_lock_state" (TTL Bound: 300 seconds!)`,
          `[STEP 7] Dispatched command group UNLOCK via MQTT broker (Topic: /scanners/GT450_BD_01/commands, QoS: 2)`,
          `[FIRMWARE 🟢] Scanner embedded controller verifying token packet...`,
          `[FIRMWARE 🟢] CRYPTO_memcmp() executed against persistent device hardware secret keys... MATCH confirmed!`,
          `[STATE-UNLOCK 🟢] Scanner mechanical safety clamp released. GT450_BD_01 status: UNLOCKED.`
        ]);

        setScannerRelayState('UNLOCKED');
        showToast('Cryptographic relay unlocked! Safe scanning initialized.', 'success');
      }
    }, 1000);
  };

  const startTilingScanningSimulation = () => {
    if (scannerRelayState === 'LOCKED') {
      showToast('Scanner physically locked. Payment authentication required.', 'error');
      return;
    }
    setIsScanningActive(true);
    setScanProgress(0);
    setHardwareLockLogs(prev => [
      ...prev,
      `[SCANNER] Glass loading elevator engaged. Slicing whole slide into gigapixel tile arrays...`
    ]);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningActive(false);
          setScannerRelayState('LOCKED');
          setHardwareLockLogs(prevLogs => [
            ...prevLogs,
            `[SCANNER] Tiled scan successful! Ingested raw .SVS formatted tissue segment. Total size: 4.82 GB (DICOM compliant).`,
            `[STEP 8] Single-use TTL token invalidated. Auto-locking device to safeguard assets...`,
            `[STATE-LOCK 🔴] Leica clamp engaged. Relocating slide to completed rack queue.`,
            `[EVENT] Emitting "ScanComplete" notification payload to NATS JetStream bus.`
          ]);
          showToast('Slide rendering complete. Auto-lock re-engaged!', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };


  // --- 4. TECHNOLOGY STACK & SLIDER PROJECTIONS ---
  const [weeklyCases, setWeeklyCases] = useState<number>(1200);
  const [slideResolution, setSlideResolution] = useState<'20x' | '40x' | '60x'>('40x');
  const [retentionYears, setRetentionYers] = useState<number>(5);

  const getSlideSize = () => {
    if (slideResolution === '20x') return 1.5; // GB
    if (slideResolution === '40x') return 5.0; // GB
    return 12.0; // GB (60x)
  };

  // Compute storage volumes
  const totalRawIncomingTBAnyWeek = (weeklyCases * getSlideSize()) / 1000;
  const hotStorageTB = totalRawIncomingTBAnyWeek * 12.8; // 90 days hot
  const warmStorageTB = totalRawIncomingTBAnyWeek * 52; // 1 year warm
  const coldStorageTB = totalRawIncomingTBAnyWeek * 52 * (Math.min(retentionYears, 5) - 1);
  const deepArchiveTB = retentionYears > 5 ? totalRawIncomingTBAnyWeek * 52 * (retentionYears - 5) : 0;

  // Costs (matching high-level S3 estimates per-TB-month: Hot $40/TB, Warm $12.50/TB, Cold $4.00/TB, Deep $1.00/TB)
  const monthlyHotCost = hotStorageTB * 22;
  const monthlyWarmCost = warmStorageTB * 8.5;
  const monthlyColdCost = coldStorageTB * 2.50;
  const monthlyDeepCost = deepArchiveTB * 0.95;
  const totalMonthlyStorageCostBD = (monthlyHotCost + monthlyWarmCost + monthlyColdCost + monthlyDeepCost) * 117.5; // BDT exchange price


  // --- 5. COMPLIANCE ASSESSOR STATE ---
  const [complianceChecks, setComplianceChecks] = useState([
    { id: '1', standard: 'HIPAA Encryption at Rest (164.312)', item: 'AES-256-GCM symmetric byte encryption configured for Patient PII table columns', status: true },
    { id: '2', standard: 'HIPAA Integrity Auditing (164.312)', item: 'Append-only audit ledger database database trigger writing to audit.change_log schema', status: true },
    { id: '3', standard: 'GDPR Right to Erasure', item: 'Bi-temporal temporal range ranges (tsrange) utilizing cascade cleanup capabilities', status: true },
    { id: '4', standard: 'GDPR Data Portability', item: 'DICOM web-streaming (WADO-RS) image export protocol support enabled', status: true },
    { id: '5', standard: 'CAP/CLIA Pathology Reporting', item: 'Strict Structured synoptic data structures matching modern CAP checklists', status: true },
    { id: '6', standard: 'Non-Repudiation Security', item: 'EdDSA Ed25519 cryptographic signatures protecting signed pathological files', status: true },
    { id: '7', standard: 'BM&DC Practitioner Code (Rule 11.2)', item: 'Mandatory double-blind clinical authentication and digital signature validation of BM&DC registered pathologists on all profiles', status: true },
    { id: '8', standard: 'WHO ICD-11 Diagnostic Framework', item: 'Standardized terminology mapping of clinical indices and pathological diagnoses with ICD-11 classifications', status: true },
    { id: '9', standard: 'UKSAI Medical AI Audit Protocol', item: 'Validation of helper AI narratives under the UK School of Artificial Intelligence Gen-AI safety/auditability rules', status: true }
  ]);

  const [documentSignDraft, setDocumentSignDraft] = useState('DIAGNOSIS PROFILE: Infiltrating Ductal Carcinoma. Grade 3. Tumor staging margins fully cleared. Diagnostic biomarkers show high estrogen receptors intensity (Her2 test: negative).');
  const [cryptographicSignResult, setCryptographicSignResult] = useState<{ reportHash: string; ed25519Signature: string } | null>(null);

  const performCryptographicEd25519SignSealing = () => {
    // Generate simulated Ed25519 digital signature
    const hashHex = Array.from(new Uint8Array(32)).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const sigHex = 'ED25519-SIG:' + Array.from(new Uint8Array(64)).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    setCryptographicSignResult({
      reportHash: hashHex.toUpperCase(),
      ed25519Signature: sigHex.toUpperCase()
    });
    
    setComplianceChecks(prev => prev.map(c => c.id === '6' ? { ...c, status: true } : c));
    showToast('Report signed! Cryptographic non-repudiation verified.', 'success');
  };

  const handleExportSpecifications = () => {
    const specData = {
      appName: "Shahnaz Pathology Lab Suite",
      version: "1.0",
      architecture_planes: ["Mechanical", "Cognitive", "Data Lifecycle"],
      microservices: services,
      database_schemas: dbTables,
      storage_projected_load: {
        weeklyCases,
        resolution: slideResolution,
        averageSlideSizeGB: getSlideSize(),
        hotStorageTB,
        warmStorageTB,
        projectedMonthlyCostBDT: totalMonthlyStorageCostBD
      },
      compliance: complianceChecks
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(specData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Shahnaz_Pathology_Enterprise_Architecture_Spec.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Enterprise blueprints exported successfully.', 'success');
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden font-sans @container">
      {/* Sub-Header / Blueprint Title Strip */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-sky-600 rounded text-[9px] font-mono uppercase tracking-widest font-black">Architecture Blueprint</span>
            <span className="text-[10px] text-slate-400 font-mono">v1.0 • APPROVED</span>
          </div>
          <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Layers className="text-sky-400 shrink-0" size={20} />
            Shahnaz Pathology Enterprise Spec Panel
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Browse bounded microservices, test the physical lock controller relay, run database ERD simulations, and check compliance metrics.
          </p>
        </div>
        
        <button
          onClick={handleExportSpecifications}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700 cursor-pointer"
        >
          <Download size={13} />
          <span>Export Blueprint JSON</span>
        </button>
      </div>

      {/* Sub-Tabs Grid Selector */}
      <div className="grid grid-cols-5 border-b border-slate-200 text-center text-xs font-semibold bg-slate-50">
        <button
          onClick={() => setSubTab('topology')}
          className={`py-3 flex flex-col items-center justify-center gap-1 border-r border-slate-200 transition ${
            subTab === 'topology' ? 'bg-white text-red-700 border-b-2 border-b-red-650 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
        >
          <Server size={14} />
          <span className="text-[10px] uppercase font-sans">1. Bounded Services</span>
        </button>
        <button
          onClick={() => setSubTab('db')}
          className={`py-3 flex flex-col items-center justify-center gap-1 border-r border-slate-200 transition ${
            subTab === 'db' ? 'bg-white text-red-700 border-b-2 border-b-red-650 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
        >
          <Database size={14} />
          <span className="text-[10px] uppercase font-sans">2. Core Schema</span>
        </button>
        <button
          onClick={() => setSubTab('crypto')}
          className={`py-3 flex flex-col items-center justify-center gap-1 border-r border-slate-200 transition ${
            subTab === 'crypto' ? 'bg-white text-red-700 border-b-2 border-b-red-650 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
        >
          <Lock size={14} />
          <span className="text-[10px] uppercase font-sans">3. Crypto Locks</span>
        </button>
        <button
          onClick={() => setSubTab('stack')}
          className={`py-3 flex flex-col items-center justify-center gap-1 border-r border-slate-200 transition ${
            subTab === 'stack' ? 'bg-white text-red-700 border-b-2 border-b-red-650 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
        >
          <Cpu size={14} />
          <span className="text-[10px] uppercase font-sans">4. Tech Stacks</span>
        </button>
        <button
          onClick={() => setSubTab('compliance')}
          className={`py-3 flex flex-col items-center justify-center gap-1 transition ${
            subTab === 'compliance' ? 'bg-white text-red-700 border-b-2 border-b-red-650 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
        >
          <Shield size={14} />
          <span className="text-[10px] uppercase">5. Compliance</span>
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="p-6">
        
        {/* TAB 1: BOUNDED MICROSERVICES */}
        {subTab === 'topology' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] text-sky-600 font-extrabold uppercase tracking-wider font-mono">Operational Topology Overview</p>
                <h4 className="text-sm font-black text-slate-900">Distributed Microservices Mesh Layout</h4>
                <p className="text-xs text-slate-500">
                  The Shahnaz Pathology system operates across 3 logical execution planes using mTLS, unified via a Kong Gateway.
                </p>
              </div>
              <button
                onClick={reRangeAllDiagnosticPings}
                disabled={isDiagnosticRunning}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RotateCcw size={12} className={isDiagnosticRunning ? 'animate-spin' : ''} />
                <span>Initialize Dynamic Telemetry Suite</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* List grid (col-span-7) */}
              <div className="lg:col-span-7 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Microservices Roster ({services.length} Bounded Services)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-2">
                  {services.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedService(item)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition text-left relative ${
                        selectedService?.id === item.id
                          ? 'bg-sky-50 border-sky-300 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <span className="text-xs font-extrabold text-slate-900 truncate block font-mono">{item.name}</span>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                          item.plane === 'Mechanical' ? 'bg-orange-100 text-orange-700' :
                          item.plane === 'Cognitive' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {item.plane}
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                        <p className="line-clamp-2 leading-relaxed font-sans">{item.responsibility}</p>
                        <div className="flex justify-between items-center pt-2 font-mono text-[9px] text-slate-400 border-t border-slate-100/60">
                          <span>{item.protocol}</span>
                          <span className="text-emerald-600 font-bold">Latency: {item.latency} ms</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Console inspector (col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                {selectedService ? (
                  <div className="bg-slate-900 text-white rounded-[2rem] border border-slate-800 p-5 space-y-4 shadow-sm text-left">
                    <div className="pb-3 border-b border-slate-800 flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-sky-400">{selectedService.plane} PLANE BOUNDARY</span>
                        <h5 className="font-extrabold text-slate-100 text-sm mt-0.5">{selectedService.name}</h5>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800/80 rounded-full text-[9px] font-mono text-emerald-300 font-black flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        {selectedService.status}
                      </span>
                    </div>

                    <div className="space-y-3 text-[11px] font-mono leading-relaxed">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Service Mission objective:</span>
                        <p className="text-slate-200 mt-0.5 font-sans leading-snug">{selectedService.responsibility}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-800/80">
                        <div>
                          <span className="text-slate-500 block text-[9px]">API STANDARDS</span>
                          <span className="text-slate-200 font-bold">{selectedService.protocol}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">ACTIVE RUNNER THREADS</span>
                          <span className="text-slate-200 font-bold">{selectedService.threads} worker units</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 text-[9px]">AVERAGE PIPELINE LATENCY</span>
                        <span className="font-bold text-sky-450">{selectedService.latency} milliseconds</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => triggerServicePing(selectedService.name)}
                        className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Activity size={12} />
                        <span>Perform Endpoint Diagnostic Verification</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 text-slate-400 rounded-[2rem] border border-slate-800 p-12 text-center text-xs">
                    <p className="font-mono">Select a service boundary to execute pings.</p>
                  </div>
                )}

                {/* Console output buffer */}
                <div className="bg-slate-950 text-slate-350 border border-slate-800 rounded-3xl p-4 font-mono text-[10px] space-y-1.5 text-left">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    <span>Live mTLS Command ledger buffer</span>
                    <span className="text-emerald-500 animate-pulse">STREAMING LIVE</span>
                  </div>
                  <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                    {diagnosticsLogs.map((log, i) => (
                      <p key={i} className="leading-snug break-all">{log}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RELATIONAL DATABASE ERD */}
        {subTab === 'db' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] text-emerald-605 font-extrabold uppercase tracking-wider font-mono">Relational Data Engine Schema</p>
                <h4 className="text-sm font-black text-slate-900">PostgreSQL CITUS Horizontal Entity Blueprint</h4>
                <p className="text-xs text-slate-500">
                  Interactive metadata navigator representing row-level security boundaries and encryption layers under HIPAA rules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Tables Pill Grid (col-span-5) */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Entity-Relationship Catalog</span>
                <div className="space-y-2">
                  {dbTables.map((tbl) => (
                    <button
                      key={tbl.name}
                      onClick={() => setSelectedDBTable(tbl)}
                      className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center transition cursor-pointer ${
                        selectedDBTable.name === tbl.name
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="block font-mono text-xs font-extrabold">dbo.{tbl.name}</span>
                        <span className="text-[9px] text-slate-400 block uppercase font-mono tracking-widest">{tbl.columns.length} structural attributes</span>
                      </div>
                      <ChevronRight size={13} className={selectedDBTable.name === tbl.name ? 'text-emerald-600' : 'text-slate-450'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Column Inspector (col-span-8) */}
              <div className="lg:col-span-8 space-y-5 text-left">
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-emerald-700 text-xs font-black">
                      <Database size={13} />
                      <span>TABLE DIRECTORY: dbo.{selectedDBTable.name}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 font-semibold">
                      {selectedDBTable.description}
                    </p>
                  </div>

                  {/* Schema Attributes Table Layout */}
                  <div className="border border-slate-150 rounded-2xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] text-slate-550 uppercase">
                        <tr>
                          <th className="p-2.5">Attribute Name</th>
                          <th className="p-2.5">SQL Domain Type</th>
                          <th className="p-2.5">Primary Key / Constraint</th>
                          <th className="p-2.5">Metadata / Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans text-slate-700 text-[11px]">
                        {selectedDBTable.columns.map((col, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold font-mono text-slate-900">{col.name}</td>
                            <td className="p-2.5 font-semibold text-slate-600 font-mono flex items-center gap-1">
                              {col.type}
                              {col.crypto && (
                                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 text-[8px] font-mono rounded-lg font-black uppercase">
                                  🔒 {col.crypto}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-center">
                              {col.key ? (
                                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase ${
                                  col.key === 'PK' ? 'bg-amber-100 text-amber-800' : 'bg-blue-105 text-blue-800'
                                }`}>
                                  {col.key}
                                </span>
                              ) : (
                                <span className="text-slate-350">-</span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-500 font-semibold">{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SQL Live query playground mock */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 font-mono text-[11px] space-y-3 shadow">
                  <div className="flex justify-between items-center text-slate-400 border-b border-slate-850 pb-2">
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wider">Simulated read-only CITUS indexing query console</span>
                    <span className="text-xs bg-slate-900 px-2 py-0.5 text-emerald-400 border border-slate-850 rounded">POSTGRESQL-17</span>
                  </div>
                  <div className="space-y-1.5">
                    <textarea
                      value={dbQueryText}
                      onChange={(e) => setDbQueryText(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900/80 text-orange-200 border-0 outline-none rounded p-2.5 h-20 text-[11px] leading-relaxed resize-none cursor-text select-text"
                    ></textarea>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase">Warning: simulated sandbox queries only modify UI telemetry context</span>
                    <button
                      onClick={executeSimulatedQuery}
                      disabled={isQueryExecuting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Play size={10} />
                      <span>{isQueryExecuting ? 'Executing Query Indices...' : 'Execute Sample SQL Query'}</span>
                    </button>
                  </div>

                  {/* Query results output ledger */}
                  <div className="bg-slate-900 rounded-2xl p-3 border border-slate-850 max-h-[140px] overflow-y-auto pr-1">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-1.5 border-b border-slate-850 pb-1">RESULT SET BINDINGS</span>
                    <pre className="text-emerald-400 leading-relaxed text-[10px] whitespace-pre-wrap">
                      {JSON.stringify(queryOutput, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CRYPTOGRAPHIC LOCK CONTROLLER */}
        {subTab === 'crypto' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left font-sans">
              <div className="space-y-0.5">
                <p className="text-[10px] text-rose-600 font-extrabold uppercase tracking-wider font-mono">Cryptographic Laboratory Security</p>
                <h4 className="text-sm font-black text-slate-900">Embedded Hardware Lock Relay Controller Spec (GT450-CLIA-01)</h4>
                <p className="text-xs text-slate-500 text-wrap">
                  Threat Model Prevention: Whole Slide Scanners remain mechanically locked via HMAC-SHA256 tokens until POS database registers cash settlement.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Simulator Panel (col-span-5) */}
              <div className="lg:col-span-5 border border-slate-200 bg-white shadow-xs rounded-3xl p-5 flex flex-col justify-between space-y-4 text-left">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400">Lock Controller Dashboard</span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-650 font-semibold font-sans">Physical Scanner:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black border flex items-center gap-1 ${
                        scannerRelayState === 'LOCKED' 
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700 animate-pulse'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${scannerRelayState === 'LOCKED' ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`}></span>
                        {scannerRelayState}
                      </span>
                    </div>
                  </div>

                  {/* Picker of specimens to scan */}
                  <div className="space-y-1.5 text-xs">
                    <label className="text-slate-505 block uppercase text-[10px] font-bold font-mono">1. Select Organic Slide Barcode Badge</label>
                    <div className="grid grid-cols-2 gap-2">
                      {simSpecimens.map((spec) => (
                        <button
                          key={spec.barcode}
                          onClick={() => {
                            setActiveSimSpecimen(spec);
                            setScannerRelayState('LOCKED');
                            setScanProgress(0);
                            setGeneratedHmacToken('');
                          }}
                          className={`p-2.5 rounded-xl border text-left font-mono text-[10px] transition ${
                            activeSimSpecimen.barcode === spec.barcode
                              ? 'bg-slate-900 text-white border-slate-900 shadow'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-bold block text-[10px] truncate">{spec.barcode}</span>
                          <span className="text-[8px] font-black text-red-500 block mt-0.5">{spec.testType}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment toggle */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-205 py-3.5 px-4 text-xs font-semibold flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <span className="text-slate-400 block uppercase text-[8px] font-mono font-bold tracking-widest">POS Database Ledger Binding</span>
                      <p className="text-slate-800 text-[11px] truncate mt-0.5 font-bold">Invoiced Cost: {activeSimSpecimen.cost}.00 BDT</p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSetSimSpecimenPayment('PENDING')}
                        className={`px-2 py-1.5 text-[9px] font-extrabold uppercase rounded-lg border transition ${
                          activeSimSpecimen.payment === 'PENDING'
                            ? 'bg-rose-100 border-rose-300 text-rose-800 font-black'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        Unpaid
                      </button>
                      <button
                        onClick={() => handleSetSimSpecimenPayment('PAID')}
                        className={`px-2 py-1.5 text-[9px] font-extrabold uppercase rounded-lg border transition ${
                          activeSimSpecimen.payment === 'PAID'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-black'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        Settled
                      </button>
                    </div>
                  </div>

                  {/* Actions to simulated scanner flow */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={executeCryptographicLockSimulationReceipt}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold tracking-widest uppercase transition rounded-xl text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-slate-800"
                    >
                      <Terminal size={12} />
                      <span>Trigger Hardware Scanner Inquiry</span>
                    </button>

                    <button
                      onClick={startTilingScanningSimulation}
                      disabled={scannerRelayState === 'LOCKED' || isScanningActive}
                      className={`w-full py-3 font-extrabold tracking-widest uppercase transition rounded-xl text-[10px] flex items-center justify-center gap-1.5 cursor-pointer ${
                        scannerRelayState === 'LOCKED'
                          ? 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed'
                          : 'bg-rose-650 hover:bg-rose-700 text-white shadow-sm'
                      }`}
                    >
                      <Play size={12} />
                      <span>{isScanningActive ? `SCANNING TISSUE ${scanProgress}%` : 'Engage Glass Slide Tiling Scan'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress rendering indicator */}
                {isScanningActive && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500">
                      <span>GT450 EMBEDDED RASTER OVERLAY PROCESS</span>
                      <span>IMAGE: 12.5 GigaPixels</span>
                    </div>
                    <div className="w-full bg-slate-150 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
                      <div
                        className="bg-rose-500 h-full transition-all duration-300 ease-out animate-pulse"
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Logs (col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-950 text-slate-300 border border-slate-850 rounded-[2rem] p-5 font-mono text-[11px] leading-relaxed text-left flex flex-col h-full justify-between space-y-4 shadow-sm min-h-[380px]">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-550 font-bold border-b border-slate-900 pb-2.5 uppercase tracking-widest">
                      <span>MQTT Secure Signal Logs Buffer</span>
                      <span className="text-rose-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        LIVE ENFORCEMENT
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {hardwareLockLogs.map((log, i) => (
                        <p key={i} className="font-mono text-[10.5px] leading-normal break-words text-slate-300 select-all">{log}</p>
                      ))}
                    </div>
                  </div>

                  {generatedHmacToken && (
                    <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-850 space-y-1 select-text">
                      <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest block font-mono">HMAC-SHA256 SEED EMBEDDED COMPONENT TOKEN</span>
                      <p className="text-white text-[10px] break-all tracking-normal font-mono text-center select-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                        {generatedHmacToken}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: TECHNOLOGY STACK RECOMMENDATIONS & COSTS */}
        {subTab === 'stack' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-left">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider font-mono">Recommended Enterprise Platform & Scalability</p>
                <h4 className="text-sm font-black text-slate-900">Tiered Cloud Database and Storage Projections (AWS S3 System)</h4>
                <p className="text-xs text-slate-500">
                  Slide storage calculations based on gigapixel resolution. Modify sliders to preview real retention data constraints.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Sliders Control Panel (col-span-5) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono pb-2 border-b border-slate-100">Projected Load Parameters</span>
                
                {/* Cases Slider */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-800">
                    <span>Weekly Requisition Cases</span>
                    <span className="font-mono text-indigo-605 font-black text-xs">{weeklyCases} cases</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={10000}
                    step={200}
                    value={weeklyCases}
                    onChange={(e) => setWeeklyCases(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Small Lab (200)</span>
                    <span>County General (10K)</span>
                  </div>
                </div>

                {/* Microscopic Slide Resolution */}
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-800 block">Typical Slides Magnification</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['20x', '40x', '60x'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setSlideResolution(r)}
                        className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          slideResolution === r
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {r} Magnification
                        <span className="block text-[8px] font-mono text-slate-400 font-extrabold text-indigo-100 mt-0.5">
                          {r === '20x' ? '1.5 GB/slide' : r === '40x' ? '5.0 GB/slide' : '12.0 GB/slide'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Storing lifespan years */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-800">
                    <span>Retention Lifespan Standard</span>
                    <span className="font-mono text-indigo-605 font-black text-xs">{retentionYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={retentionYears}
                    onChange={(e) => setRetentionYers(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Minimum compliance (1 yr)</span>
                    <span>Ultra Archival (10 yrs)</span>
                  </div>
                </div>
              </div>

              {/* Projections Matrix Display (col-span-7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Dynamically calculated storage volume bars */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Storage Tier Projection Breakdown</span>
                  
                  <div className="space-y-3 font-sans">
                    {/* Hot tier */}
                    <div className="grid grid-cols-12 gap-2 items-center text-xs">
                      <span className="col-span-3 text-[11px] font-bold text-slate-700">1. HOT (0-90 Days)</span>
                      <div className="col-span-6 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-orange-600 h-full" style={{ width: `${Math.min(100, hotStorageTB * 0.8)}%` }}></div>
                      </div>
                      <span className="col-span-3 font-mono font-bold text-right text-slate-900">{hotStorageTB.toFixed(1)} TB</span>
                    </div>

                    {/* Warm tier */}
                    <div className="grid grid-cols-12 gap-2 items-center text-xs">
                      <span className="col-span-3 text-[11px] font-bold text-slate-700">2. WARM (1 Year)</span>
                      <div className="col-span-6 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${Math.min(100, warmStorageTB * 0.2)}%` }}></div>
                      </div>
                      <span className="col-span-3 font-mono font-bold text-right text-slate-900">{warmStorageTB.toFixed(1)} TB</span>
                    </div>

                    {/* Cold tier */}
                    <div className="grid grid-cols-12 gap-2 items-center text-xs">
                      <span className="col-span-3 text-[11px] font-bold text-slate-700">3. COLD (1-5 Years)</span>
                      <div className="col-span-6 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-sky-600 h-full" style={{ width: `${Math.min(100, coldStorageTB * 0.08)}%` }}></div>
                      </div>
                      <span className="col-span-3 font-mono font-bold text-right text-slate-900">{coldStorageTB.toFixed(1)} TB</span>
                    </div>

                    {/* Glacier deep */}
                    <div className="grid grid-cols-12 gap-2 items-center text-xs">
                      <span className="col-span-3 text-[11px] font-bold text-slate-700">4. DEEP (5-10 Years)</span>
                      <div className="col-span-6 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full" style={{ width: `${Math.min(100, deepArchiveTB * 0.04)}%` }}></div>
                      </div>
                      <span className="col-span-3 font-mono font-bold text-right text-slate-900">{deepArchiveTB.toFixed(1)} TB</span>
                    </div>
                  </div>
                </div>

                {/* Cloud Financial Pricing Summary Panel */}
                <div className="bg-indigo-950 text-white rounded-3xl p-5 flex justify-between items-center gap-4 relative overflow-hidden shadow">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest block font-mono">Estimated Cloud Storage Costs</span>
                    <p className="text-2xl font-black text-slate-100 font-sans">
                      {totalMonthlyStorageCostBD.toLocaleString(undefined, { maximumFractionDigits: 0 })} BDT <span className="text-xs font-semibold text-slate-400">/ month</span>
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans max-w-[340px]">
                      Calculated using Citus RDS pricing and standard on-prem MinIO NVMe replication architectures.
                    </p>
                  </div>
                  <TrendingUp className="text-indigo-400 shrink-0" size={32} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: COMPLIANCE CHECKER */}
        {subTab === 'compliance' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-left">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] text-red-700 font-extrabold uppercase tracking-wider font-mono font-sans">Regulatory Compliance Audit</p>
                <h4 className="text-sm font-black text-slate-900">HIPAA, GDPR & Integrity Cryptographic Ledger Assessor</h4>
                <p className="text-xs text-slate-500">
                  Every active diagnostic outcome must satisfy medical verification and non-repudiation protocol definitions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Compliance Checklist Cards (col-span-7) */}
              <div className="lg:col-span-7 space-y-3 font-sans">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Medical Security Checks</span>
                <div className="space-y-3">
                  {complianceChecks.map((v) => (
                    <div key={v.id} className="bg-slate-50/70 border border-slate-202 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                      <div className="p-1 px-2.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black font-mono">
                        PASS
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <span className="font-black text-slate-900 font-mono block uppercase text-[10px] text-red-750">{v.standard}</span>
                        <p className="text-slate-600 font-semibold leading-relaxed font-sans">{v.item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Ed25519 Signing Simulator (col-span-5) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-3xl space-y-4">
                <div className="space-y-0.5 pb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Crypto Sealer Sandbox</span>
                  <h5 className="font-extrabold text-slate-950 text-xs">Digital Specimen Sealing (Ed25519 Keys)</h5>
                </div>

                <div className="space-y-3.5 text-xs">
                  <p className="text-[10.5px] text-slate-500 leading-normal font-sans font-medium">
                    Test the sign-out pipeline. Signing calculates SHA-512 hashes of reports and signs with Ed25519 private keys.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Draft Report Text:</label>
                    <textarea
                      value={documentSignDraft}
                      onChange={(e) => setDocumentSignDraft(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-red-650 outline-none p-2 rounded-xl text-[11px] font-mono resize-none font-semibold text-slate-800"
                    ></textarea>
                  </div>

                  <button
                    onClick={performCryptographicEd25519SignSealing}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10.5px] font-extrabold tracking-widest uppercase transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Shield size={12} className="text-red-500" />
                    <span>Sealed with Cryptographic key</span>
                  </button>

                  {cryptographicSignResult && (
                    <div className="bg-slate-950 text-white rounded-2xl p-3 border border-slate-800 text-[9px] font-mono space-y-2 select-text text-left shadow">
                      <div>
                        <span className="text-slate-500 block uppercase font-bold tracking-widest text-[8px] font-mono">SHA-512 Canonical Checksum Hash</span>
                        <span className="text-amber-400 select-all font-mono break-all font-bold block bg-slate-900 p-1.5 rounded border border-slate-850">
                          {cryptographicSignResult.reportHash}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-bold tracking-widest text-[8px] font-mono">Verified Digital Signature (Ed25519 / X509)</span>
                        <span className="text-emerald-400 select-all font-mono break-all font-bold block bg-slate-900 p-1.5 rounded border border-slate-850 h-16 overflow-y-auto leading-normal">
                          {cryptographicSignResult.ed25519Signature}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
