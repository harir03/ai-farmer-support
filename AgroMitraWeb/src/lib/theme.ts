// AI Farm Care Design System - Unified Theme Configuration
export const theme = {
  colors: {
    // Primary brand colors - Green (Agriculture/Growth)
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main brand green
      600: '#16a34a', // Primary action color
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    // Secondary colors - Blue (Technology/AI)
    secondary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Secondary action color
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Accent colors - Purple (Innovation/AI)
    accent: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    // Neutral grays
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  // Typography scale
  typography: {
    fontSans: 'var(--font-geist-sans)',
    fontMono: 'var(--font-geist-mono)',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  // Spacing system
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '3rem',      // 48px
    '2xl': '4rem',   // 64px
    '3xl': '6rem',   // 96px
    '4xl': '8rem',   // 128px
  },
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    full: '9999px',
  },
  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  // Layout constants
  layout: {
    containerMaxWidth: '1280px',
    navbarHeight: '4rem',
    sidebarWidth: '16rem',
  }
};

export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
};

// Comprehensive component class system
export const componentClasses = {
  // Layout components
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  page: 'min-h-screen bg-gray-50',
  section: 'py-8 md:py-12',
  
  // Card components with variants
  card: {
    base: 'bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300',
    hover: 'bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300',
    elevated: 'bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300',
    gradient: 'bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300',
  },
  
  // Button system with comprehensive variants
  button: {
    // Primary buttons
    primary: 'inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md',
    primaryLarge: 'inline-flex items-center px-6 py-3 bg-green-600 text-white text-base font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg',
    
    // Secondary buttons
    secondary: 'inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md',
    
    // Outline buttons
    outline: 'inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 bg-white shadow-sm',
    outlinePrimary: 'inline-flex items-center px-4 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 bg-white shadow-sm',
    
    // Ghost buttons
    ghost: 'inline-flex items-center px-4 py-2 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200',
    
    // Danger buttons
    danger: 'inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md',
    
    // Size variants
    small: 'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
    large: 'inline-flex items-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200',
  },
  
  // Form components
  input: 'block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 shadow-sm',
  select: 'block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 shadow-sm',
  textarea: 'block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 shadow-sm resize-vertical',
  
  // Badge system with semantic colors
  badge: {
    success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    info: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    gray: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    purple: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800',
  },
  
  // Alert system
  alert: {
    success: 'p-4 bg-green-50 border-l-4 border-green-400 rounded-lg',
    warning: 'p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg',
    error: 'p-4 bg-red-50 border-l-4 border-red-400 rounded-lg',
    info: 'p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg',
  },
  
  // Typography
  text: {
    h1: 'text-4xl md:text-5xl font-bold text-gray-900 tracking-tight',
    h2: 'text-3xl md:text-4xl font-bold text-gray-900 tracking-tight',
    h3: 'text-2xl md:text-3xl font-bold text-gray-900 tracking-tight',
    h4: 'text-xl md:text-2xl font-semibold text-gray-900',
    h5: 'text-lg md:text-xl font-semibold text-gray-900',
    h6: 'text-base md:text-lg font-semibold text-gray-900',
    body: 'text-gray-700 leading-relaxed',
    bodyLarge: 'text-lg text-gray-700 leading-relaxed',
    caption: 'text-sm text-gray-600',
    muted: 'text-gray-500',
  },
  
  // Navigation
  nav: {
    link: 'text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
    linkActive: 'text-green-600 bg-green-50 px-3 py-2 rounded-md text-sm font-medium',
  }
};