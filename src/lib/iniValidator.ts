import { validationMetadata } from './validationSchemas';

export interface IniError {
  line: number;
  message: string;
  advice?: string;
  ref?: string;
  key?: string;
  isWarning?: boolean;
}

export function validateIni(content: string): IniError[] {
  const lines = content.split(/\r?\n/);
  const errors: IniError[] = [];
  
  let currentFile: string | null = null;
  let currentSection: string | null = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) return;

    // Rileva sezioni dei file [file:xxx]
    if (trimmed.startsWith('[file:')) {
      currentFile = trimmed;
      currentSection = null;
      return;
    }

    // Rileva sezioni interne [xxx]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed;
      return;
    }

    // Coppie chiave-valore
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      
      // Check if key exists in our metadata
      if (validationMetadata[key]) {
        const metadata = validationMetadata[key];
        
        // Controlli sintassici di base (segnaposto per logiche più complesse)
        if (key === 'hostname' && value.includes(' ')) {
          errors.push({
            line: index + 1,
            message: "Gli indirizzi host non possono contenere spazi.",
            advice: metadata.advice,
            ref: metadata.ref,
            key
          });
        }
        
        if (key.includes('Color') && !value.match(/^#[0-9a-fA-F]{6}$/)) {
          errors.push({
            line: index + 1,
            message: "Formato colore hex non valido (es. #FF00FF).",
            advice: metadata.advice,
            ref: metadata.ref,
            key
          });
        }
      }
    } else if (!trimmed.startsWith('[') && trimmed.length > 0) {
       // Trovato testo che non è né una sezione né una coppia chiave-valore
       // In alcune sezioni come [file:v_key], la seconda riga è solo la chiave di licenza
       if (currentFile === '[file:v_key]') {
          // Questo è previsto
       } else {
         errors.push({
            line: index + 1,
            message: "Riga malformata: prevista chiave=valore o [sezione].",
            isWarning: true
          });
       }
    }
  });

  return errors;
}

/**
 * Reverse-parses an INI string into a Partial form values record.
 */
export function parseIniToValues(content: string): Record<string, any> {
  const lines = content.split(/\r?\n/);
  const values: Record<string, any> = {};
  
  lines.forEach(line => {
    const trimmed = line.trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0 && !trimmed.startsWith(';') && !trimmed.startsWith('#')) {
      const key = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      
      // Tenta di forzare i tipi in base ai valori previsti
      if (value.toLowerCase() === 'true') values[key] = true;
      else if (value.toLowerCase() === 'false') values[key] = false;
      else if (!isNaN(Number(value)) && value !== '' && !value.startsWith('0x')) values[key] = Number(value);
      else values[key] = value;
    }
  });
  
  return values;
}
