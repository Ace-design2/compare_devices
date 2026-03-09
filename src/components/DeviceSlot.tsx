import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Wifi, Calendar, Smartphone, Monitor, Cpu, 
  HardDrive, Camera, Volume2, Radio, Zap, Battery, 
  MoreHorizontal, Maximize
} from 'lucide-react';
import './DeviceSlot.css';

export interface DeviceData {
  id: string;
  name: string;
  brand: string;
  image: string;
  category?: string;
  specs: Record<string, Record<string, string>>;
}

interface DeviceSlotProps {
  device?: DeviceData;
  showDetails?: boolean;
  onRemove?: () => void;
  onAddPlaceholder?: () => void;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('network')) return <Wifi size={14} />;
  if (cat.includes('launch')) return <Calendar size={14} />;
  if (cat.includes('body')) return <Smartphone size={14} />;
  if (cat.includes('display')) return <Monitor size={14} />;
  if (cat.includes('platform')) return <Cpu size={14} />;
  if (cat.includes('memory')) return <HardDrive size={14} />;
  if (cat.includes('camera')) return <Camera size={14} />;
  if (cat.includes('sound')) return <Volume2 size={14} />;
  if (cat.includes('comms')) return <Radio size={14} />;
  if (cat.includes('features')) return <Zap size={14} />;
  if (cat.includes('battery')) return <Battery size={14} />;
  return <MoreHorizontal size={14} />;
};

const DeviceSlot = ({ device, showDetails = false, onRemove, onAddPlaceholder }: DeviceSlotProps) => {
  if (!device) {
    return (
      <motion.div 
        className="device-slot empty"
        onClick={onAddPlaceholder}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="empty-content">
          <div className="add-icon-wrapper">
            <span className="add-icon">+</span>
          </div>
          <p>Add Device</p>
        </div>
      </motion.div>
    );
  }

  const getMainCameraSpec = () => {
    const mainCam = device.specs['Main Camera'] || device.specs['Camera'];
    if (!mainCam) return '-';
    // Prioritize common lens configurations
    for (const key of ['Quad', 'Triple', 'Dual', 'Single', 'Modules', 'Main']) {
      if (mainCam[key]) return mainCam[key].split(',')[0];
    }
    // Fallback to the first available non-object value
    const firstVal = Object.values(mainCam).find(v => typeof v === 'string');
    return typeof firstVal === 'string' ? firstVal.split(',')[0] : '-';
  };

  // Extract summary specs
  const summarySpecs = [
    { 
      label: 'Display', 
      value: device.specs.Display?.Size?.split(',')[0] || '-', 
      icon: <Maximize size={18} /> 
    },
    { 
      label: 'Chipset', 
      value: device.specs.Platform?.Chipset?.split(',')[0] || '-', 
      icon: <Cpu size={18} /> 
    },
    { 
      label: 'OS', 
      value: device.specs.Platform?.OS?.split(',')[0] || '-', 
      icon: <Smartphone size={18} /> 
    },
    { 
      label: 'Camera', 
      value: getMainCameraSpec(), 
      icon: <Camera size={18} /> 
    },
    { 
      label: 'Memory', 
      value: device.specs.Memory?.Internal?.split(',')[0] || '-', 
      icon: <HardDrive size={18} /> 
    },
    { 
      label: 'Battery', 
      value: device.specs.Battery?.Type?.split(',')[0] || device.specs.Battery?.Size || '-', 
      icon: <Battery size={18} /> 
    },
  ];

  return (
    <motion.div 
      className={`device-slot filled ${showDetails ? 'expanded' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="slot-header">
        <div className="device-brand">{device.brand}</div>
        {onRemove && (
          <button className="remove-btn" onClick={onRemove} aria-label="Remove device">
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className="device-image-container">
        <div className="image-placeholder">
          <div className="mock-device-screen"></div>
        </div>
      </div>
      
      <h3 className="device-name">{device.name}</h3>

      {/* Summary View */}
      <div className="summary-specs">
        {summarySpecs.map((spec, idx) => (
          <div key={idx} className="summary-item">
            <div className="summary-icon">{spec.icon}</div>
            <div className="summary-content">
              <span className="summary-label">{spec.label}</span>
              <span className="summary-value" title={spec.value}>
                {spec.value}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <AnimatePresence>
        {showDetails && (
          <motion.div 
            className="detailed-specs-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="specs-container">
              {Object.entries(device.specs).map(([category, items]) => (
                <div key={category} className="spec-category">
                  <h4 className="category-title">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </h4>
                  <div className="category-items">
                    {Object.entries(items).map(([key, value]) => (
                      <div key={key} className="spec-row">
                        <span className="spec-label">{key}</span>
                        <span className="spec-value">{value || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DeviceSlot;
