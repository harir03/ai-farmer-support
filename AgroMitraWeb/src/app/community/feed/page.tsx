"use client";

import { useState, useEffect } from 'react';
import { componentClasses } from '@/lib/theme';
import { uiTranslations, getUIText, speakInEnglish } from '@/lib/uiTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CommunityFeedPage() {
  const [newPost, setNewPost] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const { language } = useLanguage();
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: 'John Farmer',
        avatar: '👨‍🌾',
        location: 'Punjab, India'
      },
      timeAgo: '2 hours ago',
      content: 'Just harvested the first batch of tomatoes this season! The weather has been perfect. Anyone else seeing great yields this year? 🍅',
      likes: 12,
      comments: 5,
      tags: ['tomatoes', 'harvest', 'season']
    },
    {
      id: 2,
      author: {
        name: 'Sarah Green',
        avatar: '👩‍🌾',
        location: 'Haryana, India'
      },
      timeAgo: '5 hours ago',
      content: 'Looking for advice on pest control for cucumber plants. Has anyone tried organic methods? Would love to hear your experiences! 🥒',
      likes: 8,
      comments: 12,
      tags: ['pest-control', 'organic', 'cucumber']
    },
    {
      id: 3,
      author: {
        name: 'Raj Patel',
        avatar: '🧑‍🌾',
        location: 'Gujarat, India'
      },
      timeAgo: '1 day ago',
      content: 'Experimenting with drip irrigation for my wheat crop. Initial results are promising - 30% water savings! Anyone else using similar techniques?',
      likes: 24,
      comments: 8,
      tags: ['irrigation', 'water-saving', 'wheat']
    }
  ]);

  const handlePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: {
          name: 'You',
          avatar: '👤',
          location: 'Your Location'
        },
        timeAgo: 'just now',
        content: newPost,
        likes: 0,
        comments: 0,
        tags: []
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  // Voice announcement on page load (always in English)
  useEffect(() => {
    if (isVoiceEnabled) {
      const timer = setTimeout(() => {
        speakInEnglish('Here are the latest community posts');
        
        // Announce post count
        setTimeout(() => {
          speakInEnglish(`There are ${posts.length} new posts`);
          
          // Announce first 3 posts
          posts.slice(0, 3).forEach((post, index) => {
            setTimeout(() => {
              speakInEnglish(`${post.author.name} posted: ${post.content}`);
            }, (index + 1) * 4000);
          });
        }, 2000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isVoiceEnabled, posts]);

  const speakPost = (post: any) => {
    if (isVoiceEnabled) {
      speakInEnglish(`${post.author.name} posted: ${post.content}`);
    }
  };



  return (
    <div className="bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 min-h-screen py-8">
      <div className={componentClasses.container}>
        <div className="max-w-4xl mx-auto">
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
              {getUIText('title', language, 'community')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mt-2">
                {getUIText('feed', language, 'community')}
              </span>
            </h1>
            
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              {getUIText('feedDescription', language, 'community')}
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

          {/* Create Post Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                ✍️
              </span>
              Share your farming experience
            </h2>
            <textarea 
              className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 resize-none"
              rows={3}
              placeholder="What's happening on your farm today?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            ></textarea>
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-3">
                <button className="p-2 text-green-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button className="p-2 text-green-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <button 
                onClick={handlePost}
                className={`${componentClasses.button.primaryLarge} bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Post
              </button>
            </div>
          </div>
          
          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                {/* Post Header */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4 text-xl shadow-md">
                    {post.author.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white flex items-center">
                      {post.author.name}
                      <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-200 text-xs rounded-full">
                        Farmer
                      </span>
                    </h3>
                    <div className="flex items-center text-sm text-green-100">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {post.author.location} • {post.timeAgo}
                    </div>
                  </div>
                  <button className="p-2 text-green-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                {/* Post Content */}
                <p className="text-green-50 mb-4 leading-relaxed text-lg">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span key={index} className={`${componentClasses.badge.info} bg-blue-500/20 text-blue-200 border border-blue-400/20`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-green-200 hover:text-white transition-all duration-200 hover:bg-white/10 px-3 py-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-green-200 hover:text-white transition-all duration-200 hover:bg-white/10 px-3 py-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-green-200 hover:text-white transition-all duration-200 hover:bg-white/10 px-3 py-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Share</span>
                    </button>
                  </div>
                  {isVoiceEnabled && (
                    <button
                      onClick={() => speakPost(post)}
                      className="flex items-center space-x-2 text-blue-200 hover:text-white transition-all duration-200 hover:bg-blue-500/20 px-3 py-2 rounded-lg border border-blue-400/20"
                      title="Speak this post"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 006 0V9a3 3 0 00-6 0v3zm0 0v3m0-3h3m-3 0H6a2 2 0 01-2-2V7a2 2 0 012-2h3" />
                      </svg>
                      <span className="font-medium">🔊</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-8">
            <button className={`${componentClasses.button.outline} bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Load More Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}