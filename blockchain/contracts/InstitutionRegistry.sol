// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./interfaces/IInstitutionRegistry.sol";

/**
 * @title InstitutionRegistry
 * @notice Decentralized directory of accredited higher education institutions and authorized BabyJubjub signing keys.
 * @dev Governed via Ownable2Step multi-sig/platform administrator. Holds zero funds.
 */
contract InstitutionRegistry is Ownable2Step, IInstitutionRegistry {
    // Custom error definitions for gas efficiency
    error InstitutionAlreadyExists(address instAddress);
    error InstitutionNotPending(address instAddress);
    error InstitutionNotApproved(address instAddress);
    error InvalidInstitutionDetails();
    error InvalidPublicKey();

    // Events
    event InstitutionRegistered(address indexed instAddress, string legalName, string shortCode);
    event InstitutionApproved(address indexed instAddress, uint256 approvedAt);
    event InstitutionSuspended(address indexed instAddress, uint256 suspendedAt);
    event IssuerKeyUpdated(address indexed instAddress, uint256 keyX, uint256 keyY);

    mapping(address => Institution) public institutions;
    mapping(bytes32 => bool) public authorizedKeys;

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Allows an academic institution to register itself for accreditation review.
     * @param legalName Full legal name of the university or institution.
     * @param shortCode Short university ticker (e.g. "RCCIIT", "MIT").
     */
    function registerInstitution(
        string calldata legalName,
        string calldata shortCode
    ) external override returns (bool) {
        if (bytes(legalName).length == 0 || bytes(shortCode).length == 0) {
            revert InvalidInstitutionDetails();
        }

        if (institutions[msg.sender].status != Status.NONE) {
            revert InstitutionAlreadyExists(msg.sender);
        }

        institutions[msg.sender] = Institution({
            legalName: legalName,
            shortCode: shortCode,
            status: Status.PENDING,
            keyX: 0,
            keyY: 0,
            registeredAt: uint64(block.timestamp),
            approvedAt: 0
        });

        emit InstitutionRegistered(msg.sender, legalName, shortCode);
        return true;
    }

    /**
     * @notice Approves a pending or suspended institution, granting credential anchoring privileges.
     * @param instAddress Ethereum address of the university.
     */
    function approveInstitution(address instAddress) external override onlyOwner returns (bool) {
        Status currentStatus = institutions[instAddress].status;
        if (currentStatus != Status.PENDING && currentStatus != Status.SUSPENDED) {
            revert InstitutionNotPending(instAddress);
        }

        institutions[instAddress].status = Status.APPROVED;
        institutions[instAddress].approvedAt = uint64(block.timestamp);

        emit InstitutionApproved(instAddress, block.timestamp);
        return true;
    }

    /**
     * @notice Suspends an accredited institution, immediately invalidating new credential anchoring.
     * @param instAddress Ethereum address of the university.
     */
    function suspendInstitution(address instAddress) external override onlyOwner returns (bool) {
        if (institutions[instAddress].status != Status.APPROVED) {
            revert InstitutionNotApproved(instAddress);
        }

        institutions[instAddress].status = Status.SUSPENDED;

        emit InstitutionSuspended(instAddress, block.timestamp);
        return true;
    }

    /**
     * @notice Allows an approved institution to publish or rotate their active BabyJubjub signing key.
     * @param keyX The X coordinate of the public key point on BabyJubjub.
     * @param keyY The Y coordinate of the public key point on BabyJubjub.
     */
    function updateIssuerKey(uint256 keyX, uint256 keyY) external override returns (bool) {
        if (institutions[msg.sender].status != Status.APPROVED) {
            revert InstitutionNotApproved(msg.sender);
        }

        if (keyX == 0 || keyY == 0) {
            revert InvalidPublicKey();
        }

        institutions[msg.sender].keyX = keyX;
        institutions[msg.sender].keyY = keyY;

        bytes32 keyHash = keccak256(abi.encodePacked(keyX, keyY));
        authorizedKeys[keyHash] = true;

        emit IssuerKeyUpdated(msg.sender, keyX, keyY);
        return true;
    }

    /**
     * @notice Checks if an institution is currently in APPROVED status.
     */
    function isAuthorized(address instAddress) external view override returns (bool) {
        return institutions[instAddress].status == Status.APPROVED;
    }

    /**
     * @notice Checks if a BabyJubjub public key has been authorized by an approved institution.
     */
    function isIssuerKeyAuthorized(uint256 keyX, uint256 keyY) external view override returns (bool) {
        bytes32 keyHash = keccak256(abi.encodePacked(keyX, keyY));
        return authorizedKeys[keyHash];
    }

    /**
     * @notice Returns full institution metadata.
     */
    function getInstitution(address instAddress) external view override returns (Institution memory) {
        return institutions[instAddress];
    }
}
