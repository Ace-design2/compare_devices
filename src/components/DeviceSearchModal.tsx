import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { type DeviceSearchItem } from '../services/api';
import './DeviceSearchModal.css';

interface DeviceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDevice: (item: DeviceSearchItem) => void;
  availableDevices: DeviceSearchItem[];
}

const DeviceSearchModal = ({ isOpen, onClose, onSelectDevice, availableDevices }: DeviceSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sort and filter devices
  const filteredDevices = useMemo(() => {
    const sorted = [...availableDevices].sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;
      return a.name.localeCompare(b.name);
    });

    if (!searchTerm.trim()) return sorted;
    
    const lowercasedSearch = searchTerm.toLowerCase();
    return sorted.filter((device) => 
      device.name.toLowerCase().includes(lowercasedSearch) ||
      device.brand.toLowerCase().includes(lowercasedSearch)
    );
  }, [availableDevices, searchTerm]);

  // Handle opening/closing reset
  useEffect(() => {
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
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="search-modal-header">
              <div className="header-content">
                <h2>Select a Device</h2>
                <p className="header-subtitle">Choose from our curated collection</p>
              </div>
              <button className="close-btn" onClick={onClose} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <div className="search-input-wrapper">
              <div className="search-input-container">
                <Search className="search-icon" size={18} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="search-input-field"
                />
              </div>
            </div>

            <div className="search-results-list">
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <motion.div
                    key={device.id}
                    className="search-result-item"
                    onClick={() => onSelectDevice(device)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="result-info">
                      <span className="result-brand">{device.brand}</span>
                      <span className="result-name">{device.name}</span>
                    </div>
                    <div className="result-action">
                      <span className="select-text">Select</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="no-results-message">
                  <p>No devices found matching "{searchTerm}"</p>
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
