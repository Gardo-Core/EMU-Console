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
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl"
      >
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormInput 
            name="profileName" 
            label="Profile Name" 
            tooltip="The unique identifier for this configuration profile across the Glink environment." 
          />
          <FormInput 
            name="hostname" 
            label="Server Hostname / IP" 
            tooltip="The IP address or DNS hostname of your AS400 terminal server." 
          />
          <FormSelect 
            name="ibm5250Model" 
            label="IBM 5250 Model" 
            tooltip="TN5250 emulation defines the terminal protocol layout. For interactive displays, use 3179-2 (24x80 resolution). 3812-1 is designated exclusively for TN5250 printer emulation endpoints, not interactive screens." 
            options={[
              { value: 2, label: '3179-2 (24x80)' },
              { value: 5, label: '3477-FC' },
              { value: 7, label: '3196-A1 / Generic 7' }
            ]} 
          />
          <FormInput 
            name="licenseKey" 
            label="License Key" 
            tooltip="Your Glink license activation key." 
          />
          <FormInput 
            name="e2kServer" 
            label="E2K Server URL" 
            tooltip="Endpoint for E2K Server configuration." 
            placeholder="http://192.168.x.x:6000::" 
          />
        </div>
      </motion.div>
    </div>
  );
}
