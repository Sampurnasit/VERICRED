// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IInstitutionRegistry {
    enum Status { NONE, PENDING, APPROVED, SUSPENDED }

    struct Institution {
        string legalName;
        string shortCode;
        Status status;
        uint256 keyX;
        uint256 keyY;
        uint64 registeredAt;
        uint64 approvedAt;
    }

    function registerInstitution(string calldata legalName, string calldata shortCode) external returns (bool);
    function approveInstitution(address instAddress) external returns (bool);
    function suspendInstitution(address instAddress) external returns (bool);
    function updateIssuerKey(uint256 keyX, uint256 keyY) external returns (bool);
    function isAuthorized(address instAddress) external view returns (bool);
    function isIssuerKeyAuthorized(uint256 keyX, uint256 keyY) external view returns (bool);
    function getInstitution(address instAddress) external view returns (Institution memory);
}
