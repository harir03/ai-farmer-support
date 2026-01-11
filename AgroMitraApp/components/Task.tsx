import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Utility functions
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

// New Task Form interface
interface NewTaskForm {
  title: string;
  description: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
}

// Trash icon component
const TrashIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
      stroke="#E74C3C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 11v6M14 11v6"
      stroke="#E74C3C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Add Task Modal Component
const AddTaskModal = ({ 
  visible, 
  onClose, 
  newTask, 
  setNewTask, 
  onSave 
}: {
  visible: boolean;
  onClose: () => void;
  newTask: NewTaskForm;
  setNewTask: (task: NewTaskForm) => void;
  onSave: () => void;
}) => {
  const priorities: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#E85D56';
      case 'Medium': return '#FFC107';
      case 'Low': return '#7E7B72';
      default: return '#7E7B72';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5E9DD" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5E9DD' }}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 20,
            backgroundColor: '#F5E9DD',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <TouchableOpacity 
              onPress={onClose}
              style={{
                backgroundColor: 'rgba(73, 73, 73, 0.1)',
                borderRadius: 20,
                padding: 8,
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="close" size={20} color="#494949" />
            </TouchableOpacity>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#494949' }}>
              Create New Task
            </Text>
            <TouchableOpacity 
              onPress={onSave}
              style={{
                backgroundColor: '#E85D56',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                minWidth: 60,
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Title Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#494949', marginBottom: 12 }}>
                Task Title *
              </Text>
              <View style={{
                backgroundColor: 'white',
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <TextInput
                  style={{
                    padding: 18,
                    fontSize: 16,
                    color: '#494949',
                    fontWeight: '500'
                  }}
                  placeholder="Enter task title..."
                  placeholderTextColor="#7E7B72"
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#494949', marginBottom: 12 }}>
                Description
              </Text>
              <View style={{
                backgroundColor: 'white',
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <TextInput
                  style={{
                    padding: 18,
                    fontSize: 16,
                    color: '#494949',
                    fontWeight: '500',
                    minHeight: 120
                  }}
                  placeholder="Enter task description..."
                  placeholderTextColor="#7E7B72"
                  multiline
                  textAlignVertical="top"
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                />
              </View>
            </View>

            {/* Due Date Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#494949', marginBottom: 12 }}>
                Due Date
              </Text>
              <View style={{
                backgroundColor: 'white',
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <TextInput
                  style={{
                    padding: 18,
                    fontSize: 16,
                    color: '#494949',
                    fontWeight: '500'
                  }}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#7E7B72"
                  value={newTask.dueDate}
                  onChangeText={(text) => setNewTask({ ...newTask, dueDate: text })}
                />
              </View>
            </View>

            {/* Priority Selection */}
            <View style={{ marginBottom: 40 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#494949', marginBottom: 12 }}>
                Priority Level
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={{
                      flex: 1,
                      padding: 18,
                      borderRadius: 16,
                      backgroundColor: newTask.priority === priority ? getPriorityColor(priority) : 'white',
                      borderWidth: newTask.priority === priority ? 0 : 2,
                      borderColor: getPriorityColor(priority),
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: newTask.priority === priority ? 0.2 : 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      transform: [{ scale: newTask.priority === priority ? 1.02 : 1 }]
                    }}
                    onPress={() => setNewTask({ ...newTask, priority })}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={priority === 'High' ? 'alert-circle' : priority === 'Medium' ? 'time' : 'checkmark-circle'} 
                      size={20} 
                      color={newTask.priority === priority ? 'white' : getPriorityColor(priority)}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={{
                      color: newTask.priority === priority ? 'white' : getPriorityColor(priority),
                      fontWeight: '700',
                      fontSize: 16
                    }}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Priority badge component
const PriorityBadge = ({ priority }: { priority: 'High' | 'Medium' | 'Low' }) => {
  const getBadgeColor = () => {
    switch (priority) {
      case 'High':
        return '#E85D56';
      case 'Medium':
        return '#FFC107';
      case 'Low':
        return '#7E7B72';
      default:
        return '#7E7B72';
    }
  };

  const getIcon = () => {
    switch (priority) {
      case 'High':
        return 'alert-circle';
      case 'Medium':
        return 'time';
      case 'Low':
        return 'checkmark-circle';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <View style={{
      backgroundColor: getBadgeColor(),
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      minWidth: 70,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    }}>
      <Ionicons name={getIcon()} size={12} color="white" style={{ marginRight: 4 }} />
      <Text style={{ 
        color: 'white', 
        fontSize: 13, 
        fontWeight: '700',
        textAlign: 'center'
      }}>
        {priority}
      </Text>
    </View>
  );
};

// Task card component
const TaskCard = ({ task, onToggleComplete, onDelete }: {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const borderColor = task.priority === 'High' ? '#E85D56' : 
                     task.priority === 'Medium' ? '#FFC107' : '#7E7B72';

  const getTaskIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('water')) return 'water';
    if (lowerTitle.includes('fertilizer') || lowerTitle.includes('fertilize')) return 'leaf';
    if (lowerTitle.includes('harvest')) return 'basket';
    if (lowerTitle.includes('soil') || lowerTitle.includes('moisture')) return 'earth';
    if (lowerTitle.includes('trim') || lowerTitle.includes('prune')) return 'cut';
    return 'checkmark-circle';
  };

  const isOverdue = () => {
    if (task.completed) return false;
    const today = new Date();
    const [day, month, year] = task.dueDate.split('/');
    const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dueDate < today;
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const [day, month, year] = task.dueDate.split('/');
    const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderDueStatus = () => {
    const daysUntil = getDaysUntilDue();
    if (task.completed) return null;
    
    if (daysUntil < 0) {
      return (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: 'rgba(232, 93, 86, 0.15)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
          alignSelf: 'flex-start',
          marginTop: 6,
          borderWidth: 1,
          borderColor: 'rgba(232, 93, 86, 0.3)'
        }}>
          <Ionicons name="warning" size={14} color="#E85D56" />
          <Text style={{ color: '#E85D56', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
            Overdue by {Math.abs(daysUntil)} day{Math.abs(daysUntil) > 1 ? 's' : ''}
          </Text>
        </View>
      );
    } else if (daysUntil === 0) {
      return (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: 'rgba(255, 193, 7, 0.15)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
          alignSelf: 'flex-start',
          marginTop: 6,
          borderWidth: 1,
          borderColor: 'rgba(255, 193, 7, 0.3)'
        }}>
          <Ionicons name="today" size={14} color="#FFC107" />
          <Text style={{ color: '#FFC107', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
            Due Today
          </Text>
        </View>
      );
    } else if (daysUntil <= 3) {
      return (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: 'rgba(255, 193, 7, 0.15)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
          alignSelf: 'flex-start',
          marginTop: 6,
          borderWidth: 1,
          borderColor: 'rgba(255, 193, 7, 0.3)'
        }}>
          <Ionicons name="alarm" size={14} color="#FFC107" />
          <Text style={{ color: '#FFC107', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
            Due in {daysUntil} day{daysUntil > 1 ? 's' : ''}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={{
        backgroundColor: task.completed ? 'rgba(245, 233, 221, 0.7)' : '#F5E9DD',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        marginHorizontal: 20,
        borderLeftWidth: 6,
        borderLeftColor: isOverdue() ? '#E85D56' : borderColor,
        minHeight: 100,
        opacity: task.completed ? 0.85 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: task.completed ? 0.05 : 0.15,
        shadowRadius: 8,
        elevation: task.completed ? 2 : 5,
        transform: [{ scale: task.completed ? 0.98 : 1 }]
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              backgroundColor: task.completed ? 'rgba(126, 123, 114, 0.2)' : 'rgba(74, 144, 226, 0.15)',
              borderRadius: 12,
              padding: 8,
              marginRight: 12
            }}>
              <Ionicons 
                name={getTaskIcon(task.title)} 
                size={18} 
                color={task.completed ? '#7E7B72' : '#4A90E2'} 
              />
            </View>
            <Text style={{ 
              color: task.completed ? '#7E7B72' : '#494949', 
              fontSize: 19, 
              fontWeight: '800', 
              flex: 1,
              textDecorationLine: task.completed ? 'line-through' : 'none'
            }}>
              {task.title}
            </Text>
          </View>
          <Text style={{ 
            color: task.completed ? '#7E7B72' : '#494949', 
            fontSize: 15, 
            fontWeight: '500',
            marginBottom: 12,
            lineHeight: 22,
            textDecorationLine: task.completed ? 'line-through' : 'none',
            marginLeft: 50
          }}>
            {task.description}
          </Text>
          <View style={{ marginLeft: 50 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: task.completed ? 'rgba(126, 123, 114, 0.1)' : 'rgba(73, 73, 73, 0.1)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              alignSelf: 'flex-start',
              marginBottom: 6
            }}>
              <Ionicons name="calendar" size={12} color={task.completed ? '#7E7B72' : '#494949'} />
              <Text style={{ 
                color: task.completed ? '#7E7B72' : '#494949', 
                fontSize: 13, 
                fontWeight: '600',
                marginLeft: 6
              }}>
                Due: {task.dueDate}
              </Text>
            </View>
            {renderDueStatus()}
            {task.completed && task.completedAt && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(41, 174, 91, 0.1)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                alignSelf: 'flex-start',
                marginTop: 4
              }}>
                <Ionicons name="checkmark-circle" size={12} color="#29AE5B" />
                <Text style={{ 
                  color: '#29AE5B', 
                  fontSize: 12, 
                  fontWeight: '700',
                  marginLeft: 6
                }}>
                  Completed: {formatDate(task.completedAt)}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={{ alignItems: 'center', justifyContent: 'space-between', minHeight: 80 }}>
          <PriorityBadge priority={task.priority} />
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <TouchableOpacity 
              onPress={() => onDelete(task.id)} 
              style={{ 
                padding: 10,
                borderRadius: 16,
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                shadowColor: '#E85D56',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              activeOpacity={0.7}
            >
              <TrashIcon />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => onToggleComplete(task.id)}
              activeOpacity={0.8}
              style={{
                padding: 4,
                shadowColor: '#29AE5B',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: task.completed ? 0.2 : 0.1,
                shadowRadius: 4,
                elevation: task.completed ? 3 : 2,
              }}
            >
              <View 
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 3,
                  borderColor: '#29AE5B',
                  backgroundColor: task.completed ? '#29AE5B' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {task.completed && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TaskScreen() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Water the Wheat Field',
      description: 'Check irrigation system and water the wheat field in the morning. Monitor for proper water distribution.',
      dueDate: '20/01/2025',
      priority: 'High',
      completed: false,
      createdAt: new Date('2025-01-15'),
    },
    {
      id: '2',
      title: 'Check Soil Moisture',
      description: 'Monitor soil moisture levels in the corn field using moisture meter. Record readings.',
      dueDate: '22/01/2025',
      priority: 'Low',
      completed: false,
      createdAt: new Date('2025-01-16'),
    },
    {
      id: '3',
      title: 'Apply Fertilizer',
      description: 'Apply organic fertilizer to the vegetable garden. Use 2kg per plot section.',
      dueDate: '25/01/2025',
      priority: 'Medium',
      completed: false,
      createdAt: new Date('2025-01-17'),
    },
    {
      id: '4',
      title: 'Harvest Tomatoes',
      description: 'Collect ripe tomatoes from greenhouse. Sort by size and quality for market.',
      dueDate: '18/01/2025',
      priority: 'Medium',
      completed: true,
      createdAt: new Date('2025-01-10'),
      completedAt: new Date('2025-01-18'),
    },
    {
      id: '5',
      title: 'Trim Fruit Trees',
      description: 'Prune apple and pear trees for better growth. Remove dead branches and shape canopy.',
      dueDate: '15/01/2025',
      priority: 'Low',
      completed: true,
      createdAt: new Date('2025-01-08'),
      completedAt: new Date('2025-01-15'),
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium'
  });

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : undefined
      } : task
    ));
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    Alert.alert(
      "Delete Task",
      `Are you sure you want to permanently delete "${taskToDelete?.title}"?\n\nThis action cannot be undone.`,
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => setTasks(tasks.filter(task => task.id !== id))
        }
      ],
      { cancelable: true }
    );
  };

  const addNewTask = () => {
    setShowAddModal(true);
  };

  const saveNewTask = () => {
    // Validation
    if (!newTask.title.trim()) {
      Alert.alert(
        "Missing Information", 
        "Please enter a task title to continue.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (newTask.title.trim().length > 50) {
      Alert.alert(
        "Title Too Long", 
        "Task title should be 50 characters or less.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim() || 'No description provided',
      dueDate: newTask.dueDate || new Date().toLocaleDateString('en-GB'),
      priority: newTask.priority,
      completed: false,
      createdAt: new Date()
    };

    setTasks([task, ...tasks]);
    setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium' });
    setShowAddModal(false);
    
    // Success feedback could be added here if needed
  };



  return (
    <View style={{ flex: 1, backgroundColor: '#F5E9DD' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E9DD" />
      {/* Background decorative circles */}
      <View 
        style={{
          position: 'absolute',
          width: width * 1.8,
          height: width * 1.8,
          backgroundColor: '#E85D56',
          borderRadius: width * 0.9,
          top: -height * 0.25,
          right: -width * 0.3,
          opacity: 0.9
        }}
      />
      <View 
        style={{
          position: 'absolute',
          width: width * 1.2,
          height: width * 1.2,
          backgroundColor: '#E85D56',
          borderRadius: width * 0.6,
          bottom: -height * 0.12,
          left: -width * 0.5,
          opacity: 0.8
        }}
      />
      
      {/* Decorative border circles */}
      <View 
        style={{
          position: 'absolute',
          width: width * 0.5,
          height: width * 0.5,
          borderWidth: 4,
          borderColor: 'rgba(245, 233, 221, 0.6)',
          borderRadius: width * 0.25,
          top: height * 0.28,
          right: -width * 0.1,
        }}
      />
      <View 
        style={{
          position: 'absolute',
          width: width * 0.9,
          height: width * 0.9,
          borderWidth: 4,
          borderColor: 'rgba(232, 93, 86, 0.3)',
          borderRadius: width * 0.45,
          top: height * 0.15,
          left: width * 0.15,
        }}
      />

      {/* Header area with date and Add Task button */}
      <SafeAreaView style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
        <View style={{ marginTop: 20, marginBottom: 24 }}>
          <Text style={{ 
            color: '#494949', 
            fontSize: 28, 
            fontWeight: '800', 
            textAlign: 'center',
            marginBottom: 8
          }}>
            Task Manager
          </Text>
          <Text style={{ 
            color: '#7E7B72', 
            fontSize: 16, 
            fontWeight: '500', 
            textAlign: 'center',
            marginBottom: 20
          }}>
            {getCurrentDate()}
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            style={{ 
              backgroundColor: '#494949', 
              paddingHorizontal: 28, 
              paddingVertical: 16, 
              borderRadius: 30,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={addNewTask}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={20} color="#F5E9DD" style={{ marginRight: 8 }} />
            <Text style={{ color: '#F5E9DD', fontSize: 18, fontWeight: '700' }}>Create New Task</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      {/* Main content container */}
      <View style={{ 
        flex: 1, 
        backgroundColor: '#494949', 
        borderTopLeftRadius: 40, 
        borderTopRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Task counters */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-around', 
            paddingTop: 32,
            paddingBottom: 24,
            paddingHorizontal: 24
          }}>
            <View style={{ 
              backgroundColor: '#F5E9DD', 
              paddingHorizontal: 24, 
              paddingVertical: 20, 
              borderRadius: 20, 
              alignItems: 'center',
              minWidth: 120,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}>
              <Text style={{ color: '#E85D56', fontSize: 36, fontWeight: '800' }}>{pendingTasks.length}</Text>
              <Text style={{ color: '#494949', fontSize: 16, fontWeight: '700', marginTop: 4 }}>Pending</Text>
            </View>
            
            <View style={{ 
              backgroundColor: '#F5E9DD', 
              paddingHorizontal: 24, 
              paddingVertical: 20, 
              borderRadius: 20, 
              alignItems: 'center',
              minWidth: 120,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}>
              <Text style={{ color: '#29AE5B', fontSize: 36, fontWeight: '800' }}>{completedTasks.length}</Text>
              <Text style={{ color: '#494949', fontSize: 16, fontWeight: '700', marginTop: 4 }}>Completed</Text>
            </View>
          </View>

          {/* Pending Tasks Section */}
          <View style={{ marginTop: 24 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingHorizontal: 20, 
              marginBottom: 20 
            }}>
              <Ionicons name="time" size={24} color="#F5E9DD" style={{ marginRight: 12 }} />
              <Text style={{ 
                color: '#F5E9DD', 
                fontSize: 24, 
                fontWeight: '800', 
                flex: 1
              }}>
                Pending Tasks
              </Text>
              {pendingTasks.length > 0 && (
                <View style={{
                  backgroundColor: 'rgba(232, 93, 86, 0.2)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E85D56'
                }}>
                  <Text style={{ color: '#E85D56', fontSize: 14, fontWeight: '700' }}>
                    {pendingTasks.length}
                  </Text>
                </View>
              )}
            </View>
            {pendingTasks.length > 0 ? (
              pendingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTaskComplete}
                  onDelete={deleteTask}
                />
              ))
            ) : (
              <View style={{ 
                alignItems: 'center', 
                paddingVertical: 48, 
                paddingHorizontal: 24,
                marginHorizontal: 20,
                backgroundColor: 'rgba(245, 233, 221, 0.1)',
                borderRadius: 20,
                borderWidth: 2,
                borderColor: 'rgba(41, 174, 91, 0.3)',
                borderStyle: 'dashed'
              }}>
                <View style={{
                  backgroundColor: 'rgba(41, 174, 91, 0.2)',
                  borderRadius: 30,
                  padding: 16,
                  marginBottom: 16
                }}>
                  <Ionicons name="checkmark-circle" size={48} color="#29AE5B" />
                </View>
                <Text style={{ 
                  color: '#F5E9DD', 
                  fontSize: 20, 
                  fontWeight: '800',
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  All Tasks Complete!
                </Text>
                <Text style={{ 
                  color: 'rgba(245, 233, 221, 0.8)', 
                  fontSize: 16,
                  textAlign: 'center',
                  lineHeight: 22
                }}>
                  Great job! You're all caught up. Create a new task to keep your farm running smoothly.
                </Text>
              </View>
            )}
          </View>

          {/* Completed Tasks Section */}
          <View style={{ marginTop: 32, marginBottom: 40 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingHorizontal: 20, 
              marginBottom: 20 
            }}>
              <Ionicons name="checkmark-circle" size={24} color="#29AE5B" style={{ marginRight: 12 }} />
              <Text style={{ 
                color: '#F5E9DD', 
                fontSize: 24, 
                fontWeight: '800', 
                flex: 1
              }}>
                Completed Tasks
              </Text>
              {completedTasks.length > 0 && (
                <View style={{
                  backgroundColor: 'rgba(41, 174, 91, 0.2)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#29AE5B'
                }}>
                  <Text style={{ color: '#29AE5B', fontSize: 14, fontWeight: '700' }}>
                    {completedTasks.length}
                  </Text>
                </View>
              )}
            </View>
            {completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTaskComplete}
                  onDelete={deleteTask}
                />
              ))
            ) : (
              <View style={{ 
                alignItems: 'center', 
                paddingVertical: 48, 
                paddingHorizontal: 24,
                marginHorizontal: 20,
                backgroundColor: 'rgba(245, 233, 221, 0.1)',
                borderRadius: 20,
                borderWidth: 2,
                borderColor: 'rgba(126, 123, 114, 0.3)',
                borderStyle: 'dashed'
              }}>
                <View style={{
                  backgroundColor: 'rgba(126, 123, 114, 0.2)',
                  borderRadius: 30,
                  padding: 16,
                  marginBottom: 16
                }}>
                  <Ionicons name="hourglass" size={48} color="#7E7B72" />
                </View>
                <Text style={{ 
                  color: '#F5E9DD', 
                  fontSize: 20, 
                  fontWeight: '800',
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  No Completed Tasks
                </Text>
                <Text style={{ 
                  color: 'rgba(245, 233, 221, 0.8)', 
                  fontSize: 16,
                  textAlign: 'center',
                  lineHeight: 22
                }}>
                  Start completing your pending tasks to see your progress here.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        newTask={newTask}
        setNewTask={setNewTask}
        onSave={saveNewTask}
      />
    </View>
  );
}
