import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardList from './CardList';
import LangSwitchButton from './LangSwitchButton';

const App = () => {
  const [lang, setLang] = useState('en'); // Default language
  const [isAnimating, setIsAnimating] = useState(false);
  const [key, setKey] = useState(0); // Force re-render key

  // Load initial language from localStorage or default
  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang) {
      setLang(storedLang);
    }
    // Trigger initial animation
    setTimeout(() => {
      setIsAnimating(true);
    }, 100); // Small delay for initial load
  }, []);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
    setIsAnimating(false); // Reset animation
    // Trigger page-turn animation after 1 second delay
    setTimeout(() => {
      setIsAnimating(true);
      setKey(prev => prev + 1); // Force re-render to ensure cards update
    }, 1000);
  };

  const pageVariants = {
    initial: { rotateY: -90, opacity: 0 },
    in: { rotateY: 0, opacity: 1 },
    out: { rotateY: 90, opacity: 0 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.8
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="initial"
        animate={isAnimating ? "in" : "initial"}
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        <LangSwitchButton currentLang={lang} onLanguageChange={handleLanguageChange} />
        <CardList lang={lang} />
      </motion.div>
    </AnimatePresence>
  );
};

export default App;