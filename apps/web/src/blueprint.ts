export const blueprintMarkdown = `
# Shahnaz Pathology — Enterprise Architecture Blueprint v1.0

> **Classification:** Proprietary & Confidential  
> **Date:** 2026-05-26  
> **Architect:** System Architecture & Healthcare Data Security  
> **Compliance Targets:** HIPAA, GDPR, CAP/CLIA, IHE PaLM

---

## 1. System Architecture Blueprint

### 1.1 High-Level Topology

The system is decomposed into **12 bounded microservices** organized across **3 operational planes**: the **Front-End Mechanical Plane**, the **Cognitive Diagnostics Plane**, and the **Data Lifecycle Plane**. All inter-service communication flows through an authenticated API Gateway with mTLS.

### 1.2 Microservice Decomposition

| # | Service | Plane | Responsibility | Protocol |
|---|---------|-------|---------------|----------|
| 1 | **Accessioning Service** | Mechanical | Patient intake, specimen registration, case creation | gRPC + REST |
| 2 | **Barcode Service** | Mechanical | Generate/validate GS1 DataMatrix barcodes, bind to specimen | gRPC |
| 3 | **POS / Financial Gate** | Mechanical | Payment processing, invoice generation, payment-status ledger | REST + Webhooks |
| 4 | **Hardware Lock Controller** | Mechanical | Cryptographic hardware enable/disable signals to scanners & printers | gRPC + MQTT |
| 5 | **WSI Scanner Controller** | Mechanical | Orchestrate scan jobs, ingest raw .SVS/.NDPI tiles, DICOMize | gRPC + DICOM DIMSE |
| 6 | **QC Engine** | Cognitive | Focus quality, tissue detection, stain normalization assessment | gRPC (internal) |
| 7 | **AI Inference & Triage** | Cognitive | Heatmap generation, ROI bounding boxes, biomarker quantification | gRPC + async tasks |
| 8 | **Diagnostics Dashboard** | Cognitive | Zero-footprint DICOM viewer, case worklist, multi-stain overlay | WebSocket + REST |
| 9 | **Crypto Sign-out Service** | Cognitive | ECDSA/EdDSA digital signature, tamper-proof PDF generation | gRPC |
| 10 | **Tiered Storage Orchestrator** | Lifecycle | Policy-driven data migration across Hot/Warm/Cold tiers | Async workers |
| 11 | **Patient Portal** | Lifecycle | Secure image sharing, report download, consent management | REST + OAuth2 |
| 12 | **Audit & Compliance Ledger** | Lifecycle | Immutable append-only audit log, HIPAA access tracking | Event-sourced |

---

## 2. Database Schema — Core Entities

### 2.1 Schema Design Principles

- **Engine:** PostgreSQL 17 with \`pg_crypto\`, \`pgaudit\`, and custom DOMAIN types
- **Multi-tenancy:** Schema-per-organization with Row-Level Security (RLS)
- **Temporal:** All mutable tables use \`valid_from\`/\`valid_to\` bi-temporal columns
- **Encryption:** Column-level AES-256-GCM for PII fields (patient name, DOB, contact)
- **Audit:** Every table triggers to the immutable \`audit.change_log\` table

---

## 3. Technology Stack Recommendation

### 3.1 Stack Matrix

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **API Gateway** | **Kong Gateway (OSS)** on Kubernetes | Plugin ecosystem for rate limiting, mTLS, JWT validation |
| **Identity / Auth** | **Keycloak 26** (self-hosted) | HIPAA-grade RBAC/ABAC, MFA, SAML |
| **Backend Services** | **Rust** (Axum framework) | Memory-safe, zero-cost abstractions for high-throughput pipelines |
| **Primary Database** | **PostgreSQL 17** + **Citus** | ACID compliance, horizontal scaling |
| **Cache** | **DragonflyDB** | Redis-compatible, multi-threaded |
| **Object Storage** | **MinIO** (on-prem) + **AWS S3** | S3-compatible, hybrid cloud flexibility |
| **AI Inference** | **NVIDIA Triton Inference Server** | Multi-model serving, dynamic batching |
| **Frontend** | **React 19** + **TypeScript** | Component architecture for complex viewer UI |

---

## 4. Compliance & Security Summary

| Requirement | Implementation |
|------------|---------------|
| **HIPAA — Access Control** | Keycloak RBAC + PostgreSQL RLS + per-request audit logging |
| **HIPAA — Encryption at Rest** | AES-256-GCM column-level (PII) + TDE (PostgreSQL) + S3 SSE-KMS |
| **GDPR — Data Portability** | DICOM export + FHIR R4 patient bundle API |
| **CAP/CLIA** | Synoptic reporting (CAP protocols), structured sign-out |
| **Non-Repudiation** | EdDSA Ed25519 digital signatures with X.509 certificate chain |

---

> [!IMPORTANT]
> **Decision Points for Your Review:**
> 1. **Cloud Provider:** AWS vs. GCP vs. hybrid — impacts storage pricing and GPU availability.
> 2. **Scanner Vendors:** Leica Aperio, Hamamatsu NanoZoomer, or 3DHistech.
> 3. **AI Models:** Build proprietary models vs. fine-tune existing foundation models.
`;
