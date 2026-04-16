"use client";

import { useFormContext } from "react-hook-form";
import { FormInput } from "../ui/FormInput";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { InfoTooltip } from "../ui/InfoTooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const itemVariants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

export function SecurityTab() {
  const { watch, setValue, register } = useFormContext();
  
  const askUserId = watch("askUserId");
  const useSystemUser = watch("useSystemUser");
  
  const askPassword = watch("askPassword");
  const enableAutoLogin = watch("enableAutoLogin");
  const scriptName = watch("scriptName");
  
  const defaultScript = `WAIT "User . . . . . ."\nTYPE $USER$\nENTER\nWAIT "Password . . . . . ."\nTYPE $PASS$\nENTER`;

  const resetTemplate = () => setValue("scriptContent", defaultScript, { shouldValidate: true, shouldDirty: true });
  
  const insertTag = (tag: string) => {
    const current = watch("scriptContent") || "";
    setValue("scriptContent", current + tag, { shouldValidate: true, shouldDirty: true });
  };

  // Automatically update input field if toggle switches are hit
  useEffect(() => {
    if (useSystemUser) {
      setValue("userId", "$USER$", { shouldValidate: true, shouldDirty: true });
    }
  }, [useSystemUser, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User ID Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl"
        >
          <h3 className="text-sm font-semibold text-emu-highlight uppercase tracking-wider mb-6">User Identification</h3>
          <div className="grid grid-cols-12 gap-y-6 gap-x-4">
            <div className="col-span-12 relative group">
              <div className={cn("transition-opacity", askUserId ? "opacity-30 pointer-events-none" : "opacity-100")}>
                <FormInput 
                  name="userId" 
                  label="User ID" 
                  tooltip="The TN5250 sign-on User ID. Use $USER$ to map to local system variable."
                  placeholder="Enter User ID" 
                />
              </div>
              {askUserId && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-md border border-emu-highlight/20 z-20 pointer-events-none">
                  <span className="text-emu-highlight font-medium text-xs flex items-center gap-2 bg-[#051821] px-3 py-1 rounded-full border border-emu-highlight/30 shadow-lg">
                    <span className="text-lg leading-none mt-1">*</span> Interactive Prompt Active
                  </span>
                </div>
              )}
            </div>
            
            <div className="col-span-12 space-y-2">
              <ToggleSwitch 
                name="useSystemUser" 
                label="System ID ($USER$)" 
                tooltip="When active, automatically injects the system's resolved username at execution time." 
              />
              <ToggleSwitch 
                name="askUserId" 
                label="Ask at Connect" 
                tooltip="If checked, ignores the supplied string and prompts the user securely when the emulator launches." 
              />
            </div>
          </div>
        </motion.div>

        {/* Password Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl"
        >
          <h3 className="text-sm font-semibold text-emu-highlight uppercase tracking-wider mb-6">Authentication</h3>
          <div className="grid grid-cols-12 gap-y-6 gap-x-4">
            <div className="col-span-12 relative group">
              <div className={cn("transition-opacity", askPassword ? "opacity-30 pointer-events-none" : "opacity-100")}>
                <FormInput 
                  name="password" 
                  type="password" 
                  label="Password" 
                  tooltip="Explicitly storing passwords in .ini files exposes them statically. We recommend keeping the interactive prompt enabled."
                  placeholder="••••••••" 
                />
              </div>
              {askPassword && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-md border border-[#f58800]/20 z-20 pointer-events-none shadow-[inset_0_0_15px_rgba(245,136,0,0.05)]">
                  <span className="text-[#f58800] font-medium text-xs flex items-center gap-2 bg-[#051821] px-3 py-1 rounded-full border border-[#f58800]/30 shadow-lg animate-pulse">
                    <span className="text-lg leading-none mt-1">*</span> Interactive Prompt Active
                  </span>
                </div>
              )}
            </div>

            <div className="col-span-12">
               <ToggleSwitch 
                name="askPassword" 
                label="Ask at Connect" 
                tooltip="If checked, leaves the password out of the configuration file entirely, preserving high security. The user will be safely prompted upon host resolution." 
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Auto Log In Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#1A4645]/30 backdrop-blur-md rounded-xl border border-[#266867]/50 p-6 shadow-xl"
      >
        <h3 className="text-sm font-semibold text-emu-highlight uppercase tracking-wider mb-6 flex items-center gap-2">
          Post-Connect Automation
          <InfoTooltip content="Specify a script file that should be executed once the connection to the host has been established to automate the login sequence." />
        </h3>
        
        <div className="grid grid-cols-12 gap-y-6 gap-x-4">
          <ToggleSwitch 
            name="enableAutoLogin" 
            label="Enable Auto Log In" 
            tooltip="Automates the login sequence by sending keystrokes to the host immediately after connection. Uses Glink's .scrgl scripting engine." 
          />
          
          <AnimatePresence>
            {enableAutoLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="col-span-12 overflow-hidden"
              >
                <div className="pt-4 space-y-8 border-t border-[#266867]/30">
                  <div className="relative">
                    <FormInput 
                      name="scriptName" 
                      label="Script Filename" 
                      placeholder="autologin.scrgl" 
                      tooltip="The localized script file that the emulator will target or create natively." 
                    />
                    {(!scriptName || scriptName.trim() === "") && (
                      <div className="text-orange-500 text-[10px] mt-1 absolute -bottom-5 left-0 pl-1">
                        Give your script a name (e.g., login.scrgl) so the .ini file can reference it.
                      </div>
                    )}
                    {scriptName && !scriptName.endsWith(".scrgl") && (
                      <div className="text-emu-highlight text-[10px] mt-1 absolute -bottom-5 left-0 pl-1">
                        E2K scripts usually end in .scrgl. Please ensure the extension is correct.
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 relative pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/50 font-medium px-1">Macro Sequence Engine</span>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={resetTemplate}
                          className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded text-white/70 transition-colors uppercase tracking-wider"
                        >
                          Reset Template
                        </button>
                        <InfoTooltip content="CRITICAL: The text inside quotes must MATCH EXACTLY what appears on the terminal screen. Glink will wait for this string before typing." />
                      </div>
                    </div>
                    
                    <div className="relative group/textarea">
                      <textarea
                        {...register("scriptContent")}
                        className="w-full bg-[#051821]/80 backdrop-blur-md border border-[#266867]/40 hover:border-[#266867]/80 focus:border-emu-highlight/60 rounded-md px-4 py-4 text-[#a1a1aa] font-mono text-sm min-h-[160px] focus:outline-none transition-all custom-scrollbar outline-none shadow-inner"
                        placeholder={defaultScript}
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-2">
                        <button type="button" onClick={() => insertTag('$USER$')} className="text-[10px] bg-[#1A4645] border border-[#266867] px-2 py-1 rounded hover:bg-emu-highlight/20 transition-colors text-white font-mono">$USER$</button>
                        <button type="button" onClick={() => insertTag('$PASS$')} className="text-[10px] bg-[#1A4645] border border-[#266867] px-2 py-1 rounded hover:bg-emu-highlight/20 transition-colors text-white font-mono">$PASS$</button>
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-green-400/60 bg-green-400/5 px-3 py-2 rounded border border-green-400/10 flex items-start gap-2 italic">
                      <div className="w-1 h-1 rounded-full bg-green-400/40 mt-1.5 shrink-0" />
                      <span>Standard AS400 pattern detected. We've pre-filled a 'Wait and Type' sequence. Just verify if your host uses different prompts.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
