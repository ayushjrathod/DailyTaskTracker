"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  color?: string;
}

export default function Loader({ size = 24, color = "currentColor" }: LoaderProps) {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
      <Loader2 size={size} color={color} />
    </motion.div>
  );
}
