// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./interfaces/ICredentialRegistry.sol";
import "./interfaces/IInstitutionRegistry.sol";

/**
 * @title CredentialRegistry
 * @notice Provides immutable on-chain anchoring for academic credentials.
 * @dev Binds salted Poseidon commitments and credential digests to authorized university addresses without storing plaintext PII.
 */
contract CredentialRegistry is Ownable2Step, ICredentialRegistry {
    error InstitutionNotAuthorized(address caller);
    error CredentialAlreadyExists(bytes32 credHash);
    error InvalidArrayLength();
    error InvalidCredentialParameters();
    error CredentialDoesNotExist(bytes32 credHash);

    event CredentialIssued(
        bytes32 indexed credHash,
        address indexed issuer,
        bytes32 commitment,
        uint256 issuedAt
    );
    event CredentialBatchIssued(uint256 count, address indexed issuer, uint256 issuedAt);

    mapping(bytes32 => CredentialRecord) public credentials;
    IInstitutionRegistry public immutable institutionRegistry;

    constructor(address initialOwner, address _institutionRegistry) Ownable(initialOwner) {
        institutionRegistry = IInstitutionRegistry(_institutionRegistry);
    }

    /**
     * @notice Anchors a single verifiable credential commitment on-chain.
     * @param credHash SHA-256 or Poseidon digest of the credential identifier.
     * @param commitment Salted Poseidon commitment of the student's academic standing (C = Poseidon(scaledCgpa, salt)).
     */
    function issueCredential(
        bytes32 credHash,
        bytes32 commitment
    ) external override returns (bool) {
        if (!institutionRegistry.isAuthorized(msg.sender)) {
            revert InstitutionNotAuthorized(msg.sender);
        }

        if (credHash == bytes32(0) || commitment == bytes32(0)) {
            revert InvalidCredentialParameters();
        }

        if (credentials[credHash].issuedAt != 0) {
            revert CredentialAlreadyExists(credHash);
        }

        credentials[credHash] = CredentialRecord({
            issuer: msg.sender,
            issuedAt: uint64(block.timestamp),
            commitment: commitment
        });

        emit CredentialIssued(credHash, msg.sender, commitment, block.timestamp);
        return true;
    }

    /**
     * @notice Performs atomic batch anchoring for graduating classes.
     * @param credHashes Array of credential digests.
     * @param commitments Array of corresponding Poseidon commitments.
     */
    function issueCredentialBatch(
        bytes32[] calldata credHashes,
        bytes32[] calldata commitments
    ) external override returns (bool) {
        if (!institutionRegistry.isAuthorized(msg.sender)) {
            revert InstitutionNotAuthorized(msg.sender);
        }

        uint256 count = credHashes.length;
        if (count == 0 || count != commitments.length) {
            revert InvalidArrayLength();
        }

        for (uint256 i = 0; i < count; ) {
            bytes32 cHash = credHashes[i];
            bytes32 cCommit = commitments[i];

            if (cHash == bytes32(0) || cCommit == bytes32(0)) {
                revert InvalidCredentialParameters();
            }

            if (credentials[cHash].issuedAt != 0) {
                revert CredentialAlreadyExists(cHash);
            }

            credentials[cHash] = CredentialRecord({
                issuer: msg.sender,
                issuedAt: uint64(block.timestamp),
                commitment: cCommit
            });

            emit CredentialIssued(cHash, msg.sender, cCommit, block.timestamp);

            unchecked {
                ++i;
            }
        }

        emit CredentialBatchIssued(count, msg.sender, block.timestamp);
        return true;
    }

    /**
     * @notice Retrieves the issuing university address for a given credential hash.
     */
    function getCredentialIssuer(bytes32 credHash) external view override returns (address) {
        address issuer = credentials[credHash].issuer;
        if (issuer == address(0)) {
            revert CredentialDoesNotExist(credHash);
        }
        return issuer;
    }

    /**
     * @notice Retrieves the Poseidon commitment for a given credential hash.
     */
    function getCredentialCommitment(bytes32 credHash) external view override returns (bytes32) {
        bytes32 commitment = credentials[credHash].commitment;
        if (commitment == bytes32(0)) {
            revert CredentialDoesNotExist(credHash);
        }
        return commitment;
    }

    /**
     * @notice Returns true if the credential has been anchored on-chain.
     */
    function credentialExists(bytes32 credHash) external view override returns (bool) {
        return credentials[credHash].issuedAt != 0;
    }
}
