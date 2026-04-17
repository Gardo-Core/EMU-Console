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
 * Handles EMU Console specific mapping and complex deconstruction.
 */
export function parseIniToValues(content: string): Record<string, any> {
  const lines = content.split(/\r?\n/);
  const values: Record<string, any> = {};
  
  // Mapping from INI keys to Form field names
  const keyMap: Record<string, string> = {
    'com.ibm5250model': 'ibm5250Model',
    'screen.autoconnect': 'autoConnect',
    'screen.noautolock': 'noAutoLock',
    'screen.showkeyboard': 'showKeyboard',
    'screen.orientation': 'orientation',
    'screen.fontsize': 'fontSize',
    'screen.scrcolor': 'scrColor',
    'screen.stscolor': 'stsColor',
    'print.bcenable': 'barcodeEnable',
    'print.bcdoafter': 'barcodeDoAfter',
    'print.bcshow': 'barcodeShow',
    'print.bcusekeymap': 'barcodeUseKeymap',
    'emu.anycmdresets': 'anyCmdResets',
    'keyboard.kc.4_DpadLeft': 'dpadLeftMacro',
    'keyboard.kc.5_DpadRight': 'dpadRightMacro',
    'E2KServer': 'e2kServer',
    'config.profile': 'profileName' // Some templates use this
  };

  let currentFile: string | null = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Track [file:xxx] sections
    if (trimmed.startsWith('[file:')) {
      currentFile = trimmed;
      return;
    }

    // Handle profile name in section headers [SOMETHING]
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.startsWith('[file:')) {
      const sectionName = trimmed.substring(1, trimmed.length - 1);
      // If we haven't found a better profile name yet, use this one
      // (Ignoring standard internal sections if any)
      if (sectionName !== 'file:v_key' && sectionName !== 'printers' && sectionName !== 'keyboards') {
        values['profileName'] = sectionName;
      }
      return;
    }

    // Handle v_key license key (it's often just a single line in a section)
    if (currentFile === '[file:v_key]' && !trimmed.includes('=') && trimmed.length > 5) {
      values['licenseKey'] = trimmed;
      return;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0 && !trimmed.startsWith(';') && !trimmed.startsWith('#')) {
      const iniKey = trimmed.substring(0, eqIdx).trim();
      let iniValue = trimmed.substring(eqIdx + 1).trim();
      
      // Handle deconstruction of com.servername
      if (iniKey === 'com.servername') {
        // Example: ASP.BLUSYS.IT -du USER -d? PASS /S SCRIPT
        const hostnameMatch = iniValue.match(/^([^ -]+)/);
        if (hostnameMatch) values['hostname'] = hostnameMatch[1];

        const userMatch = iniValue.match(/-du ([^ ]+)/);
        if (userMatch) {
          if (userMatch[1] === '*') {
            values['askUserId'] = true;
            values['userId'] = '';
          } else {
            values['askUserId'] = false;
            values['userId'] = userMatch[1];
          }
        }

        const passMatch = iniValue.match(/-d\? ([^ ]+)/);
        if (passMatch) {
          if (passMatch[1] === '*') {
            values['askPassword'] = true;
            values['password'] = '';
          } else {
            values['askPassword'] = false;
            values['password'] = passMatch[1]; // Note: This might be hashed, but we populate it anyway
          }
        }

        const scriptMatch = iniValue.match(/\/S ([^ ]+)/);
        if (scriptMatch) {
          values['enableAutoLogin'] = true;
          values['scriptName'] = scriptMatch[1];
        } else {
          values['enableAutoLogin'] = false;
        }
        return;
      }

      const formKey = keyMap[iniKey] || iniKey;
      
      // Tenta di forzare i tipi in base ai valori previsti
      let finalValue: any = iniValue;
      if (iniValue.toLowerCase() === 'true') finalValue = true;
      else if (iniValue.toLowerCase() === 'false') finalValue = false;
      else if (!isNaN(Number(iniValue)) && iniValue !== '' && !iniValue.startsWith('0x')) {
        finalValue = Number(iniValue);
      }
      
      values[formKey] = finalValue;
    }
  });
  
  return values;
}
