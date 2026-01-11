// Global Language Context for the entire application
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;