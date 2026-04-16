"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TabId } from "./TabNavigation";
import { NetworkTab } from "./tabs/NetworkTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { BehaviorTab } from "./tabs/BehaviorTab";
import { AppearanceTab } from "./tabs/AppearanceTab";
import { HardwareTab } from "./tabs/HardwareTab";
import { HelpTab } from "./tabs/HelpTab";

const tabs: Record<TabId, React.ReactNode> = {
  network: <NetworkTab />,
  security: <SecurityTab />,
  behavior: <BehaviorTab />,
  appearance: <AppearanceTab />,
  hardware: <HardwareTab />,
  help: <HelpTab />,
};

const variants: any = {
  initial: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25, staggerChildren: 0.05, delayChildren: 0.05 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

export function AnimatedTabContent({ activeTab }: { activeTab: TabId }) {
  return (
    <div className="relative mt-6 min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full bg-[#1A4645]/70 backdrop-blur-md rounded-xl p-6 border border-emu-border/30 border-t-[#266867]/60 shadow-[0_4px_30px_rgba(0,0,0,0.3)] min-h-full"
        >
          {tabs[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
