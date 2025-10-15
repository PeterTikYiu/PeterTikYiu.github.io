import React from 'react';
import { motion } from 'framer-motion';

const LangSwitchButton = ({ currentLang, onLanguageChange }) => {
  const toggleLanguage = () => {
    const langOrder = ['en', 'zh', 'tw'];
    const currentIndex = langOrder.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % langOrder.length;
    const newLang = langOrder[nextIndex];
    onLanguageChange(newLang);
  };

  const getDisplayText = () => {
    switch (currentLang) {
      case 'en': return '🇺🇸 EN';
      case 'zh': return '🇨🇳 中文';
      case 'tw': return '🇹🇼 繁體';
      default: return '🇺🇸 EN';
    }
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="lang-switch-btn"
    >
      {getDisplayText()}
    </motion.button>
  );
};

export default LangSwitchButton;