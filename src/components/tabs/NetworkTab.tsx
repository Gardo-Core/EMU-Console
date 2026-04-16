"use client";
import { FormInput } from "../ui/FormInput";
import { FormSelect } from "../ui/FormSelect";
import { motion } from "framer-motion";

const itemVariants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

export function NetworkTab() {
  return (
    <div className="space-y-6">
      <motion.div 
        variants={itemVariants}
        className="glass-card shadow-xl"
      >
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormInput 
            name="profileName" 
            label="Nome Profilo" 
            tab="network"
            tooltip="L'identificativo unico per questo profilo di configurazione nell'ambiente Glink." 
          />
          <FormInput 
            name="hostname" 
            label="Hostname Server / IP" 
            tab="network"
            tooltip="L'indirizzo IP o l'hostname DNS del server terminale AS400." 
          />
          <FormSelect 
            name="ibm5250Model" 
            label="Modello IBM 5250" 
            tab="network"
            tooltip="L'emulazione TN5250 definisce il layout del protocollo del terminale. Per i display interattivi, utilizzare 3179-2 (risoluzione 24x80). Il modello 3812-1 è destinato esclusivamente agli endpoint di emulazione stampante TN5250, non agli schermi interattivi." 
            options={[
              { value: 2, label: '3179-2 (24x80)' },
              { value: 5, label: '3477-FC' },
              { value: 7, label: '3196-A1 / Generic 7' }
            ]} 
          />
          <FormInput 
            name="licenseKey" 
            label="Chiave di Licenza" 
            tab="network"
            tooltip="La tua chiave di attivazione della licenza Glink." 
          />
          <FormInput 
            name="e2kServer" 
            label="URL Server E2K" 
            tab="network"
            tooltip="Endpoint per la configurazione del Server E2K." 
            placeholder="http://192.168.x.x:6000::" 
          />
        </div>
      </motion.div>
    </div>
  );
}
