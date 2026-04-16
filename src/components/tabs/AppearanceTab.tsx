"use client";
import { ColorPicker } from "../ui/ColorPicker";
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
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl"
      >
        <h3 className="text-sm font-semibold text-emu-highlight uppercase tracking-wider mb-6">Screen Geometry</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <Slider name="fontSize" label="Font Size" tooltip="Terminal font size in pixels." min={8} max={48} />
          
          <div className="col-span-12 h-px bg-[#266867]/30 my-2" />

          <FormSelect 
            name="scrColor" 
            label="Background" 
            tooltip="Index color for the main terminal background." 
            options={[
              { value: 0, label: 'Black' },
              { value: 7, label: 'White / Default' },
            ]} 
          />
          <FormSelect 
            name="stsColor" 
            label="Status Line" 
            tooltip="Index color for the bottom status line." 
            options={[
              { value: 0, label: 'Black' },
              { value: 3, label: 'Blue / Default' },
            ]} 
          />
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl"
      >
        <h3 className="text-sm font-semibold text-emu-highlight uppercase tracking-wider mb-6">Palette Remapping</h3>
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <ColorPicker name="colorMagenta" label="Magenta" tooltip="Substitute color for AS400 Magenta" />
          <ColorPicker name="colorCyan" label="Cyan" tooltip="Substitute color for AS400 Cyan" />
          <ColorPicker name="colorBlue" label="Blue" tooltip="Substitute color for AS400 Blue" />
          <ColorPicker name="colorYellow" label="Yellow" tooltip="Substitute color for AS400 Yellow" />
          <ColorPicker name="colorWhite" label="White" tooltip="Substitute color for AS400 White" />
          <ColorPicker name="colorGreen" label="Green" tooltip="Substitute color for AS400 Green" />
          <ColorPicker name="colorRed" label="Red" tooltip="Substitute color for AS400 Red" />
        </div>
      </motion.div>
    </div>
  );
}
