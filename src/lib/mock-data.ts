// Demo data for SIX Sense. In Phase 2 this is replaced by real DB queries +
// Claude + Mistral OCR via createServerFn. Shapes intentionally mirror the
// production schema so swap-in is mechanical.

export type AccessLevel = "public" | "department" | "restricted" | "executive";
export type ValidationStatus = "draft" | "validated" | "needs_review" | "archived";

export interface KnowledgeCard {
  id: string;
  title: string;
  owner: string;
  ownerRole: string;
  department: string;
  summary: string;
  reasoning: string;
  risks: string[];
  actions: string[];
  stakeholders: string[];
  businessContext: string;
  topics: string[];
  decisions: string[];
  sources: { id: string; name: string; page?: number; snippet: string }[];
  related: { id: string; title: string }[];
  accessLevel: AccessLevel;
  confidence: number;
  validationStatus: ValidationStatus;
  lastReviewedAt: string;
  createdAt: string;
}

export const knowledgeCards: KnowledgeCard[] = [
  {
    id: "kc-001",
    title: "T+1 Settlement Migration — Risk Framework",
    owner: "Anja Müller",
    ownerRole: "Head of Post-Trade",
    department: "Securities Services",
    summary:
      "Operational and counterparty risk framework adopted for the T+1 settlement migration in the Swiss market, including fallback procedures and the rationale for the chosen cut-off times.",
    reasoning:
      "The 14:00 CET cut-off was chosen to align with US pre-market flows while preserving sufficient operational buffer for our custody clients. We evaluated three alternatives (12:00, 14:00, 16:00) against funding costs, FX exposure and reconciliation throughput. 14:00 minimised total cost of carry while keeping fails under the 1.3% target band.",
    risks: [
      "Asia-Pacific clients lose one settlement cycle if instructions arrive after 13:00 CET.",
      "FX funding gap during the first 30 minutes after US open.",
      "Reconciliation engine throughput may degrade above 2.1M instructions/day.",
    ],
    actions: [
      "Deploy regional cut-off override for APAC desks before Q2.",
      "Pre-fund USD nostros by 25bps to absorb FX gap.",
      "Scale reconciliation cluster to 12 nodes.",
    ],
    stakeholders: ["Post-Trade Operations", "Treasury", "FINMA Compliance", "Tier-1 Custody Clients"],
    businessContext:
      "Mandatory alignment with US SEC Rule 15c6-2 and forthcoming EU CSDR amendments. Failure to meet T+1 puts CHF 1.2B daily flow at risk.",
    topics: ["Settlement", "Post-Trade", "Risk", "Regulatory"],
    decisions: ["Adopt 14:00 CET cut-off", "Pre-fund USD nostros at 25bps", "Add APAC override window"],
    sources: [
      { id: "doc-1", name: "T1_Migration_Memo_v3.pdf", page: 14, snippet: "Cut-off analysis section 4.2 — 14:00 CET selected over 12:00 / 16:00 alternatives." },
      { id: "doc-2", name: "FINMA_Consultation_Response_2025.pdf", page: 7, snippet: "Confirmation of fallback procedures for partial-fill scenarios." },
    ],
    related: [
      { id: "kc-002", title: "CSDR Penalty Framework — Internal Interpretation" },
      { id: "kc-004", title: "Nostro Funding Buffer Policy" },
    ],
    accessLevel: "restricted",
    confidence: 0.94,
    validationStatus: "validated",
    lastReviewedAt: "2026-04-12",
    createdAt: "2025-11-03",
  },
  {
    id: "kc-002",
    title: "CSDR Penalty Framework — Internal Interpretation",
    owner: "Lukas Brunner",
    ownerRole: "Senior Compliance Counsel",
    department: "Compliance",
    summary: "Internal interpretation of CSDR cash penalty mechanics applied to dual-listed securities cleared through SIX SIS.",
    reasoning:
      "Dual-listed names create ambiguity around which CSD's penalty regime applies. Counsel opinion (2024-09) concluded the issuing CSD governs unless a bilateral DvP agreement overrides — this is the controlling precedent and is now applied uniformly.",
    risks: ["Inconsistent application across desks", "Client dispute volume if interpretation shifts"],
    actions: ["Publish interpretation as binding internal guidance", "Train Tier-1 client coverage team"],
    stakeholders: ["Compliance", "Legal", "Client Coverage"],
    businessContext: "Approx. CHF 8M annual exposure to cash penalties; uniform interpretation reduces dispute risk by ~40%.",
    topics: ["Regulatory", "Compliance", "CSDR"],
    decisions: ["Issuing CSD governs penalty regime unless DvP override"],
    sources: [
      { id: "doc-3", name: "Counsel_Opinion_CSDR_2024-09.pdf", page: 3, snippet: "Issuing-CSD precedence rule under Art. 7(2)." },
    ],
    related: [{ id: "kc-001", title: "T+1 Settlement Migration — Risk Framework" }],
    accessLevel: "department",
    confidence: 0.91,
    validationStatus: "validated",
    lastReviewedAt: "2026-03-21",
    createdAt: "2024-09-18",
  },
  {
    id: "kc-003",
    title: "Onboarding Playbook — Tier-1 Custody Client",
    owner: "Sofia Reinhardt",
    ownerRole: "Head of Client Onboarding",
    department: "Client Services",
    summary: "End-to-end onboarding playbook for Tier-1 custody clients, capturing the decisions made during the 2024 redesign.",
    reasoning:
      "The redesign reduced onboarding from 96 to 52 days by parallelising KYC enrichment and connectivity testing. Decision was driven by the loss of two RFPs in 2023 where competitors quoted under 60 days.",
    risks: ["Parallel KYC may surface conflicts late in the cycle"],
    actions: ["Run KYC gate at day 21 instead of day 45", "Connectivity test starts day 7"],
    stakeholders: ["Client Onboarding", "KYC", "IT Connectivity"],
    businessContext: "Each lost RFP represents ~CHF 4M annual revenue.",
    topics: ["Onboarding", "Client Services", "Process"],
    decisions: ["Parallelise KYC + connectivity", "21-day KYC gate"],
    sources: [{ id: "doc-4", name: "Onboarding_Redesign_2024.pdf", page: 9, snippet: "Workflow diagram — parallel tracks." }],
    related: [],
    accessLevel: "department",
    confidence: 0.88,
    validationStatus: "validated",
    lastReviewedAt: "2026-02-14",
    createdAt: "2024-06-02",
  },
  {
    id: "kc-004",
    title: "Nostro Funding Buffer Policy",
    owner: "Anja Müller",
    ownerRole: "Head of Post-Trade",
    department: "Treasury",
    summary: "Policy on minimum nostro funding buffers across G10 currencies post-T+1 migration.",
    reasoning: "Buffer sized at 25bps of daily flow to absorb FX gap window. Calibrated using 24 months of settlement data.",
    risks: ["Buffer drag of ~CHF 800k/year vs. settlement fail cost of ~CHF 3.1M"],
    actions: ["Quarterly recalibration", "Treasury sign-off required for >50bps deviation"],
    stakeholders: ["Treasury", "Post-Trade"],
    businessContext: "Net positive expected value CHF 2.3M/year.",
    topics: ["Treasury", "Funding", "Settlement"],
    decisions: ["25bps buffer baseline"],
    sources: [{ id: "doc-5", name: "Treasury_Buffer_Calibration.xlsx", snippet: "24-month back-test results." }],
    related: [{ id: "kc-001", title: "T+1 Settlement Migration — Risk Framework" }],
    accessLevel: "restricted",
    confidence: 0.86,
    validationStatus: "needs_review",
    lastReviewedAt: "2025-12-08",
    createdAt: "2025-10-19",
  },
  {
    id: "kc-005",
    title: "Crypto Asset Custody — Cold Storage Decisions",
    owner: "Markus Fehr",
    ownerRole: "Head of Digital Assets",
    department: "Digital Assets",
    summary: "Rationale for the multi-sig threshold and HSM vendor selection for the regulated crypto custody offering.",
    reasoning: "3-of-5 multi-sig chosen over 2-of-3 to satisfy FINMA's recovery requirement without compromising operational latency.",
    risks: ["Vendor lock-in to HSM provider", "Key ceremony complexity"],
    actions: ["Annual key ceremony", "Dual-vendor HSM evaluation 2027"],
    stakeholders: ["Digital Assets", "FINMA", "Security Engineering"],
    businessContext: "Required for the SIX Digital Exchange custody licence renewal.",
    topics: ["Crypto", "Custody", "Security"],
    decisions: ["3-of-5 multi-sig", "Primary HSM vendor: Vendor A"],
    sources: [{ id: "doc-6", name: "Digital_Custody_Design.pdf", page: 22, snippet: "Multi-sig threshold trade-off analysis." }],
    related: [],
    accessLevel: "executive",
    confidence: 0.82,
    validationStatus: "validated",
    lastReviewedAt: "2026-01-30",
    createdAt: "2025-08-11",
  },
  {
    id: "kc-006",
    title: "Vendor Risk — Market Data Provider Switch",
    owner: "Priya Anand",
    ownerRole: "Procurement Lead",
    department: "Procurement",
    summary: "Decision log for switching primary market data provider in Q3 2025.",
    reasoning: "Switch motivated by 31% cost reduction and improved tick latency. Migration risk mitigated via 6-month dual-feed period.",
    risks: ["Reference data gaps for thinly traded ETFs"],
    actions: ["Maintain dual feed until 2026 Q1"],
    stakeholders: ["Trading", "IT", "Procurement"],
    businessContext: "Annual savings CHF 5.2M.",
    topics: ["Vendor", "Market Data"],
    decisions: ["Switch primary provider", "6-month dual-feed"],
    sources: [{ id: "doc-7", name: "Vendor_Switch_Memo.pdf", page: 4, snippet: "Cost-benefit summary." }],
    related: [],
    accessLevel: "public",
    confidence: 0.79,
    validationStatus: "draft",
    lastReviewedAt: "2026-05-02",
    createdAt: "2025-09-14",
  },
];

export const departments = [
  "Securities Services",
  "Compliance",
  "Treasury",
  "Client Services",
  "Digital Assets",
  "Procurement",
  "Technology",
  "Risk Management",
];

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  tenure: string;
  knowledgeCards: number;
  isSpof: boolean;
  leavingRisk: "low" | "medium" | "high";
}

export const employees: Employee[] = [
  { id: "emp-001", name: "Anja Müller", role: "Head of Post-Trade", department: "Securities Services", tenure: "11 years", knowledgeCards: 47, isSpof: true, leavingRisk: "medium" },
  { id: "emp-002", name: "Lukas Brunner", role: "Senior Compliance Counsel", department: "Compliance", tenure: "8 years", knowledgeCards: 32, isSpof: true, leavingRisk: "low" },
  { id: "emp-003", name: "Sofia Reinhardt", role: "Head of Client Onboarding", department: "Client Services", tenure: "6 years", knowledgeCards: 28, isSpof: false, leavingRisk: "low" },
  { id: "emp-004", name: "Markus Fehr", role: "Head of Digital Assets", department: "Digital Assets", tenure: "4 years", knowledgeCards: 19, isSpof: true, leavingRisk: "high" },
  { id: "emp-005", name: "Priya Anand", role: "Procurement Lead", department: "Procurement", tenure: "3 years", knowledgeCards: 12, isSpof: false, leavingRisk: "low" },
  { id: "emp-006", name: "Thomas Keller", role: "Reconciliation Engineer", department: "Technology", tenure: "9 years", knowledgeCards: 24, isSpof: true, leavingRisk: "medium" },
];

export interface ActivityEntry {
  id: string;
  kind: "ticket" | "meeting" | "doc" | "decision";
  title: string;
  date: string;
  detail: string;
}

export const sampleActivity: Record<string, ActivityEntry[]> = {
  "emp-001": [
    { id: "a1", kind: "decision", title: "Approved T+1 cut-off at 14:00 CET", date: "2026-05-22", detail: "Post-Trade steering committee" },
    { id: "a2", kind: "meeting", title: "FINMA quarterly review", date: "2026-05-20", detail: "Regulator alignment session, 90 min" },
    { id: "a3", kind: "doc", title: "Authored Nostro Funding Buffer Policy v2", date: "2026-05-18", detail: "Revised calibration window to 24 months" },
    { id: "a4", kind: "ticket", title: "Resolved INC-4471 — reconciliation throughput", date: "2026-05-16", detail: "Scaled cluster to 12 nodes" },
    { id: "a5", kind: "meeting", title: "Tier-1 client escalation — Bank A", date: "2026-05-14", detail: "Discussed APAC cut-off override" },
    { id: "a6", kind: "doc", title: "Updated T+1 Migration Memo to v3", date: "2026-05-10", detail: "Added Asia-Pacific fallback section" },
  ],
};

export interface ExecKpi { label: string; value: string; delta: string; positive: boolean }
export const execKpis: ExecKpi[] = [
  { label: "Knowledge Cards", value: "2,847", delta: "+184 (30d)", positive: true },
  { label: "Reuse rate", value: "63%", delta: "+9pt", positive: true },
  { label: "Onboarding time saved", value: "412 days", delta: "+58 (30d)", positive: true },
  { label: "Open escalations", value: "14", delta: "−6", positive: true },
  { label: "SME dependency risk", value: "Medium", delta: "3 SPOFs", positive: false },
  { label: "Compliance coverage", value: "94%", delta: "+2pt", positive: true },
];

export const knowledgeGrowth = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"][i],
  cards: 1100 + i * 145 + Math.round(Math.sin(i) * 40),
  validated: 900 + i * 130 + Math.round(Math.cos(i) * 30),
}));

export const departmentActivity = departments.slice(0, 6).map((d, i) => ({
  department: d,
  captures: 40 + (i * 17) % 60,
  queries: 80 + (i * 23) % 110,
}));

export interface Escalation {
  id: string;
  question: string;
  sme: string;
  department: string;
  opened: string;
  status: "open" | "acknowledged" | "resolved";
}
export const escalations: Escalation[] = [
  { id: "esc-1", question: "Can we accept partial-fill instructions from APAC after 13:00 CET?", sme: "Anja Müller", department: "Securities Services", opened: "2026-05-25", status: "open" },
  { id: "esc-2", question: "Does the 2024 CSDR interpretation apply to triple-listed ADRs?", sme: "Lukas Brunner", department: "Compliance", opened: "2026-05-23", status: "acknowledged" },
  { id: "esc-3", question: "What is the cold-storage recovery SLA for the new custody offering?", sme: "Markus Fehr", department: "Digital Assets", opened: "2026-05-21", status: "open" },
];

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  diff: Record<string, unknown>;
}
export const auditEntries: AuditEntry[] = [
  { id: "au-1", actor: "Lukas Brunner", action: "validated", entity: "knowledge_card", entityId: "kc-002", timestamp: "2026-05-25 14:22 CET", diff: { validation_status: ["needs_review", "validated"] } },
  { id: "au-2", actor: "Anja Müller", action: "created", entity: "knowledge_card", entityId: "kc-004", timestamp: "2026-05-22 09:11 CET", diff: { title: [null, "Nostro Funding Buffer Policy"] } },
  { id: "au-3", actor: "System", action: "auto-escalated", entity: "question", entityId: "q-148", timestamp: "2026-05-21 17:04 CET", diff: { confidence: [0.62, "sme: Markus Fehr"] } },
  { id: "au-4", actor: "Sofia Reinhardt", action: "approved access", entity: "knowledge_card", entityId: "kc-003", timestamp: "2026-05-20 11:48 CET", diff: { access_level: ["restricted", "department"] } },
  { id: "au-5", actor: "Markus Fehr", action: "updated", entity: "knowledge_card", entityId: "kc-005", timestamp: "2026-05-19 16:31 CET", diff: { reasoning: ["v1", "v2"] } },
];

export interface ContinuityRisk {
  employee: string;
  department: string;
  signal: "leaving" | "spof" | "concentration" | "missing_docs";
  severity: "low" | "medium" | "high";
  detail: string;
  recommendation: string;
}
export const continuityRisks: ContinuityRisk[] = [
  { employee: "Markus Fehr", department: "Digital Assets", signal: "leaving", severity: "high", detail: "Notified resignation, last day 2026-07-15. 19 knowledge cards owned.", recommendation: "Schedule 8h capture sessions; assign successor by 2026-06-15." },
  { employee: "Anja Müller", department: "Securities Services", signal: "spof", severity: "high", detail: "Sole owner of 47 cards including 14 restricted.", recommendation: "Identify deputy and run quarterly knowledge transfer." },
  { employee: "Thomas Keller", department: "Technology", signal: "spof", severity: "medium", detail: "Only engineer with deep reconciliation engine knowledge.", recommendation: "Pair-program rotation and authored runbook by Q3." },
  { employee: "Lukas Brunner", department: "Compliance", signal: "concentration", severity: "medium", detail: "32% of compliance cards owned by single SME.", recommendation: "Distribute regulatory interpretations across 2 additional counsels." },
  { employee: "—", department: "Treasury", signal: "missing_docs", severity: "medium", detail: "3 funding policies referenced but never captured.", recommendation: "Compliance to request capture from Treasury head." },
];
