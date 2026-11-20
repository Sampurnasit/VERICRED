/**
 * W3C Verifiable Credentials Data Model 2.0 Types & VERICRED ZK Suite Types
 */

export interface W3CIssuer {
  id: string; // e.g. "did:vericred:institution:rcciit"
  name: string;
  legalEntityCode?: string;
  ethereumAddress: string;
  publicKeyX: string;
  publicKeyY: string;
}

export interface AcademicStanding {
  cgpaRaw: number;
  cgpaScaled: number; // e.g. 872
  blindingSalt: string; // CSPRNG 254-bit salt string
  commitment: string; // Poseidon(cgpaScaled, salt)
}

export interface W3CAcademicSubject {
  id: string; // e.g. "did:vericred:student:vc2026001"
  studentName: string;
  enrollmentNumber: string;
  degreeName: string;
  department: string;
  academicSession?: string;
  graduationYear: number;
  classification?: string;
  academicStanding: AcademicStanding;
}

export interface W3CBabyJubjubProof {
  type: 'BabyJubjubPoseidonProof2026';
  created: string; // ISO 8601
  verificationMethod: string; // e.g. "did:vericred:institution:rcciit#key-1"
  proofPurpose: 'assertionMethod';
  signatureValue: {
    r8x: string;
    r8y: string;
    s: string;
  };
}

export interface W3CCredentialStatus {
  id: string;
  type: 'VeriCredOnChainRevocation2026';
  network: string; // "polygon-amoy" | "hardhat" | "sepolia"
  contractAddress: string;
  credentialHash: string;
}

export interface W3CCredentialSchemaRef {
  id: string;
  type: 'JsonSchemaValidator2020';
}

export interface VerifiableCredential2026 {
  '@context': string[];
  id: string; // e.g. "urn:uuid:..."
  type: string[]; // ["VerifiableCredential", "AcademicDegreeCredential"]
  issuer: W3CIssuer;
  validFrom: string;
  validUntil?: string;
  credentialSubject: W3CAcademicSubject;
  credentialStatus: W3CCredentialStatus;
  credentialSchema: W3CCredentialSchemaRef;
  proof: W3CBabyJubjubProof;
}

export interface SelectiveDisclosureOptions {
  discloseStudentName: boolean;
  discloseDepartment: boolean;
  discloseGraduationYear: boolean;
  discloseRawCgpa: boolean; // if false, exact CGPA and salt are masked, commitment remains
}

export interface VerifiablePresentation2026 {
  '@context': string[];
  id: string; // "urn:uuid:..."
  type: string[]; // ["VerifiablePresentation"]
  holder: string; // "did:vericred:student:..."
  verifierNonce: string;
  expiresAt: string;
  verifiableCredential: VerifiableCredential2026[];
  selectiveDisclosure: SelectiveDisclosureOptions;
}
