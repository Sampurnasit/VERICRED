# APPLICATION_PAGE_SPECIFICATION.md — Page Directory & Viewport Specifications

> **Document ID**: DOC-UI-002  
> **Status**: Confirmed Technical Specification

---

## 1. Public Marketing & Onboarding Pages

### 1.1 Home / Landing (`/`)
- **Purpose**: Showcase the VERICRED value proposition, animated verification demo, and call-to-actions.
- **Components**: HeroSection, VerificationPreviewAnimation, TrustHighlights, HowItWorksFlow, ZkInteractiveExplainer, MetricsBanner, FAQAccordion, Footer.
- **Actions**: "Get Started" (routes to `/register`), "Verify a Credential" (routes to `/verify`).
- **Responsive Behavior**: Hero grid collapses from 2 columns to 1 column on `< lg` viewports.

### 1.2 How It Works (`/how-it-works`)
- **Purpose**: Interactive educational walkthrough of the 3-party architecture (Institution $\rightarrow$ Student $\rightarrow$ Verifier) and zero-knowledge privacy guarantees.

### 1.3 Authentication Pages (`/login`, `/register`)
- **Purpose**: Secure credential entry, multi-role registration selector (Student vs. Institution), and forgot-password flows.
- **States**: Loading spinner on submit; field-specific validation errors; toast alert on invalid credentials.

---

## 2. Educational Institution Console (`/institution/*`)

| Page Route | Purpose | Key Components | Primary Actions |
| :--- | :--- | :--- | :--- |
| **`/institution/overview`** | Metric KPIs & recent issuance feed | MetricCards, ActivityFeed, QuickActions | Issue New Credential, Download Analytics |
| **`/institution/students`** | Campus student roster & enrollment | StudentTable, SearchFilter, AddStudentModal | Add Student, View Credential History |
| **`/institution/issue`** | Single credential creation form | CredentialForm, PreviewModal, SignConfirmDialog | Submit Credential & Sign with EdDSA |
| **`/institution/bulk`** | Large cohort CSV upload & processing | Dropzone, CsvPreviewTable, BatchStatusProgress | Upload CSV, Run Dry-Run, Mint Batch |
| **`/institution/credentials`**| Issued credentials directory | CredentialDirectoryTable, RevokeModal | View on Polygonscan, Initiate Revocation |
| **`/institution/keys`** | Authorized issuer signing key dashboard | KeyCard, KeyRotationWizard, HistoryList | Publish New Key, Rotate Active Key |
| **`/institution/analytics`**| Issuance and verification telemetry | TimeseriesChart, BreakdownDonut | Export Report (PDF/CSV) |

---

## 3. Student Sovereign Wallet (`/student/*`)

| Page Route | Purpose | Key Components | Primary Actions |
| :--- | :--- | :--- | :--- |
| **`/student/overview`** | Active credential count, sharing shortcuts | SummaryGrid, RecentPresentations | Open Wallet, Quick Share |
| **`/student/wallet`** | Sovereign credential collection | CredentialCardGrid, FilterBar | Select Credential, Export JSON |
| **`/student/credentials/:id`**| Full transcript inspection | TranscriptViewer, StatusBadge, BlockchainLink | Share, Download PDF, Generate ZK |
| **`/student/share/:id`** | Selective disclosure & QR generator | DisclosureCheckboxList, QrRenderer, NonceTimer | Generate QR, Copy Verification Link |
| **`/student/zk-prover/:id`** | In-browser ZK proof wizard | ThresholdSlider, ProverProgress, ProofSummary | Calculate Witness & Emit Proof |
| **`/student/history`** | Verification audit log for holder | VerificationEventTable, IpLookupModal | Revoke Active Presentation |

---

## 4. Public Verification Portal (`/verify/*`)

### 4.1 Verification Landing & QR Scanner (`/verify`)
- **Purpose**: Unauthenticated verifier landing page with tabbed input methods.
- **Components**:
  - `QrCameraScanner`: Real-time video stream scanner supporting front/back cameras.
  - `UrlInputBox`: Pasteable input for direct presentation links (`/verify/p/...`).
  - `ZkUploadForm`: Direct proof verification tab accepting Groth16 JSON proofs.

### 4.2 Verification Report View (`/verify/p/:presentationId`)
- **Purpose**: Detailed cryptographic audit breakdown.
- **Components**:
  - Overall Status Header (`VALID` [Green], `INVALID` [Red], `REVOKED` [Red]).
  - Inspection Checklist:
    1. Cryptographic Signature: `VERIFIED (EdDSA BabyJubjub)`
    2. Issuing Authority: `VERIFIED (RCC Institute of Information Technology)`
    3. Revocation Registry: `ACTIVE (Not Revoked on Polygon Amoy)`
    4. Expiration Status: `VALID (Expires 2030)`
    5. Zero-Knowledge Condition: `PROVEN (CGPA >= 8.0)`

---

## 5. Platform Administrator Console (`/admin/*`)

| Page Route | Purpose | Key Components | Primary Actions |
| :--- | :--- | :--- | :--- |
| **`/admin/overview`** | Ecosystem health, pending reviews | MetricOverview, PendingReviewList | Fast Approve / Reject |
| **`/admin/institutions`** | Complete directory of universities | InstitutionTable, StatusFilter, DetailModal | Approve, Suspend, Reactivate |
| **`/admin/audit-logs`** | Tamper-evident administrative action log | LogTable, JsonDiffViewer, SearchFilter | Export Audit Trail |
| **`/admin/settings`** | Smart contract addresses & relay config | ContractAddressConfig, GasLimitSettings | Update System Configuration |
