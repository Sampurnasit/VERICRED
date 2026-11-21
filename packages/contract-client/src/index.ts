import { ethers } from 'ethers';

export const INSTITUTION_REGISTRY_ABI = [
  'function registerInstitution(string legalName, string shortCode) external returns (bool)',
  'function approveInstitution(address instAddress) external returns (bool)',
  'function suspendInstitution(address instAddress) external returns (bool)',
  'function updateIssuerKey(uint256 keyX, uint256 keyY) external returns (bool)',
  'function isAuthorized(address instAddress) external view returns (bool)',
  'function isIssuerKeyAuthorized(uint256 keyX, uint256 keyY) external view returns (bool)',
  'function getInstitution(address instAddress) external view returns (tuple(string legalName, string shortCode, uint8 status, uint256 keyX, uint256 keyY, uint64 registeredAt, uint64 approvedAt))',
  'event InstitutionRegistered(address indexed instAddress, string legalName, string shortCode)',
  'event InstitutionApproved(address indexed instAddress, uint256 approvedAt)',
  'event InstitutionSuspended(address indexed instAddress, uint256 suspendedAt)',
  'event IssuerKeyUpdated(address indexed instAddress, uint256 keyX, uint256 keyY)',
];

export const CREDENTIAL_REGISTRY_ABI = [
  'function issueCredential(bytes32 credHash, bytes32 commitment) external returns (bool)',
  'function issueCredentialBatch(bytes32[] credHashes, bytes32[] commitments) external returns (bool)',
  'function getCredentialIssuer(bytes32 credHash) external view returns (address)',
  'function getCredentialCommitment(bytes32 credHash) external view returns (bytes32)',
  'function credentialExists(bytes32 credHash) external view returns (bool)',
  'event CredentialIssued(bytes32 indexed credHash, address indexed issuer, bytes32 commitment, uint256 issuedAt)',
  'event CredentialBatchIssued(uint256 count, address indexed issuer, uint256 issuedAt)',
];

export const REVOCATION_REGISTRY_ABI = [
  'function revokeCredential(bytes32 credHash, uint8 reasonCode) external returns (bool)',
  'function isCredentialRevoked(bytes32 credHash) external view returns (bool)',
  'function isCommitmentRevoked(bytes32 commitment) external view returns (bool)',
  'function getRevocationDetails(bytes32 credHash) external view returns (bool revoked, uint8 reasonCode, uint64 revokedAt, address revokedBy)',
  'event CredentialRevoked(bytes32 indexed credHash, address indexed issuer, uint8 reasonCode, uint256 revokedAt)',
];

export const DEFAULT_CONTRACT_ADDRESSES = {
  InstitutionRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  CredentialRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  RevocationRegistry: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
} as const;

export const POLYGON_AMOY_CONTRACT_ADDRESSES = {
  InstitutionRegistry: '0xF250601Ca003f6F97ae6a5b24eFFD99FC2D95266',
  CredentialRegistry: '0x35E7F512031B4F46c02e76bb1445E2DC38C7AB22',
  RevocationRegistry: '0xaacEAe5171E339763C3Cb68C5d2841816058DF78',
} as const;

export interface ContractAddresses {
  InstitutionRegistry: string;
  CredentialRegistry: string;
  RevocationRegistry: string;
}

export function formatBytes32(str: string): string {
  if (str.startsWith('0x') && str.length === 66) {
    return str;
  }
  return ethers.id(str);
}

export function formatCommitmentBytes32(commitment: string): string {
  if (commitment.startsWith('0x') && commitment.length === 66) {
    return commitment;
  }
  try {
    const big = BigInt(commitment);
    return ethers.zeroPadValue(ethers.toBeHex(big), 32);
  } catch {
    return ethers.id(commitment);
  }
}

export function getContractInstance(
  address: string,
  abi: string[],
  runner: ethers.ContractRunner
): ethers.Contract {
  return new ethers.Contract(address, abi, runner);
}

export class VeriCredContractClient {
  public readonly institutionRegistry: ethers.Contract;
  public readonly credentialRegistry: ethers.Contract;
  public readonly revocationRegistry: ethers.Contract;

  constructor(
    runner: ethers.ContractRunner,
    addresses: ContractAddresses = POLYGON_AMOY_CONTRACT_ADDRESSES
  ) {
    this.institutionRegistry = getContractInstance(
      addresses.InstitutionRegistry,
      INSTITUTION_REGISTRY_ABI,
      runner
    );
    this.credentialRegistry = getContractInstance(
      addresses.CredentialRegistry,
      CREDENTIAL_REGISTRY_ABI,
      runner
    );
    this.revocationRegistry = getContractInstance(
      addresses.RevocationRegistry,
      REVOCATION_REGISTRY_ABI,
      runner
    );
  }

  // ── Read Methods ────────────────────────────────────────────────────────────

  async isInstitutionAuthorized(institutionAddress: string): Promise<boolean> {
    return this.institutionRegistry.isAuthorized(institutionAddress);
  }

  async isCredentialRevoked(credHash: string): Promise<boolean> {
    const formatted = formatBytes32(credHash);
    return this.revocationRegistry.isCredentialRevoked(formatted);
  }

  async isCommitmentRevoked(commitment: string): Promise<boolean> {
    const formatted = formatCommitmentBytes32(commitment);
    return this.revocationRegistry.isCommitmentRevoked(formatted);
  }

  async credentialExists(credHash: string): Promise<boolean> {
    const formatted = formatBytes32(credHash);
    return this.credentialRegistry.credentialExists(formatted);
  }

  async getCredentialCommitment(credHash: string): Promise<string> {
    const formatted = formatBytes32(credHash);
    return this.credentialRegistry.getCredentialCommitment(formatted);
  }

  async getCredentialIssuer(credHash: string): Promise<string> {
    const formatted = formatBytes32(credHash);
    return this.credentialRegistry.getCredentialIssuer(formatted);
  }

  // ── Write Methods (Require Signer) ──────────────────────────────────────────

  async issueCredential(
    credHash: string,
    commitment: string
  ): Promise<ethers.ContractTransactionResponse> {
    const formattedHash = formatBytes32(credHash);
    const formattedCommitment = formatCommitmentBytes32(commitment);
    return this.credentialRegistry.issueCredential(formattedHash, formattedCommitment);
  }

  async issueCredentialBatch(
    credHashes: string[],
    commitments: string[]
  ): Promise<ethers.ContractTransactionResponse> {
    const formattedHashes = credHashes.map(formatBytes32);
    const formattedCommitments = commitments.map(formatCommitmentBytes32);
    return this.credentialRegistry.issueCredentialBatch(formattedHashes, formattedCommitments);
  }

  async revokeCredential(
    credHash: string,
    reasonCode: number
  ): Promise<ethers.ContractTransactionResponse> {
    const formattedHash = formatBytes32(credHash);
    return this.revocationRegistry.revokeCredential(formattedHash, reasonCode);
  }

  async registerInstitution(
    legalName: string,
    shortCode: string
  ): Promise<ethers.ContractTransactionResponse> {
    return this.institutionRegistry.registerInstitution(legalName, shortCode);
  }

  async approveInstitution(
    instAddress: string
  ): Promise<ethers.ContractTransactionResponse> {
    return this.institutionRegistry.approveInstitution(instAddress);
  }
}
