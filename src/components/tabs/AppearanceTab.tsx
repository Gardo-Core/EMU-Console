"use client";
import { Slider } from "../ui/Slider";
import { FormSelect } from "../ui/FormSelect";
import { motion } from "framer-motion";

const itemVariants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

export function AppearanceTab() {
  return (
    <div className="space-y-6">
      <motion.div 
        variants={itemVariants}
        className="glass-card shadow-xl"
      >
        <h3 className="text-[13px] font-bold text-emu-highlight/90 mb-6">Geometria schermo</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <Slider name="fontSize" label="Dimensione Font" tab="appearance" tooltip="Dimensione del carattere del terminale in pixel." min={8} max={48} />
          
          <div className="col-span-12 h-px bg-[#266867]/30 my-2" />

          <FormSelect 
            name="scrColor" 
            label="Sfondo" 
            tab="appearance"
            tooltip="Indice del colore per lo sfondo principale del terminale." 
            options={[
              { value: 0, label: 'Nero' },
              { value: 7, label: 'Bianco / Predefinito' },
            ]} 
          />
          <FormSelect 
            name="stsColor" 
            label="Riga di Stato" 
            tab="appearance"
            tooltip="Indice del colore per la riga di stato inferiore." 
            options={[
              { value: 0, label: 'Nero' },
              { value: 3, label: 'Blu / Predefinito' },
            ]} 
          />
        </div>
      </motion.div>

    </div>
  );
}
