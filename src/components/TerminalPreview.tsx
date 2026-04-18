"use client";

/**
 * TerminalPreview: Simulatore Terminale IBM/DKU.
 * 
 * Ruolo: Visualizzazione dell'anteprima emulata del terminale.
 * Implementazione: Utilizza Canvas API con offloading su Web Worker e React.memo per l'ottimizzazione.
 * Rationale: Isola il rendering grafico pesante dal thread principale per garantire
 * una risposta fluida dell'interfaccia utente durante la digitazione.
 */

import { useFormContext } from "react-hook-form";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { Eye, X, TerminalSquare, FileCode, Copy, Check, AlertCircle } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo, useTransition } from "react";
import { useSearch } from "@/contexts/SearchContext";
import { cn } from "@/lib/utils";
import { ConfigFormValues } from "@/lib/schema";
import { IniError } from "@/lib/iniValidator";
import { useWorker } from "@/hooks/useWorker";

/**
 * Mappa dei colori standard Glink/AS400.
 * Spostata fuori dal componente per evitare ricalcoli inutili ad ogni render.
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

/**
 * Monitor Virtuale: Rendering del contenuto dello schermo.
 * 
 * Implementazione: Memoizzato per prevenire ricalcoli non necessari durante
 * l'aggiornamento di campi del form che non influenzano la visualizzazione terminale.
 */
const ScreenContent = React.memo(function ScreenContent() {
  const { watch } = useFormContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const isTransferredRef = useRef(false);
  
  const values = watch(["fontSize", "hostname", "profileName", "scrColor", "stsColor"]);
  const [fontSize, hostname, profileName, scrColor, stsColor] = values;

  useEffect(() => {
    // Impediamo il trasferimento multiplo (comune in React Dev Mode / Strict Mode)
    if (!canvasRef.current || isTransferredRef.current) return;

    // Sincronizzazione con il caricamento dei font di sistema per evitare artefatti grafici (Zero FOUT).
    document.fonts.ready.then(() => {
      if (!canvasRef.current || isTransferredRef.current) return;
      
      try {
        // Trasferimento del controllo del Canvas al Web Worker dedicato.
        const worker = new Worker(new URL('../workers/terminal.worker.ts', import.meta.url));
        workerRef.current = worker;
        
        const offscreen = canvasRef.current.transferControlToOffscreen();
        isTransferredRef.current = true;

        worker.postMessage({ 
          type: 'INIT', 
          payload: { 
            canvas: offscreen, 
            config: { fontSize, hostname, profileName, scrColor, stsColor } 
          } 
        }, [offscreen]);
      } catch (err) {
        console.warn("Canvas transfer failed or already handled:", err);
      }
    });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []); // Eseguiamo solo una volta al mount

  // Inviamo gli update al worker quando cambiano i valori del form
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'UPDATE',
        payload: { config: { fontSize, hostname, profileName, scrColor, stsColor } }
      });
    }
  }, [fontSize, hostname, profileName, scrColor, stsColor]);

  return (
    <div className="flex flex-col h-full items-center justify-start py-4">
      <div className="w-full max-w-[400px] aspect-[4/5] bg-[#1a1a1a] rounded-[2rem] overflow-hidden border-[12px] border-[#1a1a1a] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_20px_40px_rgba(0,0,0,0.4)] relative ring-1 ring-white/10 flex flex-col">
         {/* Schermo emulato tramite Canvas */}
         <div className="flex-1 overflow-hidden relative bg-black">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={1000} 
              className="w-full h-full object-contain"
            />
            {/* Effetto CRT overlay (sempre accelerato) */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/20 pointer-events-none mix-blend-multiply" />
         </div>
         
         <div className="h-10 bg-linear-to-b from-zinc-800 to-zinc-900 flex items-center px-2 space-x-2 overflow-hidden shrink-0 border-t border-zinc-700/50">
           {['Esc', 'F1', 'F3', 'F4', 'F12', 'Invio'].map(btn => (
             <m.div 
               key={btn} 
               whileTap={{ scale: 0.9 }}
               className="bg-linear-to-b from-zinc-600 to-zinc-700 text-white text-[9px] font-sans px-2.5 py-1 rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_rgba(255,255,255,0.2)] border border-zinc-800 cursor-pointer"
             >
               {btn}
             </m.div>
           ))}
         </div>
      </div>
    </div>
  );
});

// Cache statica per i template: evita di scaricare lo stesso file ogni volta che l'utente muove uno slider
const templateCache = new Map<string, string>();

/**
 * Raw INI Content: Editor testuale per la configurazione grezza.
 * 
 * Ruolo: Visualizzazione e validazione sintattica del file INI generato.
 * Implementazione: Utilizza Web Workers per il merging dei template e la validazione asincrona.
 */
const RawIniContent = React.memo(function RawIniContent() {
  const { watch } = useFormContext();
  // Osserviamo solo i campi che impattano la generazione del file INI
  const valuesArray = watch([
    "deviceTemplate", "profileName", "hostname", "ibm5250Model", "licenseKey", 
    "e2kServer", "autoConnect", "noAutoLock", "showKeyboard", "orientation", 
    "cfgPassword", "fontSize", "scrColor", "stsColor", "barcodeEnable", 
    "barcodeDoAfter", "barcodeShow", "barcodeUseKeymap", "anyCmdResets", 
    "dpadLeftMacro", "dpadRightMacro", "userId", "useSystemUser", "askUserId", 
    "password", "askPassword", "enableAutoLogin", "scriptName"
  ]);
  const { searchTerm } = useSearch();
  const [copied, setCopied] = useState(false);
  const [iniContent, setIniContent] = useState<string>("Caricamento del template INI...");
  const [errors, setErrors] = useState<IniError[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { runTask } = useWorker();

  // Memoization dei valori per evitare re-render inutili se l'oggetto values cambia ma i valori interni no
  const formValuesKey = JSON.stringify(valuesArray);

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
    if (isEditing) return;

    const timer = setTimeout(async () => {
      try {
        const currentArr = JSON.parse(formValuesKey);
        // Mappatura posizionale dei valori osservati
        const [
          deviceTemplate, profileName, hostname, ibm5250Model, licenseKey, 
          e2kServer, autoConnect, noAutoLock, showKeyboard, orientation, 
          cfgPassword, fontSize, scrColor, stsColor, barcodeEnable, 
          barcodeDoAfter, barcodeShow, barcodeUseKeymap, anyCmdResets, 
          dpadLeftMacro, dpadRightMacro, userId, useSystemUser, askUserId, 
          password, askPassword, enableAutoLogin, scriptName
        ] = currentArr;

        const templateName = deviceTemplate === 'cipherlab95' ? 'Configuration_Cipherlab_95.ini' : 
                             deviceTemplate === 'newlandN7' ? 'Configuration_NewlandN7.ini' : 
                             'Configuration_PLUS995.ini';
        const oldProfile = deviceTemplate === 'newlandN7' ? 'Test' : 'PLURI';
        
        let text: string;
        if (templateCache.has(templateName)) {
          text = templateCache.get(templateName)!;
        } else {
          const res = await fetch(`/templates/${templateName}`);
          if (!res.ok) throw new Error();
          text = await res.text();
          templateCache.set(templateName, text);
        }

        // Ricostruiamo l'oggetto per mergeTemplate
        const mergeValues = {
          deviceTemplate, profileName, hostname, ibm5250Model, licenseKey, 
          e2kServer, autoConnect, noAutoLock, showKeyboard, orientation, 
          cfgPassword, fontSize, scrColor, stsColor, barcodeEnable, 
          barcodeDoAfter, barcodeShow, barcodeUseKeymap, anyCmdResets, 
          dpadLeftMacro, dpadRightMacro, userId, useSystemUser, askUserId, 
          password, askPassword, enableAutoLogin, scriptName
        } as ConfigFormValues;

        // Generazione del contenuto INI delegata al Web Worker per prevenire blocchi del thread principale.
        const finalIni = await runTask('MERGE_TEMPLATE', {
          baseContent: text,
          values: mergeValues,
          oldProfileName: oldProfile
        });
        
        // Validazione asincrona.
        const iniErrors = await runTask('VALIDATE_INI', { content: finalIni });
        
        // Aggiorniamo lo stato dentro una transition per non bloccare la digitazione.
        startTransition(() => {
          setIniContent(finalIni);
          setErrors(iniErrors);
        });
      } catch (err) {
        setIniContent("Errore nella risoluzione del payload INI dal vivo.");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formValuesKey, isEditing]);

  /**
   * Gestione modifica manuale (opzionale).
   * Attiva la validazione sintattica anche se l'utente digita direttamente.
   */
  const handleIniChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setIniContent(newContent);
    // Validazione asincrona via Worker
    const newErrors = await runTask('VALIDATE_INI', { content: newContent });
    setErrors(newErrors);
  };

  /**
   * Logica di evidenziazione ricerca sicura.
   * Riconciliazione ottimizzata basata su segmentazione per prevenire rischi XSS.
   */
  const searchSegments = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [{ text: iniContent, isMatch: false, key: 'raw-content' }];
    
    const parts = iniContent.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => ({
      text: part,
      isMatch: part.toLowerCase() === searchTerm.toLowerCase(),
      key: `segment-${i}-${part.length}` // Chiave stabile per performance di riconciliazione
    }));
  }, [iniContent, searchTerm]);

  const lineCount = iniContent.split('\n').length;
  
  // Ottimizzazione numeri di riga: singolo blocco pre invece di molti div
  const lineNumbersText = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => (i + 1).toString().padStart(2, '0')).join('\n');
  }, [lineCount]);

  return (
    <div className="h-full w-full bg-[#051821] border border-[#266867] rounded-xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)]">
       {/* Toolbar superiore dell'editor */}
       <div className="bg-[#1A4645] px-4 py-2.5 border-b border-emu-border/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-emu-accent/20 transition-all group/copy relative"
          >
            <span className="absolute top-8 right-0 md:left-1/2 md:-translate-x-1/2 px-2.5 py-1.5 bg-[#051821] border border-[#266867] text-emu-accent text-[10px] font-semibold rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover/copy:opacity-100 group-hover/copy:visible transition-all whitespace-nowrap z-[100]">
              Copia negli appunti
            </span>
            <AnimatePresence mode="wait">
              {copied ? (
                <m.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Check className="w-4 h-4 text-green-400" />
                </m.div>
              ) : (
                <m.div
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-emu-accent group-hover/copy:scale-110 transition-transform"
                >
                  <Copy className="w-4 h-4" />
                </m.div>
              )}
            </AnimatePresence>
          </button>
          
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

          <div 
            ref={highlightRef}
            className="absolute inset-0 p-4 pr-14 font-mono text-sm leading-tight text-transparent whitespace-pre overflow-hidden pointer-events-none select-none z-0"
          >
            {searchSegments.map((segment) => (
              <span 
                key={segment.key}
                className={segment.isMatch ? "bg-emu-highlight/40 text-transparent rounded-sm ring-1 ring-emu-highlight" : ""}
              >
                {segment.text}
              </span>
            ))}
          </div>

          {/* Gutter dei numeri di riga a destra - OTTIMIZZATO */}
          <div 
            ref={lineNumbersRef}
            className="absolute right-0 top-0 bottom-0 w-12 bg-[#051821] border-l border-[#266867]/30 py-4 overflow-hidden pointer-events-none select-none z-20"
          >
            <pre className="text-[10px] font-mono text-[#266867] leading-tight text-center">
              {lineNumbersText}
            </pre>
          </div>
          
          <AnimatePresence>
            {errors.length > 0 && (
              <m.div 
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
              </m.div>
            )}
          </AnimatePresence>
       </div>
    </div>
  );
});

/**
 * Componente TerminalPreview: Il "Monitor" laterale dell'app.
 * Automatizza il passaggio tra Visuale e Codice, e gestisce 
 * il pulsante flottante trascinabile su mobile.
 */
export function TerminalPreview() {
  const [mode, setMode] = useState<'visual' | 'raw'>('visual');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const shouldReduceMotion = useReducedMotion();

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
      <div className="sticky top-4 w-full h-full flex-shrink-0 flex flex-col z-20 pb-4">
         {headerContent}
         <m.div 
           key={mode} 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 25 }}
           className="flex-1 min-h-0 relative"
         >
           {mode === 'visual' ? <ScreenContent /> : <RawIniContent />}
         </m.div>
      </div>
    );
  }

  // LAYOUT MOBILE: Bottone flottante (FAB) ed Overlay a tutto schermo
  return (
    <>
      {/* 
        Floating Action Button (FAB) trascinabile per l'anteprima su dispositivi mobili.
      */}
      <m.button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        drag
        dragMomentum={false}
        dragConstraints={{ left: -300, right: 0, top: -600, bottom: 0 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        whileDrag={shouldReduceMotion ? {} : { scale: 1.1, cursor: "grabbing" }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 25 }}
        className="fixed bottom-[100px] right-6 z-40 bg-emu-highlight text-black p-4 rounded-full shadow-[0_0_30px_rgba(248,188,36,0.6)] lg:hidden cursor-grab active:cursor-grabbing"
      >
        <Eye className="w-6 h-6" />
      </m.button>

      {/* Overlay mobile della preview */}
      <AnimatePresence>
        {isMobileOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#051821]/90 backdrop-blur-md"
          >
            <m.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 25 }}
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
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
