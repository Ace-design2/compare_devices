import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, ChevronRight, Award } from 'lucide-react';
import type { VerdictResult } from '../utils/compareLogic';
import './VerdictSection.css';

interface VerdictSectionProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerdictResult | null;
}

const VerdictSection = ({ isOpen, onClose, result }: VerdictSectionProps) => {
  if (!isOpen || !result || !result.winner) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="verdict-section"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut", opacity: { duration: 0.3 } }}
      >
        <div className="verdict-content">
          <div className="verdict-header">
            <h2 className="verdict-title flex items-center gap-2">
              <Trophy className="text-accent" size={24} />
              Comparison Verdict
            </h2>
            <button className="close-button" onClick={onClose} aria-label="Hide verdict">
              <X size={20} />
            </button>
          </div>

          <div className="verdict-body">
            <div className="winner-spotlight">
              <div className="winner-badge">OVERALL WINNER</div>
              
              <div className="winner-card">
                <div className="winner-image-container">
                    <img 
                      src={`https://fdn2.gsmarena.com/vv/bigpic/${result.winner.image}`} 
                      alt={result.winner.name} 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('fallback');
                      }}
                    />
                </div>
                
                <div className="winner-details">
                  <h3 className="winner-name">{result.winner.name}</h3>
                  <p className="winner-brand">{result.winner.brand}</p>
                </div>
              </div>

              <div className="verdict-explanation">
                <p>{result.explanation}</p>
              </div>
            </div>

            {result.runnerUp && (
              <div className="runner-up-section">
                <h4 className="section-subtitle">
                  <Award size={16} /> Close Alternative
                </h4>
                <div className="runner-up-card">
                  <div className="runner-up-info">
                    <span className="ru-brand">{result.runnerUp.brand}</span>
                    <span className="ru-name">{result.runnerUp.name}</span>
                  </div>
                  <ChevronRight size={16} className="text-secondary" />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerdictSection;
