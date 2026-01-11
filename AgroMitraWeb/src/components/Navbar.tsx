"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from '@/contexts/LanguageContext';
import { getUIText } from '@/lib/uiTranslations';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguage();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getNavItems = () => [
    { key: 'home', name: getUIText('home', language, 'navigation'), href: "/" },
    { key: 'tasks', name: getUIText('tasks', language, 'navigation'), href: "/tasks" },
    { key: 'community', name: getUIText('community', language, 'navigation'), href: "/community" },
    { key: 'myFarm', name: getUIText('myFarm', language, 'navigation'), href: "/my-farm" },
    { key: 'marketPrices', name: getUIText('marketPrices', language, 'navigation'), href: "/market-prices" }
  ];

  const navItems = getNavItems();

  return (
    <div className="sticky top-0 z-50 px-6 py-4">
      <nav className="max-w-5xl mx-auto border rounded-full shadow-lg bg-white/90 backdrop-blur-md border-white/30">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <div className="flex items-center justify-center w-10 h-10 mr-3 bg-white rounded-full shadow-md overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="AgroMitra Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-gray-800">
                  {language === 'hi' ? 'एग्रोमित्र' : 'AgroMitra'}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="items-center hidden space-x-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {/* User Profile */}
            <div className="items-center hidden md:flex">
              <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-md cursor-pointer bg-gradient-to-br from-blue-400 to-purple-500">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 text-gray-700 transition-colors duration-200 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-6 pb-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;