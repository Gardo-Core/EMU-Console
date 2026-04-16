import { ConfigFormValues } from './schema';
import { hashPassword } from './password';

export function mergeTemplate(baseContent: string, values: ConfigFormValues, oldProfileName: string): string {
  const lineEnding = baseContent.includes('\r\n') ? '\r\n' : '\n';
  let lines = baseContent.split(/\r?\n/);
  
  // Identifichiamo [file:xxx] per sapere dove ci troviamo concettualmente
  let currentSection = '';
  
  let finalUserId = values.askUserId ? '*' : (values.userId || '');
  let finalPassword = values.askPassword ? '*' : (values.password || '');
  
  // Assembla la stringa del formato Glink Host
  let hostString = values.hostname;
  if (finalUserId) hostString += ` -du ${finalUserId}`;
  if (finalPassword) hostString += ` -d? ${finalPassword}`;
  if (values.enableAutoLogin && values.scriptName) {
      hostString += ` /S ${values.scriptName}`;
  }

  const keyUpdates = {
      'com.servername': hostString,
      'com.ibm5250model': values.ibm5250Model.toString(),
      'screen.autoconnect': values.autoConnect.toString(),
      'screen.noautolock': values.noAutoLock.toString(),
      'screen.showkeyboard': values.showKeyboard.toString(),
      'screen.orientation': values.orientation.toString(),
      'screen.cfgpassword': values.cfgPassword ? hashPassword(values.cfgPassword) : undefined,
      'screen.fontsize': values.fontSize.toString(),
      'screen.foregroundmagentalo': values.colorMagenta.toLowerCase(),
      'screen.foregroundcyanlo': values.colorCyan.toLowerCase(),
      'screen.foregroundbluelo': values.colorBlue.toLowerCase(),
      'screen.foregroundyellowlo': values.colorYellow.toLowerCase(),
      'screen.foregroundwhitelo': values.colorWhite.toLowerCase(),
      'screen.foregroundgreenlo': values.colorGreen.toLowerCase(),
      'screen.foregroundredlo': values.colorRed.toLowerCase(),
      'screen.scrcolor': values.scrColor.toString(),
      'screen.stscolor': values.stsColor.toString(),
      'print.bcenable': values.barcodeEnable.toString(),
      'print.bcdoafter': values.barcodeDoAfter.toString(),
      'print.bcshow': values.barcodeShow.toString(),
      'print.bcusekeymap': values.barcodeUseKeymap.toString(),
      'emu.anycmdresets': values.anyCmdResets.toString(),
      'keyboard.kc.4_DpadLeft': values.dpadLeftMacro,
      'keyboard.kc.5_DpadRight': values.dpadRightMacro,
  };

  const usedKeys = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (line.startsWith('[')) {
          if (line.startsWith('[file:')) currentSection = line;
      }
      
      // Aggiorna il nome del profilo ovunque delimiti sezioni o funga da valore
      if (line.trim() === `[${oldProfileName}]`) {
          lines[i] = `[${values.profileName}]`;
          continue;
      }
      
      if (line.trim().startsWith('config.') && line.includes(`=${oldProfileName}`)) {
          lines[i] = line.replace(`=${oldProfileName}`, `=${values.profileName}`);
          continue;
      }

      // Handle E2KServer
      if (line.startsWith('E2KServer=')) {
         lines[i] = `E2KServer=${values.e2kServer}`;
         continue;
      }

      // Gestisce la chiave di licenza in [file:v_key]
      if (currentSection === '[file:v_key]' && !line.includes('=') && line.trim() !== currentSection) {
         lines[i] = values.licenseKey;
      }

      // Aggiornamenti normali chiave=valore
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
          const key = line.substring(0, eqIdx).trim();
          if (key in keyUpdates) {
              const val = (keyUpdates as any)[key];
              if (val !== undefined && val !== '') {
                  lines[i] = `${key}=${val}`;
                  usedKeys.add(key);
              }
          }
      }
  }

  // Inserisce eventuali chiavi mancanti
  const sectionsToKeys: Record<string, string[]> = {
    '[file:printers]': ['print.bcenable', 'print.bcdoafter', 'print.bcshow', 'print.bcusekeymap'],
    '[file:keyboards]': ['keyboard.kc.4_DpadLeft', 'keyboard.kc.5_DpadRight']
  };

  for (const [section, items] of Object.entries(sectionsToKeys)) {
      const missing = items.filter(k => !usedKeys.has(k) && (keyUpdates as any)[k] !== undefined);
      if (missing.length > 0) {
          const sectionIdx = lines.findIndex(l => l.trim() === section);
          if (sectionIdx !== -1) {
              let injectionIdx = sectionIdx + 1;
              for (let i = sectionIdx + 1; i < lines.length; i++) {
                  if (lines[i].startsWith('[')) break;
                  injectionIdx = i + 1;
              }
              const paddingLines = missing.map(k => `${k}=${(keyUpdates as any)[k]}`);
              lines.splice(injectionIdx, 0, ...paddingLines);
          }
      }
  }

  return lines.join(lineEnding);
}

export async function generateDownload(
    iniContent: string, 
    iniFilename: string, 
    scriptContent?: string, 
    scriptFilename?: string
) {
    if (scriptContent && scriptFilename) {
        // Import dinamico per evitare errori SSR
        const JSZip = (await import('jszip')).default;
        const saveAs = (await import('file-saver')).saveAs;
        
        const zip = new JSZip();
        zip.file(iniFilename, iniContent);
        zip.file(scriptFilename, scriptContent);
        
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${iniFilename.replace(/\.(ini|glinki)$/, '')}_package.zip`);
    } else {
        const blob = new Blob([iniContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = iniFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
