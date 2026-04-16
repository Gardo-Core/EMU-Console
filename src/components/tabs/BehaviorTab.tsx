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
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl"
      >
        <h3 className="text-sm font-semibold text-emu-highlight uppercase tracking-wider mb-6">Execution & UI Logic</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <ToggleSwitch name="autoConnect" label="Auto-Connect" tooltip="Automatically initiate the connection when Glink starts." />
          <ToggleSwitch name="noAutoLock" label="Disable Screen Lock" tooltip="Prevent the device screen from locking while Glink is in foreground." />
          <ToggleSwitch name="anyCmdResets" label="Any Cmd Key Resets Error" tooltip="Allows keys other than the dedicated RESET key to clear an active AS/400 input error state, improving user productivity on restricted mobile keypads." />
          
          <div className="col-span-12 h-px bg-[#266867]/30 my-2" />

          <FormSelect 
            name="showKeyboard" 
            label="Show Keyboard Mode" 
            tooltip="Determines when the soft keyboard is displayed." 
            options={[
              { value: 0, label: 'Manual' },
              { value: 1, label: 'Automatic' },
              { value: 2, label: 'Always' }
            ]} 
          />
          <FormSelect 
            name="orientation" 
            label="Screen Orientation" 
            tooltip="Lock the display orientation." 
            options={[
              { value: 0, label: 'Auto-Rotate' },
              { value: 1, label: 'Portrait' },
              { value: 2, label: 'Landscape' }
            ]} 
          />
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl"
      >
        <h3 className="text-sm font-semibold text-emu-highlight uppercase tracking-wider mb-6">Configuration Lock</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <FormInput 
            name="cfgPassword" 
            label="Profile Password" 
            type="password" 
            tooltip="Sets an admin password to protect this configuration profile. We will automatically apply the required Glink hash format." 
            placeholder="Enter custom password..." 
          />
        </div>
      </motion.div>
    </div>
  );
}
