import { motion } from "framer-motion";

export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent/15 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-primary/15 blur-3xl"
        animate={{ x: [0, 25, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.svg
        className="absolute top-20 right-1/4 opacity-40"
        width="80" height="80" viewBox="0 0 32 32"
        animate={{ y: [0, -20, 0], rotate: [0, 360] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 24, repeat: Infinity, ease: "linear" } }}
      >
        <path d="M16 2 L29 9.5 V22.5 L16 30 L3 22.5 V9.5 Z" stroke="#6C63FF" strokeWidth="1" fill="none" />
      </motion.svg>
      <motion.svg
        className="absolute bottom-32 left-20 opacity-30"
        width="60" height="60" viewBox="0 0 32 32"
        animate={{ y: [0, 18, 0], x: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="16" cy="16" r="14" stroke="#00BCD4" strokeWidth="1" fill="none" />
      </motion.svg>
      <motion.svg
        className="absolute top-1/2 left-10 opacity-30"
        width="50" height="50" viewBox="0 0 32 32"
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <path d="M16 4 L28 11 V22 L16 28 L4 22 V11 Z" stroke="#00BCD4" strokeWidth="1" fill="none" />
      </motion.svg>
    </div>
  );
}
