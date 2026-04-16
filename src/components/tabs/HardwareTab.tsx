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
        <h3 className="text-sm font-semibold text-emu-highlight uppercase tracking-wider mb-6">Barcode Scanner Integration</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormSelect 
            name="barcodeEnable" 
            label="Integration Mode" 
            tab="hardware"
            tooltip="Mode in which the hardware scanner interfaces with Glink (Device specific values like 2, 10, or 15)." 
            options={[
              { value: 0, label: 'Disabled' },
              { value: 2, label: 'Intent API (2)' },
              { value: 10, label: 'Keyboard wedge (10)' },
              { value: 15, label: 'Advanced wedge (15)' }
            ]} 
          />
          <FormSelect 
            name="barcodeDoAfter" 
            label="Post-Scan Action" 
            tab="hardware"
            tooltip="Determines the action taken immediately after a barcode is successfully scanned." 
            options={[
              { value: 0, label: 'None' },
              { value: 1, label: 'Tab' },
              { value: 2, label: 'Enter' },
              { value: 3, label: 'Field Exit' }
            ]} 
          />
          
          <div className="col-span-12 h-px bg-[#266867]/30 my-2" />
          
          <ToggleSwitch name="barcodeShow" label="Visual Feedback" tab="hardware" tooltip="Briefly display the scanned barcode text on screen." />
          <ToggleSwitch name="barcodeUseKeymap" label="Use Keyboard Map" tab="hardware" tooltip="Run the scanned result through the custom keyboard mappings before transmission." />
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl relative z-10 focus-within:z-50 hover:z-20 transition-all duration-300"
      >
        <h3 className="text-sm font-semibold text-emu-highlight uppercase tracking-wider mb-6">Rugged Device Macros</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormInput 
            name="dpadLeftMacro" 
            label="D-Pad Left (Hex)" 
            tab="hardware"
            placeholder="^$1b" 
            tooltip="Hardware directional pad mappings. Macros support standard text and hex combinations using ^$Hex format (e.g., ^$1b for Escape)." 
          />
          <FormInput 
            name="dpadRightMacro" 
            label="D-Pad Right (Hex)" 
            tab="hardware"
            placeholder="^$09" 
            tooltip="Hardware directional pad mappings. Use ^$Hex format to map native 5250 emulator keystrokes." 
          />
        </div>
      </motion.div>
    </div>
  );
}
