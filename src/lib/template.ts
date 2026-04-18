import { ConfigFormValues } from './schema';
import { hashPassword } from './password';
import { IniAst } from './iniAst';

/**
 * Questa è la funzione "cuore" del configuratore. 
 * Prende un file INI base (il template del magazzino) e ci inietta i valori 
 * che l'utente ha compilato nel form web usando l'AST per non rompere nulla.
 */
export function mergeTemplate(baseContent: string, values: ConfigFormValues, oldProfileName: string): string {
  const ast = new IniAst(baseContent);
  const lineEnding = baseContent.includes('\r\n') ? '\r\n' : '\n';
  
  // Prepariamo i valori per l'utente e password
  let finalUserId = values.askUserId ? '*' : (values.userId || '');
  let finalPassword = values.askPassword ? '*' : (values.password || '');
  
  // Costruiamo la stringa "com.servername"
  let hostString = values.hostname;
  if (finalUserId) hostString += ` -du ${finalUserId}`;
  if (finalPassword) hostString += ` -d? ${finalPassword}`;
  if (values.enableAutoLogin && values.scriptName) {
      hostString += ` /S ${values.scriptName}`;
  }

  // Mappa di aggiornamento per l'AST
  const updates: Record<string, { val: string, section?: string }> = {
    'com.servername': { val: hostString },
    'com.ibm5250model': { val: values.ibm5250Model.toString() },
    'screen.autoconnect': { val: values.autoConnect.toString() },
    'screen.noautolock': { val: values.noAutoLock.toString() },
    'screen.showkeyboard': { val: values.showKeyboard.toString() },
    'screen.orientation': { val: values.orientation.toString() },
    'screen.fontsize': { val: values.fontSize.toString() },
    'screen.scrcolor': { val: values.scrColor.toString() },
    'screen.stscolor': { val: values.stsColor.toString() },
    'print.bcenable': { val: values.barcodeEnable.toString(), section: 'file:printers' },
    'print.bcdoafter': { val: values.barcodeDoAfter.toString(), section: 'file:printers' },
    'print.bcshow': { val: values.barcodeShow.toString(), section: 'file:printers' },
    'print.bcusekeymap': { val: values.barcodeUseKeymap.toString(), section: 'file:printers' },
    'emu.anycmdresets': { val: values.anyCmdResets.toString() },
    'keyboard.kc.4_DpadLeft': { val: values.dpadLeftMacro || '', section: 'file:keyboards' },
    'keyboard.kc.5_DpadRight': { val: values.dpadRightMacro || '', section: 'file:keyboards' },
    'E2KServer': { val: values.e2kServer }
  };

  // 1. Gestione Cambio Nome Profilo nelle Sezioni
  ast.nodes.forEach(node => {
    if (node.type === 'Section' && node.sectionName === oldProfileName) {
      node.sectionName = values.profileName;
      node.raw = `[${values.profileName}]`;
    }
  });

  // 2. Aggiornamenti chirurgici tramite AST
  for (const [key, update] of Object.entries(updates)) {
    ast.set(key, update.val, update.section);
  }

  // 3. Caso speciale password (hashing)
  if (values.cfgPassword) {
    ast.set('screen.cfgpassword', hashPassword(values.cfgPassword));
  }

  // 4. Caso speciale licenza in v_key
  const vKeyNode = ast.nodes.find(n => n.type === 'Raw' && ast.nodes[ast.nodes.indexOf(n) - 1]?.sectionName === 'file:v_key');
  if (vKeyNode) {
    vKeyNode.content = values.licenseKey;
    vKeyNode.raw = values.licenseKey;
  }

  return ast.stringify(lineEnding);
}

/**
 * Gestisce il download dei file risultanti.
 */
export function generateDownload(
    iniContent: string, 
    iniFilename: string, 
    scriptContent?: string, 
    scriptFilename?: string
) {
    if (scriptContent && scriptFilename) {
        Promise.all([
          import('jszip'),
          import('file-saver')
        ]).then(([jszipModule, filesaverModule]) => {
          const JSZip = (jszipModule as any).default || jszipModule;
          const saveAs = (filesaverModule as any).saveAs || filesaverModule;
          
          const zip = new JSZip();
          zip.file(iniFilename, iniContent);
          zip.file(scriptFilename, scriptContent);
          
          zip.generateAsync({ type: "blob" }).then((content: any) => {
            saveAs(content, `${iniFilename.replace(/\.(ini|glinki)$/, '')}_package.zip`);
          });
        });
    } else {
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

