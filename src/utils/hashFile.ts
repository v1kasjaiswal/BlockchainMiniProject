export async function hashFile(file: File): Promise<string> {
  if (!file) {
    throw new Error('Please choose a PDF first.');
  }

  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const hashHex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return `0x${hashHex}`;
}
