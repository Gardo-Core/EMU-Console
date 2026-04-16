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

    // Detect file sections [file:xxx]
    if (trimmed.startsWith('[file:')) {
      currentFile = trimmed;
      currentSection = null;
      return;
    }

    // Detect internal sections [xxx]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed;
      return;
    }

    // Key-value pairs
    if (trimmed.includes('=')) {
      const [key, value] = trimmed.split('=').map(s => s.trim());
      
      // Check if key exists in our metadata
      if (validationMetadata[key]) {
        const metadata = validationMetadata[key];
        
        // Basic syntax checks (placeholder for more complex logic)
        if (key === 'hostname' && value.includes(' ')) {
          errors.push({
            line: index + 1,
            message: "Host addresses cannot contain spaces.",
            advice: metadata.advice,
            ref: metadata.ref,
            key
          });
        }
        
        if (key.includes('Color') && !value.match(/^#[0-9a-fA-F]{6}$/)) {
          errors.push({
            line: index + 1,
            message: "Invalid hex color format (e.g., #FF00FF).",
            advice: metadata.advice,
            ref: metadata.ref,
            key
          });
        }
      }
    } else if (!trimmed.startsWith('[') && trimmed.length > 0) {
       // Found text that is neither a section nor a key-value pair
       // In some sections like [file:v_key], the second line is just the license key
       if (currentFile === '[file:v_key]') {
          // This is expected
       } else {
         errors.push({
            line: index + 1,
            message: "Malformed line: Expected key=value or [section].",
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
    if (trimmed.includes('=') && !trimmed.startsWith(';') && !trimmed.startsWith('#')) {
      const [key, value] = trimmed.split('=').map(s => s.trim());
      
      // Attempt to coerce types based on expected values
      if (value === 'true') values[key] = true;
      else if (value === 'false') values[key] = false;
      else if (!isNaN(Number(value)) && value !== '') values[key] = Number(value);
      else values[key] = value;
    }
  });
  
  return values;
}
