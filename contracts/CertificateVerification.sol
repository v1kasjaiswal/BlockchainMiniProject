// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CertificateVerification
 * @notice Issues, verifies, and revokes academic certificates on-chain.
 *         The certificate PDF is never stored on-chain — only its SHA-256
 *         hash is registered.  A verifier re-hashes the same PDF and
 *         compares it against the on-chain record.
 *
 * @dev    Run standalone demo:  npx hardhat run scripts/demo.cjs --network localhost
 *         Compile:              npx hardhat compile
 *         Start local node:     npx hardhat node
 */
contract CertificateVerification {

    // ─── Data structures ───────────────────────────────────────────────────────

    struct Certificate {
        string   studentName;
        string   course;
        bytes32  certificateHash;   // SHA-256 of the certificate PDF
        address  issuer;
        uint256  issuedAt;          // block.timestamp at issue time
        bool     revoked;
    }

    // ─── Storage ────────────────────────────────────────────────────────────────

    /// @dev certificateId (string) → Certificate record
    mapping(string => Certificate) private certificates;

    // ─── Events ─────────────────────────────────────────────────────────────────

    /// @notice Emitted when a new certificate is successfully issued.
    event CertificateIssued(
        string  indexed certificateId,
        address indexed issuer,
        string          studentName,
        string          course,
        uint256         issuedAt
    );

    /// @notice Emitted when a certificate is revoked by its issuer.
    event CertificateRevoked(
        string  indexed certificateId,
        address indexed revokedBy,
        uint256         revokedAt
    );

    // ─── Write functions ────────────────────────────────────────────────────────

    /**
     * @notice Issue a new certificate and store its hash on-chain.
     * @param certificateId   Unique human-readable ID (e.g. "CERT-2024-001").
     * @param studentName     Full name of the certificate holder.
     * @param course          Name of the course / degree.
     * @param certificateHash SHA-256 hash of the certificate PDF as bytes32.
     */
    function issueCertificate(
        string  memory certificateId,
        string  memory studentName,
        string  memory course,
        bytes32        certificateHash
    ) external {
        require(bytes(certificateId).length  > 0,  "Certificate ID is required");
        require(bytes(studentName).length    > 0,  "Student name is required");
        require(bytes(course).length         > 0,  "Course is required");
        require(certificateHash              != 0,  "Certificate hash is required");
        require(
            bytes(certificates[certificateId].studentName).length == 0,
            "Certificate ID already exists"
        );

        certificates[certificateId] = Certificate({
            studentName:     studentName,
            course:          course,
            certificateHash: certificateHash,
            issuer:          msg.sender,
            issuedAt:        block.timestamp,
            revoked:         false
        });

        emit CertificateIssued(certificateId, msg.sender, studentName, course, block.timestamp);
    }

    /**
     * @notice Revoke a previously issued certificate.
     * @dev    Only the original issuer may revoke.
     * @param  certificateId  The ID of the certificate to revoke.
     */
    function revokeCertificate(string memory certificateId) external {
        Certificate storage cert = certificates[certificateId];
        require(bytes(cert.studentName).length > 0,  "Certificate not found");
        require(cert.issuer == msg.sender,           "Only the original issuer can revoke");
        require(!cert.revoked,                       "Certificate is already revoked");

        cert.revoked = true;
        emit CertificateRevoked(certificateId, msg.sender, block.timestamp);
    }

    // ─── Read functions ─────────────────────────────────────────────────────────

    /**
     * @notice Verify a certificate by comparing the submitted hash with the
     *         on-chain record.
     * @param  certificateId   The certificate ID to look up.
     * @param  certificateHash SHA-256 hash of the PDF to check (as bytes32).
     * @return status          One of: "VALID", "INVALID", "REVOKED", "NOT_FOUND".
     */
    function verifyCertificate(
        string  memory certificateId,
        bytes32        certificateHash
    ) external view returns (string memory status) {
        Certificate storage cert = certificates[certificateId];

        if (bytes(cert.studentName).length == 0)  return "NOT_FOUND";
        if (cert.revoked)                          return "REVOKED";
        if (cert.certificateHash != certificateHash) return "INVALID";

        return "VALID";
    }

    /**
     * @notice Retrieve the full certificate record for a given ID.
     * @param  certificateId  The certificate ID to look up.
     * @return studentName    Name of the student.
     * @return course         Name of the course.
     * @return certificateHash  SHA-256 hash stored on-chain.
     * @return issuer         Address that issued the certificate.
     * @return issuedAt       Unix timestamp of issuance.
     * @return revoked        Whether the certificate has been revoked.
     */
    function getCertificate(string memory certificateId)
        external
        view
        returns (
            string  memory studentName,
            string  memory course,
            bytes32        certificateHash,
            address        issuer,
            uint256        issuedAt,
            bool           revoked
        )
    {
        Certificate storage cert = certificates[certificateId];
        return (
            cert.studentName,
            cert.course,
            cert.certificateHash,
            cert.issuer,
            cert.issuedAt,
            cert.revoked
        );
    }
}
