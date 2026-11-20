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
    addresses = DEFAULT_CONTRACT_ADDRESSES
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

  async isInstitutionAuthorized(institutionAddress: string): Promise<bool> {
    return this.institutionRegistry.isAuthorized(institutionAddress);
  }

  async isCredentialRevoked(credHash: string): Promise<bool> {
    return this.revocationRegistry.isCredentialRevoked(credHash);
  }

  async isCommitmentRevoked(commitment: string): Promise<bool> {
    return this.revocationRegistry.isCommitmentRevoked(commitment);
  }

  async credentialExists(credHash: string): Promise<bool> {
    return this.credentialRegistry.credentialExists(credHash);
  }
}
type bool = boolean;
