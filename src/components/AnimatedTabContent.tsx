"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TabId } from "./TabNavigation";
import { NetworkTab } from "./tabs/NetworkTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { BehaviorTab } from "./tabs/BehaviorTab";
import { AppearanceTab } from "./tabs/AppearanceTab";
import { HardwareTab } from "./tabs/HardwareTab";
import { HelpTab } from "./tabs/HelpTab";

const variants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25, staggerChildren: 0.05, delayChildren: 0.05 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

export function AnimatedTabContent({ activeTab }: { activeTab: TabId }) {
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
    <div className="relative mt-[var(--spacing-fluid)] min-h-[500px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full glass-panel shadow-2xl min-h-full"
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
