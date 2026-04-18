"use client";
import { FormInput } from "../ui/FormInput";
import { FormSelect } from "../ui/FormSelect";
import { motion } from "framer-motion";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Activity, Loader2, Check, X } from "lucide-react";
import { InfoTooltip } from "../ui/InfoTooltip";
import { useToast } from "@/lib/useToast";
import { cn } from "@/lib/utils";

function PingAction({ 
  fieldName = "hostname", 
  tooltip = "Test Connessione: Esegue un 'ping' TCP per verificare che l'host sia raggiungibile." 
}: { 
  fieldName?: string;
  tooltip?: string;
}) {
  const { watch } = useFormContext();
  const hostValue = watch(fieldName);
  const { addToast } = useToast();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handlePing = async () => {
    if (!hostValue) {
      addToast({ type: "error", message: `Inserisci un ${fieldName === "hostname" ? "hostname/IP" : "URL Server"} prima di testare.` });
      return;
    }
    
    setStatus("loading");
    try {
      const res = await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: hostValue })
      });
      
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        addToast({ type: "success", message: `Connessione a ${hostValue} stabilita.` });
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        addToast({ type: "error", message: data.error || `Impossibile raggiungere ${hostValue}.` });
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch (err) {
      setStatus("error");
      addToast({ type: "error", message: "Errore durante il test di connessione." });
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="flex items-center gap-1.5 focus:outline-none">
      <button
        type="button"
        onClick={handlePing}
        disabled={status === "loading"}
        className={cn(
          "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] sm:rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F58800]/50",
          status === "idle" ? "bg-[#051821] border-[#F58800]/30 text-[#F58800] hover:bg-[#F58800]/20 hover:border-[#F58800]/60" : "",
          status === "loading" ? "bg-[#051821] border-[#F58800]/50 text-[#F58800]" : "",
          status === "success" ? "bg-green-500/10 border-green-500/50 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "",
          status === "error" ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : ""
        )}
      >
        {status === "idle" && <Activity className="w-3 h-3 sm:w-4 sm:h-4" />}
        {status === "loading" && <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />}
        {status === "success" && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
        {status === "error" && <X className="w-3 h-3 sm:w-4 sm:h-4" />}
      </button>
      <div className="hidden sm:flex">
        <InfoTooltip content={tooltip} />
      </div>
    </div>
  );
}

/**
 * Varianti di animazione per un ingresso morbido degli elementi.
 * Crea quell'effetto di "salita" (y: 15 -> 0) piacevole da vedere.
 */
const itemVariants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

/**
 * Scheda Rete: raggruppa tutti i campi relativi alla connessione AS400.
 */
export function NetworkTab() {
  return (
    <div className="space-y-6">
      {/* Contenitore con effetto vetro (glass-card) */}
      <motion.div 
        variants={itemVariants}
        className="glass-card shadow-xl"
      >
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormInput 
            name="profileName" 
            label="Nome Profilo" 
            tab="network"
            tooltip="L'identificativo unico per questo profilo di configurazione nell'ambiente E2K Emu." 
          />
          <FormInput 
            name="hostname" 
            label="Hostname Server / IP" 
            tab="network"
            tooltip="L'indirizzo IP o l'hostname DNS del server terminale AS400."
            actionRight={
              <PingAction 
                fieldName="hostname" 
                tooltip="Test Connessione Host: Verifica che l'AS400 sia raggiungibile sulla porta Telnet (23) per garantire l'operatività del terminale." 
              />
            }
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
            tooltip="La tua chiave di attivazione della licenza E2K Emu." 
          />
          <FormInput 
            name="e2kServer" 
            label="URL Server E2K" 
            tab="network"
            tooltip="Endpoint per la configurazione del Server E2K." 
            placeholder="http://192.168.x.x:6000::" 
            actionRight={
              <PingAction 
                fieldName="e2kServer" 
                tooltip="Test Licensing: Verifica che il Server E2K sia raggiungibile per permettere l'attivazione della licenza del software." 
              />
            }
          />
        </div>
      </motion.div>
    </div>
  );
}
