// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IRevocationRegistry {
    struct RevocationRecord {
        bool isRevoked;
        uint8 reasonCode;
        uint64 revokedAt;
        address revokedBy;
    }

    function revokeCredential(bytes32 credHash, uint8 reasonCode) external returns (bool);
    function isCredentialRevoked(bytes32 credHash) external view returns (bool);
    function getRevocationDetails(bytes32 credHash) external view returns (
        bool revoked,
        uint8 reasonCode,
        uint64 revokedAt,
        address revokedBy
    );
}
