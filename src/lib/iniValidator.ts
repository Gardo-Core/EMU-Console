import { validationMetadata } from './schema';
import { IniAst } from './iniAst';

export interface IniError {
  line: number;
  message: string;
  advice?: string;
  ref?: string;
  key?: string;
  isWarning?: boolean;
}

export function validateIni(content: string): IniError[] {
  const ast = new IniAst(content);
  const errors: IniError[] = [];
  
  let currentFile: string | null = null;

  ast.nodes.forEach((node, index) => {
    const lineNum = index + 1;

    if (node.type === 'Section') {
      if (node.sectionName?.startsWith('file:')) {
        currentFile = node.sectionName;
      }
      return;
    }

    if (node.type === 'Property') {
      const { key, value } = node;
      if (!key || value === undefined) return;

      if (validationMetadata[key]) {
        const metadata = validationMetadata[key];
        
        if (key === 'hostname' && value.includes(' ')) {
          errors.push({
            line: lineNum,
            message: "Gli indirizzi host non possono contenere spazi.",
            advice: metadata.advice,
            ref: metadata.ref,
            key
          });
        }
        
        if (key.includes('Color') && !value.match(/^#[0-9a-fA-F]{6}$/)) {
          errors.push({
            line: lineNum,
            message: "Formato colore hex non valido (es. #FF00FF).",
            advice: metadata.advice,
            ref: metadata.ref,
            key
          });
        }
      }
    } else if (node.type === 'Raw' && node.content.length > 0) {
       if (currentFile !== 'file:v_key') {
         errors.push({
            line: lineNum,
            message: "Riga malformata: prevista chiave=valore o [sezione].",
            isWarning: true
          });
       }
    }
  });

  return errors;
}

export function parseIniToValues(content: string): Record<string, any> {
  const ast = new IniAst(content);
  const values: Record<string, any> = {};
  
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
    'config.profile': 'profileName' 
  };

  let currentFile: string | null = null;

  ast.nodes.forEach(node => {
    if (node.type === 'Section') {
      currentFile = node.sectionName || null;
      if (currentFile && !currentFile.startsWith('file:') && !['printers', 'keyboards'].includes(currentFile)) {
        values['profileName'] = currentFile;
      }
      return;
    }

    if (node.type === 'Raw' && currentFile === 'file:v_key' && node.content.length > 5) {
      values['licenseKey'] = node.content;
      return;
    }

    if (node.type === 'Property') {
      const { key: iniKey, value: iniValue } = node;
      if (!iniKey || iniValue === undefined) return;

      if (iniKey === 'com.servername') {
        const hostnameMatch = iniValue.match(/^([^ -]+)/);
        if (hostnameMatch) values['hostname'] = hostnameMatch[1];

        const userMatch = iniValue.match(/-du ([^ ]+)/);
        if (userMatch) {
          if (userMatch[1] === '*') {
            values['askUserId'] = true;
          } else {
            values['askUserId'] = false;
            values['userId'] = userMatch[1];
          }
        }

        const passMatch = iniValue.match(/-d\? ([^ ]+)/);
        if (passMatch) {
          if (passMatch[1] === '*') {
            values['askPassword'] = true;
          } else {
            values['askPassword'] = false;
            values['password'] = passMatch[1]; 
          }
        }

        const scriptMatch = iniValue.match(/\/S ([^ ]+)/);
        if (scriptMatch) {
          values['enableAutoLogin'] = true;
          values['scriptName'] = scriptMatch[1];
        }
        return;
      }

      const formKey = keyMap[iniKey] || iniKey;
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

