"use client";

/**
 * AppShell: Orchestratore Centrale dell'applicazione.
 * 
 * Ruolo: Gestisce lo stato globale del configuratore e coordina l'interfaccia utente.
 * Implementazione: Utilizza React 19 con pattern ottimistici e caricamento dinamico (Next.js Dynamic).
 * Rationale: Centralizza la logica di navigazione e salvataggio per garantire coerenza dei dati
 * tra il database locale (PGlite) e il backend remoto (Supabase).
 */

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm, FormProvider } from "react-hook-form";
import { ajvResolver } from "@/lib/ajvResolver";
import { LazyMotion, domAnimation } from "framer-motion";

import LoginGate from "@/components/LoginGate";
import { TabNavigation, TabId } from "@/components/TabNavigation";
import { AnimatedTabContent } from "@/components/AnimatedTabContent";
import { LeftNav, AppMode } from "@/components/LeftNav";
import { TopBar } from "@/components/TopBar";
import { ActionBar } from "@/components/ActionBar";
import { SearchProvider } from "@/contexts/SearchContext";
import { ToastProvider } from "@/lib/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { configSchema } from "@/lib/schema";
import { generateDownload } from "@/lib/template";
import { useOptimistic, useTransition, useMemo } from "react";
import { saveConfigAction } from "@/app/actions";
import { useWorker } from "@/hooks/useWorker";

// Caricamento dinamico dei moduli pesanti per ottimizzare il bundle iniziale.
// I componenti vengono importati solo all'attivazione della rispettiva sezione.
const TerminalPreview = dynamic(() => import("./TerminalPreview").then(mod => mod.TerminalPreview), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#051821]/50 animate-pulse rounded-xl border border-[#266867]/30" />
});

const CompareView = dynamic(() => import("./CompareView").then(mod => mod.CompareView), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-white/20 font-mono italic">Inizializzazione motore di confronto...</div>
});

const ClientsView = dynamic(() => import("./clients/ClientsView").then(mod => mod.ClientsView), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#F58800]/20 border-t-[#F58800] animate-spin" /></div>
});

export function AppShell() {
  const [appMode, setAppMode] = useState<AppMode>("configurator");
  const [activeTab, setActiveTab] = useState<TabId>("network");
  const [isGenerating, setIsGenerating] = useState(false);
  const { runTask } = useWorker();

  const methods = useForm({
    resolver: ajvResolver,
    defaultValues: {
      deviceTemplate: "cipherlab95",
      profileName: "EMUConfig",
      hostname: "ASP.BLUSYS.IT",
      ibm5250Model: 7,
      licenseKey: "L5ZSFM99EJSQC3FD",
      e2kServer: "http://192.168.3.100:6000::",
      autoConnect: true,
      noAutoLock: true,
      showKeyboard: 2,
      orientation: 1,
      cfgPassword: "",
      fontSize: 29,
      scrColor: 0,
      stsColor: 3,
      barcodeEnable: 10,
      barcodeDoAfter: 2,
      barcodeShow: false,
      barcodeUseKeymap: false,
      anyCmdResets: true,
      dpadLeftMacro: "^$1b",
      dpadRightMacro: "^$09",
      askUserId: false,
      useSystemUser: false,
      userId: "",
      askPassword: true,
      password: "",
      enableAutoLogin: false,
      scriptName: "autologin.scrgl",
      scriptContent: `WAIT "Utente . . . . . ."\nTYPE $USER$\nENTER\nWAIT "Password . . . . . ."\nTYPE $PASS$\nENTER`,
    },
    mode: "onChange"
  });

  const [isPending, startTransition] = useTransition();
  const [optimisticValues, addOptimisticValues] = useOptimistic(
    methods.getValues(),
    (state, newValues: any) => ({ ...state, ...newValues })
  );

  const handleSave = async () => {
    const currentValues = methods.getValues();
    
    startTransition(async () => {
      // Aggiornamento ottimistico istantaneo! 🚀
      addOptimisticValues(currentValues);
      
      try {
        // Local-First Persistence: Salvataggio immediato su PGlite (WASM) per eliminare la latenza di rete.
        const { saveConfigLocal } = await import("@/lib/db");
        await saveConfigLocal(currentValues.profileName, currentValues);
        
        // La sincronizzazione con Supabase avverrà in background tramite il worker
      } catch (err) {
        console.error("Errore salvataggio locale:", err);
      }
    });
  };

  // Avvio del Sync Worker al mount
  useEffect(() => {
    const syncWorker = new Worker(new URL('../workers/sync.worker.ts', import.meta.url));
    
    // Avvio del Sync Worker per la sincronizzazione bidirezionale asincrona.
    syncWorker.postMessage({
      type: 'INIT_SYNC',
      payload: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        lastSyncAt: new Date(0).toISOString(), // Partiamo da zero
      }
    });

    return () => syncWorker.terminate();
  }, []);

  const handleGenerate = async (values: any) => {
    setIsGenerating(true);
    try {
      // Chiamiamo anche il save in background
      handleSave();

      const templateName = values.deviceTemplate === 'cipherlab95' ? 'Configuration_Cipherlab_95.ini' : 
                          values.deviceTemplate === 'newlandN7' ? 'Configuration_NewlandN7.ini' : 
                          'Configuration_PLUS995.ini';
                           
      let oldProfile = values.deviceTemplate === 'newlandN7' ? 'Test' : 'PLURI';
      
      const res = await fetch(`/templates/${templateName}`);
      if (!res.ok) throw new Error("Template not found");
      const baseText = await res.text();
      
      const finalIni = await runTask('MERGE_TEMPLATE', { 
        baseContent: baseText, 
        values, 
        oldProfileName: oldProfile 
      });
      
      if (values.enableAutoLogin && values.scriptName && values.scriptContent) {
          await generateDownload(finalIni, `${values.profileName}_${values.deviceTemplate}.ini`, values.scriptContent, values.scriptName);
      } else {
          await generateDownload(finalIni, `${values.profileName}_${values.deviceTemplate}.ini`);
      }
    } catch(err) {
       console.error("Ops! Qualcosa è andato storto nella generazione", err);
    } finally {
       setIsGenerating(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <ToastProvider>
        <SearchProvider>
          <LoginGate>
            <FormProvider {...methods}>
              <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#051821] text-white selection:bg-emu-accent/30">
              
                {/* Navigazione Globale Sinistra */}
                <div className="hidden md:block shrink-0">
                  <LeftNav appMode={appMode} setAppMode={setAppMode} />
                </div>

                {/* Wrapper Contenuto App Principale */}
                <div className="flex-1 flex flex-col min-w-0 relative h-full">
                
                  <TopBar setActiveTab={setActiveTab} setAppMode={setAppMode} />

                  {appMode === "clients" ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      <ClientsView />
                    </div>
                  ) : (
                    <form 
                      onSubmit={methods.handleSubmit(handleGenerate)} 
                      className="flex-1 flex flex-col min-h-0 relative"
                    >
                      <div className="flex-1 flex flex-row justify-center overflow-y-auto custom-scrollbar">
                        {appMode === "compare" ? (
                          <div className="flex-1 h-full w-full">
                            <CompareView />
                          </div>
                        ) : (
                          <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8">
                          
                            {/* Spazio di Lavoro Centrale */}
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="sticky top-0 z-20 pb-4 bg-[#051821]/95 backdrop-blur-sm">
                                <TabNavigation activeTab={activeTab} onSelect={setActiveTab} />
                              </div>
                            
                              <div className="flex-1 pb-24">
                                <AnimatedTabContent activeTab={activeTab} />
                              </div>
                            </div>
                          
                            {/* Monitor di Anteprima */}
                            <div className="lg:shrink-0 lg:w-[350px] xl:w-[400px] lg:h-[calc(100vh-12rem)] lg:sticky lg:top-8">
                               <TerminalPreview />
                            </div>

                          </div>
                        )}
                      </div>

                      {appMode === "configurator" && (
                        <ActionBar isGenerating={isGenerating} />
                      )}
                    </form>
                  )}
                </div>
              </div>
            </FormProvider>
          </LoginGate>
        </SearchProvider>
        <ToastContainer />
      </ToastProvider>
    </LazyMotion>
  );
}
