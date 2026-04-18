"use client";

/**
 * ANIMATED TAB CONTENT: IL CAMBIO SCENA 🎭
 * 
 * Questo componente si occupa di far apparire e scomparire le varie sezioni
 * del form con una transizione fluida. 
 * Se l'utente ha attivato "Riduci movimento" nelle impostazioni di sistema,
 * noi siamo bravi e disattiviamo le animazioni per non dargli fastidio.
 */
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { TabId } from "./TabNavigation";
import { NetworkTab } from "./tabs/NetworkTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { BehaviorTab } from "./tabs/BehaviorTab";
import { AppearanceTab } from "./tabs/AppearanceTab";
import { HardwareTab } from "./tabs/HardwareTab";
import { HelpTab } from "./tabs/HelpTab";

/**
 * Varianti di animazione per il passaggio tra le tab.
 * Usiamo uno "stagger" per far sì che gli elementi interni
 * entrino in sequenza, creando un effetto più organico e premium.
 */
const variants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25, staggerChildren: 0.05, delayChildren: 0.05 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

/**
 * AnimatedTabContent: Il "contenitore" dinamico delle schede.
 * Si occupa di smontare la vecchia scheda e montare la nuova 
 * con una transizione fluida (fade + slide).
 */
export function AnimatedTabContent({ activeTab }: { activeTab: TabId }) {
  const shouldReduceMotion = useReducedMotion();

  const renderTab = () => {
    switch (activeTab) {
      case "network": return <NetworkTab />;
      case "security": return <SecurityTab />;
      case "behavior": return <BehaviorTab />;
      case "appearance": return <AppearanceTab />;
      case "hardware": return <HardwareTab />;
      case "help": return <HelpTab />;
      default: return null;
    }
  };

  return (
    <div className="relative mt-4 min-h-[400px]">
      <AnimatePresence mode="wait">
        <m.div
          key={activeTab}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          style={{ 
            willChange: 'transform, opacity',
          }}
          className="w-full min-h-full will-change-transform"
        >
          {renderTab()}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
