import { ConfigFormValues } from './schema';
import { hashPassword } from './password';

/**
 * Questa è la funzione "cuore" del configuratore. 
 * Prende un file INI base (il template del magazzino) e ci inietta i valori 
 * che l'utente ha compilato nel form web.
 */
export function mergeTemplate(baseContent: string, values: ConfigFormValues, oldProfileName: string): string {
  // Rileviamo il tipo di fine riga del file sorgente per non corromperlo
  const lineEnding = baseContent.includes('\r\n') ? '\r\n' : '\n';
  let lines = baseContent.split(/\r?\n/);
  
  // Tracciamo in quale file virtuale ci troviamo mentre cicliamo (es. [file:printers])
  let currentSection = '';
  
  // Prepariamo i valori per l'utente e password gestendo i segnaposto "*" (chiedi all'utente)
  let finalUserId = values.askUserId ? '*' : (values.userId || '');
  let finalPassword = values.askPassword ? '*' : (values.password || '');
  
  // Costruiamo la stringa "com.servername" che è il parametro più complesso di Glink.
  // Unisce host, utente, password ed eventuale script di autologin in una riga singola.
  let hostString = values.hostname;
  if (finalUserId) hostString += ` -du ${finalUserId}`;
  if (finalPassword) hostString += ` -d? ${finalPassword}`;
  if (values.enableAutoLogin && values.scriptName) {
      hostString += ` /S ${values.scriptName}`;
  }

  // Creiamo una mappa di aggiornamento. Qui associamo le chiavi tecniche dell'INI 
  // ai valori finali pronti per essere scritti nel file.
  const keyUpdates = {
      'com.servername': hostString,
      'com.ibm5250model': values.ibm5250Model.toString(),
      'screen.autoconnect': values.autoConnect.toString(),
      'screen.noautolock': values.noAutoLock.toString(),
      'screen.showkeyboard': values.showKeyboard.toString(),
      'screen.orientation': values.orientation.toString(),
      // Se c'è una password di configurazione, la hash-iamo prima di salvarla
      'screen.cfgpassword': values.cfgPassword ? hashPassword(values.cfgPassword) : undefined,
      'screen.fontsize': values.fontSize.toString(),
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

      // Gestione del cambio sezione
      if (line.startsWith('[')) {
          if (line.startsWith('[file:')) currentSection = line;
      }
      
      // Aggiorniamo il nome del profilo ovunque compaia come intestazione di sezione [vecchio_nome]
      if (line.trim() === `[${oldProfileName}]`) {
          lines[i] = `[${values.profileName}]`;
          continue;
      }
      
      // Aggiorniamo il nome del profilo se compare in chiavi di configurazione esplicite
      if (line.trim().startsWith('config.') && line.includes(`=${oldProfileName}`)) {
          lines[i] = line.replace(`=${oldProfileName}`, `=${values.profileName}`);
          continue;
      }

      // Caso speciale per il server E2K
      if (line.startsWith('E2KServer=')) {
         lines[i] = `E2KServer=${values.e2kServer}`;
         continue;
      }

      // Gestione della licenza pura (senza "chiave=") nella sezione v_key
      if (currentSection === '[file:v_key]' && !line.includes('=') && line.trim() !== currentSection) {
         lines[i] = values.licenseKey;
      }

      // Aggiornamento standard chiave=valore
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

  // Se alcune chiavi importanti non erano presenti nel template, le iniettiamo noi 
  // alla fine delle loro sezioni di competenza per sicurezza.
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

/**
 * Gestisce il download dei file risultanti.
 * Se c'è uno script di login, crea un pacchetto .ZIP contenente sia l'INI che lo script.
 * Se c'è solo l'INI, scarica direttamente il file singolo.
 */
export function generateDownload(
    iniContent: string, 
    iniFilename: string, 
    scriptContent?: string, 
    scriptFilename?: string
) {
    if (scriptContent && scriptFilename) {
        // Usiamo dynamic import perché librerie come JSZip e FileSaver 
        // a volte litigano con il rendering lato server (SSR) di Next.js.
        Promise.all([
          import('jszip'),
          import('file-saver')
        ]).then(([jszipModule, filesaverModule]) => {
          const JSZip = jszipModule.default;
          const saveAs = filesaverModule.saveAs;
          
          const zip = new JSZip();
          zip.file(iniFilename, iniContent);
          zip.file(scriptFilename, scriptContent);
          
          zip.generateAsync({ type: "blob" }).then(content => {
            saveAs(content, `${iniFilename.replace(/\.(ini|glinki)$/, '')}_package.zip`);
          });
        });
    } else {
        // Download standard del singolo file INI
        const blob = new Blob([iniContent], { type: 'application/octet-stream' });
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
