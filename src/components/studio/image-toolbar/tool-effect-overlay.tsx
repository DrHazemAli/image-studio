'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Props interface for the ToolEffectOverlay component
 * This component provides visual effects during image processing operations
 */
export interface ToolEffectOverlayProps {
  // Control visibility and type of effect
  isVisible: boolean;
  effectType: 'ray' | 'pulse' | 'ripple' | 'glow';
  
  // Positioning and sizing
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Visual customization
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'normal' | 'fast';
  
  // Progress indication
  progress?: number; // 0-100
  message?: string;
  
  // Event handlers
  onComplete?: () => void;
}

/**
 * Visual effect overlay component for image processing operations
 * Provides various animated effects to indicate processing states
 */
export const ToolEffectOverlay: React.FC<ToolEffectOverlayProps> = ({
  isVisible,
  effectType,
  bounds,
  color = '#3b82f6', // blue-500
  intensity = 'medium',
  speed = 'normal',
  progress,
  message,
  onComplete
}) => {
  const [animationStage, setAnimationStage] = useState<'entering' | 'processing' | 'exiting'>('entering');

  // Handle animation lifecycle
  useEffect(() => {
    if (isVisible) {
      setAnimationStage('entering');
      setTimeout(() => setAnimationStage('processing'), 300);
    } else if (animationStage !== 'exiting') {
      setAnimationStage('exiting');
    }
  }, [isVisible, animationStage]);

  // Call onComplete when exiting animation finishes
  useEffect(() => {
    if (animationStage === 'exiting') {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animationStage, onComplete]);

  // Define speed values
  const speedValues = {
    slow: 3,
    normal: 2,
    fast: 1
  };

  // Define intensity values
  const intensityValues = {
    low: 0.3,
    medium: 0.6,
    high: 0.9
  };

  // Ray effect component
  const RayEffect = () => {
    const rayCount = intensity === 'low' ? 8 : intensity === 'medium' ? 12 : 16;
    const rays = Array.from({ length: rayCount }, (_, i) => i);
    
    return (
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {rays.map((index) => (
          <motion.div
            key={index}
            className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-transparent via-current to-transparent origin-bottom"
            style={{
              height: Math.max(bounds.width, bounds.height) * 0.8,
              transformOrigin: '50% 0%',
              transform: `translate(-50%, -50%) rotate(${(360 / rayCount) * index}deg)`,
              color: color,
              opacity: intensityValues[intensity]
            }}
            animate={{
              scaleY: [0, 1, 0.8, 1, 0],
              opacity: [0, intensityValues[intensity], intensityValues[intensity] * 0.7, intensityValues[intensity], 0]
            }}
            transition={{
              duration: speedValues[speed] * 2,
              repeat: Infinity,
              delay: (index / rayCount) * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  };

  // Pulse effect component
  const PulseEffect = () => (
    <motion.div
      className="absolute inset-0 rounded-lg border-4"
      style={{
        borderColor: color,
        opacity: intensityValues[intensity]
      }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [intensityValues[intensity], intensityValues[intensity] * 0.3, intensityValues[intensity]]
      }}
      transition={{
        duration: speedValues[speed],
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  // Ripple effect component
  const RippleEffect = () => {
    const ripples = [0, 1, 2];
    
    return (
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {ripples.map((index) => (
          <motion.div
            key={index}
            className="absolute inset-0 border-2 rounded-lg"
            style={{
              borderColor: color,
              opacity: intensityValues[intensity]
            }}
            animate={{
              scale: [1, 1.2],
              opacity: [intensityValues[intensity], 0]
            }}
            transition={{
              duration: speedValues[speed] * 1.5,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    );
  };

  // Glow effect component
  const GlowEffect = () => (
    <motion.div
      className="absolute inset-0 rounded-lg"
      style={{
        backgroundColor: color,
        opacity: intensityValues[intensity] * 0.2,
        boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}`
      }}
      animate={{
        opacity: [intensityValues[intensity] * 0.1, intensityValues[intensity] * 0.3, intensityValues[intensity] * 0.1]
      }}
      transition={{
        duration: speedValues[speed],
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  // Render appropriate effect
  const renderEffect = () => {
    switch (effectType) {
      case 'ray':
        return <RayEffect />;
      case 'pulse':
        return <PulseEffect />;
      case 'ripple':
        return <RippleEffect />;
      case 'glow':
        return <GlowEffect />;
      default:
        return <RayEffect />;
    }
  };

  // Don't render if not visible and not exiting
  if (!isVisible && animationStage !== 'exiting') {
    return null;
  }

  return (
    <motion.div
      className="fixed pointer-events-none z-40"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: animationStage === 'exiting' ? 0 : 1,
        scale: animationStage === 'exiting' ? 0.8 : 1
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: animationStage === 'exiting' ? 0.5 : 0.3
      }}
    >
      {/* Main effect container */}
      <div className="relative w-full h-full">
        {/* Background overlay */}
        <motion.div
          className="absolute inset-0 bg-black/10 dark:bg-white/5 backdrop-blur-[1px] rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: animationStage === 'exiting' ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Effect overlay */}
        {renderEffect()}
        
        {/* Progress indicator */}
        {progress !== undefined && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/50 dark:bg-white/20 backdrop-blur-sm rounded-full p-2">
              <div className="w-full bg-gray-300/30 rounded-full h-1">
                <motion.div
                  className="bg-current h-1 rounded-full"
                  style={{ color: color }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Message display */}
        {message && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div className="bg-black/70 dark:bg-white/20 backdrop-blur-md text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
              {message}
            </div>
          </motion.div>
        )}
        
        {/* Center indicator dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: speedValues[speed] * 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
};