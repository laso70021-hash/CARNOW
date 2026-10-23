// Simple deterministic SHA-256 hashing for auth credentials
export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode("swahivo_salt_" + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
