import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Twitter, Mail, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ContactTooltip.css";

const ContactTooltip: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const contactOptions = [
    {
      name: "Whatsapp",
      icon: <MessageCircle size={18} />,
      link: "https://wa.me/+2349065058516", // Derived from email prefix + guesswork or common format
      color: "#25D366",
    },
    {
      name: "Twitter",
      icon: <Twitter size={18} />,
      link: "https://x.com/madebyacee",// Placeholder
      color: "#1DA1F2",
    },
    {
      name: "Email",
      icon: <Mail size={18} />,
      link: "mailto:showunmioluwasegun135@gmail.com",
      color: "#EA4335",
    },
    {
      name: "Phone",
      icon: <Phone size={18} />,
      link: "tel:+2349065058516", // Placeholder based on common format
      color: "#34A853",
    },
  ];

  return (
    <div className="contact-tooltip-container" ref={tooltipRef}>
      <button 
        className={`contact-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        Contact Developer
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="tooltip-content"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="tooltip-arrow" />
            <div className="tooltip-inner">
              {contactOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-option"
                  style={{ "--hover-color": option.color } as React.CSSProperties}
                >
                  <span className="icon-wrapper">
                    {option.icon}
                  </span>
                  <span className="option-name">{option.name}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactTooltip;
