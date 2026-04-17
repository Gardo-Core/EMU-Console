"use client";
import { FormSelect } from "../ui/FormSelect";
import { FormInput } from "../ui/FormInput";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { motion } from "framer-motion";

/**
 * Varianti per l'animazione di entrata.
 */
const itemVariants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

/**
 * Scheda Hardware: Qui configuriamo l'integrazione con il lettore barcode fisico 
 * (tramite Intent API o tastiera) e le macro per i tasti fisici dei palmari rugged.
 */
export function HardwareTab() {
  return (
    <div className="space-y-6">
      {/* BLOCCO: BARCODE SCANNER */}
      <motion.div 
        variants={itemVariants}
        className="glass-card shadow-xl"
      >
        <h3 className="text-[13px] font-bold text-emu-highlight/90 mb-6">Integrazione lettore barcode</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormSelect 
            name="barcodeEnable" 
            label="Modalità Integrazione" 
            tab="hardware"
            tooltip="Modalità in cui lo scanner hardware si interfaccia con E2K Emu (valori specifici del dispositivo come 2, 10 o 15)." 
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

      {/* BLOCCO: MACRO TASTI FISICI */}
      <motion.div 
        variants={itemVariants}
        className="glass-card shadow-xl"
      >
        <h3 className="text-[13px] font-bold text-emu-highlight/90 mb-6">Macro per dispositivi rugged</h3>
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
