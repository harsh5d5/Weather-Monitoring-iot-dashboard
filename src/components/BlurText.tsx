"use client";

import { motion } from 'motion/react';

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  onAnimationComplete?: () => void;
};

export default function BlurText({
  text = '',
  delay = 100,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay / 1000,
        onComplete: onAnimationComplete
      }
    }
  };

  const childVariants: any = {
    hidden: {
      opacity: 0,
      filter: 'blur(10px)',
      y: direction === 'top' ? -20 : 20
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.p
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: animateBy === 'words' ? '0.35em' : '0.1em'
      }}
    >
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          variants={childVariants}
          style={{
            display: 'inline-block',
            willChange: 'transform, filter, opacity'
          }}
        >
          {segment === ' ' ? '\u00A0' : segment}
        </motion.span>
      ))}
    </motion.p>
  );
}
