export function hashPassword(plaintext: string): string {
    if (!plaintext) return "";
    
    // Simulates Glink's ^$ prefixed password. 
    // Glink actually uses a specific encryption format, but since we are generating
    // a pseudo-hash for internal distribution, we mock a deterministic format
    // based on hex strings, preserving the required prefix.
    const hex = Array.from(plaintext)
      .map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
      .join('');
      
    // Using a chunk of the original hash pattern as a dummy suffix for length
    return `^$${hex}B6074C1846`;
  }
  
  export const DEFAULT_HASH = '^$AB74B6074C1846';
