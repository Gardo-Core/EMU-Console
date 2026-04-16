"use client";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { FormSelect } from "../ui/FormSelect";
import { FormInput } from "../ui/FormInput";
import { motion } from "framer-motion";

const itemVariants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

export function BehaviorTab() {
  return (
    <div className="space-y-6">
      <motion.div 
        variants={itemVariants}
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl relative z-10 focus-within:z-50 hover:z-20 transition-all duration-300"
      >
        <h3 className="text-[13px] font-bold text-emu-highlight/90 mb-6">Esecuzione e logica UI</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <ToggleSwitch name="autoConnect" label="Auto-Connessione" tab="behavior" tooltip="Avvia automaticamente la connessione all'avvio di Glink." />
          <ToggleSwitch name="noAutoLock" label="Disabilita Blocco Schermo" tab="behavior" tooltip="Impedisce il blocco dello schermo del dispositivo mentre Glink è in primo piano." />
          <ToggleSwitch name="anyCmdResets" label="Qualsiasi Tasto CMD Resetta Errore" tab="behavior" tooltip="Consente a tasti diversi dal tasto RESET dedicato di cancellare uno stato di errore di input AS/400 attivo, migliorando la produttività dell'utente sulle tastiere mobili limitate." />
          
          <div className="col-span-12 h-px bg-[#266867]/30 my-2" />

          <FormSelect 
            name="showKeyboard" 
            label="Modalità Mostra Tastiera" 
            tab="behavior"
            tooltip="Determina quando viene visualizzata la tastiera software." 
            options={[
              { value: 0, label: 'Manuale' },
              { value: 1, label: 'Automatico' },
              { value: 2, label: 'Sempre' }
            ]} 
          />
          <FormSelect 
            name="orientation" 
            label="Orientamento Schermo" 
            tab="behavior"
            tooltip="Blocca l'orientamento del display." 
            options={[
              { value: 0, label: 'Auto-Rotazione' },
              { value: 1, label: 'Verticale' },
              { value: 2, label: 'Orizzontale' }
            ]} 
          />
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl relative z-10 focus-within:z-50 hover:z-20 transition-all duration-300"
      >
        <h3 className="text-[13px] font-bold text-emu-highlight/90 mb-6">Blocco configurazione</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormInput 
            name="cfgPassword" 
            label="Password Profilo" 
            tab="behavior"
            type="password" 
            tooltip="Imposta una password amministratore per proteggere questo profilo di configurazione. Applicheremo automaticamente il formato hash Glink richiesto." 
            placeholder="Inserisci password personalizzata..." 
          />
        </div>
      </motion.div>
    </div>
  );
}
