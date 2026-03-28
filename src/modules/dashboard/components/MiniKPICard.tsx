// ============================================
// Mini KPI Card Component - بطاقة مؤشر صغيرة
// ============================================

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MiniKPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    scale: 1.03,
    y: -2,
    transition: { duration: 0.2 }
  }
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.15, 
    rotate: 5,
    transition: { type: "spring", stiffness: 300 }
  }
};

export function MiniKPICard({
  title,
  value,
  icon: Icon,
  color = 'text-primary bg-primary/10',
  index = 0,
}: MiniKPICardProps) {
  // Extract text and bg colors from the color string
  const colorParts = color.split(' ');
  const textColor = colorParts[0] || 'text-primary';
  const bgColor = colorParts[1] || 'bg-primary/10';
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover="hover"
      transition={{ delay: 0.4 + index * 0.05 }}
      className="h-full"
    >
      <div className={cn(
        "h-full flex items-center gap-3 p-4 rounded-2xl",
        "bg-gradient-to-br from-card via-card to-muted/20",
        "border border-transparent hover:border-primary/10",
        "shadow-sm hover:shadow-md hover:shadow-primary/5",
        "transition-all duration-300 cursor-pointer"
      )}>
        <motion.div 
          variants={iconVariants}
          initial="rest"
          whileHover="hover"
          className={cn("p-2.5 rounded-xl", bgColor)}
        >
          <Icon className={cn("h-5 w-5", textColor)} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
          <p className="font-bold text-lg truncate">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
