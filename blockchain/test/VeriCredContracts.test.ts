import '@nomicfoundation/hardhat-toolbox';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import type {
  InstitutionRegistry,
  CredentialRegistry,
  RevocationRegistry,
} from '../typechain-types';

describe('VERICRED Smart Contracts Suite', () => {
  let owner: any;
  let rcciit: any;
  let jadavpur: any;
  let attacker: any;

  let institutionRegistry: InstitutionRegistry;
  let credentialRegistry: CredentialRegistry;
  let revocationRegistry: RevocationRegistry;

  const DUMMY_KEY_X = 1234567890123456789012345678901234567890123456789012345678901234n;
  const DUMMY_KEY_Y = 9876543210987654321098765432109876543210987654321098765432109876n;

  const CRED_HASH_1 = ethers.keccak256(ethers.toUtf8Bytes('urn:uuid:cred-aarav-sen'));
  const COMMITMENT_1 = ethers.keccak256(ethers.toUtf8Bytes('poseidon(872, saltAarav)'));

  const CRED_HASH_2 = ethers.keccak256(ethers.toUtf8Bytes('urn:uuid:cred-diya-roy'));
  const COMMITMENT_2 = ethers.keccak256(ethers.toUtf8Bytes('poseidon(910, saltDiya)'));

  beforeEach(async () => {
    [owner, rcciit, jadavpur, attacker] = await (ethers as any).getSigners();

    // 1. Deploy InstitutionRegistry
    const InstitutionRegistryFactory = await ethers.getContractFactory('InstitutionRegistry');
    institutionRegistry = await InstitutionRegistryFactory.deploy(owner.address);
    await institutionRegistry.waitForDeployment();

    // 2. Deploy CredentialRegistry
    const CredentialRegistryFactory = await ethers.getContractFactory('CredentialRegistry');
    credentialRegistry = await CredentialRegistryFactory.deploy(
      owner.address,
      await institutionRegistry.getAddress()
    );
    await credentialRegistry.waitForDeployment();

    // 3. Deploy RevocationRegistry
    const RevocationRegistryFactory = await ethers.getContractFactory('RevocationRegistry');
    revocationRegistry = await RevocationRegistryFactory.deploy(
      owner.address,
      await credentialRegistry.getAddress()
    );
    await revocationRegistry.waitForDeployment();
  });

  describe('InstitutionRegistry', () => {
    it('sets the correct owner upon deployment', async () => {
      expect(await institutionRegistry.owner()).to.equal(owner.address);
    });

    it('allows an institution to register with PENDING status', async () => {
      await expect(
        institutionRegistry
          .connect(rcciit)
          .registerInstitution('RCC Institute of Information Technology', 'RCCIIT')
      )
        .to.emit(institutionRegistry, 'InstitutionRegistered')
        .withArgs(rcciit.address, 'RCC Institute of Information Technology', 'RCCIIT');

      const inst = await institutionRegistry.getInstitution(rcciit.address);
      expect(inst.legalName).to.equal('RCC Institute of Information Technology');
      expect(inst.shortCode).to.equal('RCCIIT');
      expect(inst.status).to.equal(1); // Status.PENDING
      expect(await institutionRegistry.isAuthorized(rcciit.address)).to.equal(false);
    });

    it('prevents duplicate registration from the same address', async () => {
      await institutionRegistry
        .connect(rcciit)
        .registerInstitution('RCC Institute of Information Technology', 'RCCIIT');

      await expect(
        institutionRegistry
          .connect(rcciit)
          .registerInstitution('Duplicate University', 'DUP')
      ).to.be.revertedWithCustomError(institutionRegistry, 'InstitutionAlreadyExists');
    });

    it('allows owner to approve a pending institution and verifies authorization', async () => {
      await institutionRegistry
        .connect(rcciit)
        .registerInstitution('RCC Institute of Information Technology', 'RCCIIT');

      await expect(institutionRegistry.connect(owner).approveInstitution(rcciit.address))
        .to.emit(institutionRegistry, 'InstitutionApproved');

      const inst = await institutionRegistry.getInstitution(rcciit.address);
      expect(inst.status).to.equal(2); // Status.APPROVED
      expect(await institutionRegistry.isAuthorized(rcciit.address)).to.equal(true);
    });

    it('blocks non-owner from approving an institution', async () => {
      await institutionRegistry
        .connect(rcciit)
        .registerInstitution('RCC Institute of Information Technology', 'RCCIIT');

      await expect(
        institutionRegistry.connect(attacker).approveInstitution(rcciit.address)
      ).to.be.revertedWithCustomError(institutionRegistry, 'OwnableUnauthorizedAccount');
    });

    it('allows approved institution to update BabyJubjub signing keys', async () => {
      await institutionRegistry
        .connect(rcciit)
        .registerInstitution('RCC Institute of Information Technology', 'RCCIIT');
      await institutionRegistry.connect(owner).approveInstitution(rcciit.address);

      await expect(
        institutionRegistry.connect(rcciit).updateIssuerKey(DUMMY_KEY_X, DUMMY_KEY_Y)
      )
        .to.emit(institutionRegistry, 'IssuerKeyUpdated')
        .withArgs(rcciit.address, DUMMY_KEY_X, DUMMY_KEY_Y);

      expect(
        await institutionRegistry.isIssuerKeyAuthorized(DUMMY_KEY_X, DUMMY_KEY_Y)
      ).to.equal(true);
    });

    it('blocks unapproved institution from updating keys', async () => {
      await expect(
        institutionRegistry.connect(attacker).updateIssuerKey(DUMMY_KEY_X, DUMMY_KEY_Y)
      ).to.be.revertedWithCustomError(institutionRegistry, 'InstitutionNotApproved');
    });

    it('allows owner to suspend an approved institution', async () => {
      await institutionRegistry
        .connect(rcciit)
        .registerInstitution('RCC Institute of Information Technology', 'RCCIIT');
      await institutionRegistry.connect(owner).approveInstitution(rcciit.address);

      await expect(institutionRegistry.connect(owner).suspendInstitution(rcciit.address))
        .to.emit(institutionRegistry, 'InstitutionSuspended');

      expect(await institutionRegistry.isAuthorized(rcciit.address)).to.equal(false);
    });
  });

  describe('CredentialRegistry', () => {
    beforeEach(async () => {
      // Approve RCC-IIT
      await institutionRegistry
        .connect(rcciit)
        .registerInstitution('RCC Institute of Information Technology', 'RCCIIT');
      await institutionRegistry.connect(owner).approveInstitution(rcciit.address);
      await institutionRegistry.connect(rcciit).updateIssuerKey(DUMMY_KEY_X, DUMMY_KEY_Y);
    });

    it('allows an approved institution to issue and anchor a credential commitment', async () => {
      await expect(
        credentialRegistry.connect(rcciit).issueCredential(CRED_HASH_1, COMMITMENT_1)
      )
        .to.emit(credentialRegistry, 'CredentialIssued');

      expect(await credentialRegistry.credentialExists(CRED_HASH_1)).to.equal(true);
      expect(await credentialRegistry.getCredentialIssuer(CRED_HASH_1)).to.equal(rcciit.address);
      expect(await credentialRegistry.getCredentialCommitment(CRED_HASH_1)).to.equal(COMMITMENT_1);
    });

    it('blocks unaccredited attacker from issuing credentials', async () => {
      await expect(
        credentialRegistry.connect(attacker).issueCredential(CRED_HASH_1, COMMITMENT_1)
      ).to.be.revertedWithCustomError(credentialRegistry, 'InstitutionNotAuthorized');
    });

    it('blocks duplicate issuance of the same credential hash', async () => {
      await credentialRegistry.connect(rcciit).issueCredential(CRED_HASH_1, COMMITMENT_1);

      await expect(
        credentialRegistry.connect(rcciit).issueCredential(CRED_HASH_1, COMMITMENT_1)
      ).to.be.revertedWithCustomError(credentialRegistry, 'CredentialAlreadyExists');
    });

    it('supports atomic batch credential issuance for graduating cohorts', async () => {
      const hashes = [CRED_HASH_1, CRED_HASH_2];
      const commitments = [COMMITMENT_1, COMMITMENT_2];

      await expect(credentialRegistry.connect(rcciit).issueCredentialBatch(hashes, commitments))
        .to.emit(credentialRegistry, 'CredentialBatchIssued')
        .withArgs(2, rcciit.address, (val: any) => val > 0);

      expect(await credentialRegistry.credentialExists(CRED_HASH_1)).to.equal(true);
      expect(await credentialRegistry.credentialExists(CRED_HASH_2)).to.equal(true);
    });

    it('rejects batch issuance if array lengths mismatch', async () => {
      await expect(
        credentialRegistry
          .connect(rcciit)
          .issueCredentialBatch([CRED_HASH_1, CRED_HASH_2], [COMMITMENT_1])
      ).to.be.revertedWithCustomError(credentialRegistry, 'InvalidArrayLength');
    });
  });

  describe('RevocationRegistry', () => {
    beforeEach(async () => {
      // Approve RCC-IIT and anchor a credential
      await institutionRegistry
        .connect(rcciit)
        .registerInstitution('RCC Institute of Information Technology', 'RCCIIT');
      await institutionRegistry.connect(owner).approveInstitution(rcciit.address);
      await credentialRegistry.connect(rcciit).issueCredential(CRED_HASH_1, COMMITMENT_1);
    });

    it('allows the original issuer to revoke a credential with reason code', async () => {
      const DISCIPLINARY = 1; // RevocationReason.DISCIPLINARY

      await expect(revocationRegistry.connect(rcciit).revokeCredential(CRED_HASH_1, DISCIPLINARY))
        .to.emit(revocationRegistry, 'CredentialRevoked')
        .withArgs(CRED_HASH_1, rcciit.address, DISCIPLINARY, (val: any) => val > 0);

      expect(await revocationRegistry.isCredentialRevoked(CRED_HASH_1)).to.equal(true);
      expect(await revocationRegistry.isCommitmentRevoked(COMMITMENT_1)).to.equal(true);

      const [revoked, reasonCode, revokedAt, revokedBy] =
        await revocationRegistry.getRevocationDetails(CRED_HASH_1);
      expect(revoked).to.equal(true);
      expect(reasonCode).to.equal(DISCIPLINARY);
      expect(revokedBy).to.equal(rcciit.address);
      expect(revokedAt).to.be.greaterThan(0);
    });

    it('strictly prevents an unauthorized party from revoking a credential', async () => {
      await expect(
        revocationRegistry.connect(attacker).revokeCredential(CRED_HASH_1, 1)
      ).to.be.revertedWithCustomError(revocationRegistry, 'OnlyOriginalIssuerCanRevoke');
    });

    it('strictly prevents platform administrator from revoking an institutional credential', async () => {
      // Enforces sovereign institutional authority
      await expect(
        revocationRegistry.connect(owner).revokeCredential(CRED_HASH_1, 1)
      ).to.be.revertedWithCustomError(revocationRegistry, 'OnlyOriginalIssuerCanRevoke');
    });

    it('prevents double revocation of the same credential', async () => {
      await revocationRegistry.connect(rcciit).revokeCredential(CRED_HASH_1, 1);

      await expect(
        revocationRegistry.connect(rcciit).revokeCredential(CRED_HASH_1, 1)
      ).to.be.revertedWithCustomError(revocationRegistry, 'CredentialAlreadyRevoked');
    });
  });
});
