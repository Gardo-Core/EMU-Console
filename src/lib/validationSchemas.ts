import { z } from "zod";

export interface ValidationRule {
  advice: string;
  ref: string;
  autoFix?: (val: string) => string;
}

export const validationMetadata: Record<string, ValidationRule> = {
  hostname: {
    advice: "Nota dell'Amministratore: Gli indirizzi host devono essere IPv4, IPv6 validi o nomi di dominio conformi a RFC 1123. Assicurarsi che l'host sia raggiungibile dal segmento di rete del dispositivo.",
    ref: "Rif: Guida dell'Amministratore Pagina 83"
  },
  ibm5250Model: {
    advice: "Policy di Sistema: La selezione del modello corretto garantisce l'allocazione appropriata del buffer dello schermo (Modello 2: 24x80, Modello 5: 27x132). Una parità errata può causare il troncamento della visualizzazione.",
    ref: "Rif: Guida dell'Amministratore Pagina 15"
  },
  licenseKey: {
    advice: "Avviso di Sicurezza: Le chiavi di licenza non sono trasferibili e sono legate all'ID della workstation. Verificare il checksum prima della distribuzione.",
    ref: "Rif: Guida dell'Amministratore Pagina 42"
  },
  fontSize: {
    advice: "Ottimizzazione UI: Dimensioni del font inferiori a 12px o superiori a 36px potrebbero compromettere la leggibilità sui display dei dispositivi mobili rugged standard.",
    ref: "Rif: Guida dell'Amministratore Pagina 91"
  },
  scrColor: {
    advice: "Ergonomia: Utilizzare l'Indice 0 (Nero) per risparmio energetico su display OLED o l'Indice 7 (Bianco) per ambienti ad alto contrasto.",
    ref: "Rif: Guida dell'Amministratore Pagina 104"
  },
  stsColor: {
    advice: "Visibilità Stato: Il colore della riga di stato deve fornire un contrasto sufficiente con lo sfondo per garantire che gli indicatori MW (Message Wait) siano visibili.",
    ref: "Rif: Guida dell'Amministratore Pagina 105"
  },
  profileName: {
    advice: "Standard Organizzativo: I nomi dei profili devono essere alfanumerici. Utilizzare convenzioni di denominazione che consentano un facile auditing della distribuzione MDM.",
    ref: "Rif: Guida dell'Amministratore Pagina 22"
  },
  dpadLeftMacro: {
    advice: "Regola di Sintesi: Le macro devono utilizzare la notazione caret (es. ^M per Invio) per i caratteri di controllo. Le stringhe letterali 'ESC' verranno rifiutate dall'interprete.",
    ref: "Rif: Guida dell'Amministratore Pagina 204",
    autoFix: (val: string) => val.replace(/ESC/gi, "^[").replace(/ENTER/gi, "^M")
  },
  dpadRightMacro: {
    advice: "Regola di Sintesi: Le macro devono utilizzare la notazione caret. Evitare di mischiare sequenze di escape letterali con testo semplice senza i delimitatori caret appropriati.",
    ref: "Rif: Guida dell'Amministratore Pagina 204",
    autoFix: (val: string) => val.replace(/ESC/gi, "^[").replace(/ENTER/gi, "^M")
  }
};

export const configSchema = z.object({
  deviceTemplate: z.enum(['cipherlab95', 'newlandN7', 'plus995']),
  
  // Rete e Host
  profileName: z.string().min(1, "I nomi vuoti non sono consentiti dalla policy di sistema").max(30).regex(/^[A-Za-z0-9_]+$/, "Solo caratteri alfanumerici e underscore come da Guida Admin Pagina 22"),
  hostname: z.string().min(1, "L'identificazione dell'host è obbligatoria per la negoziazione della sessione"),
  ibm5250Model: z.coerce.number().int().min(2).max(7),
  licenseKey: z.string().min(1, "Chiave di licenza richiesta per l'attivazione enterprise"),
  e2kServer: z.string().min(1, "L'endpoint del Server E2K deve essere specificato per le distribuzioni gestite"),
  
  // Comportamento
  autoConnect: z.boolean(),
  noAutoLock: z.boolean(),
  showKeyboard: z.coerce.number(),
  orientation: z.coerce.number(),
  cfgPassword: z.string().optional(),
  
  // Aspetto
  fontSize: z.coerce.number().int().min(8).max(48),
  scrColor: z.coerce.number(),
  stsColor: z.coerce.number(),
  
  // Hardware e Macro
  barcodeEnable: z.coerce.number().min(0, "Intervallo non valido").max(20, "Fuori dai limiti di sistema"),
  barcodeDoAfter: z.coerce.number().min(0).max(5),
  barcodeShow: z.boolean(),
  barcodeUseKeymap: z.boolean(),
  anyCmdResets: z.boolean().default(true),
  dpadLeftMacro: z.string().regex(/^([ -~]|\^\$[a-fA-F0-9]{2})*$/, "Errore sintassi macro: Usa ^$Hex per i codici di controllo come da Pagina 204").optional(),
  dpadRightMacro: z.string().regex(/^([ -~]|\^\$[a-fA-F0-9]{2})*$/, "Errore sintassi macro: Usa ^$Hex per i codici di controllo come da Pagina 204").optional(),

  // Sicurezza e Automazione
  userId: z.string().optional(),
  useSystemUser: z.boolean().default(false),
  askUserId: z.boolean().default(false),
  
  password: z.string().optional(),
  askPassword: z.boolean().default(true),
  
  enableAutoLogin: z.boolean().default(false),
  scriptName: z.string().optional(),
  scriptContent: z.string().optional(),
});

export type ConfigFormValues = z.infer<typeof configSchema>;
