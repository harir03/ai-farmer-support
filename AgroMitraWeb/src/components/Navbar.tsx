"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from '@/contexts/LanguageContext';
import { getUIText } from '@/lib/uiTranslations';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguage();

  // Add scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getNavItems = () => [
    { key: 'home', name: getUIText('home', language, 'navigation'), href: "/", icon: "🏠" },
    { key: 'tasks', name: getUIText('tasks', language, 'navigation'), href: "/tasks", icon: "📋" },
    { key: 'community', name: getUIText('community', language, 'navigation'), href: "/community", icon: "👥" },
    { key: 'myFarm', name: getUIText('myFarm', language, 'navigation'), href: "/my-farm", icon: "🌾" },
    { key: 'marketPrices', name: getUIText('marketPrices', language, 'navigation'), href: "/market-prices", icon: "📊" },
    { key: 'diseaseDetection', name: getUIText('diseaseDetection', language, 'navigation'), href: "/disease-detection", icon: "🩺" }
  ];

  const navItems = getNavItems();

  return (
    <div className={`sticky top-0 z-50 px-4 py-3 transition-all duration-300 ${scrolled ? 'py-2' : ''}`}>
      <nav className={`max-w-6xl mx-auto rounded-2xl transition-all duration-300 ${scrolled
          ? 'bg-white/95 shadow-lg border border-gray-100'
          : 'bg-white/80 backdrop-blur-md border border-white/40 shadow-md'
        }`}>
        <div className="px-5 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <div className="flex items-center justify-center w-9 h-9 mr-2.5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm overflow-hidden group-hover:shadow-md transition-shadow duration-200">
                  <Image
                    src="/logo.png"
                    alt="AgroMitra Logo"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  {language === 'hi' ? 'एग्रोमित्र' : 'AgroMitra'}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="items-center hidden lg:flex space-x-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${isActive(item.href)
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right side: Language toggle + Profile */}
            <div className="items-center hidden md:flex gap-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-1"
              >
                <span className="text-sm">🌐</span>
                {language === 'hi' ? 'EN' : 'हिं'}
              </button>

              {/* Profile */}
              <div className="flex items-center justify-center w-8 h-8 rounded-xl cursor-pointer bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm hover:shadow-md transition-shadow duration-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg"
              >
                {language === 'hi' ? 'EN' : 'हिं'}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-3 space-y-1 border-t border-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive(item.href)
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;