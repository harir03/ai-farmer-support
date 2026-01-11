import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  Alert,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Post {
  id: string;
  user: {
    name: string;
    timeAgo: string;
  };
  content: string;
  tag: string;
  tagColor: string;
  likes: number;
  comments: number;
  shares: number;
}

const mockPosts: Post[] = [
    {
      id: '1',
      user: {
        name: 'Ramesh Sharma',
        timeAgo: '2 hours ago'
      },
      content: 'My wheat crop is getting spot on the leaves. What should i do? Can anyone suggest?',
      tag: 'Question',
      tagColor: '#7e7b72',
      likes: 13,
      comments: 13,
      shares: 13
    },
    {
      id: '2',
      user: {
        name: 'Ramesh Sharma',
        timeAgo: '2 hours ago'
      },
      content: 'My wheat crop is getting spot on the leaves. What should i do? Can anyone suggest?',
      tag: 'Tips',
      tagColor: '#7e7b72',
      likes: 13,
      comments: 13,
      shares: 13
    },
    {
      id: '3',
      user: {
        name: 'Ramesh Sharma',
        timeAgo: '2 hours ago'
      },
      content: 'My wheat crop is getting spot on the leaves. What should i do? Can anyone suggest?',
      tag: 'Suggest',
      tagColor: '#7e7b72',
      likes: 13,
      comments: 13,
      shares: 13
    }
  ];

const CommunityFeed = () => {
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Questions');

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(postId)) {
        newLikes.delete(postId);
      } else {
        newLikes.add(postId);
      }
      return newLikes;
    });

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: likedPosts.has(postId) ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleShare = () => {
    if (postContent.trim()) {
      const newPost: Post = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          timeAgo: 'Just now'
        },
        content: postContent,
        tag: selectedCategory,
        tagColor: '#7e7b72',
        likes: 0,
        comments: 0,
        shares: 0
      };
      setPosts(prev => [newPost, ...prev]);
      setPostContent('');
      setShowCreateModal(false);
    }
  };

  const categories = ['Questions', 'Tips', 'Market', 'Weather'];

  const handleComment = (postId: string) => {
    // Placeholder for comment functionality - could open a comment modal
    Alert.alert('Comments', 'Comment feature coming soon!');
  };

  const handleSharePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ));
    Alert.alert('Shared!', 'Post shared successfully!');
  };

  const CreatePostModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showCreateModal}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-[#494949] rounded-3xl mx-4 p-6 w-11/12 max-w-md">
          <Text className="text-[#f5e9dd] text-2xl font-bold text-center mb-6">
            Create Post
          </Text>
          
          <Text className="text-[#f5e9dd] text-lg font-semibold mb-4">
            Choose Category :
          </Text>
          
          {/* Category Buttons */}
          <View className="flex-row flex-wrap justify-between mb-6">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-3 rounded-2xl mb-3 ${
                  selectedCategory === category ? 'bg-[#f5e9dd]' : 'bg-[#7e7b72]'
                }`}
                style={{ width: '48%' }}
              >
                <Text 
                  className={`text-center font-bold text-base ${
                    selectedCategory === category ? 'text-[#494949]' : 'text-[#f5e9dd]'
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Text Input */}
          <View className="bg-[#f5e9dd] rounded-2xl p-4 mb-6" style={{ minHeight: 120 }}>
            <TextInput
              className="text-[#494949] text-base flex-1"
              placeholder="Write your post here..."
              placeholderTextColor="#7e7b72"
              value={postContent}
              onChangeText={setPostContent}
              multiline
              textAlignVertical="top"
            />
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                setPostContent('');
              }}
              className="bg-[#7e7b72] rounded-2xl px-8 py-3 flex-1 mr-2"
            >
              <Text className="text-[#f5e9dd] text-lg font-bold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleShare}
              className="bg-[#29ae5b] rounded-2xl px-8 py-3 flex-1 ml-2"
              disabled={!postContent.trim()}
            >
              <Text className="text-[#f5e9dd] text-lg font-bold text-center">
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const PostCard = ({ post }: { post: Post }) => (
    <View className="bg-[#f5e9dd] rounded-3xl mx-4 mb-4 p-5 shadow-sm">
      {/* User Info Header */}
      <View className="flex-row items-start mb-4">
        <View className="flex-row items-start flex-1">
          <View className="w-12 h-12 rounded-full bg-[#7e7b72] mr-3 items-center justify-center">
            <Ionicons name="person" size={24} color="#f5e9dd" />
          </View>
          <View className="flex-1">
            <Text className="text-[#494949] text-lg font-bold">{post.user.name}</Text>
            <Text className="text-[#7e7b72] text-sm">{post.user.timeAgo}</Text>
          </View>
        </View>
        
        {/* Tag */}
        <View className="bg-[#7e7b72] rounded-3xl px-4 py-2">
          <Text className="text-[#f5e9dd] text-base font-bold">{post.tag}</Text>
        </View>
      </View>
      
      {/* Separator Line */}
      <View className="h-0.5 bg-[#7e7b72]/30 mb-4" />
      
      {/* Post Content */}
      <Text className="text-[#494949] text-base mb-4 leading-6">
        {post.content}
      </Text>
      
      {/* Separator Line */}
      <View className="h-0.5 bg-[#7e7b72]/30 mb-4" />
      
      {/* Interaction Buttons */}
      <View className="flex-row justify-between items-center px-2">
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => handleLike(post.id)}
        >
          <Ionicons 
            name={likedPosts.has(post.id) ? "heart" : "heart-outline"} 
            size={24} 
            color={likedPosts.has(post.id) ? "#e85d56" : "#494949"} 
          />
          <Text className="text-[#494949] text-lg font-bold ml-2">{post.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => handleComment(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#494949" />
          <Text className="text-[#494949] text-lg font-bold ml-2">{post.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => handleSharePost(post.id)}
        >
          <Ionicons name="share-outline" size={22} color="#494949" />
          <Text className="text-[#494949] text-lg font-bold ml-2">{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#494949] mx-2 rounded-tl-[131px] rounded-bl-[131px]">
        {/* Title */}
        <Text className="text-[#f5e9dd] text-3xl font-bold text-center mt-8 mb-6">
          Community Feed
        </Text>
        
        {/* Post Creation Section */}
        <TouchableOpacity 
          className="bg-[#f5e9dd] rounded-3xl mx-4 mb-4 p-4 flex-row items-center"
          onPress={() => setShowCreateModal(true)}
        >
          <View className="w-8 h-8 mr-3 items-center justify-center">
            <Ionicons name="add-circle-outline" size={28} color="#494949" />
          </View>
          <Text className="flex-1 text-[#7e7b72] text-lg">
            Share your thoughts...
          </Text>
          <View className="bg-[#29ae5b] rounded-3xl px-6 py-3 ml-2">
            <Text className="text-[#f5e9dd] text-xl font-bold">Share</Text>
          </View>
        </TouchableOpacity>
        
        {/* Posts Feed */}
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ScrollView>

        {/* Create Post Modal */}
        <CreatePostModal />
    </View>
  );
};

export default CommunityFeed;
