import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Community Group Icon
const CommunityIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke="#494949"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke="#494949"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke="#494949"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke="#494949"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
}

interface CommunityGroupsProps {
  activeTab?: 'Feed' | 'Groups';
  onTabChange?: (tab: 'Feed' | 'Groups') => void;
}

const CommunityGroups: React.FC<CommunityGroupsProps> = ({ 
  activeTab = 'Groups',
  onTabChange 
}) => {
  const [groups, setGroups] = useState<CommunityGroup[]>([
    {
      id: '1',
      name: 'Wheat Farmers Community',
      description: 'Share wheat farming knowledge.',
      memberCount: 1295,
      isJoined: false
    },
    {
      id: '2',
      name: 'Rice Cultivation Group',
      description: 'Rice farming tips and techniques.',
      memberCount: 2134,
      isJoined: false
    },
    {
      id: '3',
      name: 'Organic Farming Network',
      description: 'Sustainable farming practices.',
      memberCount: 856,
      isJoined: true
    },
    {
      id: '4',
      name: 'Vegetable Growers Hub',
      description: 'Vegetable farming discussions.',
      memberCount: 1678,
      isJoined: false
    },
    {
      id: '5',
      name: 'Fruit Orchard Owners',
      description: 'Fruit cultivation community.',
      memberCount: 943,
      isJoined: false
    },
    {
      id: '6',
      name: 'Dairy Farmers United',
      description: 'Dairy farming and livestock care.',
      memberCount: 1523,
      isJoined: false
    }
  ]);

  const handleJoinGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    setGroups(prevGroups => 
      prevGroups.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              isJoined: !g.isJoined,
              memberCount: g.isJoined ? g.memberCount - 1 : g.memberCount + 1
            }
          : g
      )
    );

    const action = group.isJoined ? 'left' : 'joined';
    Alert.alert(
      'Success!', 
      `You have ${action} ${group.name}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View className="flex-1 bg-[#494949] mx-2 rounded-tl-[131px] rounded-bl-[131px] px-4 pt-8">
          {/* Title */}
          <Text className="text-[#f5e9dd] text-3xl font-bold text-center mb-6">
            Community Groups
          </Text>

          {/* Groups List */}
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {groups.map((group) => (
              <View
                key={group.id}
                className="bg-[#f5e9dd] rounded-3xl p-4 mb-4 flex-row items-center"
                style={{ minHeight: 90 }}
              >
                {/* Group Icon */}
                <View className="mr-4">
                  <CommunityIcon />
                </View>

                {/* Group Info */}
                <View className="flex-1 mr-3">
                  <Text className="text-[#494949] text-lg font-bold mb-1">
                    {group.name}
                  </Text>
                  <Text className="text-[#494949] text-sm mb-2">
                    {group.description}
                  </Text>
                  <Text className="text-[#29ae5b] text-sm font-semibold">
                    {group.memberCount.toLocaleString()} Members
                  </Text>
                </View>

                {/* Join/Joined Button */}
                <TouchableOpacity
                  onPress={() => handleJoinGroup(group.id)}
                  className={`px-6 py-3 rounded-3xl ${
                    group.isJoined ? 'bg-[#494949]' : 'bg-[#29ae5b]'
                  }`}
                  style={{ minWidth: 85, minHeight: 45 }}
                >
                  <Text className="text-[#f5e9dd] text-lg font-bold text-center">
                    {group.isJoined ? 'Joined' : 'Join'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
    </View>
  );
};

export default CommunityGroups;
