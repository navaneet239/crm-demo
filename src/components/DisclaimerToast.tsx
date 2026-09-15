import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface DisclaimerToastProps {
  onClose: () => void;
}

export const DisclaimerToast: React.FC<DisclaimerToastProps> = ({ onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const location = useLocation();

  // Auto-dismiss logic with pause/resume support
  useEffect(() => {
    if (isPaused) return;

    const duration = 5000;
    const startTime = Date.now() - (duration * (1 - progress / 100));
    
    let animationFrame: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.max(0, 100 - (elapsed / duration * 100));
      
      setProgress(currentProgress);
      
      if (currentProgress > 0) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        onClose();
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused, onClose]);

  // Handle Escape key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isLoginPage = location.pathname === '/login';

  return (
    <AnimatePresence>
      <motion.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className={`fixed z-50 bg-white border border-[#DDE3EC] rounded-[8px] card-shadow overflow-hidden
                   md:top-6 md:left-6 md:w-[380px] md:right-auto
                   ${isLoginPage ? 'top-3' : 'top-[68px]'} left-3 right-3 transition-[top] duration-200`}
      >
        {/* Progress Bar - pinned to top edge, linear shrinking animation */}
        <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden pointer-events-none">
          <div 
            className="h-full bg-[#004080] will-change-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4 pt-5 relative">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2.5 right-2.5 p-1 rounded-[6px] text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9] transition-colors cursor-pointer"
            aria-label="Close disclaimer"
          >
            <X size={16} strokeWidth={2} />
          </button>

          {/* Content */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.12em] text-[#004080] font-bold block">
              DEMONSTRATION ENVIRONMENT
            </span>
            
            <p className="text-[13px] text-[#5C6880] leading-[1.4] pr-4">
              All companies, people, contact details, values and documents shown here are fictional. 
              Nothing you enter is saved or sent anywhere, and the data resets on reload.
            </p>
            
            <div className="text-[11px] text-[#5C6880]/80 pt-2 border-t border-[#F0F4F9] flex items-center gap-1">
              <span>Issues?</span>
              <a 
                href="mailto:hi@jnavaneet.in" 
                className="text-[#004080] font-semibold hover:underline transition-all"
              >
                hi@jnavaneet.in
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
