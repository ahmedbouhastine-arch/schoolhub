import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -16,
    scale: 1.02
  }
};

const pageTransition = {
  type: 'spring',
  stiffness: 280,
  damping: 32,
  mass: 1,
  duration: 0.35
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        minHeight: '100%',
        width: '100%',
        position: 'relative'
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
