export const certificateVerificationAbi = [
  'function issueCertificate(string memory certificateId, string memory studentName, string memory course, bytes32 certificateHash) external',
  'function verifyCertificate(string memory certificateId, bytes32 certificateHash) external view returns (string memory)',
  'function revokeCertificate(string memory certificateId) external',
  'function getCertificate(string memory certificateId) external view returns (string memory studentName, string memory course, bytes32 certificateHash, address issuer, uint256 issuedAt, bool revoked)',
  'event CertificateIssued(string indexed certificateId, address indexed issuer, string studentName, string course, uint256 issuedAt)',
  'event CertificateRevoked(string indexed certificateId, address indexed revokedBy, uint256 revokedAt)',
] as const;
