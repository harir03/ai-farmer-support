"use client";

import React, { useState, useEffect } from 'react';
import { componentClasses } from '@/lib/theme';
import { StatsCard, InfoCard, InstructionCard } from '@/components/ui/Cards';
import { uiTranslations, getUIText, speakInEnglish } from '@/lib/uiTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

interface Scheme {
  id: string;
  title: string;
  description: string;
  category: string;
  ministry: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  applicationLink: string;
  status: 'active' | 'closed' | 'upcoming';
  lastDate?: string;
  beneficiaries: string;
  budgetAllocation?: string;
}

export default function SchemesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const { language } = useLanguage();

  // Mock data based on actual government schemes
  const schemes: Scheme[] = [
    {
      id: '1',
      title: 'PM-KISAN Samman Nidhi',
      description: 'Direct income support of ₹6,000 per year to small and marginal farmers',
      category: 'subsidies',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: [
        '₹2,000 installments thrice a year',
        'Direct bank transfer',
        'No intermediaries'
      ],
      eligibility: [
        'Small and marginal farmers',
        'Landholding up to 2 hectares',
        'Valid bank account'
      ],
      documents: [
        'Aadhaar Card',
        'Bank Account Details',
        'Land Ownership Documents'
      ],
      applicationLink: 'https://pmkisan.gov.in/',
      status: 'active',
      beneficiaries: '11+ Crore farmers',
      budgetAllocation: '₹75,000 Crore'
    },
    {
      id: '2',
      title: 'Kisan Credit Card (KCC)',
      description: 'Credit support for agriculture and allied activities with easy loan access',
      category: 'loans',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: [
        'Flexible credit limit',
        'Simple interest rates',
        'Crop insurance facility',
        'Accident insurance coverage'
      ],
      eligibility: [
        'Farmers (individual/joint)',
        'Tenant farmers',
        'Self Help Group members'
      ],
      documents: [
        'Application form',
        'Identity proof',
        'Address proof',
        'Land documents'
      ],
      applicationLink: 'https://www.india.gov.in/kisan-credit-card-kcc-scheme',
      status: 'active',
      beneficiaries: '7+ Crore farmers',
      budgetAllocation: '₹4,00,000 Crore'
    },
    {
      id: '3',
      title: 'Pradhan Mantri Fasal Bima Yojana',
      description: 'Comprehensive crop insurance scheme providing protection against crop losses',
      category: 'insurance',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: [
        'Premium subsidy up to 90%',
        'Coverage for all crops',
        'Natural disasters coverage',
        'Quick claim settlement'
      ],
      eligibility: [
        'All farmers',
        'Sharecroppers and tenant farmers',
        'Notified crops coverage'
      ],
      documents: [
        'Aadhaar Card',
        'Land records',
        'Bank account details',
        'Sowing certificate'
      ],
      applicationLink: 'https://pmfby.gov.in/',
      status: 'active',
      beneficiaries: '3.6+ Crore farmers',
      budgetAllocation: '₹15,695 Crore'
    },
    {
      id: '4',
      title: 'Soil Health Management',
      description: 'Promote soil health through soil health cards and balanced use of fertilizers',
      category: 'organic',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: [
        'Free soil testing',
        'Customized fertilizer recommendations',
        'Improved crop productivity',
        'Reduced input costs'
      ],
      eligibility: [
        'All farmers',
        'Registered with local authorities',
        'Land ownership proof'
      ],
      documents: [
        'Land records',
        'Farmer registration',
        'Aadhaar Card'
      ],
      applicationLink: 'https://soilhealth.dac.gov.in/',
      status: 'active',
      beneficiaries: '22+ Crore farmers',
      budgetAllocation: '₹568 Crore'
    },
    {
      id: '5',
      title: 'Agriculture Infrastructure Fund',
      description: 'Financing facility for agriculture infrastructure projects',
      category: 'equipment',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: [
        '₹1 Lakh Crore fund',
        '3% interest subvention',
        'Credit guarantee support',
        'Post-harvest infrastructure'
      ],
      eligibility: [
        'Farmers and FPOs',
        'Agricultural entrepreneurs',
        'Startups in agriculture',
        'Primary Agricultural Credit Societies'
      ],
      documents: [
        'Project report',
        'Financial statements',
        'Land documents',
        'Registration certificates'
      ],
      applicationLink: 'https://agriinfra.dac.gov.in/',
      status: 'active',
      beneficiaries: 'FPOs, Cooperatives, Startups',
      budgetAllocation: '₹1,00,000 Crore'
    },
    {
      id: '6',
      title: 'National Mission for Sustainable Agriculture',
      description: 'Enhance agricultural productivity and sustainability through climate resilient practices',
      category: 'training',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: [
        'Climate resilient techniques',
        'Water conservation methods',
        'Organic farming promotion',
        'Technology adoption support'
      ],
      eligibility: [
        'All farmers',
        'Agricultural institutions',
        'State governments',
        'NGOs in agriculture'
      ],
      documents: [
        'Registration documents',
        'Project proposal',
        'Implementation plan'
      ],
      applicationLink: 'https://nmsa.dac.gov.in/',
      status: 'active',
      beneficiaries: 'All States and UTs',
      budgetAllocation: '₹3,000 Crore'
    }
  ];

  const categories = [
    { key: 'all', label: getUIText('allCategories', language, 'schemes'), count: schemes.length },
    { key: 'subsidies', label: getUIText('subsidies', language, 'schemes'), count: schemes.filter(s => s.category === 'subsidies').length },
    { key: 'loans', label: getUIText('loans', language, 'schemes'), count: schemes.filter(s => s.category === 'loans').length },
    { key: 'insurance', label: getUIText('insurance', language, 'schemes'), count: schemes.filter(s => s.category === 'insurance').length },
    { key: 'training', label: getUIText('training', language, 'schemes'), count: schemes.filter(s => s.category === 'training').length },
    { key: 'equipment', label: getUIText('equipment', language, 'schemes'), count: schemes.filter(s => s.category === 'equipment').length },
    { key: 'organic', label: getUIText('organic', language, 'schemes'), count: schemes.filter(s => s.category === 'organic').length }
  ];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.ministry.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Voice announcement on page load
  useEffect(() => {
    if (isVoiceEnabled) {
      const timer = setTimeout(() => {
        speakInEnglish('Welcome to Government Schemes. Here you can explore various agricultural schemes and subsidies available for farmers.');
        
        setTimeout(() => {
          speakInEnglish(`Found ${filteredSchemes.length} government schemes available for farmers.`);
          
          // Announce first 3 schemes
          filteredSchemes.slice(0, 3).forEach((scheme, index) => {
            setTimeout(() => {
              speakInEnglish(`${scheme.title}: ${scheme.description}`);
            }, (index + 1) * 4000);
          });
        }, 2000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [language, isVoiceEnabled, filteredSchemes]);

  const speakSchemeInfo = (scheme: Scheme) => {
    if (isVoiceEnabled) {
      speakInEnglish(`${scheme.title}. ${scheme.description}. Ministry: ${scheme.ministry}. Status: ${scheme.status}`);
    }
  };

  const handleApplyNow = (scheme: Scheme) => {
    if (isVoiceEnabled) {
      speakInEnglish(`Redirecting to ${scheme.title} application portal`);
    }
    
    // Show notification
    setNotificationMessage(`Opening ${scheme.title} application portal...`);
    setShowNotification(true);
    
    // Open the scheme's application link in a new tab
    window.open(scheme.applicationLink, '_blank', 'noopener,noreferrer');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleLearnMore = (scheme: Scheme) => {
    if (isVoiceEnabled) {
      speakInEnglish(`Opening detailed information for ${scheme.title}`);
    }
    setSelectedScheme(scheme);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedScheme(null);
  };

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-red-100 text-red-800 border-red-200',
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.active;
  };

  return (
    <div className="bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 min-h-screen py-8">
      <div className={componentClasses.container}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-lg rounded-2xl mb-4 shadow-xl">
              <svg
                className="w-12 h-12 text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            
            <h1 className={`${componentClasses.text.h1} text-white mb-4`}>
              {getUIText('title', language, 'schemes')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mt-2">
                {getUIText('subtitle', language, 'schemes')}
              </span>
            </h1>
            
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              {getUIText('description', language, 'schemes')}
            </p>

            {/* Voice Controls */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isVoiceEnabled 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-white/10 text-green-200 border border-white/20'
                }`}
              >
                {isVoiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Agriculture Schemes"
              value="687"
              icon="🌾"
              color="success"
            />
            <StatsCard
              title="Banking & Finance"
              value="289"
              icon="🏦"
              color="secondary"
            />
            <StatsCard
              title="PM-KISAN Beneficiaries"
              value="11+ Cr"
              icon="👨‍🌾"
              color="accent"
            />
            <StatsCard
              title="Infrastructure Fund"
              value="₹1L Cr"
              icon="💰"
              color="warning"
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={getUIText('searchSchemes', language, 'schemes')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      selectedCategory === category.key
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white/10 text-green-100 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <div key={scheme.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {scheme.title}
                    </h3>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(scheme.status)}`}>
                      {getUIText(scheme.status, language, 'schemes')}
                    </span>
                  </div>
                  <button
                    onClick={() => speakSchemeInfo(scheme)}
                    className="p-2 text-green-300 hover:text-green-200 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  >
                    🔊
                  </button>
                </div>

                {/* Description */}
                <p className="text-green-100 text-sm mb-4 line-clamp-3">
                  {scheme.description}
                </p>

                {/* Ministry */}
                <p className="text-blue-200 text-xs font-medium mb-4">
                  {scheme.ministry}
                </p>

                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="text-white font-medium text-sm mb-2">{getUIText('benefits', language, 'schemes')}:</h4>
                  <ul className="text-green-100 text-xs space-y-1">
                    {scheme.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Beneficiaries */}
                <div className="mb-4">
                  <p className="text-purple-200 text-xs">
                    <span className="font-medium">Beneficiaries:</span> {scheme.beneficiaries}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApplyNow(scheme)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {getUIText('applyNow', language, 'schemes')}
                  </button>
                  <button 
                    onClick={() => handleLearnMore(scheme)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {getUIText('learnMore', language, 'schemes')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-white text-xl mb-2">No schemes found</p>
              <p className="text-green-100">Try adjusting your search criteria or category filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Scheme Modal */}
      {isModalOpen && selectedScheme && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedScheme.title}</h2>
                <p className="text-gray-600">{selectedScheme.ministry}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadge(selectedScheme.status)}`}>
                  {getUIText(selectedScheme.status, language, 'schemes')}
                </span>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedScheme.description}</p>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{getUIText('benefits', language, 'schemes')}</h3>
                <ul className="space-y-2">
                  {selectedScheme.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Eligibility */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{getUIText('eligibility', language, 'schemes')}</h3>
                <ul className="space-y-2">
                  {selectedScheme.eligibility.map((criteria, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{getUIText('documents', language, 'schemes')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedScheme.documents.map((document, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V6H8V4H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">{document}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beneficiaries and Budget Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Target Beneficiaries</h4>
                  <p className="text-blue-800">{selectedScheme.beneficiaries}</p>
                </div>
                {selectedScheme.budgetAllocation && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Budget Allocation</h4>
                    <p className="text-purple-800 font-bold text-lg">{selectedScheme.budgetAllocation}</p>
                  </div>
                )}
              </div>

              {/* How to Apply */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">{getUIText('howToApply', language, 'schemes')}</h4>
                <ol className="list-decimal list-inside text-green-800 space-y-1 text-sm">
                  <li>Visit the official scheme portal</li>
                  <li>Fill in the required details</li>
                  <li>Upload necessary documents</li>
                  <li>Submit the application</li>
                  <li>Track application status online</li>
                </ol>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => handleApplyNow(selectedScheme)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🚀 {getUIText('applyNow', language, 'schemes')}
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{notificationMessage}</span>
            <button 
              onClick={() => setShowNotification(false)}
              className="ml-2 text-green-200 hover:text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}