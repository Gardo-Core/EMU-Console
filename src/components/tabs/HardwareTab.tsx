"use client";
import { FormSelect } from "../ui/FormSelect";
import { FormInput } from "../ui/FormInput";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { motion } from "framer-motion";

const itemVariants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

export function HardwareTab() {
  return (
    <div className="space-y-6">
      <motion.div 
        variants={itemVariants}
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl relative z-10 focus-within:z-50 hover:z-20 transition-all duration-300"
      >
        <h3 className="text-base font-semibold text-emu-highlight mb-6">Integrazione lettore barcode</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormSelect 
            name="barcodeEnable" 
            label="Modalità Integrazione" 
            tab="hardware"
            tooltip="Modalità in cui lo scanner hardware si interfaccia con Glink (valori specifici del dispositivo come 2, 10 o 15)." 
            options={[
              { value: 0, label: 'Disabilitato' },
              { value: 2, label: 'Intent API (2)' },
              { value: 10, label: 'Emulazione tastiera (10)' },
              { value: 15, label: 'Emulazione avanzata (15)' }
            ]} 
          />
          <FormSelect 
            name="barcodeDoAfter" 
            label="Azione Post-Scansione" 
            tab="hardware"
            tooltip="Determina l'azione intrapresa immediatamente dopo la scansione corretta di un codice a barre." 
            options={[
              { value: 0, label: 'Nessuna' },
              { value: 1, label: 'Tab' },
              { value: 2, label: 'Invio' },
              { value: 3, label: 'Uscita Campo (Field Exit)' }
            ]} 
          />
          
          <div className="col-span-12 h-px bg-[#266867]/30 my-2" />
          
          <ToggleSwitch name="barcodeShow" label="Feedback Visivo" tab="hardware" tooltip="Visualizza brevemente il testo del codice a barre scansionato sullo schermo." />
          <ToggleSwitch name="barcodeUseKeymap" label="Usa Mappa Tastiera" tab="hardware" tooltip="Elabora il risultato scansionato attraverso le mappature personalizzate della tastiera prima della trasmissione." />
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl relative z-10 focus-within:z-50 hover:z-20 transition-all duration-300"
      >
        <h3 className="text-base font-semibold text-emu-highlight mb-6">Macro per dispositivi rugged</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormInput 
            name="dpadLeftMacro" 
            label="D-Pad Sinistra (Hex)" 
            tab="hardware"
            placeholder="^$1b" 
            tooltip="Mappature del pad direzionale hardware. Le macro supportano combinazioni di testo standard ed esadecimali utilizzando il formato ^$Hex (es. ^$1b per Escape)." 
          />
          <FormInput 
            name="dpadRightMacro" 
            label="D-Pad Destra (Hex)" 
            tab="hardware"
            placeholder="^$09" 
            tooltip="Mappature del pad direzionale hardware. Usa il formato ^$Hex per mappare la pressione dei tasti nativi dell'emulatore 5250." 
          />
        </div>
      </motion.div>
    </div>
  );
}
