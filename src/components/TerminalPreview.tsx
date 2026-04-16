"use client";

import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, TerminalSquare, FileCode } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { mergeTemplate } from "@/lib/template";
import { ConfigFormValues } from "@/lib/schema";

function ScreenContent() {
  const { watch } = useFormContext();
  const values = watch();
  
  const fontSize = values.fontSize || 29;
  
  // Dynamic color resolution based on indices
  // Glink Indices: 0:Black, 1:Red, 2:Green, 3:Blue, 4:Magenta, 5:Yellow, 6:Cyan, 7:White
  const getColorByIndex = (index: number) => {
    switch (index) {
      case 0: return "#000000"; // Black is usually fixed or maps to a hidden property, but we'll use #000
      case 1: return values.colorRed || "#f01818";
      case 2: return values.colorGreen || "#24d830";
      case 3: return values.colorBlue || "#7890f0";
      case 4: return values.colorMagenta || "#ff00ff";
      case 5: return values.colorYellow || "#ffff00";
      case 6: return values.colorCyan || "#58f0f0";
      case 7: return values.colorWhite || "#ffffff";
      default: return "#ffffff";
    }
  };

  const scrColor = Number(values.scrColor);
  const stsColor = Number(values.stsColor ?? 3);

  const bgColor = scrColor === 0 ? "#000000" : (scrColor === 7 ? values.colorWhite : "#000000");
  const stsBgColor = getColorByIndex(stsColor);
  const stsTextColor = (stsColor === 0) ? values.colorWhite : "#ffffff";

  const host = (values.hostname || "ASP.BLUSYS.IT").slice(0, 15).padEnd(15, ' ');
  const profile = (values.profileName || "PLURI").slice(0, 15).padEnd(15, ' ');
  
  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] rounded-[2rem] overflow-hidden border-[12px] border-[#1a1a1a] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_20px_40px_rgba(0,0,0,0.4)] relative ring-1 ring-white/10">
       <div className="flex-1 overflow-auto p-4 relative" style={{ backgroundColor: bgColor, color: getColorByIndex(2), fontFamily: "'Courier New', Courier, monospace" }}>
         <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/20 pointer-events-none mix-blend-multiply" />
         
         <div style={{ fontSize: `${Math.max(10, fontSize * 0.45)}px`, lineHeight: '1.2' }} className="whitespace-pre sm:origin-top-left">
{`                            SIGN ON
                                              
                                  System  . . . :  `}<span style={{ color: getColorByIndex(5) }}>{host}</span>{`
                                  Subsystem . . :  QINTER
                                  Display . . . :  `}<span style={{ color: getColorByIndex(5) }}>{profile}</span>{`

  User  . . . . . . . . . .   [`}<span style={{ color: getColorByIndex(7) }}>          </span>{`]
  Password  . . . . . . . .   
  Program/procedure . . . .   [`}<span style={{ color: getColorByIndex(1) }}>          </span>{`]
  Menu  . . . . . . . . . .   [`}<span style={{ color: getColorByIndex(4) }}>          </span>{`]
  Current library . . . . .   [`}<span style={{ color: getColorByIndex(6) }}>          </span>{`]

`}
         </div>
         <div className="absolute bottom-0 left-0 right-0 px-2 py-1 flex items-center justify-between font-mono" style={{ fontSize: `${Math.max(9, fontSize * 0.35)}px`, backgroundColor: stsBgColor, color: stsTextColor }}>
           <span>MW</span>
           <span>000/000</span>
         </div>
       </div>
       
       <div className="h-12 bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center px-2 space-x-2 overflow-hidden shrink-0 border-t border-zinc-700/50">
         {['Esc', 'F1', 'F3', 'F4', 'F12', 'Enter'].map(btn => (
           <motion.div 
             key={btn} 
             whileTap={{ scale: 0.9 }}
             className="bg-gradient-to-b from-zinc-600 to-zinc-700 text-white text-[11px] font-sans px-3 py-1.5 rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_rgba(255,255,255,0.2)] border border-zinc-800 cursor-pointer"
           >
             {btn}
           </motion.div>
         ))}
       </div>
    </div>
  );
}

import { validateIni, parseIniToValues, IniError } from "@/lib/iniValidator";
import { AlertCircle } from "lucide-react";

function RawIniContent() {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const [iniContent, setIniContent] = useState<string>("Loading INI template...");
  const [errors, setErrors] = useState<IniError[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Sync from Form to INI (Only when not actively editing the text area)
  useEffect(() => {
    if (isEditing) return;

    const fetchTemplate = async () => {
      try {
         const templateName = values.deviceTemplate === 'cipherlab95' ? 'Configuration_Cipherlab_95.ini' : 
                              values.deviceTemplate === 'newlandN7' ? 'Configuration_NewlandN7.ini' : 
                              'Configuration_PLUS995.ini';
         const oldProfile = values.deviceTemplate === 'newlandN7' ? 'Test' : 'PLURI';
         
         const res = await fetch(`/templates/${templateName}`);
         if (res.ok) {
           const text = await res.text();
           const finalIni = mergeTemplate(text, values as ConfigFormValues, oldProfile);
           setIniContent(finalIni);
           setErrors(validateIni(finalIni));
         }
      } catch (err) {
         setIniContent("Error resolving live INI payload.");
      }
    };
    fetchTemplate();
  }, [values, isEditing]);

  // Sync from INI to Form (Manual overrides)
  const handleIniChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setIniContent(newContent);
    const newErrors = validateIni(newContent);
    setErrors(newErrors);

    // If no critical errors, try to sync back recognizing keys
    if (!newErrors.some(err => !err.isWarning)) {
      const parsedValues = parseIniToValues(newContent);
      Object.entries(parsedValues).forEach(([key, val]) => {
        // Only update if key exists in form and value is different
        if (values[key] !== undefined && values[key] !== val) {
          setValue(key, val, { shouldValidate: true, shouldDirty: true });
        }
      });
    }
  };

  return (
    <div className="h-full w-full bg-[#051821] border border-[#266867] rounded-xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)]">
       <div className="bg-[#1A4645] px-4 py-2 border-b border-[#266867] flex items-center justify-between shrink-0">
          <div className="flex items-center">
            <FileCode className="w-4 h-4 text-emu-highlight mr-2" />
            <span className="text-xs font-mono text-white/70">config.ini</span>
          </div>
          {errors.length > 0 && (
            <div className="flex items-center gap-1.5 text-orange-400 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{errors.length} Format Alerts</span>
            </div>
          )}
       </div>
       
       <div className="flex-1 relative overflow-hidden group/editor">
          <textarea
            value={iniContent}
            onChange={handleIniChange}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            spellCheck={false}
            className="w-full h-full bg-transparent p-4 font-mono text-sm leading-tight text-[#a1a1aa] resize-none focus:outline-none custom-scrollbar selection:bg-emu-highlight/30"
          />
          
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4 bg-orange-500/10 backdrop-blur-md border border-orange-500/20 p-3 rounded-lg flex flex-col gap-2 shadow-xl z-10"
              >
                {errors.slice(0, 2).map((err, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-2 text-orange-400 font-bold text-[10px] uppercase">
                      Line {err.line}: {err.message}
                    </div>
                    {err.advice && (
                      <div className="text-white/60 text-[10px] italic leading-tight mt-0.5">
                        {err.advice}
                      </div>
                    )}
                  </div>
                ))}
                {errors.length > 2 && (
                  <div className="text-[9px] text-orange-400/50 uppercase font-black text-center mt-1">
                    + {errors.length - 2} more issues identified
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
       </div>
    </div>
  );
}

export function TerminalPreview() {
  const [mode, setMode] = useState<'visual' | 'raw'>('visual');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headerContent = (
    <div className="flex items-center justify-between mb-4 bg-[#1A4645]/50 border border-[#266867]/50 rounded-lg p-1 shrink-0">
       <button 
         type="button"
         onClick={() => setMode('visual')}
         className={cn(
           "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all",
           mode === 'visual' ? "bg-emu-accent text-[#051821] shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"
         )}
       >
         <TerminalSquare className="w-3.5 h-3.5" /> Visual
       </button>
       <button 
         type="button"
         onClick={() => setMode('raw')}
         className={cn(
           "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all",
           mode === 'raw' ? "bg-emu-highlight text-[#051821] shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"
         )}
       >
         <FileCode className="w-3.5 h-3.5" /> Raw INI
       </button>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="sticky top-2 w-[340px] xl:w-[400px] h-full flex-shrink-0 flex flex-col z-20 pb-4">
         {headerContent}
         <motion.div 
           key={mode} /* Forces re-animation on switch */
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ type: "spring", stiffness: 400, damping: 25 }}
           className="flex-1 min-h-0 relative"
         >
           {mode === 'visual' ? <ScreenContent /> : <RawIniContent />}
         </motion.div>
      </div>
    );
  }

  // Mobile layout
  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed bottom-[100px] right-6 z-40 bg-emu-highlight text-black p-4 rounded-full shadow-[0_0_20px_rgba(248,188,36,0.5)] lg:hidden"
      >
        <Eye className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#051821]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full max-w-[400px] h-full max-h-[750px] relative flex flex-col bg-[#051821] border border-[#266867] rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex justify-between items-center shrink-0 mb-4">
                 <div className="flex-1 pr-4">{headerContent}</div>
                 <button 
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="bg-red-500/20 p-2 rounded-full text-red-400 hover:text-red-300 transition-colors shrink-0"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="flex-1 min-h-0">
                {mode === 'visual' ? <ScreenContent /> : <RawIniContent />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
