"use client";

import { useState, useEffect } from 'react';
import { componentClasses } from '@/lib/theme';
import { uiTranslations, getUIText, speakInEnglish } from '@/lib/uiTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CommunityGroupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const { language } = useLanguage();
  
  const groups = [
    {
      id: 1,
      name: 'Organic Farming',
      description: 'Dedicated to sustainable and organic farming practices. Share tips, experiences, and learn together.',
      members: 1234,
      icon: '🌱',
      gradient: 'from-green-400 to-green-600',
      category: 'sustainable',
      isJoined: true,
      recentActivity: '5 new posts today',
      tags: ['organic', 'sustainable', 'eco-friendly']
    },
    {
      id: 2,
      name: 'Farm Equipment',
      description: 'Everything about farming equipment, maintenance, reviews, and recommendations from fellow farmers.',
      members: 856,
      icon: '🚜',
      gradient: 'from-blue-400 to-blue-600',
      category: 'equipment',
      isJoined: false,
      recentActivity: '12 new posts today',
      tags: ['equipment', 'machinery', 'maintenance']
    },
    {
      id: 3,
      name: 'Crop Management',
      description: 'Discuss crop rotation, pest management, irrigation systems, and maximize your harvest yields.',
      members: 692,
      icon: '🌾',
      gradient: 'from-yellow-400 to-yellow-600',
      category: 'crops',
      isJoined: true,
      recentActivity: '8 new posts today',
      tags: ['crops', 'irrigation', 'pest-control']
    },
    {
      id: 4,
      name: 'Livestock Care',
      description: 'Share knowledge about animal husbandry, veterinary care, and livestock management practices.',
      members: 445,
      icon: '🐄',
      gradient: 'from-red-400 to-red-600',
      category: 'livestock',
      isJoined: false,
      recentActivity: '3 new posts today',
      tags: ['livestock', 'veterinary', 'husbandry']
    },
    {
      id: 5,
      name: 'Smart Farming Tech',
      description: 'Explore IoT sensors, AI applications, drone technology, and modern farming innovations.',
      members: 342,
      icon: '🤖',
      gradient: 'from-purple-400 to-purple-600',
      category: 'technology',
      isJoined: false,
      recentActivity: '15 new posts today',
      tags: ['AI', 'IoT', 'drones', 'automation']
    },
    {
      id: 6,
      name: 'Market & Trading',
      description: 'Discuss crop prices, market trends, trading strategies, and agricultural economics.',
      members: 678,
      icon: '📈',
      gradient: 'from-indigo-400 to-indigo-600',
      category: 'business',
      isJoined: true,
      recentActivity: '7 new posts today',
      tags: ['market', 'prices', 'trading', 'economics']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Groups', icon: '🌐' },
    { id: 'sustainable', name: 'Sustainable', icon: '🌱' },
    { id: 'equipment', name: 'Equipment', icon: '🚜' },
    { id: 'crops', name: 'Crops', icon: '🌾' },
    { id: 'livestock', name: 'Livestock', icon: '🐄' },
    { id: 'technology', name: 'Technology', icon: '🤖' },
    { id: 'business', name: 'Business', icon: '📈' }
  ];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Voice announcement on page load
  useEffect(() => {
    if (isVoiceEnabled) {
      const timer = setTimeout(() => {
        speakInEnglish('Welcome to Community Groups. Here you can connect with fellow farmers.');
        
        // Announce group count and details
        setTimeout(() => {
          speakInEnglish(`Found ${filteredGroups.length} farming groups available to join.`);
          
          // Announce first 3 groups
          filteredGroups.slice(0, 3).forEach((group, index) => {
            setTimeout(() => {
              speakInEnglish(`${group.name} group has ${group.members} members. ${group.description}`);
            }, (index + 1) * 3000);
          });
        }, 2000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [language, isVoiceEnabled, filteredGroups]);

  const speakGroupInfo = (group: any) => {
    if (isVoiceEnabled) {
      speakInEnglish(`${group.name} group has ${group.members} members. ${group.description}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 min-h-screen py-8">
      <div className={componentClasses.container}>
        <div className="max-w-6xl mx-auto">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            
            <h1 className={`${componentClasses.text.h1} text-white mb-4`}>
              {getUIText('title', language, 'groups')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mt-2">
                {getUIText('groups', language, 'navigation')}
              </span>
            </h1>
            
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              {getUIText('description', language, 'groups')}
            </p>

            {/* Voice Controls */}
            <div className="flex justify-center gap-4 mb-4">
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

          {/* Search and Create Group */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              <button className={`${componentClasses.button.primaryLarge} bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl whitespace-nowrap`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Group
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-white/20 text-white shadow-lg border border-white/30'
                      : 'bg-white/10 text-green-100 hover:bg-white/15 border border-white/20'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Groups Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 hover:shadow-2xl transition-all duration-300 group">
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${group.gradient} rounded-xl flex items-center justify-center mr-4 text-xl shadow-md group-hover:shadow-lg transition-all duration-300`}>
                      {group.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{group.name}</h3>
                      <div className="flex items-center text-sm text-green-100">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {group.members.toLocaleString()} members
                      </div>
                    </div>
                  </div>
                  {group.isJoined && (
                    <span className={`${componentClasses.badge.success} bg-green-500/20 text-green-200 border border-green-400/20`}>
                      Joined
                    </span>
                  )}
                </div>

                {/* Group Description */}
                <p className="text-green-50 mb-4 leading-relaxed">
                  {group.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.tags.map((tag, index) => (
                    <span key={index} className={`${componentClasses.badge.gray} bg-white/10 text-green-100 border border-white/20 text-xs`}>
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center text-sm text-green-200">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {group.recentActivity}
                  </div>
                </div>

                {/* Group Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((_, index) => (
                      <div key={index} className={`w-8 h-8 bg-gradient-to-br ${group.gradient} rounded-full border-2 border-white/20 flex items-center justify-center text-xs shadow-sm`}>
                        👤
                      </div>
                    ))}
                    <div className="w-8 h-8 bg-white/10 rounded-full border-2 border-white/20 flex items-center justify-center text-xs text-green-200">
                      +{Math.floor(group.members / 100)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isVoiceEnabled && (
                      <button
                        onClick={() => speakGroupInfo(group)}
                        className="px-3 py-2 bg-blue-500/20 text-blue-200 border border-blue-400/20 rounded-lg hover:bg-blue-500/30 transition-all duration-200 text-sm"
                        title="Speak group info"
                      >
                        🔊
                      </button>
                    )}
                    <button 
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                        group.isJoined 
                          ? 'bg-white/10 text-green-200 border border-white/20 hover:bg-white/20' 
                          : `${componentClasses.button.primary} bg-green-500 hover:bg-green-600`
                      }`}
                    >
                      {group.isJoined ? 'View Group' : 'Join Group'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No groups found</h3>
              <p className="text-green-100 mb-6">Try adjusting your search terms or category filter</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className={`${componentClasses.button.outline} bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm`}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Popular Topics */}
          <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3">
                🔥
              </span>
              Trending Topics
            </h3>
            <div className="flex flex-wrap gap-3">
              {['#organic-farming', '#crop-rotation', '#soil-health', '#water-management', '#pest-control', '#sustainable-agriculture', '#farm-automation', '#market-trends'].map((topic, index) => (
                <button key={index} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-green-100 rounded-lg text-sm transition-all duration-200 border border-white/20">
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
