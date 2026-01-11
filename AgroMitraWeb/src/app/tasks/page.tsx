"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { componentClasses } from '@/lib/theme';
import { StatsCard, InfoCard, InstructionCard } from '@/components/ui/Cards';
import { uiTranslations, getUIText, speakInLanguage, speakInEnglish } from '@/lib/uiTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  category: 'irrigation' | 'fertilization' | 'pest-control' | 'harvesting' | 'maintenance' | 'livestock' | 'planning';
  farmId?: string;
  farmName?: string;
  estimatedDuration: string;
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
}

interface NewTask {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  category: 'irrigation' | 'fertilization' | 'pest-control' | 'harvesting' | 'maintenance' | 'livestock' | 'planning';
  farmName: string;
  estimatedDuration: string;
  assignedTo: string;
}

export default function TasksPage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'title'>('dueDate');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    category: 'irrigation',
    farmName: '',
    estimatedDuration: '',
    assignedTo: ''
  });

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { language, toggleLanguage } = useLanguage();

  // Speak individual task (uses selected language)
  const speakTask = (task: Task) => {
    if (!isVoiceEnabled) return;
    const taskTextEn = `${task.category} task: ${task.title}. Status: ${task.status}. Priority: ${task.priority}`;
    const taskTextHi = `${task.category} कार्य: ${task.title}. स्थिति: ${task.status}. प्राथमिकता: ${task.priority}`;
    speakInLanguage(language === 'hi' ? taskTextHi : taskTextEn, language);
  };

  // Voice announcement on page load (uses selected language)
  useEffect(() => {
    if (isVoiceEnabled) {
      const timer = setTimeout(() => {
        const announcementText = language === 'hi'
          ? 'आपके खेत के कार्य इस प्रकार हैं'
          : 'Your farm tasks are as follows';
        speakInLanguage(announcementText, language);

        // Announce task count and categories
        setTimeout(() => {
          const filteredTasks = tasks.filter(task =>
            (selectedFilter === 'all' || task.status === selectedFilter) &&
            (selectedCategory === 'all' || task.category === selectedCategory)
          );

          if (filteredTasks.length > 0) {
            const countText = language === 'hi'
              ? `आपके पास ${filteredTasks.length} कार्य हैं`
              : `You have ${filteredTasks.length} tasks`;
            speakInLanguage(countText, language);

            // Announce first 3 task categories
            filteredTasks.slice(0, 3).forEach((task, index) => {
              setTimeout(() => {
                const taskText = language === 'hi'
                  ? `${task.category} कार्य: ${task.title}. स्थिति: ${task.status}`
                  : `${task.category} task: ${task.title}. Status: ${task.status}`;
                speakInLanguage(taskText, language);
              }, (index + 1) * 2500);
            });
          } else {
            const noTaskText = language === 'hi'
              ? 'अभी कोई कार्य उपलब्ध नहीं है'
              : 'No tasks available at the moment';
            speakInLanguage(noTaskText, language);
          }
        }, 2000);
      }, 1000);

      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [isVoiceEnabled, selectedFilter, selectedCategory, language]);

  // Function to toggle voice
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      speechSynthesis.cancel();
    }
  };

  // Function to repeat task announcement (uses selected language)
  const repeatAnnouncement = () => {
    if (isVoiceEnabled) {
      const text = language === 'hi'
        ? 'आपके खेत के कार्य इस प्रकार हैं'
        : 'Your farm tasks are as follows';
      speakInLanguage(text, language);
    }
  };

  // Mock data - replace with actual data from your farm store
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Water the vegetable garden',
      description: 'Check soil moisture and water the tomato and lettuce sections',
      dueTime: '8:00 AM',
      dueDate: '2024-12-20',
      createdAt: '2024-12-18',
      priority: 'high',
      status: 'pending',
      category: 'irrigation',
      farmId: '1',
      farmName: 'Main Farm',
      estimatedDuration: '30 minutes',
      assignedTo: 'John Smith'
    },
    {
      id: '2',
      title: 'Check livestock feed',
      description: 'Ensure cattle have sufficient feed and fresh water',
      dueTime: '10:00 AM',
      dueDate: '2024-12-19',
      createdAt: '2024-12-17',
      priority: 'medium',
      status: 'completed',
      category: 'livestock',
      farmId: '1',
      farmName: 'Main Farm',
      estimatedDuration: '20 minutes',
      assignedTo: 'Mary Johnson'
    },
    {
      id: '3',
      title: 'Fertilize crop field A',
      description: 'Apply nitrogen fertilizer to corn field section A',
      dueTime: '2:00 PM',
      dueDate: '2024-12-18',
      createdAt: '2024-12-15',
      priority: 'high',
      status: 'overdue',
      category: 'fertilization',
      farmId: '1',
      farmName: 'Main Farm',
      estimatedDuration: '2 hours',
      assignedTo: 'John Smith'
    },
    {
      id: '4',
      title: 'Inspect irrigation system',
      description: 'Check all sprinkler heads and repair any damage',
      dueTime: '4:00 PM',
      dueDate: '2024-12-21',
      createdAt: '2024-12-18',
      priority: 'medium',
      status: 'pending',
      category: 'maintenance',
      farmId: '2',
      farmName: 'North Field',
      estimatedDuration: '1 hour',
      assignedTo: 'Mike Wilson'
    },
    {
      id: '5',
      title: 'Harvest tomatoes',
      description: 'Pick ripe tomatoes from greenhouse section 2',
      dueTime: '6:00 AM',
      dueDate: '2024-12-19',
      createdAt: '2024-12-16',
      priority: 'high',
      status: 'completed',
      category: 'harvesting',
      farmId: '1',
      farmName: 'Main Farm',
      estimatedDuration: '1.5 hours',
      assignedTo: 'Sarah Davis'
    }
  ];

  const filteredTasks = tasks.filter(task => {
    const statusMatch = selectedFilter === 'all' || task.status === selectedFilter;
    const categoryMatch = selectedCategory === 'all' || task.category === selectedCategory;
    return statusMatch && categoryMatch;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'overdue':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };



  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'irrigation':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>;
      case 'fertilization':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
      case 'livestock':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /></svg>;
      case 'harvesting':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
      case 'maintenance':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      default:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 overflow-y-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="animate-fade-in">
          {/* Header Section with Enhanced Styling */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 shadow-lg bg-white/80 backdrop-blur-lg rounded-3xl">
              <svg
                className="w-12 h-12 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-800 md:text-5xl">
              {getUIText('title', language, 'tasks')}
            </h1>

            <p className="max-w-3xl mx-auto mb-8 text-lg leading-relaxed text-gray-600">
              {getUIText('description', language, 'tasks')}
            </p>

            {/* Voice Controls */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${isVoiceEnabled
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-blue-200 border border-white/20'
                  }`}
              >
                {isVoiceEnabled
                  ? (language === 'hi' ? '🔊 आवाज़ चालू' : '🔊 Voice On')
                  : (language === 'hi' ? '🔇 आवाज़ बंद' : '🔇 Voice Off')
                }
              </button>
              {isVoiceEnabled && (
                <button
                  onClick={repeatAnnouncement}
                  className="px-6 py-3 font-medium text-orange-200 transition-all duration-300 border bg-white/10 border-white/20 rounded-xl hover:bg-white/20"
                >
                  {language === 'hi' ? '🗣️ कार्य दोहराएं' : '🗣️ Repeat Tasks'}
                </button>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-3 px-8 py-3 text-lg font-semibold text-white transition-all duration-300 bg-green-500 shadow-2xl hover:bg-green-600 rounded-2xl hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {getUIText('addNew', language, 'tasks')}
              </button>
              <button className="flex items-center gap-3 px-8 py-3 text-lg font-semibold text-gray-700 transition-all duration-300 border shadow-lg bg-white/80 backdrop-blur-lg hover:bg-white rounded-2xl hover:scale-105 border-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {getUIText('filterTasks', language, 'tasks')}
              </button>

              {/* Voice Control Buttons */}
              <button
                onClick={repeatAnnouncement}
                className="flex items-center gap-3 px-6 py-3 text-lg font-semibold text-blue-600 transition-all duration-300 border shadow-lg bg-blue-50 hover:bg-blue-100 rounded-2xl hover:scale-105 border-blue-200"
                title="Repeat task announcement"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.586 17.414L4 20l2.586 2.586A2 2 0 008 21.172V18.828a2 2 0 00-.586-1.414zM4 12a8 8 0 008-8v0a8 8 0 118 8v0a8 8 0 01-8 8v0a8 8 0 00-8-8z" />
                </svg>
                🔊 Speak Tasks
              </button>

              <button
                onClick={toggleVoice}
                className={`px-6 py-3 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg border flex items-center gap-3 ${isVoiceEnabled
                  ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {isVoiceEnabled ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728m-6.95 6.95a8.966 8.966 0 01-2.829-2.828M12 6.586l1.414-1.414M19.414 12L18 10.586" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
                {isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}
              </button>
            </div>


            {/* Voice Status Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center mt-4 text-gray-600">
                <svg className="w-5 h-5 mr-3 -ml-1 text-gray-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading voice system...
              </div>
            )}

            {isVoiceEnabled && !isLoading && (
              <div className="flex items-center justify-center mt-4 text-green-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Voice system active
              </div>
            )}

          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid gap-6 mb-8 md:grid-cols-4">
            <div className="p-6 transition-all duration-300 border shadow-lg bg-white/90 backdrop-blur-lg rounded-2xl border-gray-200 hover:bg-white hover:border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-800">{taskStats.total}</span>
              </div>
              <h3 className="mb-1 font-semibold text-blue-700">{language === 'hi' ? 'कुल कार्य' : 'Total Tasks'}</h3>
              <p className="text-sm text-gray-600">{language === 'hi' ? 'सभी सौंपे गए कार्य' : 'All assigned tasks'}</p>
            </div>

            <div className="p-6 transition-all duration-300 border shadow-lg bg-white/90 backdrop-blur-lg rounded-2xl border-gray-200 hover:bg-white hover:border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-800">{taskStats.pending}</span>
              </div>
              <h3 className="mb-1 font-semibold text-yellow-700">{language === 'hi' ? 'लंबित' : 'Pending'}</h3>
              <p className="text-sm text-gray-600">{language === 'hi' ? 'ध्यान देने योग्य' : 'Need attention'}</p>
            </div>

            <div className="p-6 transition-all duration-300 border shadow-lg bg-white/90 backdrop-blur-lg rounded-2xl border-gray-200 hover:bg-white hover:border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-800">{taskStats.completed}</span>
              </div>
              <h3 className="mb-1 font-semibold text-green-700">{language === 'hi' ? 'पूर्ण' : 'Completed'}</h3>
              <p className="text-sm text-gray-600">{language === 'hi' ? 'आज' : 'Today'}</p>
            </div>

            <div className="p-6 transition-all duration-300 border shadow-lg bg-white/90 backdrop-blur-lg rounded-2xl border-gray-200 hover:bg-white hover:border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-800">{taskStats.overdue}</span>
              </div>
              <h3 className="mb-1 font-semibold text-red-700">{language === 'hi' ? 'विलंबित' : 'Overdue'}</h3>
              <p className="text-sm text-gray-600">{language === 'hi' ? 'तुरंत ध्यान दें' : 'Urgent attention'}</p>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="p-6 mb-8 border shadow-lg bg-white/90 backdrop-blur-lg rounded-2xl border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Search & Filter Tasks</h2>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tasks by title, description, assignee, or farm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full py-3 pl-10 pr-4 text-gray-800 transition-all duration-200 border bg-white border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700">Status Filter</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="block w-full px-4 py-3 text-gray-800 transition-all duration-200 border bg-white border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700">Category Filter</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-4 py-3 text-gray-800 transition-all duration-200 border bg-white border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="all">All Categories</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="fertilization">Fertilization</option>
                  <option value="pest-control">Pest Control</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="livestock">Livestock</option>
                  <option value="planning">Planning</option>
                </select>
              </div>
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'status' | 'title')}
                  className="block w-full px-4 py-3 text-gray-800 transition-all duration-200 border bg-white border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="title">Title</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedFilter('all');
                    setSelectedCategory('all');
                    setSearchTerm('');
                    setSortBy('dueDate');
                  }}
                  className="px-6 py-3 font-medium text-gray-700 transition-all duration-300 border bg-white hover:bg-gray-50 rounded-xl border-gray-300"
                >
                  Clear All
                </button>
              </div>

              <div className="flex items-center justify-center px-4 text-gray-800 border bg-green-50 rounded-xl border-green-200">
                <span className="text-lg font-semibold">
                  {filteredTasks.length} tasks
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Tasks List */}
          <div className="p-6 mb-8 border shadow-2xl bg-white/10 backdrop-blur-lg rounded-2xl border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedFilter === 'all' ? 'All' : selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Tasks ({filteredTasks.length})
              </h2>
            </div>

            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-6 transition-all duration-300 border shadow-lg bg-white/90 backdrop-blur-lg rounded-xl border-gray-200 hover:bg-white hover:border-gray-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1 space-x-4">
                      <div className="mt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                              'bg-green-100 text-green-800 border border-green-300'
                            }`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <div className="flex items-center text-blue-700">
                            {getCategoryIcon(task.category)}
                            <span className="ml-2 text-sm font-medium capitalize">{task.category.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <p className="mb-4 text-lg leading-relaxed text-gray-700">{task.description}</p>

                        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <div className="flex items-center px-3 py-2 text-green-700 border rounded-lg bg-green-50 border-green-200">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">
                              {new Date(task.dueDate).toLocaleDateString()} at {task.dueTime}
                            </span>
                          </div>
                          <div className="flex items-center px-3 py-2 text-blue-700 border rounded-lg bg-blue-50 border-blue-200">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="font-medium">{task.farmName}</span>
                          </div>
                          <div className="flex items-center px-3 py-2 text-purple-700 border rounded-lg bg-purple-50 border-purple-200">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium">{task.assignedTo}</span>
                          </div>
                          <div className="flex items-center px-3 py-2 text-yellow-700 border rounded-lg bg-yellow-50 border-yellow-200">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{task.estimatedDuration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center ml-4 space-x-2">
                      <button

                        onClick={() => {
                          speakTask(task);
                        }}
                        className="p-3 transition-all duration-200 border rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 border-gray-200 hover:border-orange-300"
                        title="Speak task name"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.586 17.414L4 20l2.586 2.586A2 2 0 008 21.172V18.828a2 2 0 00-.586-1.414zM4 12a8 8 0 008-8v0a8 8 0 118 8v0a8 8 0 01-8 8v0a8 8 0 00-8-8z" />
                        </svg>
                      </button>
                      <button
                        className="p-3 transition-all duration-200 border rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-200 hover:border-blue-300"
                        title="Edit task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="p-3 transition-all duration-200 border rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 border-gray-200 hover:border-green-300"
                        title="Mark as complete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        className="p-3 transition-all duration-200 border rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-300"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTasks.length === 0 && (
                <div className="py-12 text-center">
                  <div className="inline-block p-6 mb-4 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">No tasks found</h3>
                  <p className="mb-6 text-gray-600">No tasks match your current filters. Try adjusting your filters or create a new task.</p>
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="px-6 py-3 font-semibold text-white transition-all duration-300 bg-green-500 hover:bg-green-600 rounded-xl hover:scale-105"
                  >
                    Create New Task
                  </button>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed z-50 bottom-8 right-8">
        <button
          onClick={() => setShowAddTask(true)}
          className="p-4 text-white transition-all duration-300 rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/25 hover:scale-110 group"
          title="Add New Task"
        >
          <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Task Creation/Edit Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border shadow-2xl bg-white rounded-2xl border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setShowAddTask(false)}
                className="p-2 transition-all duration-200 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-600">Task creation form will be implemented here.</p>
              <button
                onClick={() => setShowAddTask(false)}
                className="px-6 py-2 font-semibold text-white transition-all duration-300 bg-green-500 hover:bg-green-600 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}