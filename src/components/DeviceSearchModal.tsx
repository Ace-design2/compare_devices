import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { type DeviceSearchItem } from '../services/api';
import Input from './Input';
import './DeviceSearchModal.css';

interface DeviceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDevice: (item: DeviceSearchItem) => void;
  availableDevices: DeviceSearchItem[];
}

const DeviceSearchModal = ({ isOpen, onClose, onSelectDevice, availableDevices }: DeviceSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter devices based on search term
  const filteredDevices = useMemo(() => {
    if (!searchTerm.trim()) return availableDevices;
    
    const lowercasedSearch = searchTerm.toLowerCase();
    return availableDevices.filter((device) => 
      device.name.toLowerCase().includes(lowercasedSearch) ||
      device.brand.toLowerCase().includes(lowercasedSearch)
    );
  }, [availableDevices, searchTerm]);

  // Handle opening/closing reset
  useMemo(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Handle overlay click closing
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="search-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div 
            className="search-modal-container"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          >
            <div className="search-modal-header">
              <h2>Select a Device</h2>
              <button className="close-btn" onClick={onClose} aria-label="Close modal">
                <X size={24} />
              </button>
            </div>

            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <Input
                autoFocus
                type="text"
                placeholder="Search by device name or brand..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="search-results-list">
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <motion.div
                    key={device.id}
                    className="search-result-item"
                    onClick={() => onSelectDevice(device)}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="result-brand">{device.brand}</div>
                    <div className="result-name">{device.name}</div>
                  </motion.div>
                ))
              ) : (
                <div className="no-results-message">
                  No devices found matching "{searchTerm}"
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeviceSearchModal;
