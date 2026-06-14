/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NewsArticle {
  id: string;
  source: string;
  timeAgo: string;
  title: string;
  summary: string;
}

export interface Complaint {
  id: string;
  phoneOrNid: string;
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  timestamp: string;
  legalText?: string;
  assignedStaff?: string;
}

export interface RegulatoryRuleCheck {
  ruleId: string;
  name: string;
  authority: string;
  passed: boolean;
  statusText: string;
}

export interface RegulatoryCompliance {
  status: 'COMPLIANT' | 'WARNING' | 'FAILED';
  auditedInBackend: boolean;
  timestamp: string;
  certificationAuthority: string;
  rulesEvaluated: RegulatoryRuleCheck[];
  digitalCheckSignature: string;
}

export interface PatientReport {
  id: string;
  phoneOrNid: string;
  fileName: string;
  fileData?: string; // Base64 representation if uploaded
  fileType: string;
  aiSummary?: string;
  timestamp: string;
  status: 'pending' | 'reviewed';
  digestHash?: string;
  encryptionStandard?: string;
  verificationToken?: string;
  isTlsEnforced?: boolean;
  regulatoryCompliance?: RegulatoryCompliance;
  rating?: number;
  ratingFeedback?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  fileAttached?: {
    name: string;
    type: string;
    data: string; // Base64
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}
