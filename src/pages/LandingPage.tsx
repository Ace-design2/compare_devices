import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Sparkles } from 'lucide-react';
import SelectionCard from '../components/SelectionCard';
import Button from '../components/Button';
import Input from '../components/Input';
import './LandingPage.css';

interface LandingPageProps {
  onContinue: (selectionType: SelectionType) => void;
}

type SelectionType = 'compare' | 'recommend' | null;

const LandingPage = ({ onContinue }: LandingPageProps) => {
  const [selection, setSelection] = useState<SelectionType>(null);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Subscribed with: ${email}`);
      setEmail('');
    }
  };

  return (
    <div className="landing-page">
      <div className="hero-section">
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Discover Your Next Device
        </motion.h1>
        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Select an option below to get started on finding the perfect tech for your needs.
        </motion.p>
      </div>

      <div className="selection-container">
        <SelectionCard
          title="Compare Devices"
          description="Place up to 5 devices side-by-side to see how their specs stack up against each other."
          icon={<Smartphone size={48} strokeWidth={1.5} />}
          isSelected={selection === 'compare'}
          onClick={() => setSelection('compare')}
        />
        <SelectionCard
          title="Find Your Perfect Fit"
          description="Answer a few simple questions and we'll recommend the best devices tailored to you."
          icon={<Sparkles size={48} strokeWidth={1.5} />}
          isSelected={selection === 'recommend'}
          onClick={() => setSelection('recommend')}
        />
      </div>

      <div className="action-section">
        <AnimatePresence>
          {selection && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="continue-wrapper"
            >
              <Button size="lg" onClick={() => onContinue(selection)}>
                Continue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        className="newsletter-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="newsletter-card">
          <h3>Stay Updated</h3>
          <p>Get the latest device reviews and tech news directly in your inbox.</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="secondary">Subscribe</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
