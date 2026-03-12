import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import DeviceSlot, { type DeviceData } from '../components/DeviceSlot';
import DeviceSearchModal from '../components/DeviceSearchModal';
import Button from '../components/Button';
import VerdictSection from '../components/VerdictSection';
import { fetchDeviceSearchData, fetchSingleDevice, fetchComparisonDevices, type DeviceSearchItem } from '../services/api';
import { calculateVerdict, type VerdictResult } from '../utils/compareLogic';
import { Trophy } from 'lucide-react';
import './ComparePage.css';

const MAX_DEVICES = 5;

interface ComparePageProps {
  initialDeviceIds?: number[] | null;
}

const ComparePage = ({ initialDeviceIds }: ComparePageProps) => {
  const [allSearchDevices, setAllSearchDevices] = useState<DeviceSearchItem[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddingDevice, setIsAddingDevice] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(!!initialDeviceIds && initialDeviceIds.length === 1);
  const [isMobile, setIsMobile] = useState(false);
  
  // Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isVerdictOpen, setIsVerdictOpen] = useState(false);
  const [verdictResult, setVerdictResult] = useState<VerdictResult | null>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  
  // Fetch initial devices on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch minimal names for search list (5000 devices)
        const searchItems = await fetchDeviceSearchData();
        setAllSearchDevices(searchItems);
        
        // 2. Fetch full details for initial comparison devices
        const defaultIds = initialDeviceIds || [8792, 8623]; // iPhone 16 Pro Max and S23 Ultra
        const initialFullDevices = await fetchComparisonDevices(defaultIds);
        
        if (initialFullDevices.length > 0) {
          setSelectedDevices(initialFullDevices);
        } else if (searchItems.length > 0) {
          // Fallback: fetch first 2 if defaults aren't found
          const firstTwoIds = searchItems.slice(0, 2).map(item => item.id);
          const fallbackDevices = await fetchComparisonDevices(firstTwoIds);
          setSelectedDevices(fallbackDevices);
        }
      } catch (err) {
        setError("Failed to load devices");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    
    // Evaluate mobile layout constraint
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);
    
    const unsubsribe = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', unsubsribe);
    return () => mediaQuery.removeEventListener('change', unsubsribe);
  }, []);

  const handleRemoveDevice = (indexToRemove: number) => {
    setSelectedDevices(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Recalculate verdict automatically when devices change
  useEffect(() => {
    if (selectedDevices.length >= 2) {
      setVerdictResult(calculateVerdict(selectedDevices));
    } else {
      setIsVerdictOpen(false); // Auto-close if less than 2 devices remain
    }
  }, [selectedDevices]);

  const handleAddDeviceClick = () => {
    if (selectedDevices.length >= MAX_DEVICES) return;
    setIsSearchModalOpen(true);
  };
  
  const handleSelectDevice = async (searchItem: DeviceSearchItem) => {
    if (selectedDevices.length >= MAX_DEVICES) return;
    
    setIsAddingDevice(true);
    setIsSearchModalOpen(false);
    
    try {
      // Fetch full details for the selected device on-demand
      const fullDevice = await fetchSingleDevice(searchItem.id);
      if (fullDevice) {
        setSelectedDevices(prev => [...prev, fullDevice]);
      }
    } catch (err) {
      console.error("Failed to load full device details", err);
    } finally {
      setIsAddingDevice(false);
    }
  };

  const handleToggleVerdict = () => {
    if (isVerdictOpen) {
      setIsVerdictOpen(false);
      // Wait for collapse animation to finish before scrolling back up
      setTimeout(() => {
        actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    } else {
      setIsVerdictOpen(true);
      // Wait for rendering to complete before scrolling
      setTimeout(() => {
        verdictRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  const availableDevices = useMemo(() => {
    return allSearchDevices.filter(
      (item: DeviceSearchItem) => !selectedDevices.some(selected => selected.id === item.id)
    );
  }, [allSearchDevices, selectedDevices]);

  const effectiveMaxDevices = isMobile ? 2 : MAX_DEVICES;
  const displayedDevices = isMobile ? selectedDevices.slice(0, effectiveMaxDevices) : selectedDevices;
  const showAddSlot = displayedDevices.length < effectiveMaxDevices;

  // Determine how many slots to show
  // If we have selected < effectiveMaxDevices, we show the selected ones + 1 empty slot
  // If we have selected effectiveMaxDevices, we show only the selected ones
  const totalSlots = Math.min(displayedDevices.length + 1, effectiveMaxDevices);
  
  // Calculate grid template columns depending on slots
  const gridTemplateColumns = useMemo(() => {
    if (isMobile) {
      return totalSlots === 1 ? 'minmax(140px, 1fr)' : 'repeat(2, minmax(140px, 1fr))';
    }
    if (totalSlots === 1) return 'minmax(280px, 400px)';
    if (totalSlots === 2) return 'repeat(2, minmax(280px, 1fr))';
    if (totalSlots === 3) return 'repeat(3, minmax(280px, 1fr))';
    return 'repeat(auto-fit, minmax(280px, 1fr))';
  }, [totalSlots, isMobile]);

  if (loading) {
    return (
      <div className="compare-page">
        <div className="compare-header">
          <h1>Device Comparison</h1>
          <p>Loading devices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compare-page">
        <div className="compare-header">
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h1>Device Comparison</h1>
        <p>Analyze specifications side by side</p>
      </div>

      <div className="comparison-grid" style={{ gridTemplateColumns }}>
        <AnimatePresence mode="popLayout">
          {displayedDevices.map((device, index) => (
            <DeviceSlot
              key={`${device.id}-${index}`}
              device={device}
              showDetails={showDetails}
              onRemove={() => handleRemoveDevice(index)}
            />
          ))}
          
          {showAddSlot && !isAddingDevice && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key="add-slot"
            >
              <DeviceSlot onAddPlaceholder={handleAddDeviceClick} />
            </motion.div>
          )}

          {isAddingDevice && (
             <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="loading-slot"
              className="device-slot placeholder loading"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
            >
              <span>Loading details...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedDevices.length > 0 && (
        <div ref={actionsRef} className="comparison-actions">
          <Button 
            size="md" 
            variant="secondary"
            onClick={() => setShowDetails(!showDetails)}
            className="details-toggle-main"
          >
            <span>{showDetails ? 'Show summary' : 'View detailed comparison'}</span>
            {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>

          {selectedDevices.length >= 2 && (
            <Button 
              size="md" 
              variant="primary"
              onClick={handleToggleVerdict}
              className="verdict-btn"
            >
              <Trophy size={20} />
              <span>{isVerdictOpen ? 'Hide Verdict' : 'View Verdict'}</span>
            </Button>
          )}
        </div>
      )}

      {selectedDevices.length === MAX_DEVICES && !isMobile && (
        <div className="limit-reached-msg">
          Maximum of {MAX_DEVICES} devices reached for comparison.
        </div>
      )}

      {displayedDevices.length === effectiveMaxDevices && isMobile && (
        <div className="limit-reached-msg">
          Mobile view is limited to {effectiveMaxDevices} devices. View on a larger screen to compare more.
        </div>
      )}

      {/* Render the Search Modal overlaid on the screen */}
      <DeviceSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectDevice={handleSelectDevice}
        availableDevices={availableDevices}
      />
      
      {/* Verdict Section Inline */}
      <div ref={verdictRef} className="verdict-container-wrapper">
        <VerdictSection 
          isOpen={isVerdictOpen}
          onClose={() => setIsVerdictOpen(false)}
          result={verdictResult}
        />
      </div>
    </div>
  );
};

export default ComparePage;
