"use client";

import React, { useState, useEffect } from 'react';
import { componentClasses } from '@/lib/theme';
import { StatsCard, InfoCard, InstructionCard } from '@/components/ui/Cards';

interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: string;
  timeAgo: string;
  likes: number;
  comments: number;
  tags: string[];
  location?: string;
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isJoined: boolean;
  recentActivity: string;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'events'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Voice synthesis function
  const speakText = (text: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Try to find a clear English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Generate community feed announcement
  const generateFeedAnnouncement = (posts: CommunityPost[]) => {
    if (posts.length === 0) {
      return 'No community posts available.';
    }
    
    let announcement = `Community feed has ${posts.length} posts. `;
    
    posts.slice(0, 3).forEach((post, index) => {
      announcement += `Post ${index + 1}: ${post.author} posted about ${post.title}. ${post.content.slice(0, 100)}... `;
    });
    
    if (posts.length > 3) {
      announcement += `And ${posts.length - 3} more posts available.`;
    }
    
    return announcement;
  };

  // Function to toggle voice
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isVoiceEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  // Function to repeat feed announcement
  const repeatAnnouncement = () => {
    if (filteredPosts.length > 0) {
      const announcement = generateFeedAnnouncement(filteredPosts);
      speakText(announcement);
    }
  };



  // Mock data
  const posts: CommunityPost[] = [
    {
      id: '1',
      author: 'Sarah Johnson',
      avatar: 'SJ',
      title: 'Best Organic Pesticide Alternatives',
      content: 'Just discovered neem oil works wonders against aphids! Mixed 2 tablespoons with a gallon of water and sprayed my tomatoes. Aphids gone in 2 days without harming beneficial insects.',
      category: 'Pest Control',
      timeAgo: '2 hours ago',
      likes: 24,
      comments: 8,
      tags: ['organic', 'pesticide', 'tomatoes', 'neem-oil'],
      location: 'California, USA'
    },
    {
      id: '2',
      author: 'Mike Chen',
      avatar: 'MC',
      title: 'Drought-Resistant Corn Varieties',
      content: 'Anyone tried the new Pioneer drought-tolerant corn hybrids? Looking at P1197AML for next season. Soil conditions are clay-loam with moderate fertility.',
      category: 'Crop Management',
      timeAgo: '4 hours ago',
      likes: 15,
      comments: 12,
      tags: ['corn', 'drought', 'hybrid', 'pioneer'],
      location: 'Nebraska, USA'
    },
    {
      id: '3',
      author: 'Emma Rodriguez',
      avatar: 'ER',
      title: 'Soil pH Testing Results - Need Advice',
      content: 'Just got my soil test back: pH 5.8, low phosphorus, adequate potassium. Planning to grow soybeans next season. Should I lime now or wait until spring?',
      category: 'Soil Management',
      timeAgo: '6 hours ago',
      likes: 32,
      comments: 18,
      tags: ['soil-ph', 'lime', 'soybeans', 'phosphorus'],
      location: 'Iowa, USA'
    },
  ];

  const groups: CommunityGroup[] = [
    {
      id: '1',
      name: 'Organic Farming Network',
      description: 'Share tips and experiences about organic farming practices, pest control, and sustainable agriculture.',
      memberCount: 2847,
      category: 'Organic Farming',
      isJoined: true,
      recentActivity: '12 new posts today'
    },
    {
      id: '2',
      name: 'Precision Agriculture Tech',
      description: 'Discussion about GPS, drones, sensors, and other modern farming technologies.',
      memberCount: 1653,
      category: 'Technology',
      isJoined: false,
      recentActivity: '8 new posts today'
    },
    {
      id: '3',
      name: 'Small Scale Farming',
      description: 'Support group for farmers managing 1-50 acres, sharing tips for maximizing small farm productivity.',
      memberCount: 3921,
      category: 'Small Scale',
      isJoined: true,
      recentActivity: '15 new posts today'
    },
  ];

  const stats = {
    totalMembers: 12847,
    activeGroups: 84,
    postsToday: 156,
    helpfulAnswers: 923,
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  // Effect to speak posts when page loads
  useEffect(() => {
    const initializeVoice = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            if (isVoiceEnabled && activeTab === 'feed') {
              const announcement = generateFeedAnnouncement(filteredPosts);
              setTimeout(() => speakText(announcement), 1000);
            }
            setIsLoading(false);
          };
        } else {
          if (isVoiceEnabled && activeTab === 'feed') {
            const announcement = generateFeedAnnouncement(filteredPosts);
            setTimeout(() => speakText(announcement), 1000);
          }
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeVoice();
  }, [isVoiceEnabled, activeTab, filteredPosts]);

  // Effect to announce when switching to feed tab
  useEffect(() => {
    if (activeTab === 'feed' && isVoiceEnabled && !isLoading) {
      const announcement = generateFeedAnnouncement(filteredPosts);
      setTimeout(() => speakText(announcement), 500);
    }
  }, [activeTab, filteredPosts, isVoiceEnabled, isLoading]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="animate-fade-in">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h1 className={`${componentClasses.text.h1} mb-4`}>Farming Community</h1>
              <p className={`${componentClasses.text.bodyLarge} max-w-2xl`}>
                Connect with fellow farmers, share knowledge, and grow together in our thriving agricultural community.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button className={componentClasses.button.primary}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </button>
              <button className={componentClasses.button.outline}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Join Groups
              </button>
              
              {/* Voice Control Buttons */}
              {activeTab === 'feed' && (
                <>
                  <button
                    onClick={repeatAnnouncement}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-300 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg border border-blue-300/20 flex items-center gap-2"
                    title="Read community posts aloud"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.586 17.414L4 20l2.586 2.586A2 2 0 008 21.172V18.828a2 2 0 00-.586-1.414zM4 12a8 8 0 008-8v0a8 8 0 118 8v0a8 8 0 01-8 8v0a8 8 0 00-8-8z" />
                    </svg>
                    🔊 Read Posts
                  </button>
                  
                  <button
                    onClick={toggleVoice}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg border flex items-center gap-2 ${
                      isVoiceEnabled 
                        ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:text-orange-300 border-orange-300/20' 
                        : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 dark:text-gray-300 border-gray-300/20'
                    }`}
                    title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
                  >
                    {isVoiceEnabled ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728m-6.95 6.95a8.966 8.966 0 01-2.829-2.828M12 6.586l1.414-1.414M19.414 12L18 10.586" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    )}
                    {isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}
                  </button>
                </>
              )}
            </div>
            
            {/* Voice Status Indicator */}
            {isLoading && activeTab === 'feed' && (
              <div className="flex justify-center items-center mt-4 text-gray-600 dark:text-gray-400">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading voice system...
              </div>
            )}
            
            {isVoiceEnabled && !isLoading && activeTab === 'feed' && (
              <div className="flex justify-center items-center mt-4 text-green-600 dark:text-green-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Voice system active - Community posts will be read aloud
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <StatsCard
              title="Community Members"
              value={stats.totalMembers.toLocaleString()}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              color="secondary"
            />
            <StatsCard
              title="Active Groups"
              value={stats.activeGroups}
              subtitle="Join discussions"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              color="primary"
            />
            <StatsCard
              title="Posts Today"
              value={stats.postsToday}
              subtitle="Active discussions"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              color="accent"
            />
            <StatsCard
              title="Helpful Answers"
              value={stats.helpfulAnswers}
              subtitle="This week"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              color="warning"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6">
            {['feed', 'groups', 'events'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Feed Tab */}
          {activeTab === 'feed' && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {/* Category Filter */}
                <InfoCard title="Filter Posts" className="mb-6">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={componentClasses.select}
                  >
                    <option value="all">All Categories</option>
                    <option value="crop">Crop Management</option>
                    <option value="pest">Pest Control</option>
                    <option value="soil">Soil Management</option>
                    <option value="livestock">Livestock</option>
                    <option value="equipment">Equipment</option>
                    <option value="market">Market Prices</option>
                  </select>
                </InfoCard>

                {/* Posts */}
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {post.avatar}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{post.author}</h3>
                              <p className="text-sm text-gray-500">
                                {post.timeAgo} • {post.location}
                              </p>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              {post.category}
                            </span>
                          </div>
                          
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h4>
                          <p className="text-gray-700 mb-4">{post.content}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                              <button
                                onClick={() => {
                                  const postText = `${post.author} posted about ${post.title}. ${post.content}`;
                                  speakText(postText);
                                }}
                                className="flex items-center space-x-2 text-gray-500 hover:text-orange-600"
                                title="Listen to this post"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.586 17.414L4 20l2.586 2.586A2 2 0 008 21.172V18.828a2 2 0 00-.586-1.414zM4 12a8 8 0 008-8v0a8 8 0 118 8v0a8 8 0 01-8 8v0a8 8 0 00-8-8z" />
                                </svg>
                                <span>Listen</span>
                              </button>
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>{post.likes}</span>
                              </button>
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{post.comments}</span>
                              </button>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <InfoCard title="Popular Groups">
                  <div className="space-y-4">
                    {groups.slice(0, 3).map((group) => (
                      <div key={group.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{group.name}</h4>
                          <p className="text-sm text-gray-500">{group.memberCount} members</p>
                        </div>
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                          {group.isJoined ? 'Joined' : 'Join'}
                        </button>
                      </div>
                    ))}
                  </div>
                </InfoCard>

                <InfoCard title="Trending Topics">
                  <div className="space-y-2">
                    {['#drought-resistant', '#organic-farming', '#soil-health', '#precision-ag', '#cover-crops'].map((topic) => (
                      <div key={topic} className="px-3 py-2 bg-gray-50 rounded-lg">
                        <span className="text-green-600 font-medium">{topic}</span>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              </div>
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div key={group.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {group.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{group.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{group.memberCount.toLocaleString()} members</span>
                    <span>{group.recentActivity}</span>
                  </div>
                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      group.isJoined
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {group.isJoined ? 'Joined' : 'Join Group'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <InfoCard title="Upcoming Events">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Events Coming Soon</h3>
                <p className="text-gray-600">Community events and webinars will be available soon.</p>
              </div>
            </InfoCard>
          )}


        </div>
      </div>
    </div>
  );
}