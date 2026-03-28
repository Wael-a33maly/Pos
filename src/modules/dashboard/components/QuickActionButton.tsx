// ============================================
// Quick Action Button Component - زر الإجراء السريع
// ============================================

'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { QuickActionButtonProps } from '../types';

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20 
    }
  },
  hover: { 
    scale: 1.05, 
    y: -4,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.95 }
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.2, 
    rotate: 5,
    transition: { type: "spring", stiffness: 400 }
  }
};

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  color,
}: QuickActionButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation based on label
      const routes: Record<string, string> = {
        'نقطة بيع': '?mode=pos',
        'المنتجات': '?page=products',
        'التقارير': '?page=reports',
        'العملاء': '?page=customers',
        'الورديات': '?page=shifts',
      };
      const route = routes[label];
      if (route) {
        router.push(route);
      }
    }
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="hidden"
      animate="show"
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-2.5 px-5 py-4 rounded-2xl min-w-[90px]",
        "bg-gradient-to-br from-card via-card to-muted/20",
        "border border-transparent hover:border-primary/10",
        "shadow-sm hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300 group cursor-pointer"
      )}
    >
      <motion.div 
        variants={iconVariants}
        initial="rest"
        whileHover="hover"
        className={cn(
          "p-3 rounded-xl transition-all duration-300",
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </motion.div>
      <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </motion.button>
  );
}
