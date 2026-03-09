import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import './SelectionCard.css';

interface SelectionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const SelectionCard = ({ title, description, icon, isSelected, onClick }: SelectionCardProps) => {
  return (
    <motion.div
      className={`selection-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="card-content">
        {icon && <div className="card-icon">{icon}</div>}
        <h2 className="card-title">{title}</h2>
        {description && <p className="card-description">{description}</p>}
      </div>
    </motion.div>
  );
};

export default SelectionCard;
