import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

type Props = {
  className?: string;
  xOffset: number;
  duration: number;
}

export function Bounce({ className, xOffset, duration, children }: PropsWithChildren<Props>) {
  return (
    <motion.div
      className={className}
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      whileHover={{
        x: [0, xOffset, 0],
        transition: {
          repeat: Infinity,
          duration
        }
      }}
    >
      {children}
    </motion.div>
  );
}
