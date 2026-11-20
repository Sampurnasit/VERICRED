// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./interfaces/IRevocationRegistry.sol";
import "./interfaces/ICredentialRegistry.sol";

/**
 * @title RevocationRegistry
 * @notice Permanent and tamper-evident revocation registry for academic credentials.
 * @dev Enforces sovereign institutional authority: strictly only the original issuing university can revoke a credential.
 */
contract RevocationRegistry is Ownable2Step, IRevocationRegistry {
    error OnlyOriginalIssuerCanRevoke(address caller, address originalIssuer);
    error CredentialAlreadyRevoked(bytes32 credHash);
    error CredentialDoesNotExist(bytes32 credHash);

    event CredentialRevoked(
        bytes32 indexed credHash,
        address indexed issuer,
        uint8 reasonCode,
        uint256 revokedAt
    );

    mapping(bytes32 => RevocationRecord) public revocations;
    mapping(bytes32 => bool) public commitmentRevocations;

    ICredentialRegistry public immutable credentialRegistry;

    constructor(address initialOwner, address _credentialRegistry) Ownable(initialOwner) {
        credentialRegistry = ICredentialRegistry(_credentialRegistry);
    }

    /**
     * @notice Revokes an issued credential with an auditable reason code.
     * @param credHash Digest of the credential.
     * @param reasonCode Standardization code (0=Unspecified, 1=Disciplinary, 2=Admin Error, 3=Retracted).
     */
    function revokeCredential(
        bytes32 credHash,
        uint8 reasonCode
    ) external override returns (bool) {
        address originalIssuer = credentialRegistry.getCredentialIssuer(credHash);

        if (msg.sender != originalIssuer) {
            revert OnlyOriginalIssuerCanRevoke(msg.sender, originalIssuer);
        }

        if (revocations[credHash].isRevoked) {
            revert CredentialAlreadyRevoked(credHash);
        }

        bytes32 commitment = credentialRegistry.getCredentialCommitment(credHash);

        revocations[credHash] = RevocationRecord({
            isRevoked: true,
            reasonCode: reasonCode,
            revokedAt: uint64(block.timestamp),
            revokedBy: msg.sender
        });

        commitmentRevocations[commitment] = true;

        emit CredentialRevoked(credHash, msg.sender, reasonCode, block.timestamp);
        return true;
    }

    /**
     * @notice Checks if a credential hash has been revoked.
     */
    function isCredentialRevoked(bytes32 credHash) external view override returns (bool) {
        return revocations[credHash].isRevoked;
    }

    /**
     * @notice Checks if a Poseidon commitment has been revoked.
     */
    function isCommitmentRevoked(bytes32 commitment) external view returns (bool) {
        return commitmentRevocations[commitment];
    }

    /**
     * @notice Returns full audit details of a credential revocation.
     */
    function getRevocationDetails(
        bytes32 credHash
    ) external view override returns (
        bool revoked,
        uint8 reasonCode,
        uint64 revokedAt,
        address revokedBy
    ) {
        RevocationRecord memory record = revocations[credHash];
        return (record.isRevoked, record.reasonCode, record.revokedAt, record.revokedBy);
    }
}
