"use client";

import { useState } from "react";
import LoginGate from "@/components/LoginGate";
import { TabNavigation, TabId } from "@/components/TabNavigation";
import { AnimatedTabContent } from "@/components/AnimatedTabContent";
import { TerminalPreview } from "@/components/TerminalPreview";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { configSchema, ConfigFormValues } from "@/lib/validationSchemas";
import { mergeTemplate, generateDownload } from "@/lib/template";
import { LeftNav, AppMode } from "@/components/LeftNav";
import { TopBar } from "@/components/TopBar";
import { ActionBar } from "@/components/ActionBar";
import { CompareView } from "@/components/CompareView";
import { SearchProvider } from "@/contexts/SearchContext";

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("configurator");
  const [activeTab, setActiveTab] = useState<TabId>("network");
  const [isGenerating, setIsGenerating] = useState(false);

  const methods = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: {
      deviceTemplate: "cipherlab95",
      profileName: "EMUConfig",
      hostname: "ASP.BLUSYS.IT",
      ibm5250Model: 7,
      licenseKey: "L5ZSFM99EJSQC3FD",
      e2kServer: "http://192.168.3.100:6000::",
      autoConnect: true,
      noAutoLock: true,
      showKeyboard: 2,
      orientation: 1,
      cfgPassword: "",
      fontSize: 29,
      colorMagenta: "#ff00ff",
      colorCyan: "#58f0f0",
      colorBlue: "#7890f0",
      colorYellow: "#ffff00",
      colorWhite: "#ffffff",
      colorGreen: "#24d830",
      colorRed: "#f01818",
      scrColor: 0,
      stsColor: 3,
      barcodeEnable: 10,
      barcodeDoAfter: 2,
      barcodeShow: false,
      barcodeUseKeymap: false,
      anyCmdResets: true,
      dpadLeftMacro: "^$1b",
      dpadRightMacro: "^$09",
      askUserId: false,
      useSystemUser: false,
      userId: "",
      askPassword: true,
      password: "",
      enableAutoLogin: false,
      scriptName: "autologin.scrgl",
      scriptContent: `WAIT "Utente . . . . . ."\nTYPE $USER$\nENTER\nWAIT "Password . . . . . ."\nTYPE $PASS$\nENTER`,
    },
    mode: "onChange"
  });

  const handleGenerate = async (values: any) => {
    setIsGenerating(true);
    try {
       const templateName = values.deviceTemplate === 'cipherlab95' ? 'Configuration_Cipherlab_95.ini' : 
                            values.deviceTemplate === 'newlandN7' ? 'Configuration_NewlandN7.ini' : 
                            'Configuration_PLUS995.ini';
                            
       let oldProfile = values.deviceTemplate === 'newlandN7' ? 'Test' : 'PLURI';
       
       const res = await fetch(`/templates/${templateName}`);
       if (!res.ok) throw new Error("Template not found");
       const baseText = await res.text();
       
       const finalIni = mergeTemplate(baseText, values, oldProfile);
       
       if (values.enableAutoLogin && values.scriptName && values.scriptContent) {
           await generateDownload(finalIni, `${values.profileName}_${values.deviceTemplate}.ini`, values.scriptContent, values.scriptName);
       } else {
           await generateDownload(finalIni, `${values.profileName}_${values.deviceTemplate}.ini`);
       }
    } catch(err) {
       console.error("Insuccesso nella generazione", err);
       alert("Errore durante la generazione dell'INI.");
    } finally {
       setIsGenerating(false);
    }
  }

  return (
    <SearchProvider>
      <LoginGate>
        <FormProvider {...methods}>
          <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#051821] text-white selection:bg-emu-accent/30">
            
            {/* Navigazione Globale Sinistra - Hidden on mobile, shown on md+ */}
            <div className="hidden md:block shrink-0">
              <LeftNav appMode={appMode} setAppMode={setAppMode} />
            </div>

            {/* Wrapper Contenuto App Principale */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
              
              <TopBar setActiveTab={setActiveTab} setAppMode={setAppMode} />

              <form 
                onSubmit={methods.handleSubmit(handleGenerate)} 
                className="flex-1 flex flex-col min-h-0 relative"
              >
                <div className="flex-1 flex flex-row justify-center overflow-y-auto custom-scrollbar">
                  {appMode === "compare" ? (
                    <div className="flex-1 h-full w-full">
                      <CompareView />
                    </div>
                  ) : (
                    <div className="w-full max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 p-4 sm:p-6 lg:p-8">
                      
                      {/* Spazio di Lavoro Centrale */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="sticky top-0 z-20 pb-4 bg-[#051821]/95 backdrop-blur-sm">
                          <TabNavigation activeTab={activeTab} onSelect={setActiveTab} />
                        </div>
                        
                        <div className="flex-1 pb-24">
                          <AnimatedTabContent activeTab={activeTab} />
                        </div>
                      </div>
 
                      {/* Il pannello a destra (Monitor di Anteprima) - Hidden below XL for better focus */}
                      <div className="hidden xl:block shrink-0 w-full xl:w-[400px] h-[calc(100vh-12rem)] sticky top-8">
                         <TerminalPreview />
                      </div>

                    </div>
                  )}
                </div>

                {/* Barra delle Azioni Universale (Footer fisso) */}
                {appMode === "configurator" && (
                  <ActionBar isGenerating={isGenerating} />
                )}
            </form>
          </div>
        </div>
      </FormProvider>
      </LoginGate>
    </SearchProvider>
  );
}
