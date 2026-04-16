"use client";

import { useFormContext } from "react-hook-form";
import { FormInput } from "../ui/FormInput";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { InfoTooltip } from "../ui/InfoTooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const itemVariants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

export function SecurityTab() {
  const { watch, setValue, register } = useFormContext();
  
  const askUserId = watch("askUserId");
  const useSystemUser = watch("useSystemUser");
  
  const askPassword = watch("askPassword");
  const enableAutoLogin = watch("enableAutoLogin");
  const scriptName = watch("scriptName");
  
  const defaultScript = `WAIT "User . . . . . ."\nTYPE $USER$\nENTER\nWAIT "Password . . . . . ."\nTYPE $PASS$\nENTER`;

  const resetTemplate = () => setValue("scriptContent", defaultScript, { shouldValidate: true, shouldDirty: true });
  
  const insertTag = (tag: string) => {
    const current = watch("scriptContent") || "";
    setValue("scriptContent", current + tag, { shouldValidate: true, shouldDirty: true });
  };

  // Automatically update input field if toggle switches are hit
  useEffect(() => {
    if (useSystemUser) {
      setValue("userId", "$USER$", { shouldValidate: true, shouldDirty: true });
    }
  }, [useSystemUser, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sezione ID Utente */}
        <motion.div 
          variants={itemVariants}
          className="glass-card shadow-xl"
        >
          <h3 className="text-sm font-bold text-emu-highlight mb-6">Identificazione utente</h3>
          <div className="grid grid-cols-12 gap-y-6 gap-x-4">
            <div className="col-span-12 relative group">
              <div className={cn("transition-opacity", askUserId ? "opacity-30 pointer-events-none" : "opacity-100")}>
                <FormInput 
                  name="userId" 
                  label="ID Utente" 
                  tab="security"
                  tooltip="L'ID Utente per il sign-on TN5250. Usa $USER$ per mappare alla variabile di sistema locale."
                  placeholder="Inserisci ID Utente" 
                />
              </div>
              {askUserId && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-md border border-emu-highlight/20 z-20 pointer-events-none">
                  <span className="text-emu-highlight font-medium text-xs flex items-center gap-2 bg-[#051821] px-3 py-1 rounded-full border border-emu-highlight/30 shadow-lg">
                    <span className="text-lg leading-none mt-1">*</span> Prompt Interattivo Attivo
                  </span>
                </div>
              )}
            </div>
            
            <div className="col-span-12 space-y-2">
              <ToggleSwitch 
                name="useSystemUser" 
                label="ID di Sistema ($USER$)" 
                tab="security"
                tooltip="Quando attivo, inietta automaticamente il nome utente risolto dal sistema al momento dell'esecuzione." 
              />
              <ToggleSwitch 
                name="askUserId" 
                label="Chiedi alla Connessione" 
                tab="security"
                tooltip="Se selezionato, ignora la stringa fornita e richiede l'utente in modo sicuro all'avvio dell'emulatore." 
              />
            </div>
          </div>
        </motion.div>

        {/* Sezione Password */}
        <motion.div 
          variants={itemVariants}
          className="glass-card shadow-xl"
        >
          <h3 className="text-sm font-bold text-emu-highlight mb-6">Autenticazione</h3>
          <div className="grid grid-cols-12 gap-y-6 gap-x-4">
            <div className="col-span-12 relative group">
              <div className={cn("transition-opacity", askPassword ? "opacity-30 pointer-events-none" : "opacity-100")}>
                <FormInput 
                  name="password" 
                  type="password" 
                  label="Password" 
                  tab="security"
                  tooltip="Memorizzare esplicitamente le password nei file .ini le espone staticamente. Raccomandiamo di mantenere attivo il prompt interattivo."
                  placeholder="••••••••" 
                />
              </div>
              {askPassword && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-md border border-[#f58800]/20 z-20 pointer-events-none shadow-[inset_0_0_15px_rgba(245,136,0,0.05)]">
                  <span className="text-[#f58800] font-medium text-xs flex items-center gap-2 bg-[#051821] px-3 py-1 rounded-full border border-[#f58800]/30 shadow-lg animate-pulse">
                    <span className="text-lg leading-none mt-1">*</span> Prompt Interattivo Attivo
                  </span>
                </div>
              )}
            </div>

            <div className="col-span-12">
               <ToggleSwitch 
                name="askPassword" 
                label="Chiedi alla Connessione" 
                tab="security"
                tooltip="Se selezionato, omette completamente la password dal file di configurazione, preservando un'elevata sicurezza. L'utente verrà interpellato in modo sicuro alla risoluzione dell'host." 
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sezione Cloud/Automazione */}
      <motion.div 
        variants={itemVariants}
        className="glass-card shadow-xl"
      >
        <h3 className="text-sm font-bold text-emu-highlight mb-6 flex items-center gap-2">
          Automazione post-connessione
          <InfoTooltip content="Specifica un file script da eseguire una volta stabilita la connessione all'host per automatizzare la sequenza di login." align="right" />
        </h3>
        
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <ToggleSwitch 
            name="enableAutoLogin" 
            label="Abilita Log In Automatico" 
            tab="security"
            tooltip="Automatizza la sequenza di login inviando tasti all'host immediatamente dopo la connessione. Utilizza il motore di scripting .scrgl di Glink." 
          />
          
          <AnimatePresence>
            {enableAutoLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="col-span-12"
                onAnimationComplete={(definition: any) => {
                  if ((definition as any).height === "auto") {
                    // Permette ai tooltip di uscire dal contenitore di clipping
                    const el = document.querySelector('.automation-container');
                    if (el) (el as HTMLElement).style.overflow = 'visible';
                  }
                }}
              >
                <div className="pt-4 space-y-8 border-t border-[#266867]/30">
                  <div className="relative">
                    <FormInput 
                      name="scriptName" 
                      label="Nome File Script" 
                      tab="security"
                      placeholder="autologin.scrgl" 
                      tooltip="Il file script localizzato a cui l'emulatore punterà o che creerà nativamente." 
                    />
                    {(!scriptName || scriptName.trim() === "") && (
                      <div className="text-orange-500 text-[10px] mt-1 absolute -bottom-5 left-0 pl-1">
                        Assegna un nome al tuo script (es. login.scrgl) in modo che il file .ini possa farvi riferimento.
                      </div>
                    )}
                    {scriptName && !scriptName.endsWith(".scrgl") && (
                      <div className="text-emu-highlight text-[10px] mt-1 absolute -bottom-5 left-0 pl-1">
                        Gli script E2K solitamente terminano con .scrgl. Assicurarsi che l'estensione sia corretta.
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 relative pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/50 font-medium px-1">Motore Sequenza Macro</span>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={resetTemplate}
                          className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded text-white/70 transition-colors uppercase tracking-wider"
                        >
                          Resetta Template
                        </button>
                        <InfoTooltip content="CRITICO: Il testo all'interno delle virgolette deve CORRISPONDERE ESATTAMENTE a ciò che appare sullo schermo del terminale. Glink aspetterà questa stringa prima di scrivere." align="right" />
                      </div>
                    </div>
                    
                    <div className="relative group/textarea">
                      <textarea
                        {...register("scriptContent")}
                        className="w-full bg-[#051821]/80 backdrop-blur-md border border-[#266867]/40 hover:border-[#266867]/80 focus:border-emu-highlight/60 rounded-md px-4 py-4 text-[#a1a1aa] font-mono text-sm min-h-[160px] focus:outline-none transition-all custom-scrollbar outline-none shadow-inner"
                        placeholder={defaultScript}
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-2">
                        <button type="button" onClick={() => insertTag('$USER$')} className="text-[10px] bg-[#1A4645] border border-[#266867] px-2 py-1 rounded hover:bg-emu-highlight/20 transition-colors text-white font-mono">$USER$</button>
                        <button type="button" onClick={() => insertTag('$PASS$')} className="text-[10px] bg-[#1A4645] border border-[#266867] px-2 py-1 rounded hover:bg-emu-highlight/20 transition-colors text-white font-mono">$PASS$</button>
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-green-400/60 bg-green-400/5 px-3 py-2 rounded border border-green-400/10 flex items-start gap-2 italic">
                      <div className="w-1 h-1 rounded-full bg-green-400/40 mt-1.5 shrink-0" />
                      <span>Rilevato pattern AS400 standard. Abbiamo pre-compilato una sequenza 'Wait and Type'. Verifica solo se il tuo host utilizza prompt diversi.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
