'use client';

import { ReactNode, useEffect } from 'react';
import '../lib/i18n'; // Initialize i18n

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Initialize i18n on client side
    console.log('I18n initialized');
  }, []);

  return <>{children}</>;
}