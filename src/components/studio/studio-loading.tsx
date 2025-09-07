'use client';

import { motion } from 'framer-motion';
import { LayersIcon } from '@radix-ui/react-icons';

interface StudioLoadingProps {
  isVisible: boolean;
}

export function StudioLoading({ isVisible }: StudioLoadingProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center"
    >

      {/* Main Loading Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
        {/* Animated Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="relative w-48 h-48 mx-auto">
            {/* Main Circle */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20"
            />
            
            {/* Inner Circles */}
            <motion.div
              animate={{ 
                rotate: [360, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-30"
            />
            
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.15, 1]
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute inset-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full opacity-40"
            />
            
            {/* Center Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <LayersIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            {/* Floating Elements */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.sin(i) * 10, 0],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                style={{
                  top: `${20 + (i * 15)}%`,
                  left: `${15 + (i * 12)}%`,
                  transform: `rotate(${i * 60}deg)`
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Title with Shimmer Effect */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-5xl font-bold mb-4 relative "
        >
          <motion.span
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 1
            }}
            className="bg-gradient-to-r from-gray-900 via-blue-500 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent bg-[length:200%_100%]"
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 100%'
            }}
          >
            Azure Image Studio
          </motion.span>
        </motion.h1>

        {/* Subtitle with Shimmer */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-xl mb-12 relative overflow-hidden"
        >
          <motion.span
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 1.5
            }}
            className="bg-gradient-to-r from-gray-600 via-purple-500 to-gray-600 dark:from-gray-300 dark:via-purple-400 dark:to-gray-300 bg-clip-text text-transparent bg-[length:200%_100%]"
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 100%'
            }}
          >
            Loading your creative workspace...
          </motion.span>
        </motion.p>

        {/* Loading Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="w-96 h-3 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-8 overflow-hidden"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 0.5
            }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          />
        </motion.div>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex justify-center space-x-3 mb-12"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          ))}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { icon: "🎨", text: "AI Generation", color: "from-blue-500 to-cyan-500" },
            { icon: "🖼️", text: "Image Editing", color: "from-purple-500 to-pink-500" },
            { icon: "⚡", text: "Real-time", color: "from-green-500 to-emerald-500" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
              className="text-center group"
            >
              <motion.div 
                className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {feature.icon}
              </motion.div>
              <div className={`text-sm font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                {feature.text}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { left: 10, top: 20, color: 'bg-blue-400', delay: 0, duration: 4 },
          { left: 25, top: 60, color: 'bg-purple-400', delay: 0.5, duration: 5 },
          { left: 45, top: 15, color: 'bg-pink-400', delay: 1, duration: 4.5 },
          { left: 70, top: 80, color: 'bg-blue-400', delay: 1.5, duration: 5.5 },
          { left: 85, top: 35, color: 'bg-purple-400', delay: 2, duration: 4.2 },
          { left: 15, top: 75, color: 'bg-pink-400', delay: 2.5, duration: 5.8 },
          { left: 60, top: 45, color: 'bg-blue-400', delay: 3, duration: 4.8 },
          { left: 35, top: 90, color: 'bg-purple-400', delay: 3.5, duration: 5.2 }
        ].map((particle, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              y: [0, -150],
              opacity: [0, 0.4, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeOut"
            }}
            className={`absolute w-2 h-2 rounded-full ${particle.color}`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
