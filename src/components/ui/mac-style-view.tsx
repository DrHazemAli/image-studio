'use client';

import { motion } from 'framer-motion';
import { Switch } from '@radix-ui/react-switch';
import { useTheme } from '@/hooks/use-theme';

interface MacStyleViewProps {
  title: string;
  description?: string;
  isEnabled: boolean;
  onToggle: () => void;
  stats?: {
    label: string;
    value: string | number;
    color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  }[];
  children?: React.ReactNode;
  className?: string;
}

export function MacStyleView({ 
  title, 
  description, 
  isEnabled, 
  onToggle, 
  stats = [], 
  children,
  className = ''
}: MacStyleViewProps) {
  const { resolvedTheme } = useTheme();

  const getStatColor = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 dark:text-green-400';
      case 'blue':
        return 'text-blue-600 dark:text-blue-400';
      case 'yellow':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'red':
        return 'text-red-600 dark:text-red-400';
      case 'gray':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-4 ${className}`}
      style={{
        background: resolvedTheme === 'dark' 
          ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${
            resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          {description && (
            <p className={`text-xs mt-1 ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {description}
            </p>
          )}
        </div>
        
        {/* Mac-style toggle switch */}
        <div className="flex items-center">
          <Switch
            checked={isEnabled}
            onCheckedChange={onToggle}
            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
          >
            <motion.div
              className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform"
              animate={{
                x: isEnabled ? 16 : 2,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            />
          </Switch>
        </div>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-gray-50/50 border-gray-200/50'
              }`}
            >
              <div className={`text-xs font-medium ${
                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </div>
              <div className={`text-lg font-bold mt-1 ${getStatColor(stat.color)}`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Additional content */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </motion.div>
  );
}
