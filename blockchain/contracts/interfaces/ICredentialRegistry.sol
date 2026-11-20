// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ICredentialRegistry {
    struct CredentialRecord {
        address issuer;
        uint64 issuedAt;
        bytes32 commitment;
    }

    function issueCredential(bytes32 credHash, bytes32 commitment) external returns (bool);
    function issueCredentialBatch(bytes32[] calldata credHashes, bytes32[] calldata commitments) external returns (bool);
    function getCredentialIssuer(bytes32 credHash) external view returns (address);
    function getCredentialCommitment(bytes32 credHash) external view returns (bytes32);
    function credentialExists(bytes32 credHash) external view returns (bool);
}
