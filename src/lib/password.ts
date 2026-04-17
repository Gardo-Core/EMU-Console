/**
 * Questa funzione simula l'hashing delle password utilizzato da Glink.
 * In Glink, le password salvate nei file INI non sono in chiaro ma hanno 
 * un prefisso '^$' seguito da una stringa esadecimale offuscata.
 */
export function hashPassword(plaintext: string): string {
    if (!plaintext) return "";
    
    // NOTA TECNICA: Poiché l'algoritmo di criptazione esatto di Glink è proprietario,
    // qui generiamo una stringa deterministica basata sui codici esadecimali dei caratteri.
    // Serve a far sì che il software accetti il valore come una password "valida" nel file.
    const hex = Array.from(plaintext)
      .map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
      .join('');
      
    // Aggiungiamo un suffisso statico per emulare la lunghezza tipica delle chiavi reali
    return `^$${hex}B6074C1846`;
  }
  
  // Una password di esempio già hashata, usata come fallback o test
  export const DEFAULT_HASH = '^$AB74B6074C1846';
