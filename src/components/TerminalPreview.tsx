"use client";

import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, TerminalSquare, FileCode, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { mergeTemplate } from "@/lib/template";
import { ConfigFormValues } from "@/lib/schema";

/**
 * Componente ScreenContent: Simula visivamente un monitor AS400.
 * Reagisce in tempo reale al cambio di colori, font e nomi nel form.
 */
function ScreenContent() {
  const { watch } = useFormContext();
  
  // Osserviamo solo i campi che impattano l'estetica del monitor
  const values = watch(["fontSize", "hostname", "profileName", "scrColor", "stsColor"]);
  const [
    fontSizeVal, hostname, profileName, scrColor, stsColor
  ] = values;
  
  const fontSize = (fontSizeVal as number) || 29;
  
  /**
   * Mappa dei colori standard Glink/AS400.
   * Questi indici (0-7) corrispondono ai valori salvati nel file .ini.
   */
  const getColorByIndex = (index: number) => {
    switch (index) {
      case 0: return "#000000"; // Nero
      case 1: return "#f01818"; // Rosso
      case 2: return "#24d830"; // Verde (Classico)
      case 3: return "#7890f0"; // Blu
      case 4: return "#ff00ff"; // Magenta
      case 5: return "#ffff00"; // Giallo
      case 6: return "#58f0f0"; // Ciano
      case 7: return "#ffffff"; // Bianco
      default: return "#ffffff";
    }
  };

  // Logica per determinare i colori dello sfondo e della riga di stato
  const bgColor = Number(scrColor) === 0 ? "#000000" : (Number(scrColor) === 7 ? "#ffffff" : "#000000");
  const stsBgColor = getColorByIndex(Number(stsColor ?? 3));
  const stsTextColor = "#ffffff";

  // Pulizia stringhe per il monitor (troncamento e padding per mantenere l'allineamento fisso)
  const host = (hostname || "ASP.BLUSYS.IT").slice(0, 15).padEnd(15, ' ');
  const profile = (profileName || "EMUConfig").slice(0, 15).padEnd(15, ' ');
  
  return (
    <div className="flex flex-col h-full items-center justify-start py-4">
      {/* Cornice del Monitor: Formato 4:5 con effetto bordi arrotondati e ombre interne */}
      <div className="w-full max-w-[400px] aspect-[4/5] bg-[#1a1a1a] rounded-[2rem] overflow-hidden border-[12px] border-[#1a1a1a] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_20px_40px_rgba(0,0,0,0.4)] relative ring-1 ring-white/10 flex flex-col">
         {/* Schermo emulato */}
         <div className="flex-1 overflow-auto p-4 relative" style={{ backgroundColor: bgColor, color: getColorByIndex(2), fontFamily: "'Courier New', Courier, monospace" }}>
           {/* Effetto bagliore radiale per simulare i vecchi schermi CRT */}
           <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/20 pointer-events-none mix-blend-multiply" />
           
           <div className="h-full w-full overflow-hidden flex items-start justify-start p-2">
             <pre style={{ fontSize: `${fontSize}px`, transform: `scale(${0.4})`, transformOrigin: 'top left', lineHeight: '1.2' }} className="text-inherit">
  {`                            ACCESSO
                                                
                                    Sistema . . . :  `}<span style={{ color: getColorByIndex(5) }}>{host}</span>{`
                                    Sottosistema  :  QINTER
                                    Display . . . :  `}<span style={{ color: getColorByIndex(5) }}>{profile}</span>{`
  
     Utente. . . . . . . . . .  [`}<span style={{ color: getColorByIndex(7) }}>          </span>{`]
    Password. . . . . . . . .  
     Programma/procedura . . .  [`}<span style={{ color: getColorByIndex(1) }}>          </span>{`]
     Menu. . . . . . . . . . .  [`}<span style={{ color: getColorByIndex(4) }}>          </span>{`]
     Libreria corrente . . . .  [`}<span style={{ color: getColorByIndex(6) }}>          </span>{`]
   
  `}
             </pre>
           </div>
           
           {/* Riga di stato inferiore (Status Line) */}
           <div className="absolute bottom-0 left-0 right-0 px-2 py-1 flex items-center justify-between font-mono" style={{ fontSize: `12px`, backgroundColor: stsBgColor, color: stsTextColor }}>
             <span>MW</span>
             <span>000/000</span>
           </div>
         </div>
         
         {/* Simulazione tasti fisici inferiori (per palmari ruggerizzati) */}
         <div className="h-10 bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center px-2 space-x-2 overflow-hidden shrink-0 border-t border-zinc-700/50">
           {['Esc', 'F1', 'F3', 'F4', 'F12', 'Invio'].map(btn => (
             <motion.div 
               key={btn} 
               whileTap={{ scale: 0.9 }}
               className="bg-gradient-to-b from-zinc-600 to-zinc-700 text-white text-[9px] font-sans px-2.5 py-1 rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_rgba(255,255,255,0.2)] border border-zinc-800 cursor-pointer"
             >
               {btn}
             </motion.div>
           ))}
         </div>
      </div>
    </div>
  );
}

import { validateIni, parseIniToValues, IniError } from "@/lib/iniValidator";
import { AlertCircle } from "lucide-react";
import { useRef } from "react";
import { useSearch } from "@/contexts/SearchContext";

// Cache statica per i template: evita di scaricare lo stesso file ogni volta che l'utente muove uno slider
const templateCache = new Map<string, string>();

/**
 * Componente RawIniContent: Un editor di testo avanzato che mostra il file .ini generato.
 * Include: numeri di riga, evidenziazione della ricerca e validazione in tempo reale.
 */
function RawIniContent() {
  const { watch } = useFormContext();
  const { searchTerm } = useSearch();
  const values = watch();
  const [copied, setCopied] = useState(false);
  const [iniContent, setIniContent] = useState<string>("Caricamento del template INI...");
  const [errors, setErrors] = useState<IniError[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(iniContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  /**
   * Sincronizzazione scroll: trucco per mantenere allineati verticalmente 
   * la textarea invisibile e i div sottostanti che mostrano i colori e i numeri di riga.
   */
  const handleScroll = () => {
    if (textareaRef.current) {
      if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      if (highlightRef.current) highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  /**
   * Sincronizzazione da Form a INI.
   * Ogni volta che il form cambia, rigeneriamo il file .ini "mergiando" i valori.
   * Abbiamo aggiunto un debounce di 300ms per non appesantire il browser.
   */
  useEffect(() => {
    if (isEditing) return; // Se l'utente sta scrivendo a mano nel codice, non lo sovrascriviamo

    const timer = setTimeout(async () => {
      try {
        const templateName = values.deviceTemplate === 'cipherlab95' ? 'Configuration_Cipherlab_95.ini' : 
                             values.deviceTemplate === 'newlandN7' ? 'Configuration_NewlandN7.ini' : 
                             'Configuration_PLUS995.ini';
        const oldProfile = values.deviceTemplate === 'newlandN7' ? 'Test' : 'PLURI';
        
        let text: string;
        if (templateCache.has(templateName)) {
          text = templateCache.get(templateName)!;
        } else {
          const res = await fetch(`/templates/${templateName}`);
          if (!res.ok) throw new Error();
          text = await res.text();
          templateCache.set(templateName, text);
        }

        const finalIni = mergeTemplate(text, values as ConfigFormValues, oldProfile);
        setIniContent(finalIni);
        setErrors(validateIni(finalIni));
      } catch (err) {
        setIniContent("Errore nella risoluzione del payload INI dal vivo.");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [values, isEditing]);

  /**
   * Gestione modifica manuale (opzionale).
   * Attiva la validazione sintattica anche se l'utente digita direttamente.
   */
  const handleIniChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setIniContent(newContent);
    const newErrors = validateIni(newContent);
    setErrors(newErrors);
  };

  const lineNumbers = iniContent.split('\n').length;

  /**
   * Logica di evidenziazione ricerca:
   * Dato che una textarea non supporta l'HTML interno, usiamo un "layer fantasma" 
   * posizionato esattamente sotto, dove inseriamo tag <mark> per evidenziare i match.
   */
  const getHighlightedContent = () => {
    if (!searchTerm || searchTerm.length < 2) return iniContent;
    
    // Escapiamo i caratteri pericolosi per evitare XSS o rotture del layout
    const escaped = iniContent
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<mark className="bg-emu-highlight/40 text-transparent rounded-sm ring-1 ring-emu-highlight">$1</mark>');
  };

  return (
    <div className="h-full w-full bg-[#051821] border border-[#266867] rounded-xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)]">
       {/* Toolbar superiore dell'editor */}
       <div className="bg-[#1A4645] px-4 py-2.5 border-b border-emu-border/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-emu-accent/20 transition-all group/copy relative"
            title="Copia negli appunti"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Check className="w-4 h-4 text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-emu-accent group-hover/copy:scale-110 transition-transform"
                >
                  <Copy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          {/* Indicatore avvisi di validazione INI */}
          {errors.length > 0 && (
            <div className="flex items-center gap-1.5 text-emu-accent animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">{errors.length} Avvisi di Formato</span>
            </div>
          )}
        </div>
       </div>
       
       {/* Area di editing vera e propria */}
       <div className="flex-1 relative overflow-hidden flex group/editor">
          {/* Area di input visibile (ma trasparente per far vedere gli highlight sotto) */}
          <textarea
            ref={textareaRef}
            value={iniContent}
            onChange={handleIniChange}
            onScroll={handleScroll}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            spellCheck={false}
            className="flex-1 h-full bg-transparent p-4 pr-14 font-mono text-sm leading-tight text-[#a1a1aa] resize-none focus:outline-none custom-scrollbar selection:bg-emu-highlight/30 whitespace-pre z-10 caret-emu-accent"
          />

          {/* Layer Specchio (Mirror) per evidenziare i risultati della ricerca */}
          <div 
            ref={highlightRef}
            className="absolute inset-0 p-4 pr-14 font-mono text-sm leading-tight text-transparent whitespace-pre overflow-hidden pointer-events-none select-none z-0"
            dangerouslySetInnerHTML={{ __html: getHighlightedContent() + '\n\n' }}
          />

          {/* Gutter dei numeri di riga a destra */}
          <div 
            ref={lineNumbersRef}
            className="absolute right-0 top-0 bottom-0 w-12 bg-[#051821] border-l border-[#266867]/30 py-4 overflow-hidden pointer-events-none select-none flex flex-col pt-4 z-20"
          >
            {Array.from({ length: lineNumbers }).map((_, i) => (
              <div key={i} className="text-[10px] font-mono text-[#266867] h-[1.25rem] flex items-center justify-center">
                {(i + 1).toString().padStart(2, '0')}
              </div>
            ))}
          </div>
          
          {/* Box di spiegazione errori in tempo reale */}
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-14 bg-orange-500/10 backdrop-blur-md border border-orange-500/20 p-3 rounded-lg flex flex-col gap-2 shadow-xl z-30"
              >
                {errors.slice(0, 2).map((err, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-2 text-orange-400 font-bold text-[10px] uppercase">
                      Linea {err.line}: {err.message}
                    </div>
                    {err.advice && (
                      <div className="text-white/60 text-[10px] italic leading-tight mt-0.5">
                        {err.advice}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
       </div>
    </div>
  );
}

/**
 * Componente TerminalPreview: Il "Monitor" laterale dell'app.
 * Automatizza il passaggio tra Visuale e Codice, e gestisce 
 * il pulsante flottante trascinabile su mobile.
 */
export function TerminalPreview() {
  const [mode, setMode] = useState<'visual' | 'raw'>('visual');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Monitoriamo la larghezza della finestra per scegliere il layout corretto
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headerContent = (
    <div className="flex items-center justify-between mb-4 bg-[#1A4645]/50 border border-[#266867]/50 rounded-lg p-1 shrink-0">
       <button 
         type="button"
         onClick={() => setMode('visual')}
         className={cn(
           "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all",
           mode === 'visual' ? "bg-emu-accent text-[#051821] shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"
         )}
       >
         <TerminalSquare className="w-3.5 h-3.5" /> Visuale
       </button>
       <button 
         type="button"
         onClick={() => setMode('raw')}
         className={cn(
           "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all",
           mode === 'raw' ? "bg-emu-highlight text-[#051821] shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"
         )}
       >
         <FileCode className="w-3.5 h-3.5" /> INI Grezzo
       </button>
    </div>
  );

  // LAYOUT DESKTOP: Barra laterale fissa e reattiva
  if (isDesktop) {
    return (
      <div className="sticky top-4 w-full xl:w-[25rem] h-full flex-shrink-0 flex flex-col z-20 pb-4">
         {headerContent}
         <motion.div 
           key={mode} 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ type: "spring", stiffness: 400, damping: 25 }}
           className="flex-1 min-h-0 relative"
         >
           {mode === 'visual' ? <ScreenContent /> : <RawIniContent />}
         </motion.div>
      </div>
    );
  }

  // LAYOUT MOBILE: Bottone flottante (FAB) ed Overlay a tutto schermo
  return (
    <>
      {/* Bottone flottante trascinabile con l'occhio */}
      <motion.button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        drag
        dragMomentum={false}
        dragConstraints={{ left: -300, right: 0, top: -600, bottom: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed bottom-[100px] right-6 z-40 bg-emu-highlight text-black p-4 rounded-full shadow-[0_0_30px_rgba(248,188,36,0.6)] lg:hidden cursor-grab active:cursor-grabbing"
      >
        <Eye className="w-6 h-6" />
      </motion.button>

      {/* Overlay mobile della preview */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#051821]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full max-w-[400px] h-full max-h-[750px] relative flex flex-col bg-[#051821] border border-[#266867] rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex justify-between items-center shrink-0 mb-4">
                 <div className="flex-1 pr-4">{headerContent}</div>
                 <button 
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="bg-red-500/20 p-2 rounded-full text-red-400 hover:text-red-300 transition-colors shrink-0"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="flex-1 min-h-0">
                {mode === 'visual' ? <ScreenContent /> : <RawIniContent />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
