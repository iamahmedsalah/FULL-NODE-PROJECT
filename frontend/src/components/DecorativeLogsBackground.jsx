import { Activity, Bug, Database, FileWarning, Gauge, ShieldAlert, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";

const ICONS = [
  { Icon: Database, cls: "top-[10%] left-[8%] text-cyan-300/35" },
  { Icon: Activity, cls: "top-[18%] right-[14%] text-emerald-300/30" },
  { Icon: FileWarning, cls: "top-[34%] left-[18%] text-amber-300/30" },
  { Icon: Bug, cls: "top-[46%] right-[10%] text-rose-300/30" },
  { Icon: Gauge, cls: "bottom-[24%] left-[10%] text-indigo-300/30" },
  { Icon: ShieldAlert, cls: "bottom-[14%] right-[16%] text-orange-300/30" },
  { Icon: TerminalSquare, cls: "bottom-[8%] left-[46%] text-cyan-200/25" },
];

export default function DecorativeLogsBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {ICONS.map(({ Icon, cls }, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${cls}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.5, delay: idx * 0.08 },
            y: {
              duration: 4 + idx * 0.4,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: idx * 0.15,
            },
          }}
        >
          <Icon size={22 + (idx % 3) * 4} />
        </motion.div>
      ))}
    </div>
  );
}
